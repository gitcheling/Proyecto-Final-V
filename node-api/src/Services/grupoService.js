const Grupo_Model = require('../Models/grupo'); 
const Curso_Model = require('../Models/curso'); 
const Periodo_Model = require('../Models/periodo');
const Modalidad_Clase_Model = require('../Models/modalidad_clase');
const Docente_Model = require('../Models/docente');
const Estado_Grupo_Model = require('../Models/estado_grupo');
const Inscripcion_Model = require('../Models/inscripcion');


// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, validarLongitudCadena, validarSoloNumerosEnterosYDecimales, validarBooleano, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter, traducirMes} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op, fn, col } = require('sequelize'); 

class GrupoService {

// -------------------------- Creación ------------------------------------

    // Se crea un grupo
    async crearGrupo({curso, periodo, modalidad, docente, nombre, cupo_maximo, costo_inscripcion, costo_clase }) {

        // ----------------------- Validaciones de existencia ----------------------------

            validarExistencia(curso, "curso", true);
            validarExistencia(periodo, "periodo", true);
            validarExistencia(modalidad, "modalidad", true);
            validarExistencia(docente, "docente", true);
            validarExistencia(nombre, "nombre", true);
            validarExistencia(cupo_maximo, "cupo_maximo", true);
            validarExistencia(costo_inscripcion, "costo_inscripcion", true);
            validarExistencia(costo_clase, "costo_clase", true);

        // ----------------------- Validaciones de formato ----------------------------

            const cursoLimpio = String(curso).trim();   
            validarIdNumerico(cursoLimpio, "El curso no tiene el formato correcto");

            const periodoLimpio = String(periodo).trim();   
            validarIdNumerico(periodoLimpio, "El periodo no tiene el formato correcto");

            const modalidadLimpia = String(modalidad).trim();   
            validarIdNumerico(modalidadLimpia, "La modalidad no tiene el formato correcto");

            const docenteLimpio = String(docente).trim();   
            validarIdNumerico(docenteLimpio, "El docente no tiene el formato correcto");

            const nombreLimpio = String(nombre).trim().toLowerCase();  
            validarLongitudCadena(nombreLimpio, 5, 50, "El nombre no cumple con la longitud válida (de 5 a 50 caracteres).");

            const cupoMaximoLimpio = String(cupo_maximo).trim(); 
            validarIdNumerico(cupoMaximoLimpio, "El cupo máximo no tiene el formato correcto");
            const cupoMaximoNumerico = parseInt(cupoMaximoLimpio, 10);

            const costoInscripcionLimpio = String(costo_inscripcion).trim(); 
            validarSoloNumerosEnterosYDecimales(costoInscripcionLimpio, "El costo de inscripción no tiene el formato correcto");
            const costoInscripcionNumerico = parseFloat(costoInscripcionLimpio);

            const costoClaseLimpio = String(costo_clase).trim(); 
            validarSoloNumerosEnterosYDecimales(costoClaseLimpio, "El costo unitario de clase no tiene el formato correcto");
            const costoClaseNumerico = parseFloat(costoClaseLimpio);


        // ----------------------- Validaciones de existencia en la base de datos ----------------------------

            // Se valida que exista el curso
            const cursoObjeto = await Curso_Model.findByPk(cursoLimpio, {
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'estado', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "curso")
                        attributes: ['id_estado_curso', 'nombre', 'permite_nuevos_grupos'] // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                    }
                ]
            });
            if(!cursoObjeto){throw new Error(`El curso especificado no existe.`);}


            // Se valida que exista el periodo
            const periodoObjeto = await Periodo_Model.findByPk(periodoLimpio);
            if(!periodoObjeto){throw new Error(`El periodo especificado no existe.`);}
        

            // Se valida que exista la modalidad
            const modalidadObjeto = await Modalidad_Clase_Model.findByPk(modalidadLimpia);
            if(!modalidadObjeto){throw new Error(`La modalidad de clase especificado no existe.`);}


            // Se valida que exista el docente
            const docenteObjeto = await Docente_Model.findByPk(docenteLimpio, {
                include: [
                    { 
                        association: 'estado_docente',
                        attributes: ['id_estado_docente', 'nombre', 'permite_asignacion'] 
                    }
                ]
            });
            if(!docenteObjeto){throw new Error(`El docente especificado no existe.`);}


        // ----------------------- Validaciones de rangos ----------------------------
            
            // Se valida el cupo total según la modalidad de clases
            if((modalidadObjeto.nombre == "Presencial" || modalidadObjeto.nombre == "Hibrida") && (cupoMaximoNumerico < 5 || cupoMaximoNumerico > 50 )){
               
                throw new Error(`El cupo máximo no cumple con la cantidad requerida para la modalidad ${modalidadObjeto.nombre} (de 5 a 50 estudiantes).`);
            
            }else if(modalidadObjeto.nombre == "Online" && (cupoMaximoNumerico < 5|| cupoMaximoNumerico > 400 )){
                
                throw new Error(`El cupo máximo no cumple con la cantidad requerida para la modalidad virtual (de 5 a 400 estudiantes).`);
           
            }

            // Se valida el costo de inscripción de clase 
            if(costoInscripcionNumerico < 1 || costoInscripcionNumerico > 1000){
                throw new Error(`El costo de inscripción no cumple con el monto requerido (de 1 a 1000$).`);
            }

            // Se valida el costo unitario de clase 
            if(costoClaseNumerico < 1 || costoClaseNumerico > 50){
                throw new Error(`El costo unitario de cada clase no cumple con el monto requerido (de 1 a 50$).`);
            }



        // ----------------------- Validaciones de si se permite o no crear el curso con esos datos ----------------------------

            if(cursoObjeto.estado.permite_nuevos_grupos == false){throw new Error(`El curso seleccionado no permite la creación de nuevos grupos.`);}

            if(docenteObjeto.estado_docente.permite_asignacion == false){throw new Error(`No se le pueden asignar nuevos grupos al docente seleccionado.`);};


            const fechaFinPeriodo = new Date(periodoObjeto.fecha_fin);

            /*Obtener la fecha de HOY, normalizada.
            Creamos una fecha para hoy y la normalizamos a la medianoche (00:00:00)
            para que la comparación sea a nivel de día completo y no de hora/minuto. */
            const hoyNormalizado = new Date();
            hoyNormalizado.setHours(0, 0, 0, 0);

            // La regla es: Si la fecha de finalización del periodo es *anterior* a la fecha de hoy (medianoche), 
            // significa que el periodo terminó ayer o antes.
            if (fechaFinPeriodo < hoyNormalizado) {
                throw new Error(`El periodo seleccionado ya ha finalizado y no se le pueden asignar nuevos grupos.`);
            }

    

        // ----------------------- Creación ----------------------------

            const Data = {
                id_curso: cursoObjeto.id_curso,
                id_periodo: periodoObjeto.id_periodo,
                id_modalidad: modalidadObjeto.id_modalidad,
                id_docente: docenteObjeto.id_docente,
                nombre: nombreLimpio,
                cupo_maximo: cupoMaximoNumerico,
                costo_inscripcion: costoInscripcionLimpio, 
                costo_unitario_clase: costoClaseLimpio,
                id_estado: 1,
            };


            try {

                // Se manda a crear el nuevo grupo
                const nuevoGrupo = await Grupo_Model.create(Data);

                // Renombramos las propiedades a regresar (para que el cliente no vea los nombres de las columnas de la base de datos)
                return {
                    id: nuevoGrupo.id_grupo, 
                    curso: nuevoGrupo.id_curso,
                    periodo: nuevoGrupo.id_periodo,
                    modalidad: nuevoGrupo.id_modalidad,
                    docente: nuevoGrupo.id_docente,
                    nombre: capitalizeFirstLetter(nuevoGrupo.nombre), 
                    cupo_maximo: nuevoGrupo.cupo_maximo,        
                    costo_inscripcion: nuevoGrupo.costo_inscripcion,
                    costo_clase: nuevoGrupo.costo_unitario_clase,
                    estado: "Planificado",
                    fechaCreacion: nuevoGrupo.createdAt,
                    fechaActualizacion: nuevoGrupo.updatedAt
                    
                };

            } catch (error) {
                // Manejar el error de unicidad garantizado por el modelo.
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new Error(`El grupo con el curso y el nombre especificados ya existen en éste periodo.`);
                }

                // Re-lanzar cualquier otro error (DB, conexión, etc.)
                throw error;
            }

    }




// -------------------------- Modificación ------------------------------------

    // Se manda a actualizar una entidad
    /*Nota: Los campos que no se deben modificar son:

        -id_grupo: Llave Primaria (PK). Identificador único y absoluto. Nunca debe cambiar.

        -id_periodo: No se debe cambiar, por unicidad y consistencia.

        -id_curso: No debe cambiar debido a que en base al curso es que un grupo tendrá su cantidad de clases máxima
        (y porque afectaría a los reportes de cuantas clases se han dado de X curso por ejemplo.)

        -id_modalidad: No se puede modificar si existe al menos una entrada en la tabla "inscripción", debido a que
        cambiar la modalidad (Ej. de Presencial a Online) después de la inscripción afecta directamente el servicio contratado 
        por los estudiantes.

        -"costo_inscripcion" y "costo_clase_unitario": No se pueden modificar si existe al menos una entrada en la tabla
        "inscripción".	Una vez que un estudiante se inscribe, el precio queda fijado. Modificarlo podría generar inconsistencias 
        contables.

        -cupo_maximo: Se puede modificar, pero nunca se puede reducir por debajo del número actual de estudiantes inscritos.
        
        -id_estado: Se puede modificar siempre y cuando su periodo no haya finalizado

    */
    async actualizarGrupo(id, modalidad, docente, nombre, cupo_maximo, costo_inscripcion, costo_clase, estado) {

        // ----------------------- Validaciones de existencia ----------------------------

            validarExistencia(id, "id", true);
            validarExistencia(modalidad, "modalidad", true);
            validarExistencia(docente, "docente", true);
            validarExistencia(nombre, "nombre", true);
            validarExistencia(cupo_maximo, "cupo_maximo", true);
            validarExistencia(costo_inscripcion, "costo_inscripcion", true);
            validarExistencia(costo_clase, "costo_clase", true);
            validarExistencia(estado, "estado", true);

        // ----------------------- Validaciones de formato ----------------------------

            const idLimpio = String(id).trim();   
            validarIdNumerico(idLimpio, "El id no tiene el formato correcto");

            const modalidadLimpia = String(modalidad).trim();   
            validarIdNumerico(modalidadLimpia, "La modalidad no tiene el formato correcto");

            const docenteLimpio = String(docente).trim();   
            validarIdNumerico(docenteLimpio, "El docente no tiene el formato correcto");

            const nombreLimpio = String(nombre).trim().toLowerCase();  
            validarLongitudCadena(nombreLimpio, 5, 50, "El nombre no cumple con la longitud válida (de 5 a 50 caracteres).");

            const cupoMaximoLimpio = String(cupo_maximo).trim(); 
            validarIdNumerico(cupoMaximoLimpio, "El cupo máximo no tiene el formato correcto");
            const cupoMaximoNumerico = parseInt(cupoMaximoLimpio, 10);

            const costoInscripcionLimpio = String(costo_inscripcion).trim(); 
            validarSoloNumerosEnterosYDecimales(costoInscripcionLimpio, "El costo de inscripción no tiene el formato correcto");
            const costoInscripcionNumerico = parseFloat(costoInscripcionLimpio);

            const costoClaseLimpio = String(costo_clase).trim(); 
            validarSoloNumerosEnterosYDecimales(costoClaseLimpio, "El costo unitario de clase no tiene el formato correcto");
            const costoClaseNumerico = parseFloat(costoClaseLimpio);

            const estadoLimpio = String(estado).trim(); 
            validarIdNumerico(estadoLimpio, "El estado no tiene el formato correcto");
            const estadoNumerico = parseInt(estadoLimpio, 10);


        // ----------------------- Validaciones de existencia en la base de datos ----------------------------

            // Se valida que exista el grupo
            const grupoObjeto = await Grupo_Model.findByPk(idLimpio, {
                include: [
                    { association: 'periodo', attributes: ['id_periodo', 'fecha_fin'] }
                ]
            });
            if(!grupoObjeto){throw new Error(`El grupo especificado no existe.`);}


            // Se valida que exista la modalidad
            const modalidadObjeto = await Modalidad_Clase_Model.findByPk(modalidadLimpia);
            if(!modalidadObjeto){throw new Error(`La modalidad de clase especificado no existe.`);}


            // Se valida que exista el docente
            const docenteObjeto = await Docente_Model.findByPk(docenteLimpio, {
                include: [
                    { 
                        association: 'estado_docente',
                        attributes: ['id_estado_docente', 'nombre', 'permite_asignacion'] 
                    }
                ]
            });
            if(!docenteObjeto){throw new Error(`El docente especificado no existe.`);}


            // Se valida que exista el estado
            const estadoObjeto = await Estado_Grupo_Model.findByPk(estadoNumerico);
            if(!estadoObjeto){throw new Error(`El estado especificado no existe.`);}



        // ----------------------- Validaciones de diferencia ----------------------------

            const conteoInscripciones = await Inscripcion_Model.count({ where: { id_grupo: grupoObjeto.id_grupo } })
            const hayInscripciones = conteoInscripciones > 0;

            let data = {};

            // Se comprueba si la modalidad es distinta
            if(modalidadObjeto.id_modalidad != grupoObjeto.id_modalidad){

                if(hayInscripciones){
                    throw new Error(`No se puede cambiar la modalidad, ya existen inscripciones para el grupo.`);
                }
                data.id_modalidad = modalidadObjeto.id_modalidad;
            }

            // Se comprueba si el docente es distinto
            if(docenteObjeto.id_docente != grupoObjeto.id_docente){
                if(docenteObjeto.estado_docente.permite_asignacion == false){throw new Error(`No se le pueden asignar nuevos grupos al docente seleccionado.`);};       
                
                data.id_docente = docenteObjeto.id_docente;
            
            }

            // Se comprueba si el nombre es distinto
            if(nombreLimpio !== grupoObjeto.nombre){

                if(await Grupo_Model.findOne({ where: { 
                                                    id_curso: grupoObjeto.id_curso,
                                                    id_periodo: grupoObjeto.id_periodo,
                                                    nombre: nombreLimpio
                } })){
                    throw new Error(`El nombre especificado ya lo tiene asignado otro curso en éste periodo.`);
                }
                
                data.nombre = nombreLimpio;
            }

            
            // Se comprueba si el cupo máximo es distinto
            if(cupoMaximoNumerico != grupoObjeto.cupo_maximo){
                
                // La cantidad de cupo máximo no puede ser menor a la de estudiantes inscritos en ese momento
                if(cupoMaximoNumerico < conteoInscripciones){throw new Error(`El nuevo cupo máximo (${conteoInscripciones}) no puede ser menor que la cantidad actual de estudiantes inscritos (${cuposOcupados}).`);};       
            
                
                if((modalidadObjeto.nombre == "Presencial" || modalidadObjeto.nombre == "Hibrida") && (cupoMaximoNumerico < 5 || cupoMaximoNumerico > 50 )){        
                    throw new Error(`El cupo máximo no cumple con la cantidad requerida para la modalidad ${modalidadObjeto.nombre} (de 5 a 50 estudiantes).`);                 
                }else if(modalidadObjeto.nombre == "Online" && (cupoMaximoNumerico < 5|| cupoMaximoNumerico > 400 )){
                    throw new Error(`El cupo máximo no cumple con la cantidad requerida para la modalidad virtual (de 5 a 400 estudiantes).`);
                }  

                data.cupo_maximo = cupoMaximoNumerico;   
            }
                

            // Se comprueba si el costo de inscripción es distinto
            if(costoInscripcionNumerico != grupoObjeto.costo_inscripcion){

                // Si ya hay inscripciones, no se puede cambiar
                if(hayInscripciones){ throw new Error(`No se puede cambiar el costo de inscripción cuando ya hay estudiantes inscritos al grupo.`)};
                
                if(costoInscripcionNumerico < 1 || costoInscripcionNumerico > 1000){
                    throw new Error(`El costo de inscripción no cumple con el monto requerido (de 1 a 1000$).`);
                }

                data.costo_inscripcion = costoInscripcionNumerico;   
            }


            // Se comprueba si el costo unitario de clase es distinto
            if(costoClaseNumerico != grupoObjeto.costo_unitario_clase){

                // Si ya hay inscripciones, no se puede cambiar
                if(hayInscripciones){ throw new Error(`No se puede cambiar el costo unitario de cada clase cuando ya hay estudiantes inscritos al grupo.`)};
                
                if(costoClaseNumerico < 1 || costoClaseNumerico > 50){
                    throw new Error(`El costo unitario de cada clase no cumple con el monto requerido (de 1 a 50$).`);
                }

                data.costo_unitario_clase = costoClaseNumerico;   
            }


            // Se comprueba si el estado es distinto
            if(estadoNumerico != estadoObjeto.id_estado){

                // Validación de retroceso. No se puede volver a "Planificado" (ID 1) una vez el estado del grupo es distinto a él
                if (grupoObjeto.id_estado > 1 && estadoNumerico === 1) {
                    throw new Error(`No se puede cambiar el estado a 'Planificado' ya que el grupo ya ha iniciado o avanzado a una fase posterior.`);
                }

                // Verificación de Período Finalizado
                const fechaFinPeriodo = new Date(grupoObjeto.periodo.fecha_fin);
                const hoyNormalizado = new Date();
                hoyNormalizado.setHours(0, 0, 0, 0);

                // Si el periodo ya terminó
                if (fechaFinPeriodo < hoyNormalizado) {

                    // 1. Si el periodo terminó Y el estado actual es Finalizado, NO se permite cambiar.
                    if (grupoObjeto.id_estado === 3) {
                        throw new Error(`El periodo ha finalizado y el grupo ya está en estado 'Finalizado'. No se permiten más cambios de estado.`);
                    }
                    
                    // 2. Si el periodo terminó, pero el grupo está en otro estado (ej. Activo),
                    //    SOLO se permite el cambio HACIA el estado Finalizado.
                    if (estadoNumerico !== 3) {
                        throw new Error(`El periodo ha finalizado. La única transición de estado permitida es hacia 'Finalizado'.`);
                    }
                }
                
                // Si la validación pasa, se añade a la data
                data.id_estado = estadoNumerico;
            }

        // ----------------------- Actualización ----------------------------

            try {

                const [filasAfectadas] = await Grupo_Model.update(data, 
                    { where: { id_grupo: grupoObjeto.id_grupo } } // La condición para actualizar
                );

                // Se devuelve el objeto actualizado
                if (filasAfectadas === 0) {
                    // Aunque improbable después de findByPk, se maneja.
                    return null;
                }
                
                // Renombramos las propiedades a regresar (para que el cliente no vea los nombres de las columnas de la base de datos)
                return true;

            } catch (error) {
                // Manejar el error de unicidad garantizado por el modelo.
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new Error(`El grupo con el curso y el nombre especificados ya existen en éste periodo.`);
                }
                
                // Re-lanzar cualquier otro error (DB, conexión, etc.)
                throw error;
            }
    }



// -------------------------- Obtención ------------------------------------

    // Se obtiene un solo grupo por el id
    async obtenerGrupoPorId(id) {

        validarExistencia(id, "id", true);

        const idLimpio = String(id).trim();
        validarIdNumerico(idLimpio, "El ID proporcionado no es un número entero válido o positivo.");

        const grupo = await Grupo_Model.findByPk(idLimpio, {

                include: [ 

                    // Se traen los datos del estado del grupo
                    { 
                        association: 'estado_grupo', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "grupo")
                        attributes: ['id_estado_grupo', 'nombre', 'permite_inscripcion'] // Estos son los campos que se traerán de la tabla asociada (estado_grupo)
                    },

                    // Se traen los datos de la modalidad
                    { 
                        association: 'modalidad', 
                        attributes: ['id_modalidad', 'nombre', 'descripcion'] 
                    },

                    // Se traen los datos del periodo
                    { 
                        association: 'periodo', 
                        attributes: ['id_periodo', 'nombre', 'fecha_inicio', 'fecha_fin']
                    },

                    // Se traen los datos del curso
                    { 
                        association: 'curso', 
                        attributes: ['id_curso', 'nombre'],
                        include: [
                                    { 
                                        association: 'categoria', 
                                        attributes: ['id_categoria_curso', 'nombre', 'id_categoria_padre'],

                                        // Se incluye la categoría padre
                                        include: [ 
                                            {
                                                association: 'categoria_padre', // Se usa el alias definido en el modelo "categoria_curso"
                                                attributes: ['id_categoria_curso', 'nombre'] 
                                            }
                                        ]
                                    }
                        ]
                    },

                    // Se traen los datos del docente
                    { 
                        association: 'docente', 
                        attributes: [ 'id_docente' ],
                            include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                                tablas relacionadas definidas en las asociaciones del modelo*/
                                { 
                                    association: 'entidad', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "docente")
                                    attributes: ['numero_identificacion', 'nombre', 'apellido'], // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                                
                                    // Este include anidado es para tener acceso a los prefijos
                                    include: [{
                                        // 2. Incluye el Prefijo (desde el modelo Entidad)
                                        association: 'prefijo', // Alias definido en el modelo Entidad: Entidad.belongsTo(Prefijo_Identificacion)
                                        attributes: ['letra_prefijo'] // Campos que se quieren del Prefijo
                                    }]
                                        
                                },
                                { 
                                    association: 'estado_docente', 
                                    attributes: ['id_estado_docente', 'nombre'] 
                                }
                            ]
                    }
                ]
        });
        
        return GrupoService.formatearGrupo(grupo);
    
    }


    // Permite buscar grupos basandose en filtros
    async buscargrupos(criteriosBusqueda = {}) {
        
        const whereClauses = this.generarWhereClause(criteriosBusqueda);

        // Bandera auxiliar para el filtro de Docente (simplifica la lectura)
        const hayFiltroDocente = !!whereClauses.docente_entidad;

        // 2. Definir los includes necesarios, aplicando el 'where' dinámicamente
        const includes = [

            // Filtro 1: Estado 
            { 
                association: 'estado_grupo', 
                attributes: ['id_estado_grupo', 'nombre', 'permite_inscripcion'],

                // Aplicamos la condición de filtro si existe
                where: whereClauses.estado_grupo, 

                // Requerido: Solo usar INNER JOIN si existe un filtro para esta asociación
                required: !!whereClauses.estado_grupo, 
            },

            // Filtro 2: Modalidad
            { 
                association: 'modalidad', 
                attributes: ['id_modalidad', 'nombre', 'descripcion'],
                where: whereClauses.modalidad, 
                required: !!whereClauses.modalidad, 
            },

            // Filtro 3: Período
            { 
                association: 'periodo', 
                attributes: ['id_periodo', 'nombre'],
                where: whereClauses.periodo, 
                required: !!whereClauses.periodo, 
            },

            // Filtro 4: Curso 
            { 
                association: 'curso', 
                attributes: ['id_curso', 'nombre'], 
                
                // Aplicamos el WHERE del curso
                where: whereClauses.curso,
                // INNER JOIN si hay filtro
                required: !!whereClauses.curso,

                include: [{ 
                    association: 'categoria', 
                    attributes: ['id_categoria_curso', 'nombre', 'id_categoria_padre'],
                    include:[{ 
                        association: 'categoria_padre', 
                        attributes: ['id_categoria_curso', 'nombre'] 
                    }]
                }]
            },

            // Filtro 5: Docente (por Identificación)
            { 
                association: 'docente', 
                attributes: ['id_docente'], 

                // Si hay filtro anidado, el padre (docente) también debe ser required: true
                required: hayFiltroDocente,
                
                // Aquí NO se pone el 'where' ni 'required', ya que el filtro está ANIDADO

                include: [{ 
                    // Modelo Entidad: Es el que tiene el campo 'numero_identificacion'
                    association: 'entidad', 
                    attributes: ['numero_identificacion', 'nombre', 'apellido'],
                    
                    // Aplicamos el WHERE
                    where: whereClauses.docente_entidad, 
                    
                    // Requerido: Este es el segundo punto clave. Si hay filtro, se hace INNER JOIN.
                    required: hayFiltroDocente, 

                    include:[{ 
                        association: 'prefijo', 
                        attributes: ['letra_prefijo'] 
                    }]
                },
                { 
                    association: 'estado_docente', 
                    attributes: ['id_estado_docente', 'nombre']
                }]
            }
            
        ];


       // --- Se ejecuta la Consulta ---

        const grupos = await Grupo_Model.findAll({
            
            // Se aplican las condiciones de la tabla principal
            where: whereClauses.main, 
            
            // Se aplican los includes dinámicos
            include: includes,

            // Mantenemos el orden por fecha de actualización
            order: [
                ['updatedAt', 'DESC'] 
            ]
        });

        //  Se devuelven los resultados formateados
        return grupos.map(instancia => GrupoService.formatearGrupo(instancia));
    }


    // Obtiene el conteo por mes de grupos, lo que es necesario para los gráficos
    async obtenerConteoPorMes(criteriosBusqueda = {}) {

        const concepto = criteriosBusqueda.concepto ?? null;

        // 1. Validaciones y Columna de Fecha
        validarExistencia(concepto, "concepto", true);

        const conceptoLimpio = String(concepto).trim().toLowerCase();
        validarSoloTexto(concepto, "El concepto debe contener solo texto y espacios en blanco.");

        let columnaFecha = ""; // Columna de Grupo a usar (createdAt o updatedAt)

        switch (conceptoLimpio) {
            case "creados":
                columnaFecha = "createdAt";
                break;
            case "modificados":
                columnaFecha = "updatedAt";
                break;
            default:
                columnaFecha = "createdAt";
        }



        // Generación de las Cláusulas de Filtro (Reutilizando la lógica)
        // Esto genera: whereClauses.main, whereClauses.modalidad, whereClauses.docente_entidad, etc.
        const whereClauses = this.generarWhereClause(criteriosBusqueda);
        const hayFiltroDocente = !!whereClauses.docente_entidad;

        // Aplicación del Filtro de 'Realmente Modificados' a la tabla principal
        let whereMainConFecha = { ...whereClauses.main }; // Copia las condiciones de la tabla principal
        
        // Si el conteo es por 'modificados', agregamos la condición de que updatedAt > createdAt
        if (conceptoLimpio === "modificados") {
            
            const whereModificado = { [Op.gt]: col('Grupo.createdAt') }; // 💡 col('Grupo.createdAt') para asegurar la referencia
            
            if (whereMainConFecha.updatedAt) {
                // Si ya hay filtros de rango de fechas en updatedAt, combinamos con Op.and
                whereMainConFecha.updatedAt = {
                    [Op.and]: [
                        whereMainConFecha.updatedAt, 
                        whereModificado
                    ]
                };
            } else {
                // Si no hay filtros de fecha, solo agregamos la condición de ser posterior a la creación
                whereMainConFecha.updatedAt = whereModificado;
            }
        }


        // Definición de Includes (Reutilizando la lógica de "buscargrupos")
        const includes = [
            // Filtro 1: Estado (required si hay filtro)
            { 
                association: 'estado_grupo', 
                attributes: [], // No necesitamos atributos en el conteo
                where: whereClauses.estado_grupo, 
                required: !!whereClauses.estado_grupo, 
            },

            // Filtro 2: Modalidad (required si hay filtro)
            { 
                association: 'modalidad', 
                attributes: [], 
                where: whereClauses.modalidad, 
                required: !!whereClauses.modalidad, 
            },

            // Filtro 3: Período (required si hay filtro)
            { 
                association: 'periodo', 
                attributes: [],
                where: whereClauses.periodo, 
                required: !!whereClauses.periodo, 
            },

            // Filtro 4: Curso (required si hay filtro)
            { 
                association: 'curso', 
                attributes: [], 
                where: whereClauses.curso,
                required: !!whereClauses.curso,
                // Quitamos los includes anidados para simplificar el GROUP BY (no los necesitamos para el filtro)
            },

            // Filtro 5: Docente (requiere INNER JOIN en ambos niveles si hay filtro)
            { 
                association: 'docente', 
                attributes: [], 
                required: hayFiltroDocente, // INNER JOIN si hay filtro en la entidad anidada
                
                include: [{ 
                    association: 'entidad', 
                    attributes: [],
                    where: whereClauses.docente_entidad, 
                    required: hayFiltroDocente, // INNER JOIN si hay filtro
                }]
            }
        ];


        // Ejecución de la Consulta de Agregación
        const resultadosAgregados = await Grupo_Model.findAll({

            // Aplicamos las condiciones de la tabla principal (con filtros de fecha incluidos)
            where: whereMainConFecha, 
            
            // Aplicamos los includes dinámicos
            include: includes,
            
            attributes: [
                // A) Conteo: COUNT(id_grupo)
                [fn('COUNT', col('Grupo.id_grupo')), 'conteo'],
                
                // B) Etiqueta de Mes (usando la columna de fecha dinámica)
                [
                    fn(
                        'TO_CHAR', 
                        col(`Grupo.${columnaFecha}`), //  Referenciamos la columna de fecha dinámica en el modelo Grupo
                        'Month YYYY' 
                    ), 
                    'mes'
                ],
                
                // C) Fecha de Orden (usando la columna de fecha dinámica)
                [fn('DATE_TRUNC', 'month', col(`Grupo.${columnaFecha}`)), 'fecha_orden'] //  Referenciamos la columna de fecha dinámica
            ],
            
            // Este bloque es la cláusula GROUP BY
            group: [
                // Agrupamos por la etiqueta de mes (TO_CHAR)
                fn('TO_CHAR', col(`Grupo.${columnaFecha}`), 'Month YYYY'),

                // Agregamos el campo de ordenamiento/agrupación (DATE_TRUNC)
                fn('DATE_TRUNC', 'month', col(`Grupo.${columnaFecha}`))
            ],
            
            // Ordenar por la fecha de orden
            order: [
                [fn('DATE_TRUNC', 'month', col(`Grupo.${columnaFecha}`)), 'ASC'] 
            ],
            
            // Es crucial para consultas de agregación y cuando se usan funciones de BD
            raw: true 
        });

        // Formateo y retorno (Se mantiene igual)
        return resultadosAgregados.map(item => ({
            mes: traducirMes(item.mes), 
            conteo: parseInt(item.conteo, 10)
        }));

    }


    // Obtiene la cantidad total de grupos según cada estado, aplicando los filtros de búsqueda
    async obtenerEstadosTotales(criteriosBusqueda = {}) {
        
        // 1. Generación de las Cláusulas de Filtro (Reutilizando la lógica anterior)
        const whereClauses = this.generarWhereClause(criteriosBusqueda);
        const hayFiltroDocente = !!whereClauses.docente_entidad;
        
        // 2. Definición de Includes para aplicar filtros complejos

        // NOTA: Solo se incluyen las asociaciones que tienen filtros definidos.
        const includes = [
            
            // Filtro 1: Modalidad
            { 
                association: 'modalidad', 
                attributes: [], 
                where: whereClauses.modalidad, 
                required: !!whereClauses.modalidad, 
            },

            // Filtro 2: Período
            { 
                association: 'periodo', 
                attributes: [],
                where: whereClauses.periodo, 
                required: !!whereClauses.periodo, 
            },

            // Filtro 3: Curso (para aplicar filtros por nombre de curso)
            { 
                association: 'curso', 
                attributes: [], 
                where: whereClauses.curso,
                required: !!whereClauses.curso,
            },

            // Filtro 4: Docente (por Identificación de Entidad)
            { 
                association: 'docente', 
                attributes: [], 
                required: hayFiltroDocente, 
                
                include: [{ 
                    // Entidad: Es donde reside el filtro 'numero_identificacion'
                    association: 'entidad', 
                    attributes: [],
                    where: whereClauses.docente_entidad, 
                    required: hayFiltroDocente, 
                }]
            }
            
            // El Estado del Grupo (estado_grupo) se define como el objetivo principal abajo
        ];


        // 3. Ejecución de la Consulta de Agregación
        const resultadosAgregados = await Grupo_Model.findAll({ 
            
            // Aplicamos los filtros de la tabla principal (nombre, rangos de cupo/costo, fechas)
            where: whereClauses.main, 
            
            // Aplicamos los filtros asociados definidos arriba (Docente, Curso, Modalidad, Periodo)
            include: [
                ...includes,
                { 
                    // Asociacion Objetivo: Se incluye para AGREGAR y AGRUPAR
                    association: 'estado_grupo', 
                    attributes: ['nombre'], // Necesitamos el nombre para la etiqueta de agrupación
                    // El filtro específico de 'estado' (id_estado_grupo) se aplicará aquí si existe
                    where: whereClauses.estado_grupo,
                    // Siempre debe ser INNER JOIN si se agrupa por esta asociación, o si hay un filtro aplicado
                    required: true, 
                },
            ],
            
            attributes: [
                // A) Conteo total de grupos
                [fn('COUNT', col('Grupo.id_grupo')), 'conteo']
            ],
            
            // 4. Agrupación: Agrupamos por el nombre del estado del grupo
            group: [
                // Referenciamos la columna 'nombre' a través de su alias de asociación
                col('estado_grupo.nombre') 
            ],
            
            // 5. Ordenamiento
            order: [
                [col('estado_grupo.nombre'), 'ASC'] 
            ],
            
            // Configuraciones necesarias para consultas de agregación con JOINs
            raw: true,
            subQuery: false,
            duplicating: false
        });

        // 6. Formatear y Devolver el resultado
        const estadosTotales = {}; 
        
        resultadosAgregados.forEach(item => {
            // La clave del nombre del estado en el objeto 'raw' de Sequelize se construye con el alias
            const nombreEstado = item['estado_grupo.nombre'];
            const conteoNumerico = parseInt(item.conteo, 10);
            
            if (nombreEstado) {
                estadosTotales[nombreEstado] = conteoNumerico;
            }
        });

        // Ejemplo de retorno: { 'Activo': 15, 'Pendiente': 3, 'Cerrado': 7 }
        return estadosTotales;
    }
        

 


// -------------------------- Auxiliar ------------------------------------

    static formatearGrupo(grupoInstance) {

        // Si no existe la entidad se devuelve null
        if (!grupoInstance) return null;

        const grupo = grupoInstance.toJSON(); 


        return {
            id: grupo.id_grupo, 

            estado: {
                id: grupo.estado_grupo?.id_estado_grupo ?? null,
                nombre: grupo.estado_grupo?.nombre ?? null,
                permite_inscripcion: grupo.estado_grupo.permite_inscripcion == true ? "Si" : "No",
            },

            modalidad: {
                id: grupo.modalidad?.id_modalidad ?? null,
                nombre: grupo.modalidad?.nombre ?? null,
            },

            periodo: {
                id: grupo.periodo?.id_periodo ?? null,
                nombre: capitalizeFirstLetter(grupo.periodo?.nombre ?? ""),
                inicio: grupo.periodo?.fecha_inicio ?? null,
                fin: grupo.periodo?.fecha_fin ?? null,
            },

            curso: {
                id: grupo.curso?.id_curso ?? null,
                nombre: capitalizeFirstLetter(grupo.curso?.nombre ?? ""),

                categoria: {
                    id: grupo.curso?.categoria?.id_categoria_curso ?? null,
                    nombre: grupo.curso?.categoria?.nombre ?? null,
                   
                    categoria_padre: {
                        id: grupo.curso?.categoria?.categoria_padre?.id_categoria_curso ?? null,
                        nombre: grupo.curso?.categoria?.categoria_padre?.nombre ?? null,
                    }
                }
                
            },


            docente: {
                id: grupo.docente?.id_docente ?? null,

                entidad: {       
                    numero_identificacion: grupo.docente?.entidad?.numero_identificacion ?? null,
                    nombre: capitalizeFirstLetter(grupo.docente?.entidad?.nombre ?? ""),
                    apellido: capitalizeFirstLetter(grupo.docente?.entidad?.apellido ?? ""),
                
                    prefijo: grupo.docente?.entidad?.prefijo?.letra_prefijo ?? null,
                },

                estado_docente: {
                    id: grupo.docente?.estado_docente?.id_estado_docente ?? null,
                    nombre: grupo.docente?.estado_docente?.nombre ?? null
                }
                
            },

            nombre: capitalizeFirstLetter(grupo.nombre),      
            cupo_maximo: grupo.cupo_maximo,
            costo_inscripcion: grupo.costo_inscripcion,
            costo_clase: grupo.costo_unitario_clase,
     
            fechaCreacion: grupo.createdAt,
            fechaActualizacion: grupo.updatedAt 
        };

    }

    // Función Auxiliar que genera la "whereClause" sin ejecutar la consulta
    generarWhereClause(criteriosBusqueda = {}) {
        
       // Objeto que contendrá las cláusulas WHERE separadas por modelo
        const whereClauses = {
            main: {}, // Condiciones para Grupo_Model (tabla principal)
            estado_grupo: null, // Condiciones para Modalidad_Clase_Model (tabla asociada)
            modalidad: null, 
            periodo: null,
            curso: null,         
            docente_entidad: null
            
        };

        // 1. Obtener y limpiar los criterios de búsqueda (usando desestructuración)
        const { 
            // Filtros de la tabla "grupo"
            nombre,
            docente,
            curso,
            estado,
            permite_inscripcion,
            modalidad,
            periodo,
            cupoDesde,
            cupoHasta,
            costoInscripcionDesde,
            costoInscripcionHasta,
            costoClaseDesde,
            costoClaseHasta,
            creadosDesde,
            creadosHasta,
            modificadosDesde,
            modificadosHasta,

        } = criteriosBusqueda;
    
        // Se validan y parsean las fechas
        const fechaCreacionDesde = parseAndValidateDate(creadosDesde);
        const fechaCreacionHasta = parseAndValidateDate(creadosHasta);
        const fechamodificadosDesde = parseAndValidateDate(modificadosDesde);
        const fechamodificadosHasta = parseAndValidateDate(modificadosHasta);

        // Variables auciliares para rangos
        let min = null;
        let max = null;


        // Variable para guardar los datos en limpio
        let codigoLimpio = null;

        // Variables para las fechas
            let inicioDiaSiguiente = null;
            // Suma 24 horas (86,400,000 milisegundos)
            const milisegundosEnUnDia = 24 * 60 * 60 * 1000;


        // =================================================================
        // A. Filtros por ID de Tablas Asociadas (Van en el 'where' del include)
        // =================================================================

            // Filtro A1: Modalidad (Tabla Asociada)
            if (validarExistencia(modalidad, "", false)) { 
                validarIdNumerico(modalidad, "La modalidad debe ser numérica.");
                const modalidadNumerica = parseInt(modalidad, 10);
                
                if (!isNaN(modalidadNumerica)) {
                    whereClauses.modalidad = {
                        id_modalidad: modalidadNumerica
                    };
                }
            }

            // Filtro A2: Estado del Grupo (Tabla Asociada)
            if (validarExistencia(estado, "", false)) { 
                validarIdNumerico(estado, "El estado debe ser numérico.");
                const estadoNumerico = parseInt(estado, 10);
                
                if (!isNaN(estadoNumerico)) {
                    whereClauses.estado_grupo = {
                        id_estado_grupo: estadoNumerico
                    };
                }
            }

            // Filtro A2.1: Permite Inscripción (Tabla Asociada: Estado_Grupo)
            if (validarExistencia(permite_inscripcion, "", false)) { 
                validarBooleano(permite_inscripcion, "El filtro 'permite_inscripcion' debe ser un valor booleano (true/false).");

                // Si whereClauses.estado_grupo no existe (porque no se filtró por ID de estado), lo inicializamos
                if (!whereClauses.estado_grupo) {
                    whereClauses.estado_grupo = {};
                }

                // Añadimos la condición de permite_inscripcion
                whereClauses.estado_grupo.permite_inscripcion = permite_inscripcion;
            }

            // Filtro A3: Período (Tabla Asociada)
            if (validarExistencia(periodo, "", false)) { 
                validarIdNumerico(periodo, "El ID de período debe ser numérico.");
                const periodoNumerico = parseInt(periodo, 10);
                
                if (!isNaN(periodoNumerico)) {
                    whereClauses.periodo = {
                        id_periodo: periodoNumerico
                    };
                }
            }


        // =================================================================
        // B. Filtros de Texto y Rango (Van en el 'where' de la tabla principal)
        // =================================================================

            // Filtro B1: Nombre del Grupo 
            if (validarExistencia(nombre, "", false)) {
                codigoLimpio = String(nombre).trim();
                if (codigoLimpio) {
                    validarSoloTexto(codigoLimpio, "El nombre del grupo debe contener solo texto y espacios en blanco.");
                    whereClauses.main.nombre = { [Op.iLike]: `%${codigoLimpio}%` };
                }
            }


            // Filtro B2: Rango de Cupo Máximo 
            if (validarExistencia(cupoDesde, "", false) || validarExistencia(cupoHasta, "", false)) {
                whereClauses.main.cupo_maximo = {}; // Campo en la tabla Grupo
                min = null;
                max = null;

                if (validarExistencia(cupoDesde, "", false)) {
                    validarSoloNumeros(cupoDesde, "El cupo máximo 'desde' debe ser numérico.");
                    min = parseInt(cupoDesde, 10);
                    if (!isNaN(min)) {
                        whereClauses.main.cupo_maximo[Op.gte] = min;
                    }
                }
                
                if (validarExistencia(cupoHasta, "", false)) {
                    validarSoloNumeros(cupoHasta, "El cupo máximo 'hasta' debe ser numérico.");
                    max = parseInt(cupoHasta, 10);
                    if (!isNaN(max)) {
                        whereClauses.main.cupo_maximo[Op.lte] = max;
                    }
                }

                // Si ambos existen y el cupo máximo es menor que el cupo mínimo
                if((min && max) && (max < min)){
                    throw new Error(`El cupo máximo no puede ser menor que el cupo mínimo.`);
                }
            }


            // Filtro B3: Rango de Costo de Inscripción
            if (validarExistencia(costoInscripcionDesde, "", false) || validarExistencia(costoInscripcionHasta, "", false)) {
                whereClauses.main.costo_inscripcion = {}; // Campo en la tabla Grupo
                min = null;
                max = null;

                if (validarExistencia(costoInscripcionDesde, "", false)) {
                    validarSoloNumerosEnterosYDecimales(costoInscripcionDesde, "El costo de inscripción 'Desde', no tiene el formato correcto");
                    min = parseFloat(costoInscripcionDesde);
                    if (!isNaN(min)) {
                        whereClauses.main.costo_inscripcion[Op.gte] = min;
                    }
                }
                
                if (validarExistencia(costoInscripcionHasta, "", false)) {
                    validarSoloNumerosEnterosYDecimales(costoInscripcionHasta, "El costo de inscripción 'Hasta', no tiene el formato correcto");
                    max = parseFloat(costoInscripcionHasta);
                    if (!isNaN(max)) {
                        whereClauses.main.costo_inscripcion[Op.lte] = max;
                    }
                }

                // Si ambos existen y el costo de inscripción máximo es menor que el mínimo
                if((min && max) && (max < min)){
                    throw new Error(`El costo de inscripción máximo no puede ser menor que el costo mínimo.`);
                }
            }


            // Filtro B4: Rango de Costo Unitario de Clase
            if (validarExistencia(costoClaseDesde, "", false) || validarExistencia(costoClaseHasta, "", false)) {
                whereClauses.main.costo_unitario_clase = {};
                min = null;
                max = null;

                if (validarExistencia(costoClaseDesde, "", false)) {
                    validarSoloNumerosEnterosYDecimales(costoClaseDesde, "El costo de clase 'Desde', no tiene el formato correcto");
                    min = parseFloat(costoClaseDesde);
                    if (!isNaN(min)) {
                        whereClauses.main.costo_unitario_clase[Op.gte] = min;
                    }
                }
                
                if (validarExistencia(costoClaseHasta, "", false)) {
                    validarSoloNumerosEnterosYDecimales(costoClaseHasta, "El costo de clase 'Hasta', no tiene el formato correcto");
                    max = parseFloat(costoClaseHasta);
                    if (!isNaN(max)) {
                        whereClauses.main.costo_unitario_clase[Op.lte] = max;
                    }
                }

                // Si ambos existen y el costo de clase máximo es menor que el mínimo
                if((min && max) && (max < min)){
                    throw new Error(`El costo de clase máximo no puede ser menor que el costo mínimo.`);
                }
            }


            // Filtro B5: Rango de Fechas de creación
            if (fechaCreacionDesde || fechaCreacionHasta) {

                whereClauses.main.createdAt = {};
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechaCreacionDesde) {
                    whereClauses.main.createdAt[Op.gte] = fechaCreacionDesde;
                }

                if (fechaCreacionHasta) {
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/


                    inicioDiaSiguiente = new Date(fechaCreacionHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    whereClauses.main.createdAt[Op.lt] = inicioDiaSiguiente;
        
                }
            }

            // Filtro B6: Rango de Fechas de modificación 
            if (fechamodificadosDesde || fechamodificadosHasta) {

                whereClauses.main.updatedAt = {};
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "createdAt" >= 'fecha_inicio'
                */
                if (fechamodificadosDesde) {
                    whereClauses.main.updatedAt[Op.gte] = fechamodificadosDesde;
                }

                if (fechamodificadosHasta) {
                    
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/
                    
                    inicioDiaSiguiente = new Date(fechamodificadosHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    whereClauses.main.updatedAt[Op.lt] = inicioDiaSiguiente;
                }
            }


        // =================================================================
        // C. Filtros por Tablas Asociadas (Nuevas)
        // =================================================================

            // Filtro C1: Curso por Nombre (Tabla Asociada: Curso)
            if (validarExistencia(curso, "", false)) {
                codigoLimpio = String(curso).trim();
                if (codigoLimpio) {
                    validarLongitudCadena(codigoLimpio, 0, 50, "El nombre no cumple con la longitud requerida (de 5 a 50 caracteres).");
                    whereClauses.curso = {
                        nombre: { [Op.iLike]: `%${codigoLimpio}%` }
                    };
                }
            }


            // Filtro C2: Docente por Identificación (Tablas Asociadas: Docente -> Entidad)
            if (validarExistencia(docente, "", false)) {
                let codigoLimpio = String(docente).trim();

                if (codigoLimpio) {
                    // Asumo que el número de identificación es una cadena (puede contener guiones, etc.)
                    // y que la tabla Entidad usa el campo 'numero_identificacion'
                    whereClauses.docente_entidad = {
                        numero_identificacion: { [Op.iLike]: `%${codigoLimpio}%` }
                    };
                    // O si quieres que sea una coincidencia exacta:
                    // whereClauses.docente_entidad = { numero_identificacion: codigoLimpio };
                }
            }


        return whereClauses;


    }   



}

module.exports = GrupoService;