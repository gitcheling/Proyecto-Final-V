const Obligacion_Financiera_Model = require('../Models/obligacion_financiera'); 
const Asiento_Encabezado_Model = require('../Models/asiento_encabezado');
const Asiento_Detalle_Model = require('../Models/asiento_detalle');    
const Entidad_Model = require('../Models/entidad');
const Concepto_Financiero_Model = require('../Models/concepto_financiero');
const Registro_Transaccion_Model = require('../Models/registro_transaccion');
const Cuenta_Bancaria_Model = require('../Models/cuenta_bancaria');
const Transaccion_Bancaria_Model = require('../Models/transaccion_bancaria');



// Importar la instancia de conexión
const sequelize = require('../Config/database');

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, validarLongitudCadena, validarSoloNumerosEnterosYDecimales, validarBooleano, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter, traducirMes} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op, fn, col } = require('sequelize'); 

class RegistroTransaccionService {

// -------------------------- Creación ------------------------------------

    async crearTransaccionFinanciera({ obligacion, entidad, tipo_movimiento, monto, divisa, metodo_pago, referencia, fecha_transaccion, cuenta_origen, cuenta_destino }) {
        
        // ----------------------- 1. Validaciones de Existencia y Formato ----------------------------

            validarExistencia(obligacion, "obligacion", true);
            validarExistencia(entidad, "entidad", true);
            validarExistencia(tipo_movimiento, "tipo de movimiento", true);
            validarExistencia(monto, "monto", true);
            validarExistencia(divisa, "divisa", true);
            validarExistencia(metodo_pago, "metodo de pago", true);
            validarExistencia(referencia, "referencia", true);
            validarExistencia(fecha_transaccion, "fecha de la transaccion", true);
        
            const obligacionLimpia = String(obligacion).trim();
            validarIdNumerico(obligacionLimpia, "La obligación no tiene el formato correcto");

            const entidadLimpia = String(entidad).trim();
            validarIdNumerico(entidadLimpia, "La entidad no tiene el formato correcto");

            const tipoMovimientoLimpio = String(tipo_movimiento).trim();
            validarIdNumerico(tipoMovimientoLimpio, "El tipo de movimiento no tiene el formato correcto");

            const divisaLimpia = String(divisa).trim();
            validarIdNumerico(divisaLimpia, "La divisa no tiene el formato correcto");

            const metodoPagoLimpio = String(metodo_pago).trim();
            validarIdNumerico(metodoPagoLimpio, "El método de pago no tiene el formato correcto");

            const montoNumerico = parseFloat(String(monto).trim());
            if (!(montoNumerico > 0)) { throw new Error("El monto de la transacción debe ser mayor a 0."); }

            const fechaTransaccionLimpia = parseAndValidateDate(fecha_transaccion).toISOString().slice(0, 10);

            let referenciaLimpia = null;
            if(validarExistencia(referencia, "", false)){
                referenciaLimpia = String(referencia).trim().toLowerCase();
                validarLongitudCadena(referenciaLimpia, 10, 100, "La referencia no tiene una longitud válida (de 10 a 100 caracteres)")
            }
            
        // ----------------------- 2. Obtener Obligación y Validar Estado ----------------------------
            
            const obligacionObjeto = await Obligacion_Financiera_Model.findByPk(obligacionLimpia, {
                include: [{ 
                    model: Concepto_Financiero_Model, 
                    as: 'concepto',
                    include: [{
                        association: 'cuenta'
                    }]
                }]
            })
            if (!obligacionObjeto) {
                throw new Error(`La obligación financiera con ID ${obligacionLimpia} no existe.`);
            }

            // ID 2: Pagada. ID 4: Anulada (asumiendo IDs)
            if (obligacionObjeto.id_estado === 2) {
                throw new Error("Esta obligación ya se encuentra en estado 'Pagada'.");
            }
            if (obligacionObjeto.id_estado === 4) { // Asumimos ID 4 para Anulada
                throw new Error("Esta obligación se encuentra 'Anulada'.");
            }
        

            // --- Mapeo de IDs de Método de Pago a IDs de Plan de Cuenta ----
            const MAPEO_CUENTAS_CAJA_BANCO = {
                1: 32, // Efectivo -> Caja 
                2: 33, // Transferencia Bancaria -> Banco 
                3: 33, // Tarjeta -> Banco 
                4: 33  // Cheque -> Banco 
            };

            // DEFINICIÓN DE VARIABLES CONTABLES REQUERIDAS EN LA SECCIÓN 5
            const esPorCobrar = obligacionObjeto.concepto.es_por_cobrar; 
            const idCuentaPuente = esPorCobrar ? 21 : 22; 
            const idCuentaCajaBanco = MAPEO_CUENTAS_CAJA_BANCO[metodoPagoLimpio]; 

            // Validar FKs restantes
            const entidadObjeto = await Entidad_Model.findByPk(entidadLimpia);
            if (!entidadObjeto) { throw new Error("La entidad que realiza la transacción no existe."); }

            if (String(obligacionObjeto.id_divisa) !== String(divisaLimpia)) {
                throw new Error("La divisa de la transacción debe coincidir con la divisa de la obligación.");
            }


        // -----------------------  Revisar si se necesitan cuentas bancarias ----------------------------


            // Define los IDs que requieren detalle de cuentas (Transferencia, Tarjeta, Cheque, etc.)
            const METODOS_REQUERIDOS_CUENTAS = ['2']; 
            
            const requiereCuentasBancarias = METODOS_REQUERIDOS_CUENTAS.includes(metodoPagoLimpio);

            // Variables limpias para las cuentas
            let idCuentaOrigenLimpia = null;
            let idCuentaDestinoLimpia = null;

            if (requiereCuentasBancarias) {
                // Validación de Existencia para Origen y Destino
                validarExistencia(cuenta_origen, "ID de Cuenta Origen", true);
                validarExistencia(cuenta_destino, "ID de Cuenta Destino", true);
                
                idCuentaOrigenLimpia = String(cuenta_origen).trim();
                validarIdNumerico(idCuentaOrigenLimpia, "El ID de Cuenta Origen no tiene el formato correcto");
                
                idCuentaDestinoLimpia = String(cuenta_destino).trim();
                validarIdNumerico(idCuentaDestinoLimpia, "El ID de Cuenta Destino no tiene el formato correcto");

                // Validar que las cuentas de origen y destino no sean la misma
                if (idCuentaOrigenLimpia === idCuentaDestinoLimpia) {
                    throw new Error("La cuenta de origen y la cuenta de destino deben ser diferentes para una transferencia.");
                }

                // Validar la existencia de las cuentas bancarias (Opcional, pero recomendado)
                const cuentaOrigenObjeto = await Cuenta_Bancaria_Model.findByPk(idCuentaOrigenLimpia);
                if (!cuentaOrigenObjeto) {
                    throw new Error(`La Cuenta de Origen con ID ${idCuentaOrigenLimpia} no existe.`);
                }
                const cuentaDestinoObjeto = await Cuenta_Bancaria_Model.findByPk(idCuentaDestinoLimpia);
                if (!cuentaDestinoObjeto) {
                    throw new Error(`La Cuenta de Destino con ID ${idCuentaDestinoLimpia} no existe.`);
                }
            }

        // ----------------------- 3. Calcular Saldo Pendiente ----------------------------

            // 1. Sumar el monto de todas las transacciones (pagos/cobros) registradas para esta obligación.
            const sumatoriaPagos = await Registro_Transaccion_Model.sum('monto_transaccion', {
                where: { 
                    id_obligacion: obligacionLimpia
                }
            });

            const montoAbonadoPrevio = sumatoriaPagos || 0;
            const saldoPendiente = parseFloat((obligacionObjeto.monto_original - montoAbonadoPrevio).toFixed(2));

            if (saldoPendiente <= 0.01) { 
                throw new Error("El saldo pendiente de esta obligación es cero o ya fue pagada.");
            }
    
        // ----------------------- 4. Aplicar la Restricción del Monto ----------------------------

            let montoRealAplicado = montoNumerico; // Asignamos el monto inicial
            let estadoFinalObligacion = obligacionObjeto.id_estado; // Mantiene el estado actual

            // A. RESTRICCIÓN: SI EL MONTO PROPUESTO EXCEDE EL SALDO, LANZAR ERROR.
            if (montoRealAplicado > saldoPendiente) {
                // Si el monto propuesto es mayor al saldo, el sistema debe rechazar la transacción.
                const diferencia = (montoRealAplicado - saldoPendiente).toFixed(2);
                throw new Error(`El monto propuesto de ${montoRealAplicado} excede el saldo pendiente de ${saldoPendiente} por ${diferencia}. No se permiten pagos en exceso.`);
            } 
            // En este punto, sabemos que montoRealAplicado es <= saldoPendiente.

            // B. DETERMINAR CAMBIO DE ESTADO
            if (saldoPendiente - montoRealAplicado <= 0.01) { 
                // Si con este abono el saldo restante es CERO (o muy cerca, por precisión de decimales)
                estadoFinalObligacion = 2; // Pasa a 'Pagada' (ID 2)
            } else {
                // El pago es parcial y el estado se mantiene (Emitida (1) o Vencida (3)).
                estadoFinalObligacion = obligacionObjeto.id_estado; 
            }
            // El monto aplicado es igual al monto propuesto, ya que no excedió el saldo.


        // ----------------------- 5. Ejecución Transaccional y Asientos ----------------------------
        
            const t = await sequelize.transaction();

            try {
            
                // A. Crear el Registro de Transacción
                const DataTransaccion = {
                    id_obligacion: obligacionLimpia, 
                    id_entidad_realiza: entidadLimpia,
                    id_tipo_movimiento: tipoMovimientoLimpio,
                    id_metodo_pago: metodoPagoLimpio,
                    id_divisa: divisaLimpia,
                    monto_transaccion: montoRealAplicado,
                    referencia_transaccion: referenciaLimpia || `Pago/Cobro a Obligación ID ${obligacionLimpia}`,
                    fecha_transaccion: fechaTransaccionLimpia,
                };
                const nuevoRegistroTransaccion = await Registro_Transaccion_Model.create(DataTransaccion, { transaction: t });


                // A.1. Crear el detalle en Transaccion_Bancaria si aplica
                if (requiereCuentasBancarias) {
                    const DataTransaccionBancaria = {
                        id_transaccion: nuevoRegistroTransaccion.id_transaccion, // La FK de la tabla padre
                        id_cuenta_origen: idCuentaOrigenLimpia, 
                        id_cuenta_destino: idCuentaDestinoLimpia, 
                    };
                    await Transaccion_Bancaria_Model.create(DataTransaccionBancaria, { transaction: t });
                }



                // B. Crear el Encabezado de Asiento
                const DataAsientoEncabezado = {
                    id_tipo_comprobante: obligacionObjeto.id_tipo_comprobante,
                    id_obligacion_origen: obligacionLimpia,
                    id_transaccion_origen: nuevoRegistroTransaccion.id_transaccion,
                    numero_comprobante: obligacionObjeto.numero_documento,
                    fecha_transaccion: fechaTransaccionLimpia,
                    descripcion: DataTransaccion.referencia_transaccion,
                    total_debito: montoRealAplicado,
                    total_credito: montoRealAplicado,
                };
                const nuevoAsientoEncabezado = await Asiento_Encabezado_Model.create(DataAsientoEncabezado, { transaction: t });
                
                // C. Crear los Detalles del Asiento Contable

                // C.1. Movimiento de la Cuenta Puente (Cuentas por Pagar/Cobrar)
                // Disminuye la obligación: Naturaleza opuesta a la cuenta puente (Débito 1 / Crédito 2)
                const naturalezaPuenteContraria = esPorCobrar ? 2 : 1; 

                const DataDetallePuente = {
                    id_asiento: nuevoAsientoEncabezado.id_asiento,
                    id_plan_cuenta: idCuentaPuente, // Ya definida en Sección 2
                    monto: montoRealAplicado,
                    naturaleza_movimiento: naturalezaPuenteContraria, 
                    descripcion: DataAsientoEncabezado.descripcion,
                };
                await Asiento_Detalle_Model.create(DataDetallePuente, { transaction: t });


                // C.2. Movimiento de la Cuenta de Caja/Banco (Medio de Pago)
                // Naturaleza Opuesta a la que disminuyó la cuenta puente (para balancear).
                const naturalezaCajaBanco = (naturalezaPuenteContraria === 1) ? 2 : 1; 
                
                const DataDetalleCajaBanco = {
                    id_asiento: nuevoAsientoEncabezado.id_asiento,
                    id_plan_cuenta: idCuentaCajaBanco, // Ya definida en Sección 2
                    monto: montoRealAplicado,
                    naturaleza_movimiento: naturalezaCajaBanco, 
                    descripcion: DataAsientoEncabezado.descripcion,
                };
                await Asiento_Detalle_Model.create(DataDetalleCajaBanco, { transaction: t });
                
                
                // D. Actualizar el estado de la Obligación
                if (estadoFinalObligacion === 2) {
                    await Obligacion_Financiera_Model.update(
                        { id_estado: 2 }, // ID 2: Pagada
                        { where: { id_obligacion: obligacionLimpia }, transaction: t }
                    );
                }

                // COMMIT
                await t.commit();
                
                return {
                    registro_transaccion: nuevoRegistroTransaccion.id_transaccion,
                    monto_aplicado: montoRealAplicado,
                    saldo_pendiente_despues: saldoPendiente - montoRealAplicado,
                    estado_obligacion_actualizado: estadoFinalObligacion === 2 ? 'Pagada' : 'Abonada' 
                };

            } catch (error) {

                await t.rollback();
                throw error;
            }
    }


// -------------------------- Modificación ------------------------------------



// -------------------------- Obtención ------------------------------------

    async obtenerTransaccionPorId(id) {
        
        // ----------------------- Validaciones ----------------------------

        validarExistencia(id, "idTransaccion", true);

        const idLimpio = String(id).trim();
        validarIdNumerico(idLimpio, "El ID de la transacción proporcionado no es un número entero válido o positivo.");

        // ----------------------- Búsqueda del Registro de Transacción con sus relaciones ----------------------------

        const registroTransaccion = await Registro_Transaccion_Model.findByPk(idLimpio, {

            include: [ 
               // 1. Obligación Financiera a la que está ligada la transacción
                { 
                    association: 'obligacion_financiera', // Alias en Registro_Transaccion
                    attributes: ['id_obligacion', 'numero_documento', 'monto_original', 'fecha_emision', 'fecha_vencimiento'],
                    include: [
                        // A. Estado, Divisa, Concepto (existente)
                        { association: 'estado', attributes: ['id_estado_obligacion', 'nombre', 'es_finalizado'] },
                        { association: 'divisa', attributes: ['id_divisa', 'nombre', 'codigo', 'simbolo'] },
                        { association: 'concepto', attributes: ['id_concepto', 'nombre', 'es_por_cobrar'] },
                        
                        // D. NUEVO: Entidad original de la deuda (Deudor/Acreedor)
                        { 
                            association: 'entidad', // Alias de la FK id_entidad_principal en Obligacion_Financiera
                            attributes: ['id_entidad', 'nombre', 'apellido', 'numero_identificacion', 'email'],
                            include: [
                                { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                            ]
                        }
                    ]
                },

                // 2. Entidad que realizó la Transacción (Podría ser diferente a la Entidad de la Obligación)
                { 
                    association: 'entidad', 
                    attributes: ['id_entidad', 'nombre', 'apellido', 'numero_identificacion', 'email'],
                    include: [
                        { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                    ]
                },

                // 3. Tipo de Movimiento
                { 
                    association: 'tipo_movimiento', 
                    attributes: ['id_tipo_movimiento', 'nombre']
                },

                // 4. Método de Pago (Efectivo, Transferencia, etc.)
                { 
                    association: 'metodo_pago', 
                    attributes: ['id_metodo_pago', 'nombre']
                },
                // 5. Detalle Bancario (Transaccion_Bancaria)
                { 
                    association: 'transaccion_bancaria', // Alias de hasOne en Registro_Transaccion
                    attributes: ['id_cuenta_origen', 'id_cuenta_destino'],
                    required: false, // LEFT JOIN (solo existe si es Transferencia/Tarjeta)
                    include: [
                        // A. Cuenta de Origen
                        { 
                            association: 'cuenta_origen', // Alias en Transaccion_Bancaria
                            attributes: ['id_cuenta_bancaria', 'numero_cuenta'],
                            include: [
                                { association: 'banco', attributes: ['id_banco', 'nombre'] },
                                { association: 'tipo_cuenta', attributes: ['id_tipo_cuenta', 'nombre'] },
                                { association: 'entidad', attributes: ['nombre', 'apellido'] } // Titular de la cuenta
                            ]
                        },
                        // B. Cuenta de Destino
                        { 
                            association: 'cuenta_destino', // Alias en Transaccion_Bancaria
                            attributes: ['id_cuenta_bancaria', 'numero_cuenta'],
                            include: [
                                { association: 'banco', attributes: ['id_banco', 'nombre'] },
                                { association: 'tipo_cuenta', attributes: ['id_tipo_cuenta', 'nombre'] },
                                { association: 'entidad', attributes: ['nombre', 'apellido'] } // Titular de la cuenta
                            ]
                        }
                    ]
                }
            ]
        });
        
        if (!registroTransaccion) {
            return null; 
        }

        // ----------------------- Retorno Formateado ----------------------------

        return RegistroTransaccionService.formatearTransaccion(registroTransaccion); 
    }
    

    async buscarTransacciones(criteriosBusqueda = {}) {
        
        // 1. Generar las cláusulas WHERE y los includes anidados de filtro
        const { whereClauseTransaccion, includeClauses } = this.generarWhereClauseTransaccion(criteriosBusqueda);
        
        // 2. Definir Includes Fijos (para traer los datos siempre para el formateo)
        const fixedIncludes = [ 
            // 2.1. Obligación (Origen de la Deuda)
            { 
                association: 'obligacion_financiera',
                attributes: ['id_obligacion', 'numero_documento', 'monto_original', 'descripcion'],
                include: [
                    { association: 'estado', attributes: ['id_estado_obligacion', 'nombre'] },
                    { association: 'divisa', attributes: ['id_divisa', 'nombre', 'codigo', 'simbolo'] },
                    // Entidad Deuda (Deudor/Acreedor principal)
                    { 
                        association: 'entidad', 
                        attributes: ['id_entidad', 'nombre', 'apellido', 'numero_identificacion'],
                        include: [{ association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] }]
                    },
                ]
            },
            // 2.2. Entidad Ejecutora (Quién pagó/cobró)
            { 
                association: 'entidad',
                attributes: ['id_entidad', 'nombre', 'apellido', 'numero_identificacion', 'email'],
                include: [
                    { association: 'prefijo', attributes: ['id_prefijo', 'letra_prefijo'] } 
                ]
            },
            // 2.3. Tipo de Movimiento
            { 
                association: 'tipo_movimiento', 
                attributes: ['id_tipo_movimiento', 'nombre']
            },
            // 2.4. Método de Pago
            { 
                association: 'metodo_pago', 
                attributes: ['id_metodo_pago', 'nombre']
            },
        ];

        // 3. Fusionar los includes fijos con los includes de filtro generados dinámicamente
        // NOTA: Es crucial que no dupliquemos includes que ya existen en fixedIncludes.
        // Usaremos includeClauses solo si el include correspondiente NO está ya en fixedIncludes
        
        const finalIncludes = [...fixedIncludes];

        // Añadir los includes de filtro solo si no están ya en fixedIncludes
        // (Esta lógica es compleja en JS puro, pero aquí asumimos que Sequelize gestionará la duplicación o que
        // los includes de filtro (que tienen 'required: true' y 'attributes: []') 
        // se fusionarán correctamente con los includes fijos, lo cual suele ser el caso).
        // Para simplificar, simplemente los fusionamos, priorizando la estructura que ya tenemos:
        
        // Si un include de filtro es requerido (INNER JOIN), Sequelize lo aplicará correctamente.
        // Si un include fijo no es requerido (LEFT JOIN), el filtro INNER JOIN (required: true) lo convertirá.
        // Por simplicidad y eficiencia, mantendremos la fusión simple, confiando en Sequelize.
        
        includeClauses.forEach(inc => {
            // Simple verificación para evitar includes que filtren y que ya están fijos sin filtrar
            const isFixed = finalIncludes.some(f => f.association === inc.association);
            if (!isFixed) {
                finalIncludes.push(inc);
            }
        });

            
        // --- 4. Ejecutar la Consulta ---
            
        const transacciones = await Registro_Transaccion_Model.findAll({
            where: whereClauseTransaccion, 
            include: finalIncludes,
            order: [
                ['createdAt', 'DESC'] // Ordenar por fecha de registro
            ]
        });

        // --- 5. Se devuelven los resultados formateados ---
        // Usamos el servicio de Transacción (asumimos que está definido)
        return transacciones.map(instancia => RegistroTransaccionService.formatearTransaccion(instancia));
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

    static formatearTransaccion(transaccionInstance) {

        if (!transaccionInstance) return null;

        const transaccion = transaccionInstance.toJSON(); 

        // Extraer las relaciones anidadas
        const obligacion = transaccion.obligacion_financiera;
        const entidadDeuda = obligacion?.entidad; 
        const entidadRealiza = transaccion.entidad;
        const tipoMovimiento = transaccion.tipo_movimiento;
        const metodoPago = transaccion.metodo_pago;

        // Detalle de Cuentas Bancarias
        const transaccionBancaria = transaccion.transaccion_bancaria;
        const cuentaOrigen = transaccionBancaria?.cuenta_origen;
        const cuentaDestino = transaccionBancaria?.cuenta_destino;

        // Función auxiliar para formatear la cuenta bancaria
        const formatCuenta = (cuenta) => {
            if (!cuenta) return null;
            return {
                id: cuenta.id_cuenta_bancaria,
                numero: cuenta.numero_cuenta,
                banco: cuenta.banco?.nombre ?? null,
                tipo: cuenta.tipo_cuenta?.nombre ?? null,
                titular: `${cuenta.entidad?.nombre ?? ''} ${cuenta.entidad?.apellido ?? ''}`.trim()
            };
        };
        
        // Convertir montos
        const montoTransaccion = parseFloat(transaccion.monto_transaccion);
        const montoOriginalObligacion = parseFloat(obligacion?.monto_original ?? 0);

        return {
            id_transaccion: transaccion.id_transaccion, 
            monto_aplicado: montoTransaccion,
            referencia_interna: transaccion.referencia_transaccion,
            

            // ----------------------- Detalle Bancario -----------------------
            detalle_bancario: {
                cuenta_origen: formatCuenta(cuentaOrigen),
                cuenta_destino: formatCuenta(cuentaDestino)
            },

            // ----------------------- Fechas y Registro -----------------------
            fechas: {
                transaccion: transaccion.fecha_transaccion,
                creacion_registro: transaccion.createdAt,
            },

            // ----------------------- Origen (Obligación Financiera) -----------------------
            obligacion_origen: {
                id: obligacion?.id_obligacion ?? null,
                numero_documento: obligacion?.numero_documento ?? null,
                monto_original: montoOriginalObligacion,
                fecha_emision: obligacion?.fecha_emision ?? null,
                fecha_vencimiento: obligacion?.fecha_vencimiento ?? null,
                
                // Entidad de la Deuda (Acreedor/Deudor principal)
                entidad_deuda: { // NUEVO CAMPO
                    id: entidadDeuda?.id_entidad ?? null,
                    nombre_completo: `${capitalizeFirstLetter(entidadDeuda?.nombre ?? "")} ${capitalizeFirstLetter(entidadDeuda?.apellido ?? "")}`.trim(),
                    identificacion: {
                        numero: entidadDeuda?.numero_identificacion ?? null,
                        prefijo: entidadDeuda?.prefijo?.letra_prefijo ?? null,
                    }
                },

                // Datos del Concepto, Divisa y Estado de la Obligación
                es_por_cobrar: obligacion?.concepto?.es_por_cobrar ?? null,
                divisa: {
                    id: obligacion?.divisa?.id_divisa ?? null,
                    codigo: obligacion?.divisa?.codigo ?? null,
                    simbolo: obligacion?.divisa?.simbolo ?? null
                },
                estado: {
                    id: obligacion?.estado?.id_estado_obligacion ?? null,
                    nombre: obligacion?.estado?.nombre ?? null,
                }
            },

            // ----------------------- Detalle del Movimiento -----------------------
            movimiento: {
                id_tipo_movimiento: tipoMovimiento?.id_tipo_movimiento ?? null,
                nombre_movimiento: tipoMovimiento?.nombre ?? null,
                
                metodo_pago: {
                    id: metodoPago?.id_metodo_pago ?? null,
                    nombre: metodoPago?.nombre ?? null,
                }
            },

            // ----------------------- Entidad Ejecutora (Quién hizo el pago/cobro) -----------------------
            entidad_ejecutora: {
                id: entidadRealiza?.id_entidad ?? null,
                nombre: capitalizeFirstLetter(entidadRealiza?.nombre ?? ""),
                apellido: capitalizeFirstLetter(entidadRealiza?.apellido ?? ""),
                email: entidadRealiza?.email ?? null,
                
                identificacion: {
                    numero: entidadRealiza?.numero_identificacion ?? null,
                    prefijo: entidadRealiza?.prefijo?.letra_prefijo ?? null,
                }
            },
        };
    }



    /**
     * Función Auxiliar que genera las cláusulas WHERE y los includes necesarios para filtrar Transacciones.
     * @param {object} criteriosBusqueda - Objeto con los criterios de filtro.
     * @returns {object} { whereClauseTransaccion, includeClauses }
     */
    generarWhereClauseTransaccion(criteriosBusqueda = {}) {
        
        // Cláusulas WHERE para la tabla principal (Registro_Transaccion)
        const whereClause = {}; 

        // Cláusulas WHERE para tablas anidadas
        const whereObligacion = {};
        const whereEntidadDeuda = {};
        const whereEntidadPago = {};
        
        // Obtener y limpiar los criterios de búsqueda relevantes
        const { 
            // Filtros en entidades y obligación
            entidad_deuda, 
            entidad_pago, 
            divisa,
            metodo_pago, 
            
            // Filtros en Transacción (monto y fechas)
            montoDesde,
            montoHasta, 
            creadosDesde,
            creadosHasta,
            modificadosDesde,
            modificadosHasta,
        } = criteriosBusqueda;

        let valorLimpio = null;

        // Se validan y parsean las fechas (manteniendo la lógica de inclusión del día 'Hasta')
        const fechaCreacionDesde = parseAndValidateDate(creadosDesde);
        const fechaCreacionHasta = parseAndValidateDate(creadosHasta);
        const fechamodificadosDesde = parseAndValidateDate(modificadosDesde);
        const fechamodificadosHasta = parseAndValidateDate(modificadosHasta);
        const milisegundosEnUnDia = 24 * 60 * 60 * 1000;
        let inicioDiaSiguiente = null;


        // --- 1. Filtros Directos en la Transacción (Registro_Transaccion) ---

        // Filtro: Método de Pago (id_metodo_pago)
        if (validarExistencia(metodo_pago, "", false)) { 
            valorLimpio = String(metodo_pago).trim();
            validarIdNumerico(valorLimpio, "El método de pago debe ser un número.");
            whereClause.id_metodo_pago = valorLimpio;
        }
        
        // Filtro: Montos (monto_transaccion)
        if (validarExistencia(montoDesde, "", false) || validarExistencia(montoHasta, "", false)) {
            whereClause.monto_transaccion = {};
            
            if (validarExistencia(montoDesde, "", false)) {
                valorLimpio = String(montoDesde).trim();
                validarSoloNumeros(valorLimpio, "El monto mínimo debe contener solo números.");
                whereClause.monto_transaccion[Op.gte] = parseFloat(valorLimpio);
            }

            if (validarExistencia(montoHasta, "", false)) {
                valorLimpio = String(montoHasta).trim();
                validarSoloNumeros(valorLimpio, "El monto máximo debe contener solo números.");
                whereClause.monto_transaccion[Op.lte] = parseFloat(valorLimpio);
            }
        }

        // Filtro: Fechas de Creación (createdAt)
        if (fechaCreacionDesde || fechaCreacionHasta) {
            whereClause.createdAt = {}; 
            
            if (fechaCreacionDesde) {
                whereClause.createdAt[Op.gte] = fechaCreacionDesde;
            }

            if (fechaCreacionHasta) {
                inicioDiaSiguiente = new Date(fechaCreacionHasta);
                inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
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
                inicioDiaSiguiente = new Date(fechamodificadosHasta);
                inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                whereClause.updatedAt[Op.lt] = inicioDiaSiguiente;
            }
        }

        // --- 2. Filtros Anidados (JOINs) ---
        
        // Filtro: Divisa (Necesita JOIN a Obligacion)
        if (validarExistencia(divisa, "", false)) { 
            valorLimpio = String(divisa).trim();
            validarIdNumerico(valorLimpio, "La divisa debe ser un número.");
            whereObligacion.id_divisa = valorLimpio;
        }

        // Filtro: Entidad Deuda (Necesita JOIN a Obligacion, y de Obligacion a Entidad)
        if (validarExistencia(entidad_deuda, "", false)) {
            valorLimpio = String(entidad_deuda).trim();
            validarLongitudCadena(valorLimpio, 0, 20, "El N° de identificación de la entidad de la deuda debe ser de hasta 20 caracteres máximo.");
            whereEntidadDeuda.numero_identificacion = { [Op.iLike]: `%${valorLimpio}%` };
        }

        // Filtro: Entidad Pago (Necesita JOIN a Entidad_Realiza_Transaccion)
        if (validarExistencia(entidad_pago, "", false)) {
            valorLimpio = String(entidad_pago).trim();
            validarLongitudCadena(valorLimpio, 0, 20, "El N° de identificación de la entidad del pago debe ser de hasta 20 caracteres máximo.");
            whereEntidadPago.numero_identificacion = { [Op.iLike]: `%${valorLimpio}%` };
        }


        // --- 3. Ensamblar los Includes de Filtro ---
        
        const includeClauses = [];
        
        const requiereFiltroEntidadPago = Object.keys(whereEntidadPago).length > 0;
        const requiereFiltroObligacion = Object.keys(whereObligacion).length > 0 || Object.keys(whereEntidadDeuda).length > 0;
        

        // Incluir JOIN de Entidad que realiza el Pago
        if (requiereFiltroEntidadPago) {
            const entidadPagoInclude = {
                association: 'entidad', // Alias en Registro_Transaccion
                required: true, // INNER JOIN para filtrar
                attributes: [], // No necesitamos sus atributos, solo el filtro
                where: whereEntidadPago,
            };
            includeClauses.push(entidadPagoInclude);
        }
        
        // Incluir JOIN de Obligación (y anidar la Entidad Deuda si es necesario)
        if (requiereFiltroObligacion) {
            
            const obligacionInclude = {
                association: 'obligacion_financiera', // Alias en Registro_Transaccion
                required: true, // INNER JOIN para filtrar
                attributes: [], 
                where: whereObligacion, // Filtro de Divisa va aquí

                // Si se requiere filtrar por la Entidad Deuda, la anidamos
                include: Object.keys(whereEntidadDeuda).length > 0 ? [
                    {
                        association: 'entidad', // Alias de la Entidad Deuda dentro de Obligacion_Financiera
                        required: true, // INNER JOIN para filtrar
                        attributes: [], 
                        where: whereEntidadDeuda, // Filtro de N° Identificación de la Deuda va aquí
                    }
                ] : []
            };
            
            includeClauses.push(obligacionInclude);
        }


        return {
            whereClauseTransaccion: whereClause,
            includeClauses: includeClauses
        };
    }




}

module.exports = RegistroTransaccionService;