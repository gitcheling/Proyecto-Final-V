const Obligacion_Financiera_Model = require('../Models/obligacion_financiera'); 
const Obligacion_Inscripcion_Model = require('../Models/obligacion_inscripcion'); 
const Estado_Obligacion_Model = require('../Models/estado_obligacion'); 
const Concepto_Financiero_Model = require('../Models/concepto_financiero');
const Tipo_Comprobante_Model = require('../Models/tipo_comprobante'); 
const Divisa_Model = require('../Models/divisa');   
const Entidad_Model = require('../Models/entidad');
const Asiento_Encabezado_Model = require('../Models/asiento_encabezado');
const Asiento_Detalle_Model = require('../Models/asiento_detalle');    

// Importar la instancia de conexión
const sequelize = require('../Config/database');

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, validarLongitudCadena, validarSoloNumerosEnterosYDecimales, validarBooleano, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter, traducirMes} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op, fn, col } = require('sequelize'); 

class ObligacionFinancieraService {

// -------------------------- Creación ------------------------------------

    // Se crea una oblgación financiera
    async crearObligacionFinanciera({entidad, concepto, tipo_comprobante, numero_documento, descripcion, fecha_emision, fecha_vencimiento, monto_original, divisa}) {

        console.log("fecha de emision al entrar: ", fecha_emision)
        console.log("fecha de vencimiento al entrar: ", fecha_vencimiento)

        // ----------------------- Validaciones de existencia ----------------------------

            validarExistencia(entidad, "entidad", true);
            validarExistencia(concepto, "concepto", true);
            validarExistencia(tipo_comprobante, "tipo_comprobante", true);
            validarExistencia(numero_documento, "numero_documento", true);
            validarExistencia(descripcion, "descripcion", true);
            validarExistencia(fecha_emision, "fecha_emision", true);
            validarExistencia(fecha_vencimiento, "fecha_vencimiento", true);
            validarExistencia(monto_original, "monto_original", true);
            validarExistencia(divisa, "divisa", true);

        // ----------------------- Validaciones de formato ----------------------------

            const entidadLimpia = String(entidad).trim();   
            validarIdNumerico(entidadLimpia, "La entidad no tiene el formato correcto");

            const conceptoLimpio = String(concepto).trim();   
            validarIdNumerico(conceptoLimpio, "El concepto no tiene el formato correcto");

            const tipoComprobanteLimpio = String(tipo_comprobante).trim();   
            validarIdNumerico(tipoComprobanteLimpio, "El tipo de comprobante no tiene el formato correcto");

            const numeroDocumentoLimpio = String(numero_documento).trim().toLowerCase();  
            validarLongitudCadena(numeroDocumentoLimpio, 10, 30, "El número del documento no cumple con la longitud válida (de 10 a 30 caracteres).");
       
            const descripcionLimpia = String(descripcion).trim().toLowerCase();  
            validarLongitudCadena(descripcionLimpia, 5, 255, "La descripción no cumple con la longitud válida (de 5 a 255 caracteres).");
       
            const fechaEmisionLimpia = parseAndValidateDate(fecha_emision);
        
            const fechaVencimientoLimpia = parseAndValidateDate(fecha_vencimiento);
            if(fechaVencimientoLimpia < fechaEmisionLimpia){throw new Error(`La fecha de vencimiento debe ser posterior a la fecha de emisión.`);}

            const montoOriginalLimpio = String(monto_original).trim(); 
            validarSoloNumerosEnterosYDecimales(montoOriginalLimpio, "El monto no tiene el formato correcto");
            const montoOriginalNumerico = parseFloat(montoOriginalLimpio);
            if(!(montoOriginalNumerico > 0)){throw new Error(`El monto debe ser mayor a 0.`);}

            const divisaLimpia = String(divisa).trim();   
            validarIdNumerico(divisaLimpia, "La divisa no tiene el formato correcto");

        
        // ----------------------- Validaciones de existencia en la base de datos ----------------------------

            // Se valida que exista la entidad
            const entidadObjeto = await Entidad_Model.findByPk(entidadLimpia);
            if(!entidadObjeto){throw new Error(`La entidad especificada no existe.`);}

            // Se valida que exista el concepto
            const conceptoFinancieroObjeto = await Concepto_Financiero_Model.findByPk(conceptoLimpio, {
                include: [{ 
                    association: 'cuenta', // Alias para "Plan_Cuenta" en "Concepto_Financiero"
                    attributes: ['id_plan_cuenta', 'id_naturaleza'] 
                }] 
            });
            if(!conceptoFinancieroObjeto){throw new Error(`El concepto financiero especificado no existe.`);}
        
        
            // Se valida que exista el tipo de comprobante
            const tipoComprobanteObjeto = await Tipo_Comprobante_Model.findByPk(tipoComprobanteLimpio);
            if(!tipoComprobanteObjeto){throw new Error(`El tipo de comprobante especificado no existe.`);}

            // Se valida que exista la divisa
            const divisaObjeto = await Divisa_Model.findByPk(divisaLimpia);
            if(!divisaObjeto){throw new Error(`La divisa especificada no existe.`);}

            // Se valida que no exista ya el número de documento
            const conteoDocumentos = await Obligacion_Financiera_Model.count({where: {
                                                                numero_documento: numeroDocumentoLimpio,
                                                            },});
            if(conteoDocumentos > 0){throw new Error(`El número de documento ya existe en el sistema.`);}



        // ----------------------- Validaciones de si se permite o no crear la inscripción con esos datos ----------------------------

            // Se comprueba si el padre del concepto financiero es null (es decir, que no tenga padre)
            if(!conceptoFinancieroObjeto.id_concepto_padre){throw new Error(`Debe seleccionar un subconcepto financiero.`);}
            if(!conceptoFinancieroObjeto.cuenta){throw new Error(`El concepto financiero no tiene una cuenta contable asociada.`);}
            
           

        // ----------------------- Creación ----------------------------

            // Obtenemos la fecha de hoy y la limpiamos a medianoche (YYYY-MM-DD 00:00:00).
            const HOY = new Date();
            HOY.setHours(0, 0, 0, 0); 
            
            let estadoInicialId;

            // 2. Comparación: 
            // Como ambos, fechaVencimientoLimpia y HOY, son objetos Date a medianoche, la comparación es exacta.
            // Si la fecha de vencimiento es ANTERIOR al inicio de hoy, la obligación ya está vencida.
            if (fechaVencimientoLimpia < HOY) {
                estadoInicialId = 3; // ID para "Vencida"
            } else {
                estadoInicialId = 1; // ID para "Emitida"
            }


            // Se deben guardar como string o suceden cosas raras como poner fechas reducidas un mes y quien sabe que
            const fechaEmisionString = fechaEmisionLimpia.toISOString().slice(0, 10);
            const fechaVencimientoString = fechaVencimientoLimpia.toISOString().slice(0, 10);

            // INICIAR LA TRANSACCIÓN
            const t = await sequelize.transaction();

            try {


                // Se manda a crear la obligación financiera
                const DataObligacion = {
                    id_entidad: entidadObjeto.id_entidad,
                    id_concepto: conceptoFinancieroObjeto.id_concepto,             
                    id_tipo_comprobante: tipoComprobanteObjeto.id_comprobante,              
                    numero_documento: numeroDocumentoLimpio,
                    descripcion: descripcionLimpia,
                    fecha_emision: fechaEmisionString,
                    fecha_vencimiento: fechaVencimientoString,
                    monto_original: montoOriginalNumerico,
                    id_divisa: divisaObjeto.id_divisa,
                    id_estado: estadoInicialId
                };
                const nuevaObligacion = await Obligacion_Financiera_Model.create(DataObligacion, { transaction: t });


                const DataAsientoEncabezado = {
                    id_tipo_comprobante: tipoComprobanteObjeto.id_comprobante,
                    id_obligacion_origen: nuevaObligacion.id_obligacion,
                    id_transaccion_origen: null,

                    numero_comprobante: numeroDocumentoLimpio,          
                    fecha_transaccion: nuevaObligacion.createdAt,
                    descripcion: descripcionLimpia,
                    total_debito: montoOriginalNumerico,
                    total_credito: montoOriginalNumerico,

                };

                const nuevoAsientoEncabezado = await Asiento_Encabezado_Model.create(DataAsientoEncabezado, { transaction: t });

                

                let cuenta_afectada = null;
                let naturaleza_movimiento = null;
                if(conceptoFinancieroObjeto.es_por_cobrar){
                    cuenta_afectada = 21; // Cuentas por cobrar
                    naturaleza_movimiento = 1; // Naturaleza deudora, la cuenta crece por la izquierda
                }else{
                    cuenta_afectada = 22; // Cuentas por pagar
                    naturaleza_movimiento = 2; // Naturaleza acreedora, la cuenta crece por la derecha
                }

                const DataPrimerAsientoDetalle = {
                    id_asiento: nuevoAsientoEncabezado.id_asiento,
                    id_plan_cuenta: cuenta_afectada, // La cuenta afectada recien calculada
                    monto: montoOriginalNumerico,
                    naturaleza_movimiento: naturaleza_movimiento,
                    descripcion: descripcionLimpia,
                };


                // Determinar la Naturaleza Final para la Cuenta de Ingreso/Gasto (Concepto)
                const esObligacionNegativa = conceptoFinancieroObjeto.es_obligacion_negativa;
                const naturalezaBaseConcepto = conceptoFinancieroObjeto.cuenta.id_naturaleza;

                let naturalezaFinalConcepto = naturalezaBaseConcepto;

                // Si la obligación es negativa (Ej: un descuento), se INVIERTE la naturaleza contable de la cuenta base.
                // 1 <-> 2 (para que pase de deudora a acreedora o viceversa)
                if (esObligacionNegativa) {
                    // Si la cuenta es DEUDORA (1), ahora debe ir en el CRÉDITO (2).
                    // Si la cuenta es ACREEDORA (2), ahora debe ir en el DÉBITO (1).
                    naturalezaFinalConcepto = (naturalezaBaseConcepto === 1) ? 2 : 1; 
                }

                // --------------------------------------------------------------------------
                // Verificar la partida doble (El débito total debe ser igual al crédito total)
                // La naturaleza de la Cuenta Puente DEBE ser la opuesta a la Cuenta Concepto
                // --------------------------------------------------------------------------
                if (naturaleza_movimiento === naturalezaFinalConcepto) {
                    // Esto sucede si la naturaleza de la cuenta puente es igual a la naturaleza final del concepto.
                    // Ej: Cta por Cobrar (Débito) y Gasto (Débito) -> No balancea.
                    // Ej: Cta por Pagar (Crédito) e Ingreso (Crédito) -> No balancea.
                    throw new Error(`Error de configuración contable: El asiento no balancea. Ambas cuentas son ${naturaleza_puente === 1 ? 'Débito' : 'Crédito'}.`);
                }
                      
                const DataSegundoAsientoDetalle = {
                    id_asiento: nuevoAsientoEncabezado.id_asiento,
                    id_plan_cuenta: conceptoFinancieroObjeto.id_cuenta_afectada, // La cuenta afectada registrada en los conceptos
                    monto: montoOriginalNumerico,
                    naturaleza_movimiento: naturalezaFinalConcepto,
                    descripcion: descripcionLimpia,
                };

                await Asiento_Detalle_Model.create(DataPrimerAsientoDetalle, { transaction: t });
                await Asiento_Detalle_Model.create(DataSegundoAsientoDetalle, { transaction: t });


                // COMMIT: Si todo lo anterior se ejecuta sin errores, se guardan los cambios.
                await t.commit();


                return true;

            } catch (error) {

                // ROLLBACK: Si ocurre CUALQUIER error (incluyendo el SequelizeUniqueConstraintError) se deshacen todos los cambios.
                await t.rollback();
        
                // Manejar el error de unicidad garantizado por el modelo.
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new Error(`La obligación ya está registrado en el sistema.`);
                }

                // Re-lanzar cualquier otro error (DB, conexión, etc.)
                throw error;
            }

    }



// -------------------------- Modificación ------------------------------------


    // Modificar obligación
    async actualizarObligacionFinanciera(id, fecha_vencimiento) {

        // ----------------------- Validaciones de existencia ----------------------------

            validarExistencia(id, "id", true);
            validarExistencia(fecha_vencimiento, "fecha_vencimiento", true);

        // ----------------------- Validaciones de formato ----------------------------

            const idLimpio = String(id).trim();   
            validarIdNumerico(idLimpio, "El id no tiene el formato correcto");

            const fechaVencimientoLimpia = parseAndValidateDate(fecha_vencimiento);
            const fechaVencimientoString = fechaVencimientoLimpia.toISOString().slice(0, 10); // Cadena 'YYYY-MM-DD' (ej: '2026-01-01')

            
        
        // ----------------------- Validaciones de existencia en la base de datos ----------------------------

            // Se valida que exista la obligación financiera
            const obligacionObjeto = await Obligacion_Financiera_Model.findByPk(idLimpio, {
                attributes: ['id_obligacion', 'fecha_emision', 'fecha_vencimiento', 'id_estado'], // Campos necesarios
                include: [
                    {
                        association: 'estado', // Usando el alias 'estado' definido en Obligacion_Financiera.associate
                        attributes: ['es_finalizado'], // Solo necesitamos este campo
                        required: true // Opcional, pero asegura el JOIN
                    }
                ]
            });
            if(!obligacionObjeto){throw new Error(`La obligación financiera especificada no existe.`);}

    
        // ----------------------- Validaciones de si se permite o no crear la inscripción con esos datos ----------------------------

            // Se comprueba si el padre del concepto financiero es null (es decir, que no tenga padre)
            if(obligacionObjeto.fecha_emision > fechaVencimientoString){
                throw new Error(`La fecha de vencimiento (${fechaVencimientoString}) debe ser posterior a la fecha de emisión (${obligacionObjeto.fecha_emision}).`);
            }

            // Se comprueba si la obligación está en estado que sea "es_finalizado: true" y si es asi se impide la modificación
            if (obligacionObjeto.estado && obligacionObjeto.estado.es_finalizado === true) {
                throw new Error(`No se puede modificar la obligación porque su estado actual (${obligacionObjeto.estado.nombre || 'finalizado'}) no permite modificaciones.`);
            }



        // ----------------------- Creación ----------------------------

            // INICIAR LA TRANSACCIÓN
            const t = await sequelize.transaction();

            try {

                await Obligacion_Financiera_Model.update(
                    { fecha_vencimiento: fechaVencimientoString }, 
                    { where: { id_obligacion: obligacionObjeto.id_obligacion },
                    transaction: t, }
                );

                // COMMIT: Si todo lo anterior se ejecuta sin errores, se guardan los cambios.
                await t.commit();


                return true;

            } catch (error) {

                // ROLLBACK: Si ocurre CUALQUIER error (incluyendo el SequelizeUniqueConstraintError) se deshacen todos los cambios.
                await t.rollback();
        
                // Re-lanzar cualquier otro error (DB, conexión, etc.)
                throw error;
            }

    }



// -------------------------- Obtención ------------------------------------

    async obtenerObligacionPorId(id) {

        // ----------------------- Validaciones ----------------------------

        validarExistencia(id, "id", true);

        const idLimpio = String(id).trim();
        validarIdNumerico(idLimpio, "El ID proporcionado no es un número entero válido o positivo.");

        // ----------------------- Búsqueda de la Obligación con sus relaciones ----------------------------

        const obligacion = await Obligacion_Financiera_Model.findByPk(idLimpio, {

            include: [ 
                // 1. Datos de la Entidad (Proveedor, Cliente, Estudiante, etc.)
                { 
                    association: 'entidad', // Alias: 'entidad' en Obligacion_Financiera
                    attributes: ['id_entidad', 'nombre', 'apellido', 'numero_identificacion', 'email'],
                    include: [
                        // Traer el prefijo de identificación de la entidad
                        { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                    ]
                },

                // 2. Datos del Concepto Financiero
                { 
                    association: 'concepto', // Alias: 'concepto' en Obligacion_Financiera
                    attributes: ['id_concepto', 'nombre', 'descripcion', 'es_por_cobrar', 'es_obligacion_negativa', 'id_cuenta_afectada'],
                    include: [
                        // Traer la cuenta afectada del concepto
                        { 
                            association: 'cuenta', // Alias: 'cuenta' en Concepto_Financiero
                            attributes: ['id_plan_cuenta', 'nombre']
                        },
                        // Traer el concepto padre (jerarquía)
                        { 
                            association: 'concepto_padre', // Alias: 'concepto_padre' en Concepto_Financiero
                            attributes: ['id_concepto', 'nombre']
                        }
                    ]
                },

                // 3. Datos del Tipo de Comprobante (Factura, Nota de Crédito, etc.)
                { 
                    association: 'tipo_comprobante', // Alias: 'tipo_comprobante' en Obligacion_Financiera
                    attributes: ['id_comprobante', 'nombre', 'es_legal']
                },

                // 4. Datos del Estado (Emitida, Pagada, Anulada, etc.)
                { 
                    association: 'estado', // Alias: 'estado' en Obligacion_Financiera
                    attributes: ['id_estado_obligacion', 'nombre', 'es_finalizado']
                },

                // 5. Datos de la Divisa
                { 
                    association: 'divisa', // Alias: 'divisa' en Obligacion_Financiera
                    attributes: ['id_divisa', 'nombre', 'codigo', 'simbolo']
                }

            ]
        });
        
        // Si no existe, puedes devolver null o lanzar un error
        if (!obligacion) {
            return null; 
        }

        return ObligacionFinancieraService.formatearObligacion(obligacion); 

    }
    

    async buscarObligaciones(criteriosBusqueda = {}) {
        
        // Generar las cláusulas WHERE y los includes anidados de filtro
        const { whereClauseObligacion, includeClauses } = this.generarWhereClauseObligacion(criteriosBusqueda);
        
        // 2. Definir Includes Fijos (para traer los datos siempre para el formateo)
        const fixedIncludes = [ 
            // Traer datos del Estado de la Obligación
            { 
                association: 'estado', 
                attributes: ['id_estado_obligacion', 'nombre', 'es_finalizado']
            },
            // Traer datos de la Divisa
            { 
                association: 'divisa', 
                attributes: ['id_divisa', 'nombre', 'codigo', 'simbolo']
            },
            // Traer datos de la Entidad (Proveedor/Cliente)
            { 
                association: 'entidad',
                attributes: ['id_entidad', 'nombre', 'apellido', 'numero_identificacion', 'email'],
                include: [
                    // Traer el prefijo de identificación de la entidad
                    { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                ]
            },
            // Traer datos del Concepto Financiero
            { 
                association: 'concepto',
                attributes: ['id_concepto', 'nombre', 'descripcion', 'es_por_cobrar', 'es_obligacion_negativa'],
                include: [
                    // Traer la cuenta afectada del concepto
                    { association: 'cuenta', attributes: ['id_plan_cuenta', 'nombre'] },
                    // Traer el concepto padre
                    { association: 'concepto_padre', attributes: ['id_concepto', 'nombre'] }
                ]
            },
            // Traer datos del Tipo de Comprobante
            { 
                association: 'tipo_comprobante',
                attributes: ['id_comprobante', 'nombre', 'es_legal']
            },
        ];

        // Fusionar los includes fijos con los includes de filtro generados dinámicamente
        const finalIncludes = [...fixedIncludes, ...includeClauses];
            
        // --- 4. Ejecutar la Consulta ---
            
        const obligaciones = await Obligacion_Financiera_Model.findAll({
            where: whereClauseObligacion, 
            include: finalIncludes,
            order: [
                ['updatedAt', 'DESC'] 
            ]
        });

        // --- 5. Se devuelven los resultados formateados ---
        // Usamos el servicio de Obligación (asumimos que está definido)
        return obligaciones.map(instancia => ObligacionFinancieraService.formatearObligacion(instancia));
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


    static formatearObligacion(obligacionInstance) {

        // Si no existe la instancia se devuelve null
        if (!obligacionInstance) return null;

        // Convertir a un objeto JSON simple, incluyendo todas las anidaciones cargadas
        const obligacion = obligacionInstance.toJSON(); 

        // Extraer datos principales para mayor claridad
        const entidad = obligacion.entidad;
        const concepto = obligacion.concepto;
        const estado = obligacion.estado;
        const divisa = obligacion.divisa;
        const tipoComprobante = obligacion.tipo_comprobante;

        // Parsear el monto_original
        const montoOriginal = parseFloat(obligacion.monto_original);


        return {
            id: obligacion.id_obligacion, 
            numero_documento: obligacion.numero_documento,
            descripcion: obligacion.descripcion,
            
            // ----------------------- Montos y Fechas -----------------------
            montos: {
                monto_original: montoOriginal,
                // NOTA: Se omite el saldo pendiente y el monto transado total según solicitud.
            },
            fechas: {
                emision: obligacion.fecha_emision,
                vencimiento: obligacion.fecha_vencimiento,
                creacion: obligacion.createdAt,
                actualizacion: obligacion.updatedAt 
            },

            // ----------------------- Estado de la Obligación -----------------------
            estado: {
                id: estado?.id_estado_obligacion ?? null,
                nombre: estado?.nombre ?? null,
                es_finalizado: estado?.es_finalizado ?? false, 
            },
            
            // ----------------------- Datos del Tipo de Comprobante -----------------------
            tipo_comprobante: {
                id: tipoComprobante?.id_comprobante ?? null,
                nombre: tipoComprobante?.nombre ?? null,
                es_legal: tipoComprobante?.es_legal ?? false
            },

            // ----------------------- Datos de la Divisa -----------------------
            divisa: {
                id: divisa?.id_divisa ?? null,
                nombre: divisa?.nombre ?? null,
                codigo: divisa?.codigo ?? null,
                simbolo: divisa?.simbolo ?? null
            },

            // ----------------------- Datos del Concepto Financiero -----------------------
            concepto: {
                id: concepto?.id_concepto ?? null,
                nombre: capitalizeFirstLetter(concepto?.nombre ?? ""),
                descripcion: concepto?.descripcion ?? null,
                es_por_cobrar: concepto?.es_por_cobrar ?? null,
                es_obligacion_negativa: concepto?.es_obligacion_negativa ?? false,
                
                // Cuenta Contable Afectada
                cuenta_afectada: {
                    id: concepto?.cuenta?.id_plan_cuenta ?? null,
                    nombre: concepto?.cuenta?.nombre ?? null,
                },

                // Concepto Padre
                concepto_padre: {
                    id: concepto?.concepto_padre?.id_concepto ?? null,
                    nombre: concepto?.concepto_padre?.nombre ?? null,
                }
            },

            // ----------------------- Datos de la Entidad (Proveedor/Cliente/Persona) -----------------------
            entidad: {
                id: entidad?.id_entidad ?? null,
                nombre: capitalizeFirstLetter(entidad?.nombre ?? ""),
                apellido: capitalizeFirstLetter(entidad?.apellido ?? ""),
                email: entidad?.email ?? null,
                
                identificacion: {
                    numero: entidad?.numero_identificacion ?? null,
                    prefijo: entidad?.prefijo?.letra_prefijo ?? null,
                }
            },
        };
    }


    // Función Auxiliar que genera la "whereClause" sin ejecutar la consulta
    generarWhereClauseObligacion(criteriosBusqueda = {}) {
        
        // Cláusulas WHERE para la tabla principal (Obligacion_Financiera)
        const whereClause = {}; 

        // Cláusulas WHERE para la tabla Entidad (Cliente/Proveedor)
        const whereEntidad = {}; 
        
        // Obtener y limpiar los criterios de búsqueda relevantes
        const { 
            nombre, 
            apellido,
            prefijo, 
            numero_identificacion, 
            estado,     
            divisa, 
            tipo_comprobante,
            montoDesde,
            montoHasta,    
            emisionDesde,
            emisionHasta,
            vencimientoDesde,
            vencimientoHasta,
            creadosDesde,
            creadosHasta,
            modificadosDesde,
            modificadosHasta,
        } = criteriosBusqueda;



        let valorLimpio = null;

        // Se validan y parsean las fechas (asumiendo que las funciones auxiliares están disponibles)
        const fechaEmisionDesde = parseAndValidateDate(emisionDesde);
        const fechaEmisionHasta = parseAndValidateDate(emisionHasta);
        const fechaVencimientoDesde = parseAndValidateDate(vencimientoDesde);
        const fechaVencimientoHasta = parseAndValidateDate(vencimientoHasta);

        const fechaCreacionDesde = parseAndValidateDate(creadosDesde);
        const fechaCreacionHasta = parseAndValidateDate(creadosHasta);
        const fechamodificadosDesde = parseAndValidateDate(modificadosDesde);
        const fechamodificadosHasta = parseAndValidateDate(modificadosHasta);

        // Variables para las fechas
        let inicioDiaSiguiente = null;
        const milisegundosEnUnDia = 24 * 60 * 60 * 1000;


        // --- 1. Filtros Directos en la Obligación (id_estado, id_divisa, fechas) ---

            // Filtro: Estado de la Obligación (id_estado)
            if (validarExistencia(estado, "", false)) { 
                valorLimpio = String(estado).trim();
                validarIdNumerico(valorLimpio, "El estado de la obligación debe ser un número.");
                whereClause.id_estado = valorLimpio;
            }

            // Filtro: Divisa (id_divisa)
            if (validarExistencia(divisa, "", false)) { 
                valorLimpio = String(divisa).trim();
                validarIdNumerico(valorLimpio, "La divisa debe ser un número.");
                whereClause.id_divisa = valorLimpio;
            }


            // Filtro: Tipo de Comprobante 
            if (validarExistencia(tipo_comprobante, "", false)) { 
                valorLimpio = String(tipo_comprobante).trim();
                validarIdNumerico(valorLimpio, "El tipo de comprobante debe ser un número.");
                whereClause.id_tipo_comprobante = valorLimpio;
            }


            // Filtro: Montos (monto_original)
            if (validarExistencia(montoDesde, "", false) || validarExistencia(montoHasta, "", false)) {
                whereClause.monto_original = {};
                
                if (validarExistencia(montoDesde, "", false)) {
                    valorLimpio = String(montoDesde).trim();
                    validarSoloNumeros(valorLimpio, "El monto mínimo debe contener solo números.");
                    whereClause.monto_original[Op.gte] = parseFloat(valorLimpio);
                }

                if (validarExistencia(montoHasta, "", false)) {
                    valorLimpio = String(montoHasta).trim();
                    validarSoloNumeros(valorLimpio, "El monto máximo debe contener solo números.");
                    whereClause.monto_original[Op.lte] = parseFloat(valorLimpio);
                }
            }

            // Filtro: Fechas de Emisión (fecha_emision)
            if (fechaEmisionDesde || fechaEmisionHasta) {
                whereClause.fecha_emision = {}; 
                
                if (fechaEmisionDesde) {
                    whereClause.fecha_emision[Op.gte] = fechaEmisionDesde.toISOString().slice(0, 10);
                }
                if (fechaEmisionHasta) {
                    // Para las fechas DATEONLY, usamos <= directamente con la cadena YYYY-MM-DD
                    whereClause.fecha_emision[Op.lte] = fechaEmisionHasta.toISOString().slice(0, 10);
                }
            }

            // Filtro: Fechas de Vencimiento (fecha_vencimiento)
            if (fechaVencimientoDesde || fechaVencimientoHasta) {
                whereClause.fecha_vencimiento = {}; 
                
                if (fechaVencimientoDesde) {
                    whereClause.fecha_vencimiento[Op.gte] = fechaVencimientoDesde.toISOString().slice(0, 10);
                }
                if (fechaVencimientoHasta) {
                    whereClause.fecha_vencimiento[Op.lte] = fechaVencimientoHasta.toISOString().slice(0, 10);
                }
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


        // --- 2. Filtros Anidados en Entidad (a través de la Obligación) ---

            // Filtro: Nombre de la Entidad
            if (validarExistencia(nombre, "", false)) {
                valorLimpio = String(nombre).trim();
                if (valorLimpio) {
                    validarSoloTexto(valorLimpio, "El nombre debe contener solo texto o espacios.");
                    whereEntidad.nombre = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }

            // Filtro: Apellido de la Entidad
            if (validarExistencia(apellido, "", false)) {
                valorLimpio = String(apellido).trim();
                if (valorLimpio) {
                    validarSoloTexto(valorLimpio, "El apellido debe contener solo texto o espacios.");
                    whereEntidad.apellido = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }

            // Filtro: Prefijo de Identificación de la Entidad (id_prefijo)
            // NOTA: Para filtrar por prefijo, necesitamos entrar a Entidad y luego a Prefijo.
            // Pero como Prefijo está anidado bajo Entidad, podemos filtrar la FK id_prefijo en la tabla Entidad.
            if (validarExistencia(prefijo, "", false)) { 
                valorLimpio = String(prefijo).trim();
                validarIdNumerico(valorLimpio, "El prefijo debe contener solo números.");
                whereEntidad.id_prefijo = valorLimpio;
            }

            // Filtro: Número de Identificación de la Entidad
            if (validarExistencia(numero_identificacion, "", false)) {
                valorLimpio = String(numero_identificacion).trim();
                if (valorLimpio) {
                    validarSoloNumeros(valorLimpio, "El número de identificación debe contener solo números.");
                    whereEntidad.numero_identificacion = { [Op.iLike]: `%${valorLimpio}%` };
                }
            }


        // --- 3. Ensamblar el objeto de retorno ---
        
        const includeClauses = [];
        
        const requiereEntidadInclude = Object.keys(whereEntidad).length > 0;
        
        
        if (requiereEntidadInclude) {
            
            // Incluir JOIN de Entidad (Entidad es directa de Obligacion_Financiera)
            const entidadInclude = {
                association: 'entidad', 
                required: true, 
                attributes: [], 
                where: whereEntidad,
                // Los filtros de prefijo (id_prefijo) se aplican directamente al whereEntidad.
            };
            
            includeClauses.push(entidadInclude);
        }


        return {
            whereClauseObligacion: whereClause,
            includeClauses: includeClauses
        };
    }



}

module.exports = ObligacionFinancieraService;