/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Entidad_Model = require('../Models/entidad'); 
const Regla_Prefijo_Documento_Model = require('../Models/regla_prefijo_documento'); 
const Tipo_Identificacion_Model = require('../Models/tipo_identificacion'); 
const Prefijo_Identificacion_Model = require('../Models/prefijo_identificacion'); 

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, validarLongitudCadena, validarEmail, validarSoloNumerosYGuion, validarTelefonoVenezolano, validarBooleano, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter, traducirMes} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op, fn, col } = require('sequelize'); 

class EntidadService {

// -------------------------- Creación ------------------------------------

    // Se crea una entidad
    async crearEntidad({tipo_identificacion, prefijo, numero_identificacion, nombre, apellido, email, telefono, direccion }) {

        // Validamos que existan todos los datos
        validarExistencia(tipo_identificacion, "tipo de identificación", true);
        validarExistencia(prefijo, "prefijo", true);
        validarExistencia(numero_identificacion, "número de identificación", true);
        validarExistencia(nombre, "nombre", true);
        validarExistencia(email, "email", true);
        validarExistencia(telefono, "teléfono", true);
        validarExistencia(direccion, "dirección", true);

        /* Se valida el tipo de identificación, solo puede ser un número del "1" al "4" (ya que solo se tienen y tendrán esas en la base de datos, y 
        justo esos son sus ids). A su vez, se comprueba que el valor sea un número entero.
        */
        validarSoloNumeros(tipo_identificacion, "El tipo de identificación debe contener solo números (dígitos 0-9).")
        const tipo_Identificacion_Numerica = parseInt(tipo_identificacion, 10);
        if (isNaN(tipo_Identificacion_Numerica) || tipo_Identificacion_Numerica < 1 || tipo_Identificacion_Numerica > 4) {
            throw new Error("El tipo de identificación no es válido.");
        }

        /* Se valida el prefijo, solo puede ser un número del "1" al "5" (ya que solo se tienen y tendrán esas en la base de datos, y 
        justo esos son sus ids). A su vez, se comprueba que el valor sea un número entero.
        */
        validarSoloNumeros(prefijo, "El prefijo debe contener solo números (dígitos 0-9).")
        const prefijo_Numerico = parseInt(prefijo, 10);
        if (isNaN(prefijo_Numerico) || prefijo_Numerico < 1 || prefijo_Numerico > 5) {
            throw new Error("El prefijo no es válido.");
        }

        // Se valida que el número de identificacion sólo tenga números
        validarSoloNumerosYGuion(numero_identificacion, "El número de identificación debe contener solo números (dígitos 0-9) o guión (-).")

        // Se valida que el nombre sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
        validarSoloTexto(nombre, "El nombre debe contener solo texto y espacios en blanco.");

        if(validarExistencia(apellido, "", false)){
            // Se valida que el apellido sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
            validarSoloTexto(apellido, "El apellido debe contener solo texto y espacios en blanco.")
        }

        // Se valida que el correo sea válido
        validarEmail(email, "El correo electrónico no tiene un formato válido.");

        // Se valida que el número de teléfono sólo tenga números y el formato correcto
        validarTelefonoVenezolano(telefono, "El número de teléfono debe tener solo números, y 11 digitos exactos")

        // Se valida que la dirección tenga el rango indicado
        validarLongitudCadena(direccion, 5, 255, "La dirección debe tener entre 5 y 255 caracteres.");
    

        // Se valida que no exista ya el correo en la base de datos
        const correoEnMinuscula = email.toLowerCase();
        if(await Entidad_Model.findOne({ where: { email: correoEnMinuscula } })){
            throw new Error(`El email '${email}' ya está registrado.`);
        }

        // Se valida la restricción UNIQUE del modelo
        if(await Entidad_Model.findOne({ where: { 
                                                id_prefijo : prefijo_Numerico,
                                                id_tipo_identificacion : tipo_Identificacion_Numerica,
                                                numero_identificacion : numero_identificacion } }))
        {
            throw new Error(`La entidad con ese prefijo, tipo de identificación y número de identificación ya está registrado.`);
        }


        // Comprobamos que el tipo de documento coincida con el prefijo
        if(!await Regla_Prefijo_Documento_Model.findOne({ where: { 
                                                id_tipo_identificacion : tipo_Identificacion_Numerica,
                                                id_prefijo : prefijo_Numerico } }))
        {
            throw new Error(`Debe seleccionar un prefijo que coincida con el tipo de documento.`);
        }
        
        
        // Calculamos el tipo de entidad según el tipo de documento
        // Decimos que por defecto es Persona Natural (1)
        const id_tipo_entidad = 1;

        // Si el tipo de identificación es un RIF la entidad puede ser jurídica
        if(tipo_Identificacion_Numerica === 4){ 

            // Si el prefijo no es ni "V" (1) o "E" (2) entonces es Persona Jurídica
            if(prefijo_Numerico !== 1 && prefijo_Numerico !== 2){

                id_tipo_entidad = 2;
            }
            
        }

        /* Nota: el tipo de entidad "3" es para uso interno, ya que la academia no maneja sucursales sólo se crea una entidad para la
        academia y se hace a nivel de base de datos, el usuario no puede hacerlo (de esta forma teniendo a la academia como entidad, 
        si hay un movimiento interno esta saldrá como la entidad que lo produjo) */


        //Ponemos los datos en minúscula (para que todo sea consistente) 
        let nombreEnMinuscula = nombre.toLowerCase().trim();
        let apellidoEnMinuscula = null;

        if(validarExistencia(apellido, "", false)){
            apellidoEnMinuscula = apellido.toLowerCase().trim();
        }
        
        let direccionEnMinuscula = direccion.toLowerCase().trim();

    
        const entidadData = {
            id_tipo_entidad: id_tipo_entidad,
            id_tipo_identificacion: tipo_Identificacion_Numerica,
            id_prefijo: prefijo_Numerico,
            numero_identificacion: numero_identificacion,
            nombre: nombreEnMinuscula, 
            apellido: apellidoEnMinuscula,        
            email: correoEnMinuscula, 
            telefono: telefono,
            direccion: direccionEnMinuscula
        };

        // Se manda a crear la nueva entidad
        const nuevaEntidad = await Entidad_Model.create(entidadData);

        // Renombramos las propiedades a regresar (para que el cliente no vea los nombres de las columnas de la base de datos)
        return {
            id: nuevaEntidad.id_entidad, 
            tipo_entidad: nuevaEntidad.id_tipo_entidad,
            tipo_identificacion: nuevaEntidad.id_tipo_identificacion,
            prefijo: nuevaEntidad.id_prefijo,
            numero_identificacion: nuevaEntidad.numero_identificacion,
            nombre: capitalizeFirstLetter(nuevaEntidad.nombre), 
            apellido: capitalizeFirstLetter(nuevaEntidad.apellido ? nuevaEntidad.apellido : ""),        
            email: nuevaEntidad.email,
            telefono: nuevaEntidad.telefono,
            direccion: nuevaEntidad.direccion,
            estado: nuevaEntidad.estado,
            
            fechaCreacion: nuevaEntidad.createdAt,
            fechaActualizacion: nuevaEntidad.updatedAt
            
        };
    }



// -------------------------- Modificación ------------------------------------

    // Se manda a actualizar una entidad
    /*Nota: Los campos que no se deben modificar son:

        -id_entidad	Llave Primaria (PK). Identificador único y absoluto. Nunca debe cambiar.
        -id_tipo_entidad: Naturaleza del sujeto económico (Natural, Jurídica, Interna). Si se cambia, se rompen todas las reglas de inferencia y las posibles restricciones en tablas de rol (Ej: Un id_entidad Jurídico no puede ser Estudiante).
        -id_prefijo: Componente de la C.I./RIF (V, E, J, G). Es parte de la identidad fiscal única.
        -id_tipo_identificacion: Tipo de Documento (Cédula, RIF, Pasaporte). Es parte de la identidad fiscal única.
        -numero_identificacion: Número del documento. Es la parte central de la identidad fiscal. 
    */
    async actualizarEntidad(id, nombre, apellido, email, telefono, direccion) {

        // Validamos que existan todos los datos
        validarExistencia(id, "id", true);
        validarExistencia(nombre, "nombre", true);
        validarExistencia(email, "email", true);
        validarExistencia(telefono, "teléfono", true);
        validarExistencia(direccion, "dirección", true);

        validarIdNumerico(id, "El id es obligatorio");

        // Se valida que el nombre sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
        validarSoloTexto(nombre, "El nombre debe contener solo texto y espacios en blanco.");

        if(validarExistencia(apellido, "", false)){
            // Se valida que el apellido sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
            validarSoloTexto(apellido, "El apellido debe contener solo texto y espacios en blanco.")
        }

        // Se valida que el correo sea válido
        validarEmail(email, "El correo electrónico no tiene un formato válido.");

        // Se valida que el número de teléfono sólo tenga números y el formato correcto
        validarTelefonoVenezolano(telefono, "El número de teléfono debe tener solo números, y 11 digitos exactos")

        // Se valida que la dirección tenga el rango indicado
        validarLongitudCadena(direccion, 5, 255, "La dirección debe tener entre 5 y 255 caracteres.");
        
    
        
        // Se busca la entidad existente, y si no existe se regresa null
        const entidadExistente = await Entidad_Model.findByPk(id)

        if(!entidadExistente){
            return null;
        };


        // Se comprueba si el correo es distinto
        const correoEnMinuscula = email.toLowerCase().trim();
        if(correoEnMinuscula !== entidadExistente.email){

            if(await Entidad_Model.findOne({ where: { email: correoEnMinuscula } })){
                throw new Error(`El email '${email}' ya está registrado.`);
            }
        }

        //Ponemos los datos en minúscula (para que todo sea consistente) 
        let nombreEnMinuscula = nombre.toLowerCase().trim();
        let direccionEnMinuscula = direccion.toLowerCase().trim();
        let apellidoEnMinuscula = null;

        if(validarExistencia(apellido, "", false)){
            apellidoEnMinuscula = apellido.toLowerCase().trim();
        }

        


        const [filasAfectadas] = await Entidad_Model.update(
            { // Objeto con los campos a actualizar
                nombre: nombreEnMinuscula,
                apellido: apellidoEnMinuscula,
                email: correoEnMinuscula,
                telefono: telefono,
                direccion: direccionEnMinuscula
            }, 
            
            { where: { id_entidad: id } } // La condición para actualizar
        );

        // Se devuelve el objeto actualizado
        if (filasAfectadas === 0) {
            // Aunque improbable después de findByPk, se maneja.
            return null;
        }
        
        await entidadExistente.reload(); 

        // Renombramos las propiedades a regresar (para que el cliente no vea los nombres de las columnas de la base de datos)
        return {
            id: entidadExistente.id_entidad, 
            tipo_entidad: entidadExistente.id_tipo_entidad,
            tipo_identificacion: entidadExistente.id_tipo_identificacion,
            prefijo: entidadExistente.id_prefijo,
            numero_identificacion: entidadExistente.numero_identificacion,
            nombre: capitalizeFirstLetter(entidadExistente.nombre), 
            apellido: capitalizeFirstLetter(entidadExistente.apellido),        
            email: entidadExistente.email,
            telefono: entidadExistente.telefono,
            direccion: entidadExistente.direccion,
            estado: entidadExistente.estado,
            
            fechaCreacion: entidadExistente.createdAt,
            fechaActualizacion: entidadExistente.updatedAt
            
        };
    }


    // Ésta función simula el borrado de una entidad al desactivarla o activarla (ya que permitir borrados sería desastroso)
    async cambiarEstadoEntidad(id, nuevoEstado) {

        if(!validarExistencia(id, "id", false)){
            return null;
        }

        // Se valida el id
        validarIdNumerico(id, "El id no tiene el formato correcto");

        // Se valida que el id de la cuenta no sea el "1" (la cuenta interna)
        if(id === 1){
            throw new Error("No puedes cambiar el estado de la cuenta interna de la academia");
        };
        
        // Se valida el nuevo estado
        validarBooleano(nuevoEstado, "El campo estado solo puede ser verdadero o falso (true/false).")

        // Se valida la existencia de la cuenta, si no existe se regresa null
        if(!await Entidad_Model.findByPk(id)){
            return null;
        };

        // Solo se actualiza la columna 'estado'
        const [filasAfectadas] = await Entidad_Model.update(
            { estado: nuevoEstado }, 
            { where: { id_entidad: id } }
        );

        if (filasAfectadas === 0) {       
            return null;      
        }
    
        return true;
    }



// -------------------------- Obtención ------------------------------------

    // Se obtiene una sola entidad por el id
    async obtenerEntidadPorId(id) {

        validarExistencia(id, "id", true);

        validarIdNumerico(id, "El ID proporcionado no es un número entero válido o positivo.");

        // Método de Sequelize para buscar una entidad por su Primary Key
        const entidad = await Entidad_Model.findByPk(id, {

                attributes: [// Atributos de la tabla principal (entidad)                
                    'id_entidad', 'id_tipo_entidad', 'id_tipo_identificacion', 'id_prefijo', 
                    'numero_identificacion', 'nombre','apellido','email','telefono',
                    'direccion', 'estado', 'createdAt', 'updatedAt'
                ],
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'tipo_entidad', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "entidad")
                        attributes: ['id_tipo_entidad', 'nombre'] // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                    },
                    { 
                        association: 'tipo_identificacion', 
                        attributes: ['id_tipo_identificacion', 'nombre'] 
                    },
                    { 
                        association: 'prefijo', 
                        attributes: ['id_prefijo', 'letra_prefijo'] 
                    }
                ]
        });
        
        return EntidadService.formatearEntidad(entidad);
    
    }


    // Se obtienen los prefijos según el tipo de identificación
    async obtenerPrefijos(id) {

        validarExistencia(id, "id", true);

        validarSoloNumeros(id, "El tipo de identificación debe contener solo números (dígitos 0-9).")
        const tipo_Identificacion_Numerica = parseInt(id, 10);
        if (isNaN(tipo_Identificacion_Numerica) || tipo_Identificacion_Numerica < 1 || tipo_Identificacion_Numerica > 4) {
            throw new Error("El tipo de identificación no es válido.");
        }

        const resultado = await Tipo_Identificacion_Model.findByPk(tipo_Identificacion_Numerica, {
            // Usamos la asociación 'Prefijos' que definimos con 'as'
            include: [{
                model: Prefijo_Identificacion_Model, // El modelo de sequelize de la otra tabla
                as: 'prefijos_sociados', // El "as" definido en "tipo_identificacion"
                // Opcional: Especifica solo los atributos que se necesita del prefijo
                attributes: ['id_prefijo', 'letra_prefijo', 'descripcion'],

                through: {
                    attributes: []
                }
            }],
            // Opcional: No se necesita en éste caso los atributos del tipo_identificacion
            attributes: [] 
        });

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }
        return resultado.prefijos_sociados;
    
    }


    // Permite buscar entidades basandose en filtros
    async buscarEntidades(criteriosBusqueda = {}) {
        
        const whereClause = this.generarWhereClause(criteriosBusqueda);

        // --- Se ejecutar la Consulta con la Cláusula WHERE construida ---
            
        const entidades = await Entidad_Model.findAll({
            // Aplicamos todas las condiciones construidas dinámicamente
            where: whereClause, 
            
            // Mantenemos las asociaciones (includes) para traer los nombres de FKs
            include: [ 
                { 
                    association: 'tipo_entidad', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "entidad")
                    attributes: ['id_tipo_entidad', 'nombre'] // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                },
                { 
                    association: 'tipo_identificacion', 
                    attributes: ['id_tipo_identificacion', 'nombre'] 
                },
                { 
                    association: 'prefijo', 
                    attributes: ['id_prefijo', 'letra_prefijo'] 
                }
            ],

            // Mantenemos el orden por fecha de actualización
            order: [
                ['updatedAt', 'DESC'] 
            ]
        });

        // --- Se devuelven los resultados formateados ---
        return entidades.map(instancia => EntidadService.formatearEntidad(instancia));
    }


    // Obtiene el conteo por mes de entidades, lo que es necesario para los gráficos
    async obtenerConteoPorMes(criteriosBusqueda = {}) {

        const concepto = criteriosBusqueda.concepto ?? null;

        // Validamos que existan todos los datos
        validarExistencia(concepto, "concepto", true);

        const conceptoLimpio = String(concepto).trim().toLowerCase();
        // Se valida que el concepto sólo tenga texto 
        validarSoloTexto(concepto, "El concepto debe contener solo texto y espacios en blanco.");

        let columna = "";

        switch (conceptoLimpio) {
            case "creados":
                columna = "createdAt";
                break;
            case "modificados":
                columna = "updatedAt";
                break;
            default:
                columna = "createdAt";
        }
        
        const whereClause = this.generarWhereClause(criteriosBusqueda);

        /* Se agregar el filtro de "Realmente Modificados", y se hace debido a que, al registrar a una entidad, se coloca su
        fecha de "updatedAt" en la misma que "createdAt", y si mandamos a contar sin mas las entidades actualizadas nos va a
        salir la misma cantidad de modificados que de creados, por lo que si realmente queremos saber cuántas entidades fueron
        modificadas, su fecha de "updatedAt" debe ser mayor que la de "createdAt" */
        if (conceptoLimpio === "modificados") {
        
            // La condición de que la fecha de actualización sea posterior a la de creación
            // Esto asegura que solo contamos las modificaciones reales, no la creación inicial.
            const whereModificado = { [Op.gt]: col('createdAt') }; 
            
            if (whereClause.updatedAt) {
                // Si ya hay condiciones de fecha (Desde/Hasta) en updatedAt, las combinamos con Op.and
                whereClause.updatedAt = {
                    [Op.and]: [
                        whereClause.updatedAt, // Conserva los filtros de fecha (Desde/Hasta)
                        whereModificado            // Agrega la condición de ser posterior a la creación
                    ]
                };
            } else {
                // Si no hay filtros de fecha, solo agregamos la condición de ser posterior a la creación
                whereClause.updatedAt = whereModificado;
            }
        }


        /* Nota: El módulo "fn" permite invocar cualquier función nativa de la base de datos (como PostgreSQL, MySQL, etc.) dentro 
        de una consulta. Llama a una función de la base de datos. Es usado para llamar a funciones como COUNT(), TRIM(), TO_CHAR(), 
        y DATE_TRUNC().Sintaxisfn(nombreFuncionSQL, arg1, arg2, ...)fn('COUNT', col('id_entidad')). Su propósito es realizar 
        operaciones que el servidor de la base de datos está optimizado para hacer, como cálculos, formateo de fechas o agregaciones.
        Ejemplo: En la línea [fn('COUNT', col('id_entidad')), 'conteo'], le estás pidiendo a Sequelize que ejecute la función SQL "COUNT" 
        sobre la columna "id_entidad" y llame al resultado conteo.
        

        El módulo "col" se utiliza como argumento dentro de otras funciones (como fn o literal) para indicar explícitamente que el valor 
        que se está pasando es el nombre de una columna de la tabla, y no un string literal. Evitar ambigüedades en SQL. Si no se usa "col", 
        Sequelize podría interpretar el nombre como una cadena que debe ser enviada a la base de datos (ej: 'id_entidad'), en lugar de la 
        columna real ("id_entidad").
        
        */
        
        // 2. Definición del Conteo y Agrupación por Mes/Año
        const resultadosAgregados = await Entidad_Model.findAll({

            where: whereClause,
            
            attributes: [
                /* A) Conteo: COUNT(*). Se compone de tres partes:

                    -"fn('COUNT', ...)": Es la función de agregación. Le indica a Sequelize que debe aplicar la función SQL de conteo (COUNT).

                    -"col('id_entidad')": Es la columna de Referencia. Especifica que la función "COUNT" debe contar los valores no nulos en 
                    la columna "id_entidad" (que es la clave primaria y siempre existirá).

                    -'conteo'. Es el alias (Nombre de Salida). Define cómo se llamará el resultado de esta operación en el JSON final que 
                    JavaScript recibe.

                El equivalente en sql es: 

                    COUNT("id_entidad") AS "conteo"
                */
                [fn('COUNT', col('id_entidad')), 'conteo'],
                
                /* B) Etiqueta de Mes (para el cliente): Usamos TO_CHAR. Se compone de:

                    -"fn('TO_CHAR', ...)". Es la función SQL. Llama a la función TO_CHAR (To Character, "A Carácter") de la base de datos. Esta función convierte 
                    un valor de fecha/tiempo a una cadena de texto según un formato específico.

                    -"col('createdAt')": Es el dato de Entrada. Indica que el valor que se debe formatear es el contenido de la columna "createdAt" (la fecha y hora 
                    en que se creó la entidad).

                    -'Month YYYY'. Es el formato deseado. Es la plantilla que le dice a "TO_CHAR" cómo debe lucir la cadena de salida: "Month" (nombre completo del mes,
                    con mayúscula inicial) seguido del "YYYY" (año completo de cuatro dígitos).

                    -'mes': Es el alias (Nombre de Salida). Define el nombre con el que se accederá a esta cadena formateada en JavaScript. (ej: item.mes valdrá "Noviembre 2025").
                
                El equivalente en sql es (poniendo de ejemplo a "createdAt"): 

                    TO_CHAR("createdAt", 'Month YYYY') AS "mes"
                */
                    [
                    fn(
                        'TO_CHAR', 
                        col(columna), 
                        'Month YYYY' 
                    ), 
                    'mes'
                ],
                
                /*Llama a la función nativa "DATE_TRUNC" (Date Truncate o "Truncar Fecha") de PostgreSQL. Esta función "corta" la fecha/hora a una precisión específica.
                Los componentes son:

                    -'month': Especifica que la fecha debe truncarse al nivel de mes.

                    -"col('createdAt')": La columna de fecha/hora a truncar.

                    -'fecha_orden': El alias (Nombre de Salida). El nombre que se asigna a este valor truncado.
                
                El equivalente en sql es (poniendo de ejemplo a "createdAt"): 

                    DATE_TRUNC('month', "createdAt") AS "fecha_orden"

                Nota: Cuando se usa "DATE_TRUNC" con la unidad 'month' no es que corte la fecha de forma literal y se pierda todo lo demás, sino que la base de datos 
                (PostgreSQL, en este caso) toma el valor de tiempo original y lo ajusta de la siguiente manera:

                    -Año y Mes: El Año y el Mes originales se mantienen sin cambios.

                    -Día: El Día se establece al valor mínimo posible para ese mes, que es el 1.

                    -Hora, Minuto, Segundo, Milisegundo: Todos los componentes de la hora (que son más detallados que la unidad de truncamiento) se establecen a cero.
                
                Por ejemplo:

                    Entidad	    Valor Original (createdAt)	    DATE_TRUNC('month', createdAt)
                    A	        2025-11-09 14:30:55	            2025-11-01 00:00:00
                    B	        2025-11-20 08:15:00	            2025-11-01 00:00:00
                    C	        2025-12-05 10:00:00	            2025-12-01 00:00:00

                Esto se hace con los elementos que ya trajo el "WHERE" previamente.
                */
                [fn('DATE_TRUNC', 'month', col(columna)), 'fecha_orden']

            ],
            
            // Este bloque es la cláusula GROUP BY
            group: [
                // Agrupamos por la etiqueta de mes (TO_CHAR)
                fn('TO_CHAR', col(columna), 'Month YYYY'),

                // Agregamos el campo de ordenamiento/agrupación (DATE_TRUNC)
                fn('DATE_TRUNC', 'month', col(columna))
            ],
            
            // Ordenar por la fecha de creación (usando el campo DATE_TRUNC)
            order: [
                // Usamos el DATE_TRUNC aquí, que ahora es parte del GROUP BY
                [fn('DATE_TRUNC', 'month', col(columna)), 'ASC'] 
            ],
            
            raw: true 
        });

        return resultadosAgregados.map(item => ({
            mes: traducirMes(item.mes), 
            conteo: parseInt(item.conteo, 10)
        }));
    }


    // Obtiene la cantidad total de entidades activas e inactivas para los gráficos
    async obtenerEstadosTotales(criteriosBusqueda = {}) {
        
        const whereClause = this.generarWhereClause(criteriosBusqueda);

    
        const resultadosAgregados = await Entidad_Model.findAll({

            where: whereClause,
            
            attributes: [
                // A) Conteo total de entidades por grupo (estado)
                [fn('COUNT', col('id_entidad')), 'conteo'],
                
                // B) Columna de Agrupación: Seleccionar el valor del estado
                ['estado', 'estado_entidad'] 
                // Esto selecciona el valor BOOLEAN de la columna 'estado' y lo aliasa como 'estado_entidad'
            ],
            
            // El bloque GROUP BY es el ÚNICO que define la división de los datos.
                group: [
                    // Agrupamos SOLAMENTE por la columna 'estado'
                    col('estado')
                ],
                
                // Ordenar opcionalmente para que el resultado sea predecible
                order: [
                    ['estado', 'DESC'] // Ordena 'true' antes de 'false' (si aplica)
                ],
                
                raw: true 
            });


        // Formatear y Devolver el resultado
        // El resultado de la consulta será algo como: 
        // [{ conteo: '150', estado_entidad: true }, { conteo: '50', estado_entidad: false }]
        
        // Lo mapeamos al formato final deseado:
        const estadosTotales = {
            Activos: 0,
            Inactivos: 0
        };

        resultadosAgregados.forEach(item => {
            const conteoNumerico = parseInt(item.conteo, 10);
            
            // Sequelize/raw:true puede devolver 'estado_entidad' como boolean o string ('true'/'false')
            // Usamos una verificación explícita para asegurar la clasificación.
            if (item.estado_entidad === true || item.estado_entidad === 'true') {
                estadosTotales.Activos = conteoNumerico;
            } else if (item.estado_entidad === false || item.estado_entidad === 'false') {
                estadosTotales.Inactivos = conteoNumerico;
            }
        });

        // Devolver el objeto final: { activos: 150, inactivos: 50 }
        return estadosTotales;
    }


    

// -------------------------- Verificación ------------------------------------

    /**
    * Verifica si ya existe una cuenta con el mismo código o nombre, excluyendo un ID dado (en caso de que se estuviera modificando
    * y no creando una cuenta).
    * @param {string} email - El email a buscar (en minúsculas).
    * @param {int} prefijo - El prefijo a buscar
    * * @param {int} tipo_identificacion - El tipo de identificacion a buscar
    * * @param {int} numero_identificacion - El numero de identificacion a buscar
    * @param {number|null} idExcluido - El ID de la entidad actual (para exclusión).
    * @returns {string|null} Retorna 'email', 'nombre', 'ambos', o null si no hay duplicados. */
    
    async verificarEntidadDuplicada(email, tipo_identificacion, prefijo, numero_identificacion, idExcluido) {

        let condicionesDuplicidad = [];

        validarExistencia(email, "email", true);

        // Se valida que el correo sea válido
        const correoEnMinuscula = email.toLowerCase();
        validarEmail(correoEnMinuscula, "El correo electrónico no tiene un formato válido.");

        let identificacionCompleta = false;
        let tipo_Identificacion_Numerica = null;
        let prefijo_Numerico = null;

        if(validarExistencia(tipo_identificacion, "", false) && validarExistencia(prefijo, "", false) && validarExistencia(numero_identificacion, "", false)){

            identificacionCompleta = true;

            /* Se valida el tipo de identificación, solo puede ser un número del "1" al "4" (ya que solo se tienen y tendrán esas en la base de datos, y 
            justo esos son sus ids). A su vez, se comprueba que el valor sea un número entero.
            */
            validarSoloNumeros(tipo_identificacion, "El tipo de identificación debe contener solo números (dígitos 0-9).")
            tipo_Identificacion_Numerica = parseInt(tipo_identificacion, 10);
            if (isNaN(tipo_Identificacion_Numerica) || tipo_Identificacion_Numerica < 1 || tipo_Identificacion_Numerica > 4) {
                throw new Error("El tipo de identificación no es válido.");
            }

            /* Se valida el prefijo, solo puede ser un número del "1" al "5" (ya que solo se tienen y tendrán esas en la base de datos, y 
            justo esos son sus ids). A su vez, se comprueba que el valor sea un número entero.
            */
            validarSoloNumeros(prefijo, "El prefijo debe contener solo números (dígitos 0-9).")
            prefijo_Numerico = parseInt(prefijo, 10);
            if (isNaN(prefijo_Numerico) || prefijo_Numerico < 1 || prefijo_Numerico > 5) {
                throw new Error("El prefijo no es válido.");
            }

            // Se valida que el número de identificacion sólo tenga números
            validarSoloNumerosYGuion(numero_identificacion, "El número de identificacion debe contener solo números (dígitos 0-9) o guión (-).")

            // Definición de las condiciones de duplicidad (OR)
            condicionesDuplicidad = [
                // Condición OR 1: Duplicidad por Email
                { email: correoEnMinuscula },

                // Condición OR 2: Duplicidad por Identificación Compuesta (usando AND implícito)
                {
                    id_tipo_identificacion: tipo_Identificacion_Numerica, 
                    id_prefijo: prefijo_Numerico,
                    numero_identificacion: numero_identificacion
                }
            ];

        }else{

            // Definición de las condiciones de duplicidad (OR)
            condicionesDuplicidad = [
                // Condición OR 1: Duplicidad por Email
                { email: correoEnMinuscula }
            ];
        }



        // Creación de la Cláusula WHERE final
        const whereClause = {
            [Op.or]: condicionesDuplicidad
        };


        // Aplicar la Exclusión del ID SOLO si se está en modo ACTUALIZACIÓN
        // Usamos el idExcluido pasado como parámetro, y verificamos si es un valor "truthy" (no null, no 0, no "")
        if (validarExistencia(idExcluido, "", false)) {
            validarIdNumerico(idExcluido, "El id es obligatorio");
            // La condición de exclusión (ID != idExcluido) debe aplicarse a TODO el WHERE
            whereClause.id_entidad = {
                [Op.ne]: idExcluido
            };
        }


        // Ejecutar una única consulta FINDONE
        const duplicado = await Entidad_Model.findOne({
            where: whereClause
        });

        // Análisis del Resultado
        if (!duplicado) {
            return null; // No hay duplicados
        }


        // El email y la identidad pueden ser iguales, por lo que verificamos qué falló:
        const esEmailDuplicado = duplicado.email === correoEnMinuscula;
        
        let esIdentidadDuplicada = false;
        // Solo intentar la comparación si la identificación fue enviada y procesada.
        if (identificacionCompleta) {
            esIdentidadDuplicada = (
                duplicado.id_tipo_identificacion == tipo_Identificacion_Numerica &&
                duplicado.id_prefijo == prefijo_Numerico &&
                duplicado.numero_identificacion == numero_identificacion
            );
        }

        if (esEmailDuplicado && esIdentidadDuplicada) {
            return 'ambos';
        } else if (esEmailDuplicado) {
            return 'email';
        } else if (esIdentidadDuplicada) {
            return 'identidad';
        }

    }

// -------------------------- Auxiliar ------------------------------------

    // Esta función complementa a las funciones "buscarEntidades" y "obtenerEntidadPorId", y sirve para formatear las claves que le llegará al usuario
    static formatearEntidad(entidadInstance) {

        // Si no existe la entidad se devuelve null
        if (!entidadInstance) return null;

        const entidad = entidadInstance.toJSON(); 

        return {
            id: entidad.id_entidad, 

            tipo_entidad: {
                id: entidad.tipo_entidad ? entidad.tipo_entidad.id_tipo_entidad : null,
                nombre: entidad.tipo_entidad ? entidad.tipo_entidad.nombre : null,
            },

            tipo_identificacion: {
                id: entidad.tipo_identificacion ? entidad.tipo_identificacion.id_tipo_identificacion : null,
                nombre: entidad.tipo_identificacion ? entidad.tipo_identificacion.nombre : null,
            },

            prefijo: {
                id: entidad.prefijo ? entidad.prefijo.id_prefijo : null,
                letra_prefijo: entidad.prefijo ? entidad.prefijo.letra_prefijo : null,
            },

            numero_identificacion: entidad.numero_identificacion,
            nombre: capitalizeFirstLetter(entidad.nombre), 
            apellido: capitalizeFirstLetter(entidad.apellido),        
            email: entidad.email,
            telefono: entidad.telefono,
            direccion: entidad.direccion,
            estado: entidad.estado,
            
            fechaCreacion: entidad.createdAt,
            fechaActualizacion: entidad.updatedAt 
        };

    }

    // Función Auxiliar que genera la "whereClause" sin ejecutar la consulta
    generarWhereClause(criteriosBusqueda = {}) {
        
        // Objeto que contendrá todas las condiciones de filtro combinadas con AND
        const whereClause = {};

        // 1. Obtener y limpiar los criterios de búsqueda (usando desestructuración)
        const { 
            tipo_entidad, 
            tipo_identificacion, 
            prefijo, 
            numero_identificacion, 
            nombre, 
            apellido,
            email,
            telefono,
            estado,
            creadosDesde,
            creadosHasta,
            modificadosDesde,
            modificadosHasta,
            solo_personas_naturales // Para descartar personas jurídicas y gubernamentales
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

            // Filtro 1: Tipo de entidad 
            if (validarExistencia(tipo_entidad, "", false)) {  
                
                validarSoloNumeros(tipo_entidad, "El tipo de entidad debe contener solo números (dígitos 0-9).");
                const tipo_Entidad_Numerica = parseInt(tipo_entidad, 10);
                if ( !(isNaN(tipo_Entidad_Numerica) || tipo_Entidad_Numerica < 1 || tipo_Entidad_Numerica > 3)) {

                    whereClause.id_tipo_entidad = tipo_Entidad_Numerica;
                }; 

            }

            // Filtro 2: Tipo de identificación 
            if (validarExistencia(tipo_identificacion, "", false)) {  
        
                validarSoloNumeros(tipo_identificacion, "El tipo de identificación debe contener solo números (dígitos 0-9).");
                const tipo_Identificacion_Numerica = parseInt(tipo_identificacion, 10);
                if ( !(isNaN(tipo_Identificacion_Numerica) || tipo_Identificacion_Numerica < 1 || tipo_Identificacion_Numerica > 4)) {

                    whereClause.id_tipo_identificacion = tipo_Identificacion_Numerica;
                }; 

            }

            // Filtro 3: Prefijo 
            if (validarExistencia(prefijo, "", false)) {  
                
                validarSoloNumeros(prefijo, "El prefijo debe contener solo números (dígitos 0-9).");
                const prefijo_Numerico = parseInt(prefijo, 10);
                if ( !(isNaN(prefijo_Numerico) || prefijo_Numerico < 1 || prefijo_Numerico > 5)) {

                    whereClause.id_prefijo = prefijo_Numerico;
                }; 

            }

            
            // Filtro 4: Número de identificación 
            if (validarExistencia(numero_identificacion, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(numero_identificacion).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    validarSoloNumeros(codigoLimpio, "El número de identificación debe contener solo números (dígitos 0-9).");


                    whereClause.numero_identificacion = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }


            // Filtro 5: Nombre 
            if (validarExistencia(nombre, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(nombre).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    // Se valida que el nombre sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
                    validarSoloTexto(codigoLimpio, "El nombre de la entidad debe contener solo texto o espacios en blanco, sin números.")

                    whereClause.nombre = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }


            // Filtro 6: Apellido 
            if (validarExistencia(apellido, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(apellido).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    // Se valida que el nombre sólo tenga texto (enviando el nombre y el error que se lanzará si no es así)
                    validarSoloTexto(codigoLimpio, "El apellido de la entidad debe contener solo texto o espacios en blanco, sin números.")

                    whereClause.apellido = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }

            // Filtro 7: Email 
            if (validarExistencia(email, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(email).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    // Se valida que el correo sea válido
                    validarEmail(email, "El correo electrónico no tiene un formato válido.");

                    whereClause.email = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }

            // Filtro 8: Teléfono 
            if (validarExistencia(telefono, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(telefono).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (telefono) {

                    // Se valida que el número de teléfono sólo tenga números y el formato correcto
                    validarTelefonoVenezolano(telefono, "El número de teléfono debe tener solo números, y 11 digitos exactos")

                    whereClause.telefono = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }

            // Filtro 8: Teléfono 
            if (validarExistencia(telefono, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(telefono).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (telefono) {

                    // Se valida que el número de teléfono sólo tenga números y el formato correcto
                    validarTelefonoVenezolano(telefono, "El número de teléfono debe tener solo números, y 11 digitos exactos")

                    whereClause.telefono = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }


            // Filtro 9: Estado 
            if (validarExistencia(estado, "", false)) { 

                // Limpieza y Validación:
                codigoLimpio = String(estado).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    // Se valida el estado
                    validarBooleano(estado, "El estado solo puede ser verdadero o falso (true/false).")

                    whereClause.estado = estado;
                } 
    
            }

            //Filtro 10: Se verifica si el usuario ha proporcionado al menos una de las fechas de creación
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


                    inicioDiaSiguiente = new Date(fechaCreacionHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    whereClause.createdAt[Op.lt] = inicioDiaSiguiente;
        
                }
            }

            // Filtro 11: Se verifica si el usuario ha proporcionado al menos una de las fechas de modificación
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

            // Filtro 12: Se verifica si solo se quieren entidades que sean personas 
            if (validarExistencia(solo_personas_naturales, "", false)) {

                validarBooleano(solo_personas_naturales, "Seleccionar solo a personas naturales necesita que sea o verdadero o falso (true/false).")


                if (solo_personas_naturales === true || solo_personas_naturales === 'true') {
                    // IDs a excluir: 4 (Jurídica - J) y 5 (Gubernamental - G)
                    // Usamos Op.notIn para que id_prefijo NO esté en el array [4, 5].
                    whereClause.id_prefijo = { [Op.notIn]: [4, 5] };
                }
                
            }

        return whereClause;
    }   



}

module.exports = EntidadService;