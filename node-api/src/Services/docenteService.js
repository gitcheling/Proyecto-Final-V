/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Docente_Model = require('../Models/docente'); 
const Entidad_Model = require('../Models/entidad'); 
const Estado_Docente_Model = require('../Models/estado_docente'); 

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter} = require('../Utils/funciones');


// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 

class DocenteService {


    // Se crea un nuevo docente
    async crearDocente({id}) {

        // Validamos que existan todos los datos
        validarExistencia(id, "id", true);

        validarIdNumerico(id, "El id no tiene el formato correcto");

        // Se comprueba que exista una entidad con ese id
        const entidad = await Entidad_Model.findByPk(id);

        if (!entidad) {

            // La Entidad  no existe, no se puede crear el estudiante.
            throw new Error(`La entidad con ID ${id} no está registrada.`);

        }else if(entidad.estado !== true){

            throw new Error(`No se puede crear un docente de una entidad desactivada.`);

        }else if(entidad.id_prefijo == 4 || entidad.id_prefijo == 5){

            throw new Error(`No se puede crear un docente de una entidad jurídica o gubernamental.`);
        }

        // Se comprueba que no exista ya un docente con ese id
        if(await Docente_Model.findByPk(id)){ 
            // Si lo encuentra, ya es docente
            throw new Error(`La Entidad con ID ${id} ya está registrada como docente.`);
        }


        const datos = {
            id_docente: entidad.id_entidad,
            id_estado_docente: 1
        };
        
        
        const nuevoDocente = await Docente_Model.create(datos);

       
        return {
            id: nuevoDocente.id_docente, 
            estado_docente: "Activo",
            
            fechaCreacion: nuevoDocente.createdAt,
            fechaActualizacion: nuevoDocente.updatedAt            
        };
                
    }


    async cambiarEstadoDocente(id, nuevoEstado) {

        if(!validarExistencia(id, "id", false)){
            return null;
        }

        validarExistencia(nuevoEstado, "nuevo estado", true);

        // Se valida el id
        validarIdNumerico(id, "El id no tiene el formato correcto");

        // Se valida el nuevo estado
        validarIdNumerico(nuevoEstado, "El nuevo estado no tiene el formato correcto");

        const estado_Numerico = parseInt(nuevoEstado, 10);
        if ( isNaN(estado_Numerico) || estado_Numerico < 1 || estado_Numerico > 4) {
           throw new Error(`El nuevo estado no es válido.`);
        }; 

        // Se valida la existencia de la cuenta, si no existe se regresa null
        const docente = await Docente_Model.findByPk(id)

        if(!docente){
            return null;
        };

        // Solo se actualiza la columna 'estado'
        const [filasAfectadas] = await Docente_Model.update(
            { id_estado_docente: estado_Numerico }, 
            { where: { id_docente: docente.id_docente } }
        );

        if (filasAfectadas === 0) {       
            return null;      
        }

        return Estado_Docente_Model.findByPk(estado_Numerico);
    
    }


    // Se obtiene un solo docente por el id
    async obtenerDocentePorId(id) {

        validarExistencia(id, "id", true);

        validarIdNumerico(id, "El ID proporcionado no es un número entero válido o positivo.");

        // Método de Sequelize para buscar una entidad por su Primary Key
        const docente = await Docente_Model.findByPk(id, {

                attributes: [// Atributos de la tabla principal (docente)                
                    'id_docente', 'createdAt', 'updatedAt'
                ],
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'entidad', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "docente")
                        attributes: ['numero_identificacion', 'nombre', 'apellido', 'estado'], // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                    
                        // Este include anidado es para tener acceso a los prefijos
                        include: [{
                            // 2. Incluye el Prefijo (desde el modelo Entidad)
                            association: 'prefijo', // Alias definido en el modelo Entidad: Entidad.belongsTo(Prefijo_Identificacion)
                            attributes: ['letra_prefijo'] // Campos que se quieren del Prefijo
                        }]
                               
                    },
                    { 
                        association: 'estado_docente', 
                        attributes: ['id_estado_docente', 'nombre', 'descripcion', 'permite_asignacion', 'aplica_pago'] 
                    }
                ]
        });
        
        return DocenteService.formatearDocente(docente);
       
    }


    // Permite buscar cuentas basandose en filtros
    async buscarDocentes(criteriosBusqueda = {}) {
        
        // Objeto para condiciones en la tabla docente (base)
        const docenteWhere = {};
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
                    if ( !(isNaN(estado_Numerico) || estado_Numerico < 1 || estado_Numerico > 4)) {

                        docenteWhere.id_estado_academico = estado_Numerico;
                    }; 
                } 
       
            }


            //Filtro 10: Se verifica si el usuario ha proporcionado al menos una de las fechas de creación
            if (fechaCreacionDesde || fechaCreacionHasta) {

                docenteWhere.createdAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechaCreacionDesde) {
                    docenteWhere.createdAt[Op.gte] = fechaCreacionDesde;
                }

                if (fechaCreacionHasta) {
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/


                    inicioDiaSiguiente = new Date(fechaCreacionHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    docenteWhere.createdAt[Op.lt] = inicioDiaSiguiente;
        
                }
            }

            // Filtro 11: Se verifica si el usuario ha proporcionado al menos una de las fechas de modificación
            if (fechamodificadosDesde || fechamodificadosHasta) {

                docenteWhere.updatedAt = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechamodificadosDesde) {
                    docenteWhere.updatedAt[Op.gte] = fechamodificadosDesde;
                }

                if (fechamodificadosHasta) {
                    
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/
                    
                    inicioDiaSiguiente = new Date(fechamodificadosHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    docenteWhere.updatedAt[Op.lt] = inicioDiaSiguiente;
                }
            }



            // --- 3. Ejecutar la Consulta con Cláusulas WHERE separadas ---
            const docentes = await Docente_Model.findAll({
                // Aplicamos los filtros directos de la tabla Estudiante
                where: docenteWhere, 
                
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
                        association: 'estado_docente', 
                        attributes: ['id_estado_docente', 'nombre', 'descripcion', 'permite_asignacion', 'aplica_pago'] 
                    }
                ],

                // Mantenemos el orden según las actualizaciones de la tabla "estudiante"
                order: [ ['updatedAt', 'DESC'] ]
            });


        // --- Se devuelven los resultados formateados ---
        return docentes.map(instancia => DocenteService.formatearDocente(instancia));
    }
    

    // Esta función complementa a las funciones "buscarDocentes" y "obtenerDocentePorId", y sirve para formatear las claves que le llegará al usuario
    static formatearDocente(docenteInstance) {

        // Si no existe la entidad se devuelve null
        if (!docenteInstance) return null;

        const docente = docenteInstance.toJSON(); 

        return {
            id: docente.id_estudiante, 
            codigo_estudiantil: docente.codigo_estudiantil.toString(),

            entidad: {
                numero_identificacion: docente.entidad.numero_identificacion ? docente.entidad.numero_identificacion.toString() : null,
                nombre: docente.entidad.nombre ? capitalizeFirstLetter(docente.entidad.nombre.toString()) : null,
                apellido: docente.entidad.apellido ? capitalizeFirstLetter(docente.entidad.apellido.toString()) : null,
                estado: docente.entidad.estado ? docente.entidad.estado : null,

                prefijo: {
                    letra_prefijo: docente.entidad.prefijo.letra_prefijo ? docente.entidad.prefijo.letra_prefijo.toString() : null,
                }
            },

            estado: {
                id: docente.estado_docente.id_estado_docente ? docente.estado_docente.id_estado_docente : null,
                nombre: docente.estado_docente.nombre ? docente.estado_docente.nombre.toString() : null,
                descripcion: docente.estado_docente.descripcion ? docente.estado_docente.descripcion.toString() : null,
                permite_asignacion: docente.estado_docente.permite_asignacion == true ? "Si" : "No",
                aplica_pago: docente.estado_docente.aplica_pago == true ? "Si" : "No"
            },
       
            fechaCreacion: docente.createdAt,
            fechaActualizacion: docente.updatedAt 
        };

    }


    // Se obtienen los estados académicos
    async obtenerEstadosDocente() {

        const resultado = await Estado_Docente_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_estado_docente, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString(), 
            permite_asignacion:  instancia.permite_asignacion == true ? "Si" : "No",    
            aplica_pago: instancia.aplica_pago == true ? "Si" : "No"            
        }));
    
    }
    
}

module.exports = DocenteService;