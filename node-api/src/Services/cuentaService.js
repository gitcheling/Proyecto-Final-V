/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Cuenta_Model = require('../Models/plan_cuenta'); 

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTextoPermisivo, validarSoloNumeros, validarBooleano, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 

class CuentaService {


    async crearCuenta({ codigo, nombre, naturaleza, cuenta_padre}) {

        // Validamos que existan todos los datos
        validarExistencia(codigo, "código", true);
        validarExistencia(nombre, "nombre", true);
        validarExistencia(naturaleza, "naturaleza", true);
        validarExistencia(cuenta_padre, "cuenta padre", true);
        
        // Se valida que el código sólo tenga números
        validarSoloNumeros(codigo, "El código de cuenta debe contener solo números (dígitos 0-9).")

        // Se valida que el nombre sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
        validarSoloTextoPermisivo(nombre, "El nombre de la cuenta debe contener solo texto, espacios, barra inclinada o guión, sin números.")

        /* Se valida la naturaleza, solo puede ser un número "1" o "2" (ya que solo se tienen y tendrón dos en la base de datos, y 
        justo esos son sus ids). A su vez, se comprueba que el valor sea un número entero.
        */
        validarSoloNumeros(naturaleza, "La naturaleza debe contener solo números (dígitos 0-9).")
        const naturalezaNumerica = parseInt(naturaleza, 10);
        if (isNaN(naturalezaNumerica) || naturalezaNumerica < 1 || naturalezaNumerica > 2) {
             throw new Error("La naturaleza solo puede ser Deudora o Acreedora.");
        }

        // Se verifica la existencia de la cuenta padre mediante una promesa
        validarIdNumerico(cuenta_padre, "La cuenta padre debe contener solo números (dígitos 0-9).")
        
        const cuentaPadre = await Cuenta_Model.findByPk(cuenta_padre);

        if(!cuentaPadre){
            throw new Error(`La cuenta padre no existe.`)
        };

        // Se obtiene el estado de la cuenta padre
        const estadoPadre = cuentaPadre.estado;

        if(!estadoPadre){
            throw new Error(`No puedes crear una cuenta de una cuenta padre desactivada.`);
        }

        // Se obtiene el código de la cuenta padre
        const codigoPadre = cuentaPadre.codigo;

        // Se valida que el código de la cuenta hija sea mas largo que el del padre (para que no sea el mismo código o menor) 
        validarSoloNumeros(codigo, "El código debe contener solo números (dígitos 0-9).")
        if (codigo.length <= codigoPadre.length) {
            throw new Error("El código de la cuenta hija debe ser más largo que el código de la cuenta padre para establecer la jerarquía.");
        }

        // Se valida que los dígitos iniciales del código de la cuenta hija sean iguales a los de la cuenta padre
        if (!codigo.startsWith(codigoPadre)) {
            throw new Error(`El código '${codigo}' debe iniciar con el código del padre: '${codigoPadre}'.`);
        }

        // Se valida que no exista ya el código en la base de datos
        if(await Cuenta_Model.findOne({ where: { codigo: codigo } })){
            throw new Error(`El código de cuenta '${codigo}' ya está registrado.`);
        }

        /* Ponemos el nombre en minúscula (para que todo se guarde en la base de datos así, sino alguien podría guardar una cuenta como
        "Activos", otro "ACTIVOS", otro "AcTiVoS" y demás)
        */
        const nombreEnMinuscula = nombre.toLowerCase().trim();

        // Se valida que no exista ya el nombre en la base de datos
        if(await Cuenta_Model.findOne({ where: { nombre: nombreEnMinuscula } })){
            throw new Error(`El nombre de cuenta '${nombreEnMinuscula}' ya está en uso.`);
        };



        // --------------- Si se pasan todas las validaciones, se realizan los cálculos -------------

        // Si el padre existe, la nueva cuenta es nivel del padre + 1
        const nivelCalculado = cuentaPadre.nivel + 1;

        // En éste sistema, el límite de nivel para las cuentas será de nivel 8
        if (nivelCalculado > 8) {
             throw new Error("El código de no puede ser mayor al nivel 8");
        }
         
        // Se combinan los datos del cliente con los valores calculados/fijos
        const cuentaData = {
            codigo,
            nivel: nivelCalculado,
            nombre: nombreEnMinuscula, 
            id_naturaleza: naturalezaNumerica, // Asumiendo que añades este campo al Modelo Sequelize
            id_clasificacion: cuentaPadre.id_clasificacion,
            id_padre: cuentaPadre.id_plan_cuenta,
            estado: true // O se omite si el Modelo tiene el defaultValue: true
        };

        // Se manda a crear la nueva cuenta
        const nuevaCuenta = await Cuenta_Model.create(cuentaData);

        // Renombramos las propiedades a regresar (para que el cliente no vea los nombres de las columnas de la base de datos)
        return {
            id: nuevaCuenta.id_plan_cuenta, 
            codigo: nuevaCuenta.codigo,
            nombre: capitalizeFirstLetter(nuevaCuenta.nombre),
            nivel: nuevaCuenta.nivel,
            estado: nuevaCuenta.estado,

            fechaCreacion: nuevaCuenta.createdAt,
            fechaActualizacion: nuevaCuenta.updatedAt,
            
            padreId: nuevaCuenta.id_padre, 
            naturalezaId: nuevaCuenta.id_naturaleza,
            clasificacionId: nuevaCuenta.id_clasificacion,           
     
        };
    }

    // Se manda a actualizar una cuenta
    async actualizarCuenta(id, nombre) {

        // Validamos que existan todos los datos
        validarExistencia(id, "id", true);
        validarExistencia(nombre, "nombre", true);
        
        validarIdNumerico(id, "El id es obligatorio");
        
        // Se valida que el nombre sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
        validarSoloTextoPermisivo(nombre, "El nombre de la cuenta debe contener solo texto, espacios barra inclinada o guión, sin números.")

        
        // Se busca la cuenta existente, y si no existe se regresa null
        const cuentaExistente = await Cuenta_Model.findByPk(id)

        if(!cuentaExistente){
            return null;
        };

        /* Ponemos el nombre en minúscula (para que todo se guarde en la base de datos así, sino alguien podría guardar una cuenta como
        "Activos", otro "ACTIVOS", otro "AcTiVoS" y demás)
        */
        const nombreEnMinuscula = nombre.toLowerCase().trim();
        
        const cuentaConMismoNombre = await Cuenta_Model.findOne({ 
            where: { 
                nombre: nombreEnMinuscula, // Que el nombre coincida (insensible a mayúsculas)
                
                // CLAVE: Que el ID sea DIFERENTE al que se está actualizando
                id_plan_cuenta: { [Op.ne]: id } 
            } 
        });


        if (cuentaConMismoNombre) {
            throw new Error(`El nombre '${nombreEnMinuscula}' ya está en uso por otra cuenta.`);
        }


        /* Se actualiza las columnas 'nombre' y 'estado' simultáneamente. El objetivo de este bloque es decirle a la base de datos: 
        "Cambia el "nombre" y el "estado" en la tabla "tb_plan_cuenta" solo para la fila donde el "id_plan_cuenta" coincide con el ID 
        que te di.". En si, ".update(...)": Es el método de Sequelize que genera y ejecuta una sentencia SQL de tipo UPDATE:

            -(A) "{ nombre: nombre, estado: estado }": Este es el primer argumento, el objeto de valores. Define las columnas que se
            van a cambiar y sus nuevos valores. El SQL equivalente es: 

                SET nombre = 'nuevo nombre', estado = true

            -(B) "{ where: { id_plan_cuenta: idNumerico } }": Este es el segundo argumento, el objeto de opciones. Define la condición 
            que debe cumplir la fila para ser actualizada. EL SQL equivalente es: 
            
                WHERE id_plan_cuenta = [idNumerico]

        Nota: El método ".update()" en Sequelize (cuando no se usa la opción returning: true, que no se tiene aquí en este caso) 
        siempre devuelve un arreglo que contiene, como primer elemento, la cantidad de filas que fueron modificadas.
        La sintaxis "[filasAfectadas]" está desestructurando ese arreglo devuelto y asignando el valor de su primer elemento a una 
        nueva variable llamada "filasAfectadas".
        */
        const [filasAfectadas] = await Cuenta_Model.update(
            { nombre: nombreEnMinuscula }, // Objeto con los campos a actualizar
            { where: { id_plan_cuenta: id } } // La condición para actualizar
        );

        // Se devuelve el objeto actualizado
        if (filasAfectadas === 0) {
            // Aunque improbable después de findByPk, se maneja.
            return null;
        }
        
        /* Cuando se ejecuta "Cuenta_Model.findByPk", nos devuelve un objeto especial de JavaScript llamado instancia de Sequelize 
        (que se guarda en la variable "cuentaExistente"). Sin embargo, esa instancia contiene los datos antiguos. El método "reload()"
         le dice a Sequelize que vaya a la base de datos y por medio de una consulta automática traiga los datos nuevos y reemplace 
         los viejos de la variable "cuentaExistente"

         Nota: Es importante ya que, si justo después de la actualización se quisiera hacer cualquier otra operación o validación usando
         la instancia ("cuentaExistente"), esos datos serían incorrectos. El método ".reload()" garantiza que el objeto JavaScript 
         local refleje instantáneamente el nuevo estado de la base de datos, asegurando la coherencia de datos en tiempo real.
        */
        await cuentaExistente.reload(); 

        return {
            id: cuentaExistente.id_plan_cuenta, 
            codigo: cuentaExistente.codigo,
            nombre: capitalizeFirstLetter(cuentaExistente.nombre),
            nivel: cuentaExistente.nivel,
            estado: cuentaExistente.estado,

            fechaCreacion: cuentaExistente.createdAt,
            fechaActualizacion: cuentaExistente.updatedAt,
            
            padreId: cuentaExistente.id_padre, 
            naturalezaId: cuentaExistente.id_naturaleza,
            clasificacionId: cuentaExistente.id_clasificacion,           
     
        };
    }


    // Ésta función simula el borrado de una cuenta al desactivarla o activarla (ya que permitir borrados sería desastroso)
    async cambiarEstadoCuenta(id, nuevoEstado) {

        if(!validarExistencia(id, "", false)){
            return null;
        }

        // Se valida el id
        validarIdNumerico(id, "El id es obligatorio");
        
        // Se valida el nuevo estado
        validarBooleano(nuevoEstado, "El campo estado solo puede ser verdadero o falso (true/false).")

        // Se valida la existencia de la cuenta, si no existe se regresa null
        if(!await Cuenta_Model.findByPk(id)){
            return null;
        };

        // Solo se actualiza la columna 'estado'
        const [filasAfectadas] = await Cuenta_Model.update(
            { estado: nuevoEstado }, 
            { where: { id_plan_cuenta: id } }
        );

        if (filasAfectadas === 0) {       
            return null;      
        }
        
        return true;
    }


    // Se obtiene una sola cuenta por el id (ya no se usa, la reemplazó "buscarCuentas")
    async obtenerCuentaPorId(id) {

        validarExistencia(id, "id", true);

        validarIdNumerico(id, "El ID proporcionado no es un número entero válido o positivo.");

        // Método de Sequelize para buscar un registro por su Primary Key (id_plan_cuenta)
        const cuenta = await Cuenta_Model.findByPk(id, {
                attributes: [
                    // Atributos de la Cuenta principal
                    'id_plan_cuenta', 'codigo', 'nombre', 'nivel', 'estado', 
                    'createdAt', 'updatedAt',
                    'id_naturaleza', 'id_clasificacion', 'id_padre' 
                ],
                include: [ 
                    { 
                        association: 'naturaleza', 
                        attributes: ['id_naturaleza', 'nombre'] 
                    },
                    { 
                        association: 'clasificacion', 
                        attributes: ['id_clasificacion', 'nombre'] 
                    },
                    { 
                        association: 'cuentaPadre', 
                        attributes: ['id_plan_cuenta', 'nombre'] 
                    }
                ]
            });
        
        return CuentaService.formatearCuenta(cuenta);
       
    }


    // Se obtienen todas las cuentas (ya no se usa, la reemplazó "buscarCuentas")
    async obtenerCuentas() {
        // Método de Sequelize para obtener todos los registros de la tabla
        const cuentas = await Cuenta_Model.findAll({
        attributes: [
            // Atributos de la Cuenta principal
            'id_plan_cuenta', 'codigo', 'nombre', 'nivel', 'estado', 
            'createdAt', 'updatedAt',
            // Opcionalmente se puedes incluir las FKs, aunque no son necesarias si se incluyes el objeto completo de cada una
            'id_naturaleza', 'id_clasificacion', 'id_padre' 
        ],
        include: [ // Incluímos los elementos que queremos de cada clave foránea
            { 
                // Alias de la relación
                association: 'naturaleza', 
                // Qué atributos de la tabla "tb_naturaleza" se quiere:
                attributes: ['id_naturaleza', 'nombre'] 
            },
            { 
                association: 'clasificacion', 
                attributes: ['id_clasificacion', 'nombre'] 
            },
            { 
                association: 'cuentaPadre', 
                // Aquí solo se quiere el ID y el nombre del padre
                attributes: ['id_plan_cuenta', 'nombre'] 
            }
        ],
        order: [ // Permite decir en que orden queremos los datos
            ['updatedAt', 'DESC'] 
        ]

        
    });



        /* Iteramos sobre el arreglo de las cuentas y usamos el método estático "formatearCuenta" para renombrar las propiedades de cada
        cuenta (con la finalidad de no devolver los nombres de las columnas de la base de datos, el cliente no tiene por que verlo), y las
        regresamos */

        console.log(cuentas);
        
        return cuentas.map(instancia => 
            CuentaService.formatearCuenta(instancia)
        );
        
    }


    // Permite buscar cuentas basandose en filtros
    async buscarCuentas(criteriosBusqueda = {}) {
        
        // Objeto que contendrá todas las condiciones de filtro combinadas con AND
        const whereClause = {};

        // 1. Obtener y limpiar los criterios de búsqueda (usando desestructuración)
        const { 
            codigo, 
            nombre, 
            nivel, 
            estado, 
            naturaleza, 
            clasificacion,
            padre,
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

        // Variable para guardar los datos en limpio
        let codigoLimpio = null;

        // Variables para las fechas
            let inicioDiaSiguiente = null;
            // Suma 24 horas (86,400,000 milisegundos)
            const milisegundosEnUnDia = 24 * 60 * 60 * 1000;


        // --- 2. Aplicar filtros solo si existen ---

            // Filtro 1: Código (Búsqueda parcial e insensible a mayúsculas)
            if (validarExistencia(codigo, "", false)) {  
                
                // Limpieza y Validación:
                codigoLimpio = String(codigo).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    // Se valida que el código sólo tenga números
                    validarSoloNumeros(codigo, "El código de cuenta debe contener solo números (dígitos 0-9).")

                    whereClause.codigo = {

                        // Se manda a buscar el código sin sensibilidad a mayúsculas o minúsculas
                        [Op.iLike]: `%${codigo}%`
                    }; 
                }

            }

            // Filtro 2: Nombre (Búsqueda parcial e insensible a mayúsculas)
            if (validarExistencia(nombre, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(nombre).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    // Se valida que el nombre sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
                    validarSoloTextoPermisivo(codigoLimpio, "El nombre de la cuenta debe contener solo texto, espacios barra inclinada o guión, sin números.")

                    whereClause.nombre = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }
            
            // Filtro 3: Nivel (Búsqueda exacta)
            if (validarExistencia(nivel, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(nivel).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    /* Se valida el nivel, solo puede ser un número del 1 al 6. A su vez, se comprueba que el valor sea un número entero.*/
                    const nivelNumerico = parseInt(nivel, 10);

                    if (isNaN(nivelNumerico) || nivelNumerico < 1 || nivelNumerico > 6) {
                        throw new Error("El nivel solo puede ser del 1 al 6.");
                    }

                    whereClause.nivel = nivelNumerico;
                }
            }

            // Filtro 4: Estado (Búsqueda exacta)
            if (validarExistencia(estado, "", false)) { // El estado puede ser 'true' o 'false', se revisa que NO sea "undefined"

                // Limpieza y Validación:
                codigoLimpio = String(estado).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    // Se valida el estado
                    validarBooleano(estado, "El estado solo puede ser verdadero o falso (true/false).")

                    whereClause.estado = estado;
                } 

                
            }

            // Filtro 5: Naturaleza (Foreign Key, Búsqueda exacta)
            if (validarExistencia(naturaleza, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(naturaleza).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    /* Se valida la naturaleza, solo puede ser un número "1" o "2" (ya que solo se tienen y tendrón dos en la base de datos, y 
                    justo esos son sus ids). A su vez, se comprueba que el valor sea un número entero.
                    */
                    const naturalezaNumerica = parseInt(naturaleza, 10);

                    if (isNaN(naturalezaNumerica) || naturalezaNumerica < 1 || naturalezaNumerica > 2) {
                        throw new Error("La naturaleza solo puede ser Deudora o Acreedora.");
                    }

                    whereClause.id_naturaleza = naturalezaNumerica;
                } 
                
            }

            // Filtro 7: Clasificación (Foreign Key, Búsqueda exacta)
            if (validarExistencia(clasificacion, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(clasificacion).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    /* Se valida la clasificacion, solo puede ser un número "1" o "2" (ya que solo se tienen y tendrón dos en la base de datos, y 
                    justo esos son sus ids). A su vez, se comprueba que el valor sea un número entero.
                    */
                    const clasificacionNumerica = parseInt(clasificacion, 10);

                    if (isNaN(clasificacionNumerica) || clasificacionNumerica < 1 || clasificacionNumerica > 2) {
                        throw new Error("La clasificación solo puede ser Real o Nominal.");
                    }

                    whereClause.id_clasificacion = clasificacionNumerica;
                } 

                
            }


            // Filtro 8: Padre (Búsqueda exacta)
            if (validarExistencia(padre, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(padre).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    // Se valida el id del padre
                    validarIdNumerico(padre, "El ID proporcionado del padre no es un número entero válido o positivo.");
                    whereClause.id_padre = padre;
                } 
                
            }

            
            //Filtro 9: Se verifica si el usuario ha proporcionado al menos una de las fechas de creación
            if (fechaCreacionDesde || fechaCreacionHasta) {

                whereClause.createdAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechaCreacionDesde) {
                    whereClause.createdAt[Op.gte] = fechaCreacionDesde;
                }

                if (fechaCreacionHasta) {
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/


                    let inicioDiaSiguiente = new Date(fechaCreacionHasta);
                     
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    whereClause.createdAt[Op.lt] = inicioDiaSiguiente;
        
                }
            }

            // Filtro 10: Se verifica si el usuario ha proporcionado al menos una de las fechas de modificación
            if (fechamodificadosDesde || fechamodificadosHasta) {

                whereClause.updatedAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechamodificadosDesde) {
                    whereClause.updatedAt[Op.gte] = fechamodificadosDesde;
                }

                if (fechamodificadosHasta) {
                    
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/
                    
                    inicioDiaSiguiente = new Date(fechamodificadosHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    whereClause.updatedAt[Op.lt] = inicioDiaSiguiente;
                }
            }


        // --- Se ejecutar la Consulta con la Cláusula WHERE construida ---
            
        const cuentas = await Cuenta_Model.findAll({
            // Aplicamos todas las condiciones construidas dinámicamente
            where: whereClause, 
            
            // Mantenemos las asociaciones (includes) para traer los nombres de FKs
            include: [ 
                { 
                    association: 'naturaleza', 
                    attributes: ['id_naturaleza', 'nombre'] 
                },
                { 
                    association: 'clasificacion', 
                    attributes: ['id_clasificacion', 'nombre'] 
                },
                { 
                    association: 'cuentaPadre', 
                    attributes: ['id_plan_cuenta', 'nombre'] 
                }
            ],
            
            // Mantenemos el orden por fecha de actualización
            order: [
                ['updatedAt', 'DESC'] 
            ]
        });

        console.log(cuentas);

        // --- Se devuelven los resultados formateados ---
        return cuentas.map(instancia => CuentaService.formatearCuenta(instancia));
    }



    // Esta función complementa a las funciones "obtenerCuentas" y "obtenerCuentaPorId", y sirve para formatear la clave que le llegará al usuario
    static formatearCuenta(cuentaInstance) {

        // Si no existe la cuenta se devuelve null
        if (!cuentaInstance) return null;

        const cuenta = cuentaInstance.toJSON(); 

        return {
            id: cuenta.id_plan_cuenta, 
            codigo: cuenta.codigo,
            nombre: capitalizeFirstLetter(cuenta.nombre),
            nivel: cuenta.nivel,
            estado: cuenta.estado,

            fechaCreacion: cuenta.createdAt,
            fechaActualizacion: cuenta.updatedAt,
            

            naturaleza: {
                id: cuenta.naturaleza ? cuenta.naturaleza.id_naturaleza : null,
                nombre: cuenta.naturaleza ? capitalizeFirstLetter(cuenta.naturaleza.nombre) : null,
            },
            
            clasificacion: {
                id: cuenta.clasificacion ? cuenta.clasificacion.id_clasificacion : null,
                nombre: cuenta.clasificacion ? capitalizeFirstLetter(cuenta.clasificacion.nombre) : null,
            },
            
            padre: {
                // Nota: Aquí se usa cuentaPadre, que es el alias de la recursividad
                id: cuenta.cuentaPadre ? cuenta.cuentaPadre.id_plan_cuenta : null,
                nombre: cuenta.cuentaPadre ? capitalizeFirstLetter(cuenta.cuentaPadre.nombre) : null,
            }           
        
        };
    }



    /**
     * Verifica si ya existe una cuenta con el mismo código o nombre, excluyendo un ID dado (en caso de que se estuviera modificando
     * y no creando una cuenta).
     * @param {string} codigo - El código a buscar (en minúsculas).
     * @param {string} nombre - El nombre a buscar (en minúsculas).
     * @param {number|null} idExcluido - El ID de la cuenta actual (para exclusión).
     * @returns {string|null} Retorna 'codigo', 'nombre', 'ambos', o null si no hay duplicados.
     */
    async verificarCuentaDuplicada(codigo, nombre, idExcluido) {
        
        /* Se debe configurar la condición WHERE.
        La "whereClause" es un objeto que mapea las condiciones de búsqueda y se construye en dos pasos principales: 
        la condición OR (para duplicados) y la condición NOT EQUAL (para exclusión):

            1. La Condición OR ([Op.or]): Este es el corazón de la validación de duplicados y utiliza el operador lógico "OR" de 
            Sequelize (Op.or). Por ejemplo: 

                const whereClause = {
                    [Op.or]: [
                        { codigo: codigo }, // Condición 1: Buscar por Código
                        { nombre: nombre }  // Condición 2: Buscar por Nombre
                    ]
                };

            Este codigo en partes se tiene:

                -[Op.or]: En SQL, esto se traduce directamente a un "OR". Le dice a la base de datos: "Quiero registros que cumplan 
                la Condición 1 o la Condición 2."

                -Condición 1 ({ codigo: codigo }): Busca cualquier fila donde el valor de la columna "codigo" en la tabla sea igual al 
                valor de la variable JavaScript "codigo" que se recibió. En SQl sería:

                    WHERE (codigo = 'valor_del_codigo' OR ...)

                -Condición 2 ({ nombre: nombre }): Busca cualquier fila donde el valor de la columna "nombre" en la tabla sea igual al
                valor de la variable JavaScript "nombre" que se recibió. En SQl sería:

                    WHERE (... OR nombre = 'valor_del_nombre')

            


            2. La Condición de Exclusión ([Op.ne]): Esta condición se añade solo cuando se está editando una cuenta (es decir, cuando 
            se proporciona un "idExcluido"). Por ejemplo:

                if (idExcluido) {
                    whereClause.id_plan_cuenta = { [Op.ne]: idExcluido };
                }
            
            Este codigo en partes se tiene:

                -idExcluido: Es el ID de la cuenta que se está modificando actualmente.

                -[Op.ne]: Significa "Not Equal" ("No es Igual" o "Distinto"). En SQL, se traduce a "<>".

        */
   
        let whereClause = {};

        validarExistencia(nombre, "nombre", true);
        
        // Se valida que el nombre sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
        validarSoloTextoPermisivo(nombre, "El nombre de la cuenta debe contener solo texto, espacios barra inclinada o guión, sin números.")


        if (!validarExistencia(codigo, "", false)) {
            whereClause = {
                [Op.or]: [
                    // Buscar por Nombre (exacto)
                    { nombre: nombre }
                ]
            };

        }else{

            // Se valida que el código sólo tenga números
            validarSoloNumeros(codigo, "El código de cuenta debe contener solo números (dígitos 0-9).")

            whereClause = {
                [Op.or]: [
                    // Buscar por Código (exacto)
                    { codigo: codigo },
                    // Buscar por Nombre (exacto)
                    { nombre: nombre }
                ]
            };

        }
        
        // Si se proporciona un ID a excluir, se agrega a la cláusula WHERE
        if (validarExistencia(idExcluido, "", false)) {

            validarIdNumerico(idExcluido, "El id es obligatorio");

            whereClause.id_plan_cuenta = { [Op.ne]: idExcluido };

        }

        // Se busca una cuenta que cumpla la condición
        //Nota: Si encuentra una cuenta que coincide con la condición (Op.or) y no es el "idExcluido", devuelve esa instancia.
        const cuentaDuplicada = await Cuenta_Model.findOne({ 
            where: whereClause 
        });

        // Se determina qué campo está duplicado (comparando los datos obtenidos de la base de datos con los traidos desde el frontend)
        if (cuentaDuplicada) {

            let nombreDuplicado = cuentaDuplicada.nombre.toLowerCase() === nombre;
            let codigoDuplicado = null;

            if (validarExistencia(codigo, "", false)) {
                codigoDuplicado = cuentaDuplicada.codigo.toLowerCase() === codigo;
            }

            if (codigoDuplicado && nombreDuplicado) {
                return 'ambos';
            } else if (codigoDuplicado) {
                return 'codigo';
            } else if (nombreDuplicado) {
                return 'nombre';
            }
        }

        return null; // No hay duplicados
    }



}

module.exports = CuentaService;