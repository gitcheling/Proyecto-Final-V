/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Estudiante_Model = require('../Models/estudiante'); 
const Entidad_Model = require('../Models/entidad'); 
const Estado_Academico_Model = require('../Models/estado_academico'); 

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter} = require('../Utils/funciones');

// Se importa la función del archivo de utilidades
const { generarCodigoEstudiantil } = require('../Utils/generadorCodigos');

// Se importa el mutex
const { crearEstudianteMutex } = require('../Utils/mutex');



// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 

class EstudianteService {


    // Se crea un nuevo estudiante
    async crearEstudiante({id}) {

        // Validamos que existan todos los datos
        validarExistencia(id, "id", true);

        validarIdNumerico(id, "El id no tiene el formato correcto");

        // Se comprueba que exista una entidad con ese id
        const entidad = await Entidad_Model.findByPk(id);

        if (!entidad) {

            // La Entidad  no existe, no se puede crear el estudiante.
            throw new Error(`La entidad con ID ${id} no está registrada.`);

        }else if(entidad.estado !== true){

            throw new Error(`No se puede crear un estudiante de una entidad desactivada.`);

        }else if(entidad.id_prefijo == 4 || entidad.id_prefijo == 5){

            throw new Error(`No se puede crear un estudiante de una entidad jurídica o gubernamental.`);
        }

        // Se comprueba que no exista ya un estudiante con ese id
        if(await Estudiante_Model.findByPk(id)){ 
            // Si lo encuentra, ya es estudiante
            throw new Error(`La Entidad '${entidad.nombre.charAt(0).toUpperCase() + entidad.nombre.slice(1)} ${entidad.apellido ? entidad.apellido.charAt(0).toUpperCase() + entidad.apellido.slice(1) : ""}' ya está registrada como estudiante.`);
        }

        // Adquirir el Mutex para proteger la generación y la creación.
        /* Nota: La función "runExclusive" siempre devuelve una Promesa. Esta Promesa representa el resultado final de la ejecución de 
        la función callback que se le pase.

        Bloqueo y Cola: Cuando se llama a "runExclusive", el Mutex primero comprueba si la llave está libre. Si no lo está, la función 
        asíncrona se pone en cola y se pausa (se crea una Promesa que espera).

        Ejecución Segura: Cuando la llave se libera, el Mutex ejecuta la función asíncrona.

        Mantenimiento del Lock: Mientras la función asíncrona se ejecuta, puede encontrarse con varios await (como "await generarCodigoEstudiantil()" y 
        "await Estudiante_Model.create()"). Aunque el Event Loop de Node.js se libera durante estos await, el Mutex mantiene el estado de 
        "ocupado" porque sabe que la función aún no ha terminado. 
        */
        return crearEstudianteMutex.runExclusive(async () => {
                        
            try {
                // 3. Generar el código (Bajo el lock/candado)
                const codigoGenerado = await generarCodigoEstudiantil(); 

                // 4. Preparar los datos finales
                const datosFinales = {
                    id_estudiante: id,
                    codigo_estudiantil: codigoGenerado,
                    id_estado_academico: 1
                };
                
                // 5. Crear el registro (Bajo el lock/candado)
                const nuevoEstudiante = await Estudiante_Model.create(datosFinales);

                // 6. El Mutex se libera automáticamente aquí al retornar la Promesa.
                return {
                    id: nuevoEstudiante.id_estudiante, 
                    codigo_estudiantil: nuevoEstudiante.codigo_estudiantil,
                    estado_academico: "Activo",
                  
                    fechaCreacion: nuevoEstudiante.createdAt,
                    fechaActualizacion: nuevoEstudiante.updatedAt            
                };
                
                
            } catch (error) {
                // El Mutex se libera automáticamente incluso si hay un error aquí.
                console.error("Error al crear estudiante en la sección crítica:", error);
                
                // Se puede manejar errores de la DB, como violaciones de unicidad.
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new Error("Fallo al crear el estudiante. El código generado ya existía (Fallo de concurrencia).");
                }
                throw error;
            }
        });

    }


    async cambiarEstadoEstudiante(id, nuevoEstado) {

        if(!validarExistencia(id, "id", false)){
            return null;
        }

        validarExistencia(nuevoEstado, "nuevo estado", true);

        // Se valida el id
        validarIdNumerico(id, "El id no tiene el formato correcto");

        // Se valida el nuevo estado
        validarIdNumerico(nuevoEstado, "El nuevo estado no tiene el formato correcto");

        const estado_Numerico = parseInt(nuevoEstado, 10);
        if ( isNaN(estado_Numerico) || estado_Numerico < 1 || estado_Numerico > 5) {
           throw new Error(`El nuevo estado no es válido.`);
        }; 


        // Se valida la existencia de la cuenta, si no existe se regresa null
        const estudiante = await Estudiante_Model.findByPk(id)

        if(!estudiante){
            return null;
        };

        // Solo se actualiza la columna 'estado'
        const [filasAfectadas] = await Estudiante_Model.update(
            { id_estado_academico: estado_Numerico }, 
            { where: { id_estudiante: id } }
        );

        if (filasAfectadas === 0) {       
            return null;      
        }

        return Estado_Academico_Model.findByPk(estado_Numerico);
    
    }


    // Se obtiene un solo estudiante por el id
    async obtenerEstudiantePorId(id) {

        validarExistencia(id, "id", true);

        validarIdNumerico(id, "El ID proporcionado no es un número entero válido o positivo.");

        // Método de Sequelize para buscar una entidad por su Primary Key
        const estudiante = await Estudiante_Model.findByPk(id, {

                attributes: [// Atributos de la tabla principal (estudiante)                
                    'id_estudiante', 'codigo_estudiantil', 'createdAt', 'updatedAt'
                ],
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'entidad', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "estudiante")
                        attributes: ['numero_identificacion', 'nombre', 'apellido', 'email', 'telefono', 'estado'], // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                    
                        // Este include anidado es para tener acceso a los prefijos
                        include: [{
                            // 2. Incluye el Prefijo (desde el modelo Entidad)
                            association: 'prefijo', // Alias definido en el modelo Entidad: Entidad.belongsTo(Prefijo_Identificacion)
                            attributes: ['letra_prefijo'] // Campos que se quieren del Prefijo
                        }]
                               
                    },
                    { 
                        association: 'estado_academico', 
                        attributes: ['id_estado_academico', 'nombre', 'permite_inscripcion'] 
                    }
                ]
        });
        
        return EstudianteService.formatearEstudiante(estudiante);
       
    }


    // Permite buscar cuentas basandose en filtros
    async buscarEstudiantes(criteriosBusqueda = {}) {
        
        // Objeto para condiciones en la tabla Estudiante (base)
        const estudianteWhere = {};
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
            codigo_estudiantil,
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

            // Filtro 5: Código estudiantil 
            if (validarExistencia(codigo_estudiantil, "", false)) {
                // Limpieza y Validación:
                valorLimpio = String(codigo_estudiantil).trim();

                if (valorLimpio) { 
                    validarSoloNumeros(valorLimpio, "El código estudiantil debe contener solo números (dígitos 0-9).");
                    estudianteWhere.codigo_estudiantil = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }

        
            // Filtro 9: Estado 
            if (validarExistencia(estado, "", false)) { 

                // Limpieza y Validación:
                valorLimpio = String(estado).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (valorLimpio) {

                    validarSoloNumeros(valorLimpio, "El estado debe contener solo números (dígitos 0-9).");
                    const estado_Numerico = parseInt(valorLimpio, 10);
                    if ( !(isNaN(estado_Numerico) || estado_Numerico < 1 || estado_Numerico > 5)) {

                        estudianteWhere.id_estado_academico = estado_Numerico;
                    }; 
                } 
       
            }


            //Filtro 10: Se verifica si el usuario ha proporcionado al menos una de las fechas de creación
            if (fechaCreacionDesde || fechaCreacionHasta) {

                estudianteWhere.createdAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechaCreacionDesde) {
                    estudianteWhere.createdAt[Op.gte] = fechaCreacionDesde;
                }

                if (fechaCreacionHasta) {
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/


                    inicioDiaSiguiente = new Date(fechaCreacionHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    estudianteWhere.createdAt[Op.lt] = inicioDiaSiguiente;
        
                }
            }

            // Filtro 11: Se verifica si el usuario ha proporcionado al menos una de las fechas de modificación
            if (fechamodificadosDesde || fechamodificadosHasta) {

                estudianteWhere.updatedAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechamodificadosDesde) {
                    estudianteWhere.updatedAt[Op.gte] = fechamodificadosDesde;
                }

                if (fechamodificadosHasta) {
                    
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/
                    
                    inicioDiaSiguiente = new Date(fechamodificadosHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    estudianteWhere.updatedAt[Op.lt] = inicioDiaSiguiente;
                }
            }



            // --- 3. Ejecutar la Consulta con Cláusulas WHERE separadas ---
            const estudiantes = await Estudiante_Model.findAll({
                // Aplicamos los filtros directos de la tabla Estudiante
                where: estudianteWhere, 
                
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
                        association: 'estado_academico', 
                        attributes: ['id_estado_academico', 'nombre', 'permite_inscripcion'] 
                    }
                ],

                // Mantenemos el orden según las actualizaciones de la tabla "estudiante"
                order: [ ['updatedAt', 'DESC'] ]
            });


        // --- Se devuelven los resultados formateados ---
        return estudiantes.map(instancia => EstudianteService.formatearEstudiante(instancia));
    }
    

    // Esta función complementa a las funciones "buscarEstudiantes" y "obtenerEstudiantePorId", y sirve para formatear las claves que le llegará al usuario
    static formatearEstudiante(estudianteInstance) {

        // Si no existe la entidad se devuelve null
        if (!estudianteInstance) return null;

        const estudiante = estudianteInstance.toJSON(); 

        return {
            id: estudiante.id_estudiante, 
            codigo_estudiantil: estudiante.codigo_estudiantil.toString(),

            entidad: {
                numero_identificacion: estudiante.entidad.numero_identificacion ? estudiante.entidad.numero_identificacion.toString() : null,
                nombre: estudiante.entidad.nombre ? capitalizeFirstLetter(estudiante.entidad.nombre.toString()) : null,
                apellido: estudiante.entidad.apellido ? capitalizeFirstLetter(estudiante.entidad.apellido.toString()) : null,
                email: estudiante.entidad.email ? estudiante.entidad.email : null,
                telefono: estudiante.entidad.telefono ? estudiante.entidad.telefono : null,
                estado: estudiante.entidad.estado ? estudiante.entidad.estado : null,

                prefijo: {
                    letra_prefijo: estudiante.entidad.prefijo.letra_prefijo ? estudiante.entidad.prefijo.letra_prefijo.toString() : null,
                }
            },

            estado: {
                id: estudiante.estado_academico.id_estado_academico ? estudiante.estado_academico.id_estado_academico : null,
                nombre: estudiante.estado_academico.nombre ? estudiante.estado_academico.nombre.toString() : null,
                puede_inscribirse: estudiante.estado_academico.permite_inscripcion == true ? "Si" : "No",
            },
       
            fechaCreacion: estudiante.createdAt,
            fechaActualizacion: estudiante.updatedAt 
        };

    }


}

module.exports = EstudianteService;