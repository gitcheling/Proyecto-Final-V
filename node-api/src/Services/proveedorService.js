/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Proveedor_Model = require('../Models/proveedor'); 
const Entidad_Model = require('../Models/entidad'); 
const Estado_Proveedor_Model = require('../Models/estado_proveedor');
const Tipo_Proveedor_Model = require('../Models/tipo_proveedor');  

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter} = require('../Utils/funciones');


// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 

class ProveedorService {

    // Se crea un nuevo proveedor
    async crearProveedor({id, tipo}) {
        

        // Validamos que existan todos los datos
        validarExistencia(id, "id", true);
        validarExistencia(tipo, "tipo de proveedor", true);


        const id_limpio = String(id).trim();
        validarIdNumerico(id_limpio, "El id no tiene el formato correcto");
        
        if (id_limpio == 1){
            throw new Error(`No se puede colocar la cuenta interna de la Academis como proveedor.`);
        }

        const tipo_proveedor_limpio = String(tipo).trim();
        validarIdNumerico(tipo_proveedor_limpio, "El tipo de proveedor no tiene el formato correcto");


        // Se comprueba que exista una entidad con ese id
        const entidad = await Entidad_Model.findByPk(id_limpio);

        if (!entidad) {

            // La Entidad  no existe, no se puede crear el estudiante.
            throw new Error(`La entidad con ID ${id_limpio} no está registrada.`);

        }else if(entidad.estado !== true){

            throw new Error(`No se puede crear un proveedor de una entidad desactivada.`);

        }

        // Se comprueba que no exista ya un proveedor con ese id (que para efectos prácticos, un proveedor sólo puede tener un tipo)
        const proveedor = await Proveedor_Model.findByPk(id_limpio);

        if (proveedor) {
            // Si lo encuentra, ya es proveedor para ese tipo
            throw new Error(`La Entidad ya está registrada como proveedor.`);
        }

        const tipo_proveedor_objeto = await Tipo_Proveedor_Model.findByPk(tipo_proveedor_limpio);

        if(!tipo_proveedor_objeto){ 

            throw new Error(`No existe el estado de proveedor solicitado.`);
        }



        const datos = {
            id_proveedor: entidad.id_entidad,
            id_tipo_proveedor: tipo_proveedor_objeto.id_tipo_proveedor,
            id_estado_proveedor: 1
        };
        
        
        const nuevoProveedor = await Proveedor_Model.create(datos);

       
        return {
            id: nuevoProveedor.id_proveedor, 
            estado_proveedor: "Activo",
            tipo_proveedor: tipo_proveedor_objeto.nombre,

            fechaCreacion: nuevoProveedor.createdAt,
            fechaActualizacion: nuevoProveedor.updatedAt            
        };
                
    }


    async modificarProveedor(id, nuevoEstado, tipo) {

        if(!validarExistencia(id, "id", false)){
            return null;
        }

        validarExistencia(nuevoEstado, "nuevo estado", true);
        validarExistencia(tipo, "tipo", true);

        // Se valida el id
        const id_limpio = String(id).trim();
        validarIdNumerico(id_limpio, "El id no tiene el formato correcto");
        

        // Se valida el nuevo estado
        const estado_limpio = String(nuevoEstado).trim();
        validarIdNumerico(estado_limpio, "El nuevo estado no tiene el formato correcto");

        const estado_numerico = parseInt(estado_limpio, 10);
        if ( isNaN(estado_numerico) || estado_numerico < 1 || estado_numerico > 4) {
           throw new Error(`El nuevo estado no es válido.`);
        }; 


        // Se valida el nuevo tipo
        const tipo_limpio = String(tipo).trim();
        validarIdNumerico(tipo_limpio, "El nuevo tipo no tiene el formato correcto");

        const tipo_numerico = parseInt(tipo_limpio, 10);
        if ( isNaN(tipo_numerico) || tipo_numerico < 1 || tipo_numerico > 10) {
           throw new Error(`El nuevo estado no es válido.`);
        }; 

        // Se valida la existencia de la cuenta, si no existe se regresa null
        const proveedor = await Proveedor_Model.findByPk(id)

        if(!proveedor){
            return null;
        };

        // Solo se actualiza la columna 'estado'
        const [filasAfectadas] = await Proveedor_Model.update(
            {   
                id_estado_proveedor: estado_numerico,
                id_tipo_proveedor: tipo_numerico 
            }, 
            { where: { id_proveedor: proveedor.id_proveedor } }
        );

        if (filasAfectadas === 0) {       
            return null;      
        }

        return true;
    
    }


    // Se obtiene un solo proveedor por el id
    async obtenerProveedorPorId(id) {

        validarExistencia(id, "id", true);

        validarIdNumerico(id, "El ID proporcionado no es un número entero válido o positivo.");

        // Método de Sequelize para buscar un proveedor por su Primary Key
        const proveedor = await Proveedor_Model.findByPk(id, {

                attributes: [// Atributos de la tabla principal (docente)                
                    'id_proveedor', 'createdAt', 'updatedAt'
                ],
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'entidad', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "docente")
                        attributes: ['numero_identificacion', 'nombre', 'apellido', 'estado', 'email', "telefono"], // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                    
                        // Este include anidado es para tener acceso a los prefijos
                        include: [{
                            // 2. Incluye el Prefijo (desde el modelo Entidad)
                            association: 'prefijo', // Alias definido en el modelo Entidad: Entidad.belongsTo(Prefijo_Identificacion)
                            attributes: ['letra_prefijo'] // Campos que se quieren del Prefijo
                        }]
                               
                    },
                    { 
                        association: 'tipo_proveedor', 
                        attributes: ['id_tipo_proveedor', 'nombre', 'descripcion'] 
                    },
                    { 
                        association: 'estado_proveedor', 
                        attributes: ['id_estado_proveedor', 'nombre', 'descripcion', 'permite_pago'] 
                    }
                ]
        });
        
        return ProveedorService.formatearProveedor(proveedor);
       
    }


    // Permite buscar cuentas basandose en filtros
    async buscarProveedores(criteriosBusqueda = {}) {
        
        // Objeto para condiciones en la tabla proveedor (base)
        const proveedorWhere = {};
        // Objeto para condiciones en la tabla entidad (asociada)
        const entidadWhere = {};

        // Variable auxiliar para datos limpios
        let valorLimpio = null;

        // 1. Obtener y limpiar los criterios de búsqueda (usando desestructuración)
        const {  
            prefijo,
            numero_identificacion, 
            nombre, 
            apellido,
            estado,
            creadosDesde,
            creadosHasta,
            modificadosDesde,
            modificadosHasta
        } = criteriosBusqueda;
      
        // Se validan y parsean las fechas
        const fechaCreacionDesde = parseAndValidateDate(creadosDesde);
        const fechaCreacionHasta = parseAndValidateDate(creadosHasta);
        const fechamodificadosDesde = parseAndValidateDate(modificadosDesde);
        const fechamodificadosHasta = parseAndValidateDate(modificadosHasta);

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

  
            // Filtro 5: Estado 
            if (validarExistencia(estado, "", false)) { 

                // Limpieza y Validación:
                valorLimpio = String(estado).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (valorLimpio) {

                    validarSoloNumeros(valorLimpio, "El estado debe contener solo números (dígitos 0-9).");
                    const estado_Numerico = parseInt(valorLimpio, 10);
                    if ( !(isNaN(estado_Numerico) || estado_Numerico < 1 || estado_Numerico > 10)) {

                        proveedorWhere.id_estado_proveedor = estado_Numerico;
                    }; 
                } 
       
            }


            //Filtro 10: Se verifica si el usuario ha proporcionado al menos una de las fechas de creación
            if (fechaCreacionDesde || fechaCreacionHasta) {

                proveedorWhere.createdAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechaCreacionDesde) {
                    proveedorWhere.createdAt[Op.gte] = fechaCreacionDesde;
                }

                if (fechaCreacionHasta) {
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/


                    inicioDiaSiguiente = new Date(fechaCreacionHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    proveedorWhere.createdAt[Op.lt] = inicioDiaSiguiente;
        
                }
            }

            // Filtro 11: Se verifica si el usuario ha proporcionado al menos una de las fechas de modificación
            if (fechamodificadosDesde || fechamodificadosHasta) {

                proveedorWhere.updatedAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechamodificadosDesde) {
                    proveedorWhere.updatedAt[Op.gte] = fechamodificadosDesde;
                }

                if (fechamodificadosHasta) {
                    
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/
                    
                    inicioDiaSiguiente = new Date(fechamodificadosHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    proveedorWhere.updatedAt[Op.lt] = inicioDiaSiguiente;
                }
            }



            // --- 3. Ejecutar la Consulta con Cláusulas WHERE separadas ---
            const proveedores = await Proveedor_Model.findAll({
                // Aplicamos los filtros directos de la tabla Estudiante
                where: proveedorWhere, 
                
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
                        attributes: ['numero_identificacion', 'nombre', 'apellido', 'telefono', 'email'] 
                    },
                    { 
                        association: 'tipo_proveedor', 
                        attributes: ['id_tipo_proveedor', 'nombre', 'descripcion'] 
                    },
                    { 
                        association: 'estado_proveedor', 
                        attributes: ['id_estado_proveedor', 'nombre', 'descripcion', 'permite_pago'] 
                    }
                ],

                // Mantenemos el orden según las actualizaciones de la tabla "estudiante"
                order: [ ['updatedAt', 'DESC'] ]
            });


        // --- Se devuelven los resultados formateados ---
        return proveedores.map(instancia => ProveedorService.formatearProveedor(instancia));
    }
    

    // Esta función complementa a las funciones "buscarProveedores" y "obtenerProveedorPorId", y sirve para formatear las claves que le llegará al usuario
    static formatearProveedor(proveedorInstance) {

        // Si no existe la entidad se devuelve null
        if (!proveedorInstance) return null;

        const proveedor = proveedorInstance.toJSON(); 
        

        // Función auxiliar para convertir booleanos a "Si"/"No"
        // Nota: si recibe "undefined" sería: "undefined === true" es false
        const boolToText = (value) => value === true ? "Si" : "No";

        return {
            id: proveedor.id_proveedor, 

            entidad: {
                numero_identificacion: proveedor.entidad?.numero_identificacion ?? null,
                nombre: proveedor.entidad?.nombre ? capitalizeFirstLetter(proveedor.entidad.nombre.toString()) : null,
                apellido: proveedor.entidad?.apellido ? capitalizeFirstLetter(proveedor.entidad.apellido.toString()) : null,
                telefono: proveedor.entidad?.telefono ?? null,
                email: proveedor.entidad?.email ?? null,

                estado: proveedor.entidad?.estado ?? null,

                prefijo: {
                    letra_prefijo: proveedor.entidad.prefijo.letra_prefijo?.toString() ?? null,
                }
            },

            estado: {
                id: proveedor.estado_proveedor?.id_estado_proveedor ?? null,
                nombre: proveedor.estado_proveedor?.nombre ?? null,
                descripcion: proveedor.estado_proveedor?.descripcion ?? null,

                // Si no existe se envía "undefined"
                permite_pago: boolToText(proveedor.estado_proveedor?.permite_pago),
            },

            tipo_proveedor: {
                id: proveedor.tipo_proveedor?.id_tipo_proveedor ?? null,
                nombre: proveedor.tipo_proveedor?.nombre ?? null,
                descripcion: proveedor.tipo_proveedor?.descripcion ?? null,

            },
       
            fechaCreacion: proveedor.createdAt,
            fechaActualizacion: proveedor.updatedAt 
        };

    }

}

module.exports = ProveedorService;