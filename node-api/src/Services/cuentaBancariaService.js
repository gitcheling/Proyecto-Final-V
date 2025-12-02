/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Cuenta_Bancaria_Model = require('../Models/cuenta_bancaria'); 
const Entidad_Cuenta_Asociacion_Model = require('../Models/entidad_cuenta_asociacion'); 
const Tipo_Rol_Asociado_Model = require('../Models/tipo_rol_asociado'); 
const Entidad_Model = require('../Models/entidad'); 
const Banco_Model = require('../Models/banco'); 
const Tipo_Cuenta_Model = require('../Models/tipo_cuenta_bancaria');
const Estado_Cuenta_Bancaria_Model = require('../Models/estado_cuenta_bancaria');  


// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 


class CuentaBancariaService {

    // Se crea una nueva cuenta bancaria
    async crearCuentaBancaria({numero_cuenta, tipo_cuenta, banco, entidad_titular }) {

        // Validamos que existan todos los datos
        validarExistencia(numero_cuenta, "numero de cuenta", true);
        validarExistencia(tipo_cuenta, "tipo de cuenta", true);
        validarExistencia(banco, "banco", true);
        validarExistencia(entidad_titular, "entidad titular", true);

        

        // Validamos primero el banco ya que necesitaremos los datos más adelante
        validarIdNumerico(banco, "El banco no tiene el formato correcto");
        // Se comprueba que exista un banco con ese id
        const banco_objeto = await Banco_Model.findByPk(banco);

        if (!banco_objeto) {
            // EL banco no existe, no se puede crear la cuenta bancaria
            throw new Error(`El banco seleccionado no está registrado.`);
        }

        // Validamos ahora el número de cuenta
        const numero_cuenta_limpio = numero_cuenta.trim();
        validarSoloNumeros(numero_cuenta_limpio, "El número de cuenta debe contener solo números (dígitos 0-9).");
        // EL número de cuenta debe tener exactamente 20 dígitos
        if (numero_cuenta_limpio.length !== 20) {
            throw new Error(`El número de cuenta debe tener exactamente 20 dígitos. Longitud actual: ${numero_cuenta_limpio.trim().length}.`);
        }

        // Obtenemos el prefijo del número de cuenta (los primeros 4 dígitos).
        const prefijoCuenta = numero_cuenta_limpio.substring(0, 4);
        if (prefijoCuenta !== banco_objeto.codigo_nacional) {
            throw new Error(`El código del banco en la cuenta (${prefijoCuenta}) no coincide con el banco seleccionado (${banco_objeto.codigo_nacional}).`);
        }
        
        // Validamos el tipo de cuenta
        validarIdNumerico(tipo_cuenta, "El tipo de cuenta no tiene el formato correcto");
        const tipo_cuenta_objeto = await Tipo_Cuenta_Model.findByPk(tipo_cuenta);

        if (!tipo_cuenta_objeto) {
            // EL tipo de cuenta no existe, no se puede crear la cuenta bancaria
            throw new Error(`El tipo de cuenta con ID ${tipo_cuenta} no está registrada.`);
        }

        // Validamos quién es el titular de la cuenta
        validarIdNumerico(entidad_titular, "La entidad no tiene el formato correcto");
        // Se comprueba que exista una entidad con ese id
        const entidad_objeto = await Entidad_Model.findByPk(entidad_titular);

        if (!entidad_objeto) {
            // La Entidad  no existe, no se puede crear la cuenta bancaria
            throw new Error(`La entidad solicitada no está registrada.`);
        }else if(entidad_objeto.estado !== true){
            throw new Error(`No se puede crear una cuenta bancaria de una entidad desactivada.`);
        }
        

        // Se comprueba que no exista ya una cuenta bancaria con el mismo número de cuenta
        if(await Cuenta_Bancaria_Model.findOne({
            where: {
                // Las condiciones de unicidad se basan en la restricción UNIQUE de tu tabla
                numero_cuenta: numero_cuenta_limpio,
                id_banco: banco_objeto.id_banco
            },
            // Optimización: Solo necesitamos saber si existe, no todos los datos.
            attributes: ['id_cuenta_bancaria'] 
        })){
            throw new Error(`La cuenta con el número y el banco proporcionado ya existe en el sistema.`);
        }

        // Comprobamos ahora que la entidad no sea titular ya de 5 cuentas bancarias
        const totalCuentas = await Cuenta_Bancaria_Model.count({
            where: {
                // La condición: que la columna id_entidad_titular coincida con el ID proporcionado
                id_entidad_titular: entidad_objeto.id_entidad 
            }
        });

        if(totalCuentas >= 5){
            throw new Error(`La entidad titular ya tiene el número máximo permitido de cuentas bancarias (5).`);
        }


        // Preparar los datos finales
        const datosFinales = {
            numero_cuenta: numero_cuenta_limpio,
            id_tipo_cuenta: tipo_cuenta_objeto.id_tipo_cuenta,
            id_banco: banco_objeto.id_banco,
            id_entidad_titular: entidad_objeto.id_entidad,
            id_estado_cuenta: 5,
            approvedAt: null
        };
        
        const nuevoBanco = await Cuenta_Bancaria_Model.create(datosFinales);

        return {
            id: nuevoBanco.id_banco, 
            tipo_cuenta: nuevoBanco.id_tipo_cuenta,
            banco: nuevoBanco.id_banco,
            entidad_titular: nuevoBanco.id_entidad_titular,
            estado_academico: "Pendiente de Validación",
            
            fechaCreacion: nuevoBanco.createdAt,
            fechaActualizacion: nuevoBanco.updatedAt            
        };
    

    }


    /* Ésta función simula el borrado de una entidad al desactivarla o activarla (ya que permitir borrados sería desastroso)
    Nota: no se puede permitir el modificar cualquier otro dato ya que no es correcto, el hecho de que se modifique algún dato significa
    que cualquier transacción hecha por una persona o cambia de persona, o de banco, o de número de cuenta, y en cuestión de auditoria eso
    es un desastre */
    async cambiarEstadoCuentaBancaria(id, nuevoEstado) {

        if(!validarExistencia(id, "", false)){
            throw new Error(`Debe proporcionar el id de la cuenta bancaria.`);
        }

        validarExistencia(nuevoEstado, "nuevo estado", true);

        // Se valida el id
        validarIdNumerico(id, "El id no tiene el formato correcto");

        // Se valida el nuevo estado
        validarIdNumerico(nuevoEstado, "El nuevo estado no tiene el formato correcto");

        const estado = await Estado_Cuenta_Bancaria_Model.findByPk(nuevoEstado);

        if(!estado){
            throw new Error(`No existe el estado de cuenta bancaria solicitado.`);
        }else if(estado.nombre === "Pendiente de Validación"){
            throw new Error(`No puedes cambiar el estado de la cuenta a 'pendiente de validación'.`);
        }

        // Se valida la existencia de la cuenta, si no existe se regresa null
        const cuenta_bancaria = await Cuenta_Bancaria_Model.findByPk(id)

        if(!cuenta_bancaria){
            return null;
        };

        // Solo se actualiza la columna 'estado'
        const [filasAfectadas] = await Cuenta_Bancaria_Model.update(
            { id_estado_cuenta: estado.id_estado_cuenta }, 
            { where: { id_cuenta_bancaria: cuenta_bancaria.id_cuenta_bancaria } }
        );

        if (filasAfectadas === 0) {       
            return null;      
        }
 
        return estado;
    
    }


    /* Ésta función aprueba una cuenta bancaria */
    async aprobarCuentaBancaria(id) {

        if(!validarExistencia(id, "", false)){
            throw new Error(`Debe proporcionar el id de la cuenta bancaria.`);
        }

        // Se valida el id
        validarIdNumerico(id, "El id no tiene el formato correcto");

        // Se valida la existencia de la cuenta, si no existe se regresa null
        const cuenta_bancaria = await Cuenta_Bancaria_Model.findByPk(id)

        if(!cuenta_bancaria){
            return null;
        };

        if(cuenta_bancaria.id_estado_cuenta !== 5){
             throw new Error(`No se puede aprobar una cuenta que ya ha sido aprobada.`);
        }
        
        // Comprobamos ahora que la entidad no sea titular ya de 5 cuentas bancarias
        const totalCuentas = await Cuenta_Bancaria_Model.count({
            where: {
                // La condición: que la columna id_entidad_titular coincida con el ID proporcionado
                id_entidad_titular: cuenta_bancaria.id_entidad_titular
            }
        });

        if(totalCuentas >= 5){
            throw new Error(`La entidad titular ya tiene el número máximo permitido de cuentas bancarias (5).`);
        }

        // Solo se actualiza la columna 'estado'
        const [filasAfectadas] = await Cuenta_Bancaria_Model.update(
            { id_estado_cuenta: 1, approvedAt: new Date() }, 
            { where: { id_cuenta_bancaria: cuenta_bancaria.id_cuenta_bancaria } }
        );


        if (filasAfectadas === 0) {       
            return null;      
        }
 
        return true;
    }
    

    /* Ésta función borra una cuenta bancaria (que no haya sido aprobada, ojo)*/
    async eliminarCuentaBancaria(id) {

        console.log("id: ", id)
        if(!validarExistencia(id, "", false)){
            throw new Error(`Debe proporcionar el id de la cuenta bancaria.`);
        }

        // Se valida el id
        validarIdNumerico(id, "El id no tiene el formato correcto");

        // Se valida la existencia de la cuenta, si no existe se regresa null
        const cuenta_bancaria = await Cuenta_Bancaria_Model.findByPk(id)

        if(!cuenta_bancaria){
            return null;
        };

        if(cuenta_bancaria.id_estado_cuenta !== 5){
             throw new Error(`No se puede eliminar una cuenta que ya ha sido aprobada.`);
        }

        const filasEliminadas = await Cuenta_Bancaria_Model.destroy({
            where: {
                id_cuenta_bancaria: cuenta_bancaria.id_cuenta_bancaria
            }
        });

        if (filasEliminadas === 0) {       
            return null;      
        }
 
        return true;
    }



    // Se obtiene una sola cuenta bancaria por el id
    async obtenerCuentaBancariaPorId(id) {

        validarExistencia(id, "id", true);

        validarIdNumerico(id, "El ID proporcionado no es un número entero válido o positivo.");

        // Método de Sequelize para buscar una cuenta bancaria por su Primary Key
        const cuenta_bancaria = await Cuenta_Bancaria_Model.findByPk(id.trim(), {

                attributes: [// Atributos de la tabla principal (cuenta_bancaria)                
                    'id_cuenta_bancaria', 'numero_cuenta', 'createdAt', 'updatedAt', 'approvedAt'
                ],
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'entidad', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "cuenta_bancaria")
                        attributes: ['numero_identificacion', 'nombre', 'apellido', 'estado'], // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                    
                        // Este include anidado es para tener acceso a los prefijos
                        include: [{
                            // 2. Incluye el Prefijo (desde el modelo Entidad)
                            association: 'prefijo', // Alias definido en el modelo Entidad: Entidad.belongsTo(Prefijo_Identificacion)
                            attributes: ['letra_prefijo'] // Campos que se quieren del Prefijo
                        }]
                               
                    },
                    { 
                        association: 'banco', 
                        attributes: ['id_banco', 'nombre'] 
                    },
                    { 
                        association: 'tipo_cuenta', 
                        attributes: ['id_tipo_cuenta', 'nombre', 'descripcion'] 
                    },
                    { 
                        association: 'estado_cuenta', 
                        attributes: ['id_estado_cuenta', 'nombre', 'descripcion', 'permite_operacion'] 
                    }
                ]
        });
        
        return CuentaBancariaService.formatearCuentaBancaria(cuenta_bancaria);
       
    }


    /**
     * Permite buscar cuentas basandose en filtros
     * y no creando una cuenta).
     * @param {object} criteriosBusqueda - Un objeto con los criterios de búsqueda.
     * @param {bool} porAprobar - Un booleano que nos indica si debe traer sólo las cuentas por aprobar (true)
     * @returns {bool} Retorna "true", o "false" si no hay duplicados.
     */
    async buscarCuentasBancarias(criteriosBusqueda = {}, porAprobar = false) {
        
        // Objeto para condiciones en la tabla cuenta_bancaria (base)
        const cuentaBancariaWhere = {};

        // Objeto para condiciones en la tabla Entidad (asociada)
        const entidadWhere = {};

        // Variable auxiliar para datos limpios
        let valorLimpio = null;

        // 1. Obtener y limpiar los criterios de búsqueda (usando desestructuración)
        const {  
            prefijo,
            numero_identificacion, 
            nombre, 
            apellido,
            numero_cuenta,
            tipo_cuenta,
            banco,
            estado,
            creadosDesde,
            creadosHasta,
            modificadosDesde,
            modificadosHasta,
            aprobadosDesde,
            aprobadosHasta
        } = criteriosBusqueda;
      
        // Se validan y parsean las fechas
        const fechaCreacionDesde = parseAndValidateDate(creadosDesde);
        const fechaCreacionHasta = parseAndValidateDate(creadosHasta);
        const fechaModificadosDesde = parseAndValidateDate(modificadosDesde);
        const fechaModificadosHasta = parseAndValidateDate(modificadosHasta);
        const fechaAprobadosDesde = parseAndValidateDate(aprobadosDesde);
        const fechaAprobadosHasta = parseAndValidateDate(aprobadosHasta);

        // Variables para las fechas
            let inicioDiaSiguiente = null;
            // Suma 24 horas (86,400,000 milisegundos)
            const milisegundosEnUnDia = 24 * 60 * 60 * 1000;


        // --- 2. Aplicar filtros solo si existen ---

            // Filtro 1: Prefijo
            if (validarExistencia(prefijo, "", false)) {  
                
                validarSoloNumeros(prefijo, "El prefijo debe contener solo números (dígitos 0-9).");
                const prefijo_Numerico = parseInt(prefijo, 10);

                if ( !(isNaN(prefijo_Numerico) || prefijo_Numerico < 1 || prefijo_Numerico > 5)) {
                    entidadWhere.id_prefijo = prefijo_Numerico;
                }; 

            }


            // Filtro 2: Número de identificación 
            if (validarExistencia(numero_identificacion, "", false)) {
                valorLimpio = String(numero_identificacion).trim();

                if (valorLimpio) { 
                    validarSoloNumeros(valorLimpio, "El número de identificación debe contener solo números (dígitos 0-9).");
                    entidadWhere.numero_identificacion = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }


            // Filtro 3: Nombre 
            if (validarExistencia(nombre, "", false)) {
                valorLimpio = String(nombre).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (valorLimpio) {            
                    validarSoloTexto(valorLimpio, "El nombre de la entidad debe contener solo texto o espacios en blanco, sin números.")
                    entidadWhere.nombre = { [Op.iLike]: `%${valorLimpio}%` }; 
                }
            }


            // Filtro 4: Apellido 
            if (validarExistencia(apellido, "", false)) {
                valorLimpio = String(apellido).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (valorLimpio) {
                    validarSoloTexto(valorLimpio, "El apellido de la entidad debe contener solo texto o espacios en blanco, sin números.")
                    entidadWhere.apellido = { [Op.iLike]: `%${valorLimpio}%` }; 
                }
            }


            // Filtro 5: Número de cuenta 
            if (validarExistencia(numero_cuenta, "", false)) {
                // Limpieza y Validación:
                valorLimpio = String(numero_cuenta).trim();

                if (valorLimpio) { 
                    validarSoloNumeros(valorLimpio, "El número de cuenta debe contener solo números (dígitos 0-9).");
                    cuentaBancariaWhere.numero_cuenta = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }

            // Filtro 6: Tipo de cuenta 
            if (validarExistencia(tipo_cuenta, "", false)) {
                // Limpieza y Validación:
                valorLimpio = String(tipo_cuenta).trim();

                if (valorLimpio) { 

                    validarIdNumerico(valorLimpio, "El tipo de cuenta no tiene el formato correcto.");
                    cuentaBancariaWhere.id_tipo_cuenta = valorLimpio;
                }
            }

            // Filtro 7: Banco
            if (validarExistencia(banco, "", false)) {
                // Limpieza y Validación:
                valorLimpio = String(banco).trim();

                if (valorLimpio) { 

                    validarIdNumerico(valorLimpio, "El banco no tiene el formato correcto.");
                    cuentaBancariaWhere.id_banco = valorLimpio;
                }
            }


            // Filtro 8: Estado

                // 1. Caso: Si solo se quieren las cuentas POR APROBAR (id_estado_cuenta = 5)
                if (porAprobar) { 
                    // Usamos la igualdad exacta
                    cuentaBancariaWhere.id_estado_cuenta = 5;

                } else { 
                    // 2. Caso: NO se quieren las cuentas por aprobar ("porAprobar" es "false")

                    // Inicializar la condición de WHERE con un array para usar Op.and
                    // Esto asegura que podemos combinar múltiples requisitos.
                    let condicionesEstado = [
                        // REGLA OBLIGATORIA: Siempre debe ser diferente de 5 si no se está buscando el estado de aprobación.
                        { id_estado_cuenta: { [Op.ne]: 5 } }
                    ];


                    // 2.1. Revisar si el usuario proporcionó un ID de estado específico
                    if (validarExistencia(estado, "", false)) { 
                        
                        const valorLimpio = String(estado).trim();

                        if (valorLimpio) {
                            validarIdNumerico(valorLimpio, "El estado de cuenta no tiene el formato correcto.");
                            const idEstadoBuscado = parseInt(valorLimpio, 10);
                            
                            // Verificación de seguridad: Evitar que el usuario fuerce el ID 5.
                            if (idEstadoBuscado === 5) {
                                throw new Error("El estado solicitado no es válido.");
                            }
                            
                            // Añadir la condición específica al array (ej. AND id_estado_cuenta = 3)
                            condicionesEstado.push({ id_estado_cuenta: idEstadoBuscado });
                        }
                    }
                    
                    // Aplicar las condiciones combinadas con AND
                    // Si solo existe el Op.ne, el WHERE será: WHERE "id_estado_cuenta" != 5
                    // Si se añade otro estado, el WHERE será: WHERE ("id_estado_cuenta" != 5 AND "id_estado_cuenta" = X)
                    cuentaBancariaWhere[Op.and] = condicionesEstado;

                }



            //Filtro 9: Se verifica si el usuario ha proporcionado al menos una de las fechas de creación
            if (fechaCreacionDesde || fechaCreacionHasta) {

                cuentaBancariaWhere.createdAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechaCreacionDesde) {
                    cuentaBancariaWhere.createdAt[Op.gte] = fechaCreacionDesde;
                }

                if (fechaCreacionHasta) {
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/


                    inicioDiaSiguiente = new Date(fechaCreacionHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    cuentaBancariaWhere.createdAt[Op.lt] = inicioDiaSiguiente;
        
                }
            }

            // Filtro 10: Se verifica si el usuario ha proporcionado al menos una de las fechas de modificación
            if (fechaModificadosDesde || fechaModificadosHasta) {

                cuentaBancariaWhere.updatedAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechaModificadosDesde) {
                    cuentaBancariaWhere.updatedAt[Op.gte] = fechaModificadosDesde;
                }

                if (fechaModificadosHasta) {
                    
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/
                    
                    inicioDiaSiguiente = new Date(fechaModificadosHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    cuentaBancariaWhere.updatedAt[Op.lt] = inicioDiaSiguiente;
                }
            }


            // Filtro 11: Se verifica si el usuario ha proporcionado al menos una de las fechas de aprobación
            if (fechaAprobadosDesde || fechaAprobadosHasta) {

                cuentaBancariaWhere.approvedAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechaAprobadosDesde) {
                    cuentaBancariaWhere.approvedAt[Op.gte] = fechaAprobadosDesde;
                }

                if (fechaAprobadosHasta) {
                    
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/
                    
                    inicioDiaSiguiente = new Date(fechaAprobadosHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    cuentaBancariaWhere.approvedAt[Op.lt] = inicioDiaSiguiente;
                }
            }


            // --- 3. Ejecutar la Consulta con Cláusulas WHERE separadas ---
            const cuentasBancarias = await Cuenta_Bancaria_Model.findAll({
                // Aplicamos los filtros directos de la tabla Estudiante
                where: cuentaBancariaWhere, 
                
                include: [ // Define qué otras tablas deben unirse a la consulta y qué campos de esas tablas deben traerse.
                    { 
                        association: 'entidad', // Realiza el JOIN desde "estudiante" a "entidad", basándose en la asociación Estudiante.belongsTo(Entidad, { as: 'entidad' }).

                        // APLICAMOS LOS FILTROS DE ENTIDAD AQUÍ
                        where: entidadWhere, // Usa el objeto where creado dinámicamente (es decir, se aplican los filtros de la tabla "entidad")
                        required: Object.keys(entidadWhere).length > 0, /* Sequelize por defecto realiza un LEFT OUTER JOIN . Trae todos los estudiantes que cumplan los 
                                                                        filtros de Estudiante, e incluye los datos de la Entidad si existen. El "required: true" hace que
                                                                        se convierta a "INNER JOIN", haciendo que se traigan solo aquellos datos que cumplan las condiciones
                                                                        indicadas, por lo que al decir "required: Object.keys(entidadWhere).length > 0", se está diciendo que
                                                                        si hay filtros de entidad, que se ap´lique un INNER JOIN.*/
                               
                        include: [ /* Inclusión Anidada: Le dice a Sequelize que, dentro de la tabla "entidad", debe realizar otro JOIN para traer el 
                                    prefijo asociado (Entidad.belongsTo(Prefijo_Identificacion, { as: 'prefijo' })).

                                    Resultado: Los datos del prefijo aparecerán anidados dentro del objeto entidad en el JSON final.*/
                            { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] }
                        ],
                        // Atributos de la entidad que queremos traer:
                        attributes: ['numero_identificacion', 'nombre', 'apellido', 'estado'] 
                    },
                    { 
                        association: 'estado_cuenta', 
                        attributes: ['id_estado_cuenta', 'nombre', 'descripcion', 'permite_operacion'] 
                    },
                    { 
                        association: 'banco', 
                        attributes: ['id_banco', 'nombre'] 
                    },
                    { 
                        association: 'tipo_cuenta', 
                        attributes: ['id_tipo_cuenta', 'nombre', 'descripcion'] 
                    }
                ],

                // Mantenemos el orden según las actualizaciones de la tabla "cuenta_bancaria"
                order: [ ['updatedAt', 'DESC'] ]
            });


        // --- Se devuelven los resultados formateados ---
        return cuentasBancarias.map(instancia => CuentaBancariaService.formatearCuentaBancaria(instancia));
    }
    

    // Esta función complementa a las funciones "buscarCuentasBancarias" y "obtenerCuentaBancariaPorId", y sirve para formatear las claves que le llegará al usuario
    static formatearCuentaBancaria(cuentaInstance) {

        // Si no existe la entidad se devuelve null
        if (!cuentaInstance) return null;

        const cuenta_bancaria = cuentaInstance.toJSON(); 

        return {
            id: cuenta_bancaria.id_cuenta_bancaria, 
            numero_cuenta: cuenta_bancaria.numero_cuenta.toString(),

            entidad_titular: {
                numero_identificacion: cuenta_bancaria.entidad.numero_identificacion ? cuenta_bancaria.entidad.numero_identificacion.toString() : null,
                nombre: cuenta_bancaria.entidad.nombre ? capitalizeFirstLetter(cuenta_bancaria.entidad.nombre.toString()) : null,
                apellido: cuenta_bancaria.entidad.apellido ? capitalizeFirstLetter(cuenta_bancaria.entidad.apellido.toString()) : null,
                estado: cuenta_bancaria.entidad.estado ? cuenta_bancaria.entidad.estado : null,

                prefijo: {
                    letra_prefijo: cuenta_bancaria.entidad.prefijo.letra_prefijo ? cuenta_bancaria.entidad.prefijo.letra_prefijo.toString() : null,
                }
            },

            banco: {
                id: cuenta_bancaria.banco.id_banco ? cuenta_bancaria.banco.id_banco : null,
                nombre: cuenta_bancaria.banco.nombre ? cuenta_bancaria.banco.nombre.toString() : null
            },

            tipo_cuenta: {
                id: cuenta_bancaria.tipo_cuenta.id_tipo_cuenta ? cuenta_bancaria.tipo_cuenta.id_tipo_cuenta : null,
                nombre: cuenta_bancaria.tipo_cuenta.nombre ? cuenta_bancaria.tipo_cuenta.nombre.toString() : null,
                descripcion: cuenta_bancaria.tipo_cuenta.descripcion ? cuenta_bancaria.tipo_cuenta.descripcion.toString() : null
            },

            estado: {
                id: cuenta_bancaria.estado_cuenta.id_estado_cuenta ? cuenta_bancaria.estado_cuenta.id_estado_cuenta : null,
                nombre: cuenta_bancaria.estado_cuenta.nombre ? cuenta_bancaria.estado_cuenta.nombre.toString() : null,
                descripcion: cuenta_bancaria.estado_cuenta.descripcion ? cuenta_bancaria.estado_cuenta.descripcion.toString() : null,
                permite_operacion: cuenta_bancaria.estado_cuenta.permite_operacion == true ? "Si" : "No",
            },
       
            fechaCreacion: cuenta_bancaria.createdAt,
            fechaActualizacion: cuenta_bancaria.updatedAt,
            fechaAprobacion: cuenta_bancaria.approvedAt,
        };


    }

    /**
     * Verifica si ya existe una cuenta bancaria con el número de cuenta y el banco proporcionado
     * y no creando una cuenta).
     * @param {string} numero_cuenta - El número de cuenta a buscar
     * @param {string} banco - El banco a buscar
     * @returns {bool} Retorna "true", o "false" si no hay duplicados.
     */
    async verificarCuentaBancariaExistente(numero_cuenta, banco) {
        
        let whereClause = {};

        validarExistencia(numero_cuenta, "número de cuenta", true);
        validarExistencia(banco, "banco", true);

        // Validamos primero el banco ya que necesitaremos los datos más adelante
        validarIdNumerico(banco, "El banco no tiene el formato correcto");
        // Se comprueba que exista un banco con ese id
        const banco_objeto = await Banco_Model.findByPk(banco.trim());

        if (!banco_objeto) {
            // EL banco no existe, no se puede crear la cuenta bancaria
            throw new Error(`El banco seleccionado no está registrado.`);
        }

        // Validamos ahora el número de cuenta
        const numero_cuenta_limpio = numero_cuenta.trim();
        validarSoloNumeros(numero_cuenta_limpio, "El número de cuenta debe contener solo números (dígitos 0-9).");
        // EL número de cuenta debe tener exactamente 20 dígitos
        if (numero_cuenta_limpio.length !== 20) {
            throw new Error(`El número de cuenta debe tener exactamente 20 dígitos. Longitud actual: ${numero_cuenta_limpio.trim().length}.`);
        }

        // Obtenemos el prefijo del número de cuenta (los primeros 4 dígitos).
        const prefijoCuenta = numero_cuenta_limpio.substring(0, 4);
        if (prefijoCuenta !== banco_objeto.codigo_nacional) {
            throw new Error(`El código del banco en la cuenta (${prefijoCuenta}) no coincide con el banco seleccionado (${banco_objeto.codigo_nacional}).`);
        }

        const cuentaEncontrada = await Cuenta_Bancaria_Model.findOne({
            where: {

                numero_cuenta: numero_cuenta_limpio,
                
                id_banco: banco_objeto.id_banco 
            },
            // Opcional: Solo traer el ID para optimizar la consulta si solo se necesita saber si existe
            attributes: ['id_cuenta_bancaria'] 
        });

        if (cuentaEncontrada) {
            return true; 
        }else{
            return false;
        }
    }



    /* Ésta función cuenta las cuentas bancarias que tiene una entidad según un rol */
    async ContarPorEntidad(id, rol) {

        if(!validarExistencia(id, "", false)){
            throw new Error(`Debe proporcionar el id de la entidad.`);
        }

        if(!validarExistencia(rol, "", false)){
            throw new Error(`Debe proporcionar el rol de la entidad.`);
        }

        const idLimpio = String(id).trim();
        const rolLimpio = String(rol).trim().toLowerCase();

        // Se valida el id
        validarIdNumerico(idLimpio, "El id no tiene el formato correcto");

        // Se valida el rol
        validarSoloTexto(rolLimpio, "El rol debe contener solo texto.");

        if(!["docente", "proveedor", "estudiante"].includes(rolLimpio)){
            throw new Error(`El rol proporcionado no es válido.`);
        }

        const tipo_rol_objeto = await await Tipo_Rol_Asociado_Model.findOne({
            where: {
                nombre: rolLimpio
            }
        })
        
        // Se valida la existencia de la entidad, si no existe se regresa null
        const entidad = await Entidad_Model.findByPk(idLimpio)

        if(!entidad){
            throw new Error(`la entidad solicitada no existe.`);
        };

        const totalCuentasAsociadas = await Entidad_Cuenta_Asociacion_Model.count({
            
            where: {
                id_entidad_asociada: entidad.id_entidad,
                id_tipo_rol: tipo_rol_objeto.id_tipo_rol
            }
        });

        return totalCuentasAsociadas;
    }



    async function guardarAsociaciones(entidadId, concepto, cuentasIds) {

        validarExistencia(entidadId, "entidad", true);
        validarExistencia(concepto, "concepto", true);

        if (!cuentasIds || cuentasIds.length === 0) {
            return []; // No hay nada que guardar
        }

        const entidad_limpia = entidadId.trim();
        validarIdNumerico(entidad_limpia, "La entidad no tiene el formato correcto");

        // Se comprueba que exista una entidad con ese id
        const entidad_objeto = await Entidad_Model.findByPk(entidad_limpia);

        if (!entidad_objeto) {
            // La Entidad  no existe, no se puede crear la cuenta bancaria
            throw new Error(`La entidad solicitada no está registrada.`);
        }

        const concepto_limpio = concepto.trim().toLowerCase();
        if(!["docente", "estudiante", "proveedor"].includes(concepto_limpio)){
            throw new Error(`El concepto no es válido.`);
        }

        const idsLimpios = cuentasIds.map((idString, index) => {
            // Configuramos el mensaje de error
            const campo = `cuenta Nº ${index + 1}`; 
            // Eliminamos espacios al inicio/final
            const id_limpio = idString.trim();


            validarExistencia(id_limpio, `La ${campo} no es válida`, true);
            
            validarIdNumerico(id_limpio, campo);

            return parseInt(id_limpio, 10);
        });


        // 2. Preparar los datos en el formato de array de objetos
        // Usamos el array ya limpio (idsDeCuentasValidados)
        const datosParaGuardar = idsDeCuentasValidados.map(cuentaId => ({
            // Asumiendo que estos son los nombres de las columnas en tu modelo AsociacionCuentaEntidad
            id_entidad: entidadId, 
            concepto_entidad: concepto,
            // cuentaId es ahora un número entero, listo para la DB
            id_cuenta_bancaria: cuentaId 
        }));


        // 1. Mapear el array de IDs
        const promesasDeCreacion = cuentasIds.map(cuentaId => {
            
            // 2. Por cada ID, creamos un objeto de datos a guardar
            const datosAsociacion = {
                id_entidad: entidadId,
                concepto_entidad: concepto,
                id_cuenta_bancaria: cuentaId
            };
            
            // 3. Devolver la promesa de creación (sin esperar aquí)
            return AsociacionCuentaEntidadModel.create(datosAsociacion);
        });

        // 4. Esperar que TODAS las promesas se resuelvan
        // Sequelize guardará todos los registros simultáneamente (batch insert).
        const resultados = await Promise.all(promesasDeCreacion);

        // 5. Retornar los resultados de los registros creados
        return resultados; 
    }



    
    
}


module.exports = CuentaBancariaService;