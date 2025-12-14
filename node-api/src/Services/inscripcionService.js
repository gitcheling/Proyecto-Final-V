const Inscripcion_Model = require('../Models/inscripcion');
const Estado_Inscripcion_Model = require('../Models/estado_inscripcion');
const Grupo_Model = require('../Models/grupo'); 
const Estudiante_Model = require('../Models/estudiante'); 
const Obligacion_Financiera_Model = require('../Models/obligacion_financiera'); 
const Obligacion_Inscripcion_Model = require('../Models/obligacion_inscripcion'); 

// Importar la instancia de conexión
const sequelize = require('../Config/database');

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, validarLongitudCadena, validarSoloNumerosEnterosYDecimales, validarBooleano, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter, traducirMes} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op, fn, col } = require('sequelize'); 

class InscripcionService {

// -------------------------- Creación ------------------------------------

    // Se crea una inscripción
    async crearInscripcion({grupo, estudiante}) {

        // ----------------------- Validaciones de existencia ----------------------------

            validarExistencia(grupo, "grupo", true);
            validarExistencia(estudiante, "estudiante", true);

        // ----------------------- Validaciones de formato ----------------------------

            const grupoLimpio = String(grupo).trim();   
            validarIdNumerico(grupoLimpio, "El grupo no tiene el formato correcto");

            const estudianteLimpio = String(estudiante).trim();   
            validarIdNumerico(estudianteLimpio, "El estudiante no tiene el formato correcto");

        
        // ----------------------- Validaciones de existencia en la base de datos ----------------------------

            // Se valida que exista el grupo
            const grupoObjeto = await Grupo_Model.findByPk(grupoLimpio, {
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'estado_grupo', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "grupo")
                        attributes: ['id_estado_grupo', 'nombre', 'permite_inscripcion'] // Estos son los campos que se traerán de la tabla asociada (estado_grupo)
                    },
                    { 
                        association: 'periodo', 
                        attributes: ['id_periodo', 'nombre', 'fecha_fin'] 
                    }
                ]
            });
            if(!grupoObjeto){throw new Error(`El grupo especificado no existe.`);}


            // Se valida que exista el estudiante
            const estudianteObjeto = await Estudiante_Model.findByPk(estudianteLimpio, {
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'estado_academico', 
                        attributes: ['id_estado_academico', 'nombre', 'permite_inscripcion'] 
                    }
                ]
            });
            if(!estudianteObjeto){throw new Error(`El estudiante especificado no existe.`);}
        


        // ----------------------- Validaciones de si se permite o no crear la inscripción con esos datos ----------------------------

            if(grupoObjeto.estado_grupo.permite_inscripcion == false){throw new Error(`El grupo seleccionado no permite nuevas inscripciones.`);}

            if(estudianteObjeto.estado_academico.permite_inscripcion == false){throw new Error(`EL estudiante seleccionado no puede realizar nuevas inscripciones.`);};


            const fechaFinPeriodo = new Date(grupoObjeto.periodo.fecha_fin);

            /*Obtener la fecha de HOY, normalizada.
            Creamos una fecha para hoy y la normalizamos a la medianoche (00:00:00)
            para que la comparación sea a nivel de día completo y no de hora/minuto. */
            const hoyNormalizado = new Date();
            hoyNormalizado.setHours(0, 0, 0, 0);

            // La regla es: Si la fecha de finalización del periodo es *anterior* a la fecha de hoy (medianoche), 
            // significa que el periodo terminó ayer o antes.
            if (fechaFinPeriodo < hoyNormalizado) {
                throw new Error(`El grupo seleccionado es de un periodo que ya ha finalizado. Por favor seleccione un grupo de un periodo actual o futuro.`);
            }




            // Validación de Cupo Máximo 
            // Contar SOLO las inscripciones que actualmente OCUPAN un cupo (donde el estado permite ver la clase).
            const conteoCupoOcupado = await Inscripcion_Model.count({
                where: {
                    id_grupo: grupoObjeto.id_grupo,
                },
                // Incluir la asociación para poder filtrar por la propiedad del estado
                include: [{
                    association: 'estado_inscripcion', 
                    attributes: [], // No necesitamos las columnas del estado en el resultado, solo para el filtro
                    where: {
                        // Filtramos solo por estados que indican que el cupo está siendo usado
                        puede_ver_clase: true 
                    },
                    required: true // Forzamos un INNER JOIN para que solo cuente las que cumplen la condición
                }],
                
                // Configuraciones necesarias para COUNT cuando se usa JOIN (distinct y col son importantes)
                distinct: true, 
                col: 'id_inscripcion', // Aseguramos el conteo sobre la clave primaria de la tabla principal
                subQuery: false,
            });

            const cupoMaximo = grupoObjeto.cupo_maximo;

            if (conteoCupoOcupado >= cupoMaximo) {
                throw new Error(`El grupo "${capitalizeFirstLetter(grupoObjeto.nombre)}" ha alcanzado su cupo máximo de estudiantes activos (${cupoMaximo}). No es posible realizar la inscripción.`);
            }
    

        // ----------------------- Creación ----------------------------


            // INICIAR LA TRANSACCIÓN
            const t = await sequelize.transaction();

            try {

                // LÓGICA DE GENERACIÓN DEL NÚMERO DE RECIBO (VARCHAR)
                // Ejemplo simple pero robusto y único: Usar el timestamp en milisegundos más un prefijo.
                // Formato: REC-[TIMESTAMP_MS] (ej: REC-1765795580620) -> Mín. 19 caracteres (cumple con [10, 30] de longitud) 
                const timestamp = Date.now();
                const numeroReciboGenerado = `REC-${timestamp}`;


                // Se manda a crear la inscripcion
                const DataInscripcion = {
                    id_grupo: grupoObjeto.id_grupo,
                    id_estudiante: estudianteObjeto.id_estudiante,             
                    id_estado: 1
                };
                const nuevaInscripcion = await Inscripcion_Model.create(DataInscripcion, { transaction: t });


                // Se manda a crear la obligación financiera
                const DataObligacionFinanciera = {
                    id_entidad: estudianteObjeto.id_estudiante,
                    id_concepto: 5, // "Inscripción"
                    id_tipo_comprobante: 5, // "Recibo Provisional",
                    numero_documento: numeroReciboGenerado , 
                    fecha_emision: new Date(), // Creamos un objeto Date simple. Sequelize y DATEONLY se encargarán de truncar la hora.
                    fecha_vencimiento: new Date(), 
                    monto_original: grupoObjeto.costo_inscripcion, 
                    id_divisa: 2, // "Dolar Estadounidense"
                    id_estado: 1, // "Emitida" (esperando por pago)
                }; 
                const nuevaObligacion = await Obligacion_Financiera_Model.create(DataObligacionFinanciera, { transaction: t });


                // Se manda a crear la obligación de inscripcion
                const DataObligacionInscripcion = {
                    id_obligacion: nuevaObligacion.id_obligacion,
                    id_inscripcion: nuevaInscripcion.id_inscripcion,             
                };
                const nuevaObligacionInscripcion = await Obligacion_Inscripcion_Model.create(DataObligacionInscripcion, { transaction: t });


                // COMMIT: Si todo lo anterior se ejecuta sin errores, se guardan los cambios.
                await t.commit();


                // Renombramos las propiedades a regresar (para que el cliente no vea los nombres de las columnas de la base de datos)
                return {
                    id: nuevaInscripcion.id_inscripcion, 
                    estado: "Pendiente de Pago",

                    fechaCreacion: nuevaInscripcion.createdAt,
                    fechaActualizacion: nuevaInscripcion.updatedAt
                    
                };

            } catch (error) {

                // ROLLBACK: Si ocurre CUALQUIER error (incluyendo el SequelizeUniqueConstraintError) se deshacen todos los cambios.
                await t.rollback();
        
                // Manejar el error de unicidad garantizado por el modelo.
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new Error(`El estudiante ya está registrado en el grupo especificado.`);
                }

                // Re-lanzar cualquier otro error (DB, conexión, etc.)
                throw error;
            }

    }




// -------------------------- Modificación ------------------------------------

    async cambiarEstadoInscripcion(id, nuevoEstado) {

        // ----------------------- Validaciones de existencia ----------------------------

            if(!validarExistencia(id, "", false)){
                return null;
            }

            validarExistencia(nuevoEstado, "estado", true)

            
        // ----------------------- Validaciones de formato ----------------------------

            // Se valida el id
            const idLimpio = String(id).trim();
            validarIdNumerico(idLimpio, "El id no tiene el formato correcto");

            // Se valida el nuevo estado
            const nuevoEstadoLimpio = String(nuevoEstado).trim();
            validarIdNumerico(nuevoEstadoLimpio, "El nuevo estado no tiene el formato correcto");


        // ----------------------- Validaciones de existencia en la base de datos ----------------------------

            // Se valida que exista la inscripción
            const inscripcionObjeto = await Inscripcion_Model.findByPk(idLimpio, {
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'estado_inscripcion', 
                        attributes: ['id_estado_inscripcion', 'nombre', 'ciclo_cerrado'] 
                    }
                ]
            });
            if(!inscripcionObjeto){throw new Error(`La inscripción especificada no existe.`);}
            

            // Se valida que exista el nuevo estado
            const estadoInscripcionObjeto = await Estado_Inscripcion_Model.findByPk(nuevoEstadoLimpio);
            if(!estadoInscripcionObjeto){throw new Error(`EL nuevo estado especificado no existe.`);}



        // ----------------------- Validaciones de si se permite o no crear la inscripción con esos datos ----------------------------

            if(inscripcionObjeto.estado_inscripcion.ciclo_cerrado == true){throw new Error(`La inscripción ya ha terminado su ciclo, no se puede cambiar su estado.`);}
            
            if(estadoInscripcionObjeto.nombre == "Pendiente de Pago" && inscripcionObjeto.id_estado > 1){throw new Error(`La inscripción ya ha sido activada, no se puede volver a la etapa anterior.`);}


            let anularObligaciones = false;
            let idsObligacionesAAnular = [];
            if(estadoInscripcionObjeto.ciclo_cerrado == true){

                // Buscamos las Obligaciones Financieras (OF) cuyo estado es "Emitida" (1)
                // y que están relacionadas a través de Obligacion_Inscripcion (OI) con el idInscripcion dado.
                const obligacionesPendientes = await Obligacion_Financiera_Model.findAll({
                    attributes: ['id_obligacion'], // Solo necesitamos el ID para la actualización
                    where: {
                        id_estado: 1, // "Emitida"
                    },
                    
                    // Unir a Obligacion_Inscripcion para filtrar por el ID de la inscripción
                    include: [{
                        model: Obligacion_Inscripcion_Model, // Usamos el modelo Obligacion_Inscripcion
                        as: 'obligacion_inscripcion',       // Alias definido en Obligacion_Financiera_Model.hasOne
                        required: true,                     // Forzar INNER JOIN
                        attributes: [],                     // No necesitamos sus columnas
                        where: {
                            id_inscripcion: idLimpio, // Filtrar por la inscripción específica
                        }
                    }]
                });

                // Obtener la lista de IDs a actualizar
                idsObligacionesAAnular = obligacionesPendientes.map(ob => ob.id_obligacion);

                if (idsObligacionesAAnular.length > 0) {
                   anularObligaciones = true;
                }

            }


            // INICIAR LA TRANSACCIÓN
            const t = await sequelize.transaction();

            try {

                // Solo se actualiza la columna 'estado'
                const [filasAfectadas] = await Inscripcion_Model.update(
                    { id_estado: estadoInscripcionObjeto.id_estado_inscripcion }, 
                    { where: { id_inscripcion: inscripcionObjeto.id_inscripcion },
                    transaction: t, }
                );


                if(anularObligaciones){

                    // ACTUALIZAR (ANULAR) LAS OBLIGACIONES ENCONTRADAS
        
                    // Sequelize.update devuelve un array: [número de filas afectadas, filas afectadas (solo si raw: false)]
                    const [filasActualizadas] = await Obligacion_Financiera_Model.update(
                        { id_estado: 4 }, // El nuevo valor de estado (Anulada = 4)
                        {
                            where: {
                                id_obligacion: {
                                    [Op.in]: idsObligacionesAAnular // Filtrar por los IDs encontrados
                                },
                                id_estado: 1 // Doble chequeo de seguridad
                            },
                            transaction: t, // Ejecutar la actualización dentro de la transacción
                        }
                    );
                }


                // COMMIT: Si todo lo anterior se ejecuta sin errores, se guardan los cambios.
                await t.commit();

                return true;

            } catch (error) {

                // ROLLBACK: Si ocurre CUALQUIER error (incluyendo el SequelizeUniqueConstraintError) se deshacen todos los cambios.
                await t.rollback();
        
                // Manejar el error de unicidad garantizado por el modelo.
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new Error(`El estudiante ya está registrado en el grupo especificado.`);
                }

                // Re-lanzar cualquier otro error (DB, conexión, etc.)
                throw error;
            }

    }



// -------------------------- Obtención ------------------------------------

    // Se obtiene una sola inscripción por el id
    async obtenerInscripcionPorId(id) {

        validarExistencia(id, "id", true);

        const idLimpio = String(id).trim();
        validarIdNumerico(idLimpio, "El ID proporcionado no es un número entero válido o positivo.");

        const inscripcion = await Inscripcion_Model.findByPk(idLimpio, {

                include: [ 

                    // Se traen los datos del estado del grupo
                    { 
                        association: 'estado_inscripcion', 
                        attributes: ['id_estado_inscripcion', 'nombre', 'puede_ver_clase', 'ciclo_cerrado']
                    },

                    // Traer datos del Estudiante y la Entidad
                    { 
                        association: 'estudiante', // Alias en Inscripcion
                        attributes: ['id_estudiante', 'codigo_estudiantil'],
                        include: [
                            { 
                                association: 'entidad', // Alias en Estudiante
                                attributes: ['nombre', 'apellido', 'numero_identificacion'],
                                include: [
                                    { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                                    // Prefijo está asociado a la Entidad
                                ]
                            }
                        ]
                    },


                    { 
                        association: 'grupo',
                        include: [
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

                            { association: 'modalidad', attributes: ['id_modalidad', 'nombre'] },

                            // Se traen los datos del estado del grupo
                            { 
                                association: 'estado_grupo',
                                attributes: ['id_estado_grupo', 'nombre', 'permite_inscripcion'] 
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
                            { 
                                association: 'docente', 
                                attributes: ['id_docente'],
                                include: [
                                    { 
                                        association: 'entidad', 
                                        attributes: ['nombre', 'apellido', 'numero_identificacion'],
                                        include: [
                                            { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                                            // Prefijo está asociado a la Entidad
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
        });
        
        return InscripcionService.formatearInscripcion(inscripcion);
    
    }
    

    async buscarInscripciones(criteriosBusqueda = {}) {
        
        // 1. Generar las cláusulas WHERE y los includes anidados de filtro
        const { whereClauseInscripcion, includeClauses } = this.generarWhereClause(criteriosBusqueda);
        
        // 2. Definir Includes Fijos (para traer los datos siempre)
        const fixedIncludes = [ 
            { 
                association: 'estado_inscripcion', 
                attributes: ['id_estado_inscripcion', 'nombre', 'ciclo_cerrado']
            },
            // Traer datos del Estudiante y la Entidad
            { 
                association: 'estudiante', // Alias en Inscripcion
                attributes: ['id_estudiante', 'codigo_estudiantil'],
                include: [
                    { 
                        association: 'entidad', // Alias en Estudiante
                        attributes: ['nombre', 'apellido', 'numero_identificacion'],
                        include: [
                            { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                            // Prefijo está asociado a la Entidad
                        ]
                    }
                ]
            },
    
            // Traer datos del Grupo y Periodo
            { 
                association: 'grupo', 
                attributes: ['id_grupo', 'nombre', 'cupo_maximo', 'costo_inscripcion', 'costo_unitario_clase'],
                include: [
                    { association: 'periodo', attributes: ['id_periodo', 'nombre', 'fecha_inicio', 'fecha_fin'] },
                    { association: 'estado_grupo', attributes: ['id_estado_grupo', 'nombre', 'permite_inscripcion'] },

                     // Traer datos del Docente y la Entidad
                    { 
                        association: 'docente', 
                        attributes: ['id_docente'],
                        include: [
                            { 
                                association: 'entidad', 
                                attributes: ['nombre', 'apellido', 'numero_identificacion'],
                                include: [
                                    { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                                    // Prefijo está asociado a la Entidad
                                ]
                            }
                        ]
                    },
                    
                ]
            }
        ];

        // 3. Fusionar los includes fijos con los includes de filtro generados dinámicamente
        // NOTA: Se asume que no habrá conflicto de aliases con los includes fijos.
        const finalIncludes = [...fixedIncludes, ...includeClauses];
                
        // --- 4. Ejecutar la Consulta ---
            
        const inscripciones = await Inscripcion_Model.findAll({
            where: whereClauseInscripcion, 
            include: finalIncludes,
            order: [
                ['updatedAt', 'DESC'] 
            ]
        });

        // --- 5. Se devuelven los resultados formateados ---
        return inscripciones.map(instancia => InscripcionService.formatearInscripcion(instancia));
    }



    // Obtiene el conteo por mes de Inscripciones, lo que es necesario para los gráficos
    async obtenerConteoPorMes(criteriosBusqueda = {}) {
     
        console.log("hecho 1")
        const concepto = criteriosBusqueda.concepto ?? null;

        console.log("hecho 2")
        // Validaciones y Columna de Fecha
        validarExistencia(concepto, "concepto", true);

        const conceptoLimpio = String(concepto).trim().toLowerCase();
        validarSoloTexto(concepto, "El concepto debe contener solo texto y espacios en blanco.");

        let columnaFecha = ""; // Columna de Inscripcion a usar (createdAt o updatedAt)

        switch (conceptoLimpio) {
            case "creados":
                columnaFecha = "createdAt";
                break;
            case "modificados":
                columnaFecha = "updatedAt";
                break;
            default:
                columnaFecha = "createdAt"; // Valor por defecto
        }
console.log("hecho 3")

        // Generación de las Cláusulas de Filtro (Reutilizando la lógica de Inscripcion)
        const { 
            whereClauseInscripcion, // where de la tabla principal (Inscripcion)
            includeClauses          // includes con required: true para los filtros anidados
        } = this.generarWhereClause(criteriosBusqueda);
        
        let whereMainConFecha = { ...whereClauseInscripcion }; // Copia las condiciones de la tabla principal
        
        // Aplicación del Filtro de 'Realmente Modificados' a la tabla principal
        if (conceptoLimpio === "modificados") {
            
            // La referencia ahora es Inscripcion.createdAt
            const whereModificado = { [Op.gt]: col('Inscripcion.createdAt') }; 
            
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


        // Ejecución de la Consulta de Agregación
        const resultadosAgregados = await Inscripcion_Model.findAll({

            // Aplicamos las condiciones de la tabla principal (con filtros de fecha incluidos)
            where: whereMainConFecha, 
            
            // Aplicamos los includes dinámicos (ya contienen los JOINs necesarios para Estudiante/Grupo)
            include: includeClauses, 
            
            attributes: [
                // A) Conteo: COUNT(id_inscripcion)
                [fn('COUNT', col('Inscripcion.id_inscripcion')), 'conteo'],
                
                // B) Etiqueta de Mes (usando la columna de fecha dinámica)
                [
                    fn(
                        'TO_CHAR', 
                        col(`Inscripcion.${columnaFecha}`), // Referenciamos la columna de fecha dinámica en el modelo Inscripcion
                        'Month YYYY' 
                    ), 
                    'mes'
                ],
                
                // C) Fecha de Orden (usando la columna de fecha dinámica)
                [fn('DATE_TRUNC', 'month', col(`Inscripcion.${columnaFecha}`)), 'fecha_orden'] 
            ],
            
            // Este bloque es la cláusula GROUP BY
            group: [
                // Agrupamos por la etiqueta de mes (TO_CHAR)
                fn('TO_CHAR', col(`Inscripcion.${columnaFecha}`), 'Month YYYY'),

                // Agregamos el campo de ordenamiento/agrupación (DATE_TRUNC)
                fn('DATE_TRUNC', 'month', col(`Inscripcion.${columnaFecha}`))
            ],
            
            // Ordenar por la fecha de orden
            order: [
                [fn('DATE_TRUNC', 'month', col(`Inscripcion.${columnaFecha}`)), 'ASC'] 
            ],
            
            raw: true 
        });

        // Formateo y retorno (Se mantiene igual)
        // Se asume que 'traducirMes' está disponible en el contexto
        return resultadosAgregados.map(item => ({
            mes: traducirMes(item.mes), 
            conteo: parseInt(item.conteo, 10)
        }));
    }


    // Obtiene la cantidad total de inscripciones según cada estado, aplicando los filtros de búsqueda
    async obtenerEstadosTotales(criteriosBusqueda = {}) {
            
        const { 
            whereClauseInscripcion, 
            includeClauses: filtrosAnidados
        } = this.generarWhereClause(criteriosBusqueda);
        
        // 1. Ejecución de la Consulta de Agregación
        const resultadosAgregados = await Inscripcion_Model.findAll({ 
                
            // Aplicamos los filtros de la tabla principal (fechas, id_estado)
            where: whereClauseInscripcion, 
            
            // Aplicamos los filtros anidados que contienen los JOINs necesarios 
            // para Estudiante y Grupo (con required: true)
            include: [
                ...filtrosAnidados, // Incluye Estudiante y Grupo si se aplican filtros
                { 
                    // Asociacion Objetivo: Se incluye para AGREGAR y AGRUPAR
                    association: 'estado_inscripcion', 
                    attributes: ['nombre'], // Necesitamos el nombre para la etiqueta de agrupación
                    // Se asume que cualquier filtro de 'estado' (id_estado) ya se aplicó a whereClauseInscripcion
                    required: true, // Siempre se requiere para agrupar
                },
            ],
            
            attributes: [
                // A) Conteo total de inscripciones
                [fn('COUNT', col('Inscripcion.id_inscripcion')), 'conteo']
            ],
            
            // 2. Agrupación: Agrupamos por el nombre del estado de la inscripción
            group: [
                // Referenciamos la columna 'nombre' a través de su alias de asociación
                col('estado_inscripcion.nombre') 
            ],
            
            // 3. Ordenamiento
            order: [
                [col('estado_inscripcion.nombre'), 'ASC'] 
            ],
            
            // Configuraciones necesarias para consultas de agregación con JOINs
            raw: true,
            subQuery: false,
            duplicating: false
        });

        // 4. Formatear y Devolver el resultado
        const conteoPorEstado = {}; 
        
        resultadosAgregados.forEach(item => {
            const nombreEstado = item['estado_inscripcion.nombre']; 
            const conteoNumerico = parseInt(item.conteo, 10);
            
            if (nombreEstado) {
                conteoPorEstado[nombreEstado] = conteoNumerico;
            }
        });

        // Ejemplo de retorno: { 'Aprobada': 50, 'Rechazada': 10, 'Pendiente': 30 }
        return conteoPorEstado;
    }
        

 


// -------------------------- Auxiliar ------------------------------------


    static formatearInscripcion(inscripcionInstance) {

        // Si no existe la instancia se devuelve null
        if (!inscripcionInstance) return null;

        const inscripcion = inscripcionInstance.toJSON(); 

        // Extraer datos del Grupo y sus anidaciones (Período, Curso, etc.)
        const grupo = inscripcion.grupo;
        
        // Extraer datos del Estudiante y la Entidad (Identificación, Nombre, Apellido)
        const estudiante = inscripcion.estudiante;
        const entidad = estudiante?.entidad;


        return {
            id: inscripcion.id_inscripcion, 
            
            // ----------------------- Estado de la Inscripción -----------------------
            estado: {
                id: inscripcion.estado_inscripcion?.id_estado_inscripcion ?? null,
                nombre: inscripcion.estado_inscripcion?.nombre ?? null,
                // Asumiendo que 'ciclo_cerrado' existe en el modelo Estado_Inscripcion
                ciclo_cerrado: inscripcion.estado_inscripcion?.ciclo_cerrado, 
            },

            // ----------------------- Datos del Estudiante (Entidad) -----------------------
            estudiante: {
                id_estudiante: estudiante?.id_estudiante ?? null,
                codigo_estudiantil: estudiante?.codigo_estudiantil ?? null,

                // Datos de la Entidad (Persona)
                entidad: {
                    nombre: capitalizeFirstLetter(entidad?.nombre ?? ""),
                    apellido: capitalizeFirstLetter(entidad?.apellido ?? ""),
                    numero_identificacion: entidad?.numero_identificacion ?? null,
              
                    prefijo: entidad?.prefijo?.letra_prefijo ?? null,        
                }
            },

            // ----------------------- Datos del Grupo -----------------------
            grupo: {
                id: grupo?.id_grupo ?? null, 
                nombre: capitalizeFirstLetter(grupo?.nombre ?? ""), 
                cupo_maximo: grupo?.cupo_maximo ?? null,
                costo_inscripcion: grupo?.costo_inscripcion ?? null,
                costo_clase: grupo?.costo_unitario_clase ?? null,

                // Estado del Grupo (si está incluido)
                estado: {
                    id: grupo?.estado_grupo?.id_estado_grupo ?? null,
                    nombre: grupo?.estado_grupo?.nombre ?? null,
                    permite_inscripcion: grupo?.estado_grupo?.permite_inscripcion == true ? "Si" : "No",
                },

                // Periodo
                periodo: {
                    id: grupo?.periodo?.id_periodo ?? null,
                    nombre: capitalizeFirstLetter(grupo?.periodo?.nombre ?? ""),
                    inicio: grupo?.periodo?.fecha_inicio ?? null,
                    fin: grupo?.periodo?.fecha_fin ?? null,
                },

                // Modalidad
                modalidad: {
                    id: grupo?.modalidad?.id_modalidad ?? null,
                    nombre: capitalizeFirstLetter(grupo?.modalidad?.nombre ?? ""),
                },
                
                // Curso
                curso: {
                    id: grupo?.curso?.id_curso ?? null,
                    nombre: capitalizeFirstLetter(grupo?.curso?.nombre ?? ""),

                    // Categoría del Curso
                    categoria: {
                        id: grupo?.curso?.categoria?.id_categoria_curso ?? null,
                        nombre: grupo?.curso?.categoria?.nombre ?? null,
                        
                        categoria_padre: {
                            id: grupo?.curso?.categoria?.categoria_padre?.id_categoria_curso ?? null,
                            nombre: grupo?.curso?.categoria?.categoria_padre?.nombre ?? null,
                        }
                    }
                },

                // Docente
                docente: {
                    id: grupo?.docente?.id_docente ?? null,
                    
                    entidad: {
                        nombre: capitalizeFirstLetter(grupo?.docente?.entidad?.nombre ?? ""),
                        apellido: capitalizeFirstLetter(grupo?.docente?.entidad?.apellido ?? ""),
                        numero_identificacion: grupo?.docente?.entidad?.numero_identificacion ?? null,
                        prefijo: grupo?.docente?.entidad?.prefijo?.letra_prefijo ?? null,
                    },

                    estado: {
                        id: grupo?.docente?.estado_docente?.id_estado_docente ?? null,
                        nombre: grupo?.docente?.estado_docente?.nombre ?? null
                    }
                }
                
            },

            // ----------------------- Fechas de la Inscripción -----------------------
            fechaCreacion: inscripcion.createdAt,
            fechaActualizacion: inscripcion.updatedAt 
        };
    }


    // Función Auxiliar que genera la "whereClause" sin ejecutar la consulta
    generarWhereClause(criteriosBusqueda = {}) {
    
        // Cláusulas WHERE para la tabla principal (Inscripcion)
        const whereClause = {}; 

        // Cláusulas WHERE para la tabla Estudiante
        const whereEstudiante = {};
        
        // Cláusulas WHERE para la tabla Entidad (donde están los datos del estudiante)
        const whereEntidad = {}; 
        
        // Cláusulas WHERE para la tabla Grupo
        const whereGrupo = {};

        // Obtener y limpiar los criterios de búsqueda relevantes
        const { 
            nombre, 
            apellido,
            prefijo, 
            numero_identificacion, 
            codigo_estudiantil,
            estado, 
            grupo, 
            periodo,
            creadosDesde,
            creadosHasta,
            modificadosDesde,
            modificadosHasta,
        } = criteriosBusqueda;

        let valorLimpio = null;

        // Se validan y parsean las fechas
        const fechaCreacionDesde = parseAndValidateDate(creadosDesde);
        const fechaCreacionHasta = parseAndValidateDate(creadosHasta);
        const fechamodificadosDesde = parseAndValidateDate(modificadosDesde);
        const fechamodificadosHasta = parseAndValidateDate(modificadosHasta);

        // Variables para las fechas
        let inicioDiaSiguiente = null;
        const milisegundosEnUnDia = 24 * 60 * 60 * 1000;



        // --- 1. Filtros Directos en la Inscripción (id_estado, id_grupo) ---

            // Filtro: Estado de la Inscripción (id_estado)
            if (validarExistencia(estado, "", false)) { 
                valorLimpio = String(estado).trim();
                validarIdNumerico(valorLimpio, "El estado de la inscripción debe ser un número.");
                whereClause.id_estado = valorLimpio;
            }


            // Filtro: Fechas de Creación (createdAt)
            if (fechaCreacionDesde || fechaCreacionHasta) {

                whereClause.createdAt = {}; 
                
                if (fechaCreacionDesde) {
                    whereClause.createdAt[Op.gte] = fechaCreacionDesde;
                }

                if (fechaCreacionHasta) {
                    // Calcular el inicio del día siguiente (para incluir todo el día 'Hasta')
                    inicioDiaSiguiente = new Date(fechaCreacionHasta);
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    // Usamos Op.lt (Menor que) el inicio del día siguiente
                    whereClause.createdAt[Op.lt] = inicioDiaSiguiente;
                }
            }

            // Filtro: Fechas de Modificación (updatedAt)
            if (fechamodificadosDesde || fechamodificadosHasta) {

                whereClause.updatedAt = {}; 
                
                if (fechamodificadosDesde) {
                    whereClause.updatedAt[Op.gte] = fechamodificadosDesde;
                }

                if (fechamodificadosHasta) {
                    // Calcular el inicio del día siguiente (para incluir todo el día 'Hasta')
                    inicioDiaSiguiente = new Date(fechamodificadosHasta);
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    // Usamos Op.lt (Menor que) el inicio del día siguiente
                    whereClause.updatedAt[Op.lt] = inicioDiaSiguiente;
                }
            }


        // --- 2. Filtros Anidados en Estudiante ---

            // Filtro: Código Estudiantil (Campo directo en el modelo Estudiante)
            if (validarExistencia(codigo_estudiantil, "", false)) {
                valorLimpio = String(codigo_estudiantil).trim();
                if (valorLimpio) {
                    validarSoloNumeros(valorLimpio, "El código estudiantil debe contener solo números.");
                    
                    // Aplicar el filtro al nuevo objeto whereEstudiante
                    whereEstudiante.codigo_estudiantil = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }

        // --- 3. Filtros Anidados en Entidad (a través de la Entidad/Estudiante) ---

            // Filtro: Nombre del Estudiante
            if (validarExistencia(nombre, "", false)) {
                valorLimpio = String(nombre).trim();
                if (valorLimpio) {
                    validarSoloTexto(valorLimpio, "El nombre debe contener solo texto o espacios.");
                    whereEntidad.nombre = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }

            // Filtro: Apellido del Estudiante
            if (validarExistencia(apellido, "", false)) {
                valorLimpio = String(apellido).trim();
                if (valorLimpio) {
                    validarSoloTexto(valorLimpio, "El apellido debe contener solo texto o espacios.");
                    whereEntidad.apellido = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }

            // Filtro: Prefijo de Identificación del Estudiante (id_prefijo)
            if (validarExistencia(prefijo, "", false)) { 
                valorLimpio = String(prefijo).trim();
                validarIdNumerico(valorLimpio, "El prefijo debe contener solo números.");
                whereEntidad.id_prefijo = valorLimpio;
            }

            // Filtro: Número de Identificación del Estudiante
            if (validarExistencia(numero_identificacion, "", false)) {
                valorLimpio = String(numero_identificacion).trim();
                if (valorLimpio) {
                    validarSoloNumeros(valorLimpio, "El número de identificación debe contener solo números.");
                    whereEntidad.numero_identificacion = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }
    


        // --- 4. Filtros Anidados en Grupo (si se requiere filtrar por Periodo) ---
        
            // Filtro: Nombre del Grupo (NUEVA LÓGICA)
            if (validarExistencia(grupo, "", false)) { 
                valorLimpio = String(grupo).trim();
                if (valorLimpio) {
                    validarLongitudCadena(valorLimpio, 0, 50, "El nombre del grupo debe tener como máximo 50 caracteres.");
                    // Añadimos el filtro por nombre del grupo a whereGrupo
                    whereGrupo.nombre = { [Op.iLike]: `%${valorLimpio}%` }; 
                }
            }
            
            // Filtro: Periodo (id_periodo)
            if (validarExistencia(periodo, "", false)) {
                valorLimpio = String(periodo).trim();
                validarIdNumerico(valorLimpio, "El periodo debe ser un número.");
                // Si ya tiene el filtro de nombre, se combina. Si no, se crea la propiedad.
                whereGrupo.id_periodo = valorLimpio; 
            }
    
    
    // --- 5. Ensamblar el objeto de retorno ---
    
    
        const includeClauses = [];
    
        const requiereEstudianteInclude = Object.keys(whereEstudiante).length > 0 || Object.keys(whereEntidad).length > 0;
        
        
        if (requiereEstudianteInclude) {
            
            const estudianteInclude = {
                association: 'estudiante', 
                required: true, 
                attributes: [], 
                where: Object.keys(whereEstudiante).length > 0 ? whereEstudiante : null, 
                include: [] 
            };

            if (Object.keys(whereEntidad).length > 0) {
                estudianteInclude.include.push({
                    association: 'entidad', 
                    required: true, 
                    attributes: [], 
                    where: whereEntidad,
                });
            } 
            
            includeClauses.push(estudianteInclude);
        }


        // Incluir JOIN del Grupo (se usó Periodo O Nombre del Grupo)
        if (Object.keys(whereGrupo).length > 0) {
            includeClauses.push({
                association: 'grupo', 
                required: true, 
                attributes: [],
                where: whereGrupo,
            });
        }

        return {
            whereClauseInscripcion: whereClause,
            includeClauses: includeClauses
        };
    }



}

module.exports = InscripcionService;