/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Periodo_Model = require('../Models/periodo'); 

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarInicioAntesDeFin, validarSoloTexto, validarSoloTextoPermisivo, validarSoloNumeros, validarLongitudCadena, validarEmail, validarSoloNumerosYGuion, validarTelefonoVenezolano, validarBooleano, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 

class PeriodoService {

// --------------------- Creación --------------------------
    // Se crea un nuevo periodo
    async crearPeriodo({nombre, inicio, fin}) {

        // Validamos que existan todos los datos
        validarExistencia(nombre, "nombre", true);
        validarExistencia(inicio, "fecha de inicio", true);
        validarExistencia(fin, "fecha de finalización", true);

        // Se valida el nombre
        const nombreLimpio = String(nombre).trim();
        if(nombreLimpio.length > 20){
            throw new Error("La longitud del nombre no puede exceder los 20 caracteres.");
        }


        // Se valida que ambas fechas sean futuras

        const fechaInicioLimpia = parseAndValidateDate(inicio);
        const fechaFinLimpia = parseAndValidateDate(fin);

        // APLICAR COMPENSACIÓN DE ZONA HORARIA (+1 día)
        // Esto es lo que revierte el desplazamiento de un día (que por falta de tiempo se hace así)
        if (fechaInicioLimpia) {
            fechaInicioLimpia.setDate(fechaInicioLimpia.getDate() + 1); // Ahora es 2025-12-08T19:00:00.000Z
        }
        if (fechaFinLimpia) {
            fechaFinLimpia.setDate(fechaFinLimpia.getDate() + 1);       // Ahora es 2026-03-08T19:00:00.000Z
        }


        // Se valida que la fecha de inicio sea anterior que la fecha de fin
        validarInicioAntesDeFin(fechaInicioLimpia, fechaFinLimpia);
        

        // Se cuentan cuantos periodos futuros existen ya (no se puede crear uno si ya existe uno futuro).
        const fechaActual = new Date();    
        const totalPeriodosFuturos = await Periodo_Model.count({
            where: {
                // Condición: fecha_inicio > fechaActual
                fecha_inicio: {
                    [Op.gt]: fechaActual 
                }
            }
        });
        if(totalPeriodosFuturos > 0){
            throw new Error(`No se puede crear un nuevo periodo cuando ya existe uno futuro.`);
        }


        // Se comprueba que el nuevo periodo comience después de la fecha de fin del último periodo registrado
        const ultimoPeriodo = await PeriodoService.obtenerUltimoPeriodo();
        if (ultimoPeriodo) {
            const fechaFinUltimo = ultimoPeriodo.fecha_fin;

            // Convertir ambas fechas a milisegundos para comparación numérica segura
            const inicioTimestamp = Date.parse(fechaInicioLimpia);
            const finUltimoTimestamp = Date.parse(fechaFinUltimo);

            // El nuevo periodo debe iniciar DESPUÉS de que el último termine.
            if (inicioTimestamp <= finUltimoTimestamp){
                throw new Error(`La fecha de inicio debe ser posterior a la fecha de finalización del último periodo registrado (${fechaFinUltimo}).`);
            }
        }

        // Se valida que el rango de la fecha de inicio y la fecha de fim  no se solape con algún otro periodo.
        await PeriodoService.validarNoSolapamiento({ 
            fecha_inicio: fechaInicioLimpia, 
            fecha_fin: fechaFinLimpia 
        });

        const Data = {
            nombre: nombreLimpio,
            fecha_inicio: fechaInicioLimpia,
            fecha_fin: fechaFinLimpia
        };

        
        const nuevoPeriodo = await Periodo_Model.create(Data);

        // Renombramos las propiedades a regresar (para que el cliente no vea los nombres de las columnas de la base de datos)
        return {
            id: nuevoPeriodo.id_periodo,
            nombre: nuevoPeriodo.nombre, 
            inicio: nuevoPeriodo.fecha_inicio,
            fin: nuevoPeriodo.fecha_fin,

            fechaCreacion: nuevoPeriodo.createdAt,
            fechaActualizacion: nuevoPeriodo.updatedAt
            
        };
    }



// --------------------- Modificación --------------------------

    // Se manda a actualizar un periodo
    /*Nota: Todos los campos (menos el id) se pueden modificar si no ha empezado el periodo, pero si ya ha empezado:

        -El nombre: se puede cambiar
        -La fecha de inicio: no se puede cambiar
        -la fecha de fin: se puede cambiar, siempre y cuando sea para alargar el periodo, y que no choque con la fecha de
        inicio de un futuro periodo.
    */
    async actualizarPeriodo(id, nombre, inicio, fin) {

        console.log("inicio: ", inicio)
        console.log("fin: ", fin)


        // Validamos que existan todos los datos
        validarExistencia(id, "id", true);
        validarExistencia(nombre, "nombre", true);
        validarExistencia(inicio, "fecha de inicio", true);
        validarExistencia(fin, "fecha de finalización", true);

        // Se valida el id
        const id_limpio = String(id).trim()
        validarIdNumerico(id_limpio, "El id es obligatorio");

        const periodoActual = await Periodo_Model.findByPk(id);
        if (!periodoActual) {
            throw new Error("El periodo a actualizar no existe.");
        }

        // Se valida el nombre
        const nombreLimpio = String(nombre).trim();
        if(nombreLimpio.length > 20){
            throw new Error("La longitud del nombre no puede exceder los 20 caracteres.");
        }

        // Obtenemos las fechas
        const fechaInicioLimpia = parseAndValidateDate(inicio);
        const fechaFinLimpia = parseAndValidateDate(fin);

        //  APLICAR COMPENSACIÓN DE ZONA HORARIA (+1 día)
        // Esto es lo que revierte el desplazamiento de un día (que por falta de tiempo se hace así)
        if (fechaInicioLimpia) {
            fechaInicioLimpia.setDate(fechaInicioLimpia.getDate() + 1); // Ahora es 2025-12-08T19:00:00.000Z
        }
        if (fechaFinLimpia) {
            fechaFinLimpia.setDate(fechaFinLimpia.getDate() + 1);       // Ahora es 2026-03-08T19:00:00.000Z
        }


        // Comprobamos si no ha empezado ya el periodo
        const hoy = new Date().toISOString().slice(0, 10); 
        const inicioPeriodoDB_string = new Date(periodoActual.fecha_inicio).toISOString().slice(0, 10);
        const haComenzado = inicioPeriodoDB_string <= hoy;
        const finPeriodoDB_string = new Date(periodoActual.fecha_fin).toISOString().slice(0, 10);

        // Comprobamos que el periodo a editar no haya sido finalizado
        if (finPeriodoDB_string < hoy) {
            throw new Error("No se puede editar un periodo que ya ha finalizado.");
        }
        
        const datosActualizar = { nombre: nombreLimpio };

       
    if (!haComenzado) {
        // A) PERIODO FUTURO: Se aplican las mismas reglas que si se estuviera creando.
 
        datosActualizar.fecha_inicio = fechaInicioLimpia;
        datosActualizar.fecha_fin = fechaFinLimpia;

        validarInicioAntesDeFin(fechaInicioLimpia, fechaFinLimpia);

        const ultimoPeriodo = await PeriodoService.obtenerUltimoPeriodo();

        if (ultimoPeriodo && ultimoPeriodo.id_periodo != id_limpio) {
            // Si el periodo que estamos editando es el último, no necesitamos comparar.
            // Si hay otro periodo más reciente (que no es este), debemos chequear.

            const fechaFinUltimo_Date = new Date(ultimoPeriodo.fecha_fin); // Asegura que es un objeto Date

            if (fechaInicioLimpia <= fechaFinUltimo_Date) {
                throw new Error(`La fecha de inicio debe ser posterior a la fecha de finalización del último periodo registrado (${fechaFinUltimo_Date.toISOString().slice(0, 10)}).`);
            }

        }
        

    } else {
        // B) PERIODO EN CURSO: Aplicamos restricciones.

        // Mantenemos la fecha de inicio original de la DB, ignorando el valor de 'inicio' que viene en el input.
        datosActualizar.fecha_inicio = periodoActual.fecha_inicio;

        // Normalizamos ambas fechas a la misma cadena YYYY-MM-DD para la comparación estricta
        const inicioDB_normalizado = new Date(periodoActual.fecha_inicio).toISOString().slice(0, 10);


        // Fecha de Fin: Solo se puede aumentar
        // Convertir ambas a timestamps para una comparación numérica segura
        const finActualTimestamp = new Date(periodoActual.fecha_fin).getTime();
        const finInputTimestamp = fechaFinLimpia.getTime(); 

        if (finInputTimestamp < finActualTimestamp) { 
            throw new Error("La fecha de finalización solo puede ser aumentada si el periodo ya ha comenzado.");
        }


        // Se permite actualizar si es igual o mayor
        datosActualizar.fecha_fin = fechaFinLimpia;
 
    }

        // No Solapamiento con cualquier otro periodo.
        await PeriodoService.validarNoSolapamiento({
            id_periodo: id_limpio, 
            fecha_inicio: datosActualizar.fecha_inicio,
            fecha_fin: datosActualizar.fecha_fin
        });

        // Ejecutar la actualización
        const [filasAfectadas] = await Periodo_Model.update(datosActualizar, {
            where: { id_periodo: id }
        });

        if (filasAfectadas === 0) {
            return null;
        }

        return true;
    }



// --------------------- Obtención --------------------------

    // Obtiene el periodo con la fecha de inicio más reciente
    static async obtenerUltimoPeriodo() {
        return Periodo_Model.findOne({
            order: [['fecha_inicio', 'DESC']],
            limit: 1
        });
    }

    /**
     * Busca y retorna el objeto Periodo cuya fecha_inicio <= HOY <= fecha_fin (es decir, en base a la fecha de hoy buscamos si existe
     * un periodo que esté en transcurso)
     * @returns {object|null} El objeto Periodo en curso o null si no hay ninguno.
     */
    static async obtenerPeriodoEnCurso() {
        // Nota: Si usas la convención de Sequelize para la fecha (ej: DATEONLY),
        // debes usar [Op.lte] y [Op.gte].

        const hoy = new Date().toISOString().slice(0, 10); // Cadena 'YYYY-MM-DD' para comparar con DATEONLY

        const periodoEnCurso = await Periodo_Model.findOne({
            where: {
                // fecha_inicio <= HOY
                fecha_inicio: {
                    [Op.lte]: hoy 
                },
                // fecha_fin >= HOY
                fecha_fin: {
                    [Op.gte]: hoy 
                }
            }
        });

        return periodoEnCurso;
    }


    // Se obtiene un solo periodo por el id
    async obtenerPeriodoPorId(id) {

        validarExistencia(id, "id", true);

        const idLimpio = String(id).trim();

        validarIdNumerico(idLimpio, "El ID proporcionado no es un número entero válido o positivo.");

        // Método de Sequelize para buscar una entidad por su Primary Key
        const periodo = await Periodo_Model.findByPk(idLimpio, {

            attributes: [// Atributos de la tabla principal (entidad)                
                'id_periodo', 'nombre', 'fecha_inicio', 'fecha_fin', 
                'createdAt', 'updatedAt'
            ]
        });
        
        return PeriodoService.formatearPeriodo(periodo);
       
    }


    // Permite buscar periodos basandose en filtros
    async buscarPeriodos(criteriosBusqueda = {}) {
        
        // Objeto que contendrá todas las condiciones de filtro combinadas con AND
        const whereClause = {};

        // 1. Obtener y limpiar los criterios de búsqueda (usando desestructuración)
        const { 
            nombre, 
            iniciadosDesde,
            iniciadosHasta,
            finalizadosDesde,
            finalizadosHasta,   
            creadosDesde,
            creadosHasta,
            modificadosDesde,
            modificadosHasta
        } = criteriosBusqueda;
      
        // Se validan y parsean las fechas
        const fechaIniciadoDesde = parseAndValidateDate(iniciadosDesde);
        const fechaIniciadoHasta = parseAndValidateDate(iniciadosHasta);
        const fechaFinalizadoDesde = parseAndValidateDate(finalizadosDesde);
        const fechaFinalizadoHasta = parseAndValidateDate(finalizadosHasta);
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


        // ---  Aplicar filtros solo si existen ---

            // Filtro 1: Nombre 
            if (validarExistencia(nombre, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(nombre).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    whereClause.nombre = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }

            // Filtro 2: Se verifica si el usuario ha proporcionado al menos una de las fechas de inicio
            if (fechaIniciadoDesde || fechaIniciadoHasta) {

                whereClause.fecha_inicio = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "fecha_inicio" >= 'fecha_inicio'
                */
                if (fechaIniciadoDesde) {
                    whereClause.fecha_inicio[Op.gte] = fechaIniciadoDesde;
                }

                if (fechaIniciadoHasta) {
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/


                    inicioDiaSiguiente = new Date(fechaIniciadoHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    whereClause.fecha_inicio[Op.lt] = inicioDiaSiguiente;
        
                }
            }


            // Filtro 3: Se verifica si el usuario ha proporcionado al menos una de las fechas de fin
            if (fechaFinalizadoDesde || fechaFinalizadoHasta) {

                whereClause.fecha_fin = {}; 
                
                /* [Op.gte]: Este es el operador "Greater Than or Equal" (Mayor o Igual que).

                Significado: Si el usuario proporciona una fecha "Desde", esta línea garantiza que solo se incluyan las cuentas cuya fecha de 
                creación sea igual o posterior a la hora y fecha proporcionadas.

                Traducción SQL: WHERE "fecha_fin" >= 'fecha_inicio'
                */
                if (fechaFinalizadoDesde) {
                    whereClause.fecha_fin[Op.gte] = fechaFinalizadoDesde;
                }

                if (fechaFinalizadoHasta) {
                    /* En éste caso, sólo interesa la fecha, no la hora, por lo que hacemos que de forma automática fuerce la hora a las 11:59pm,
                    con la finalidad de que abarque todo el día el filtro "hasta"

                    Nota: Si interesara la hora habría que comprobar si se envió y mandarlo asi al Op*/


                    inicioDiaSiguiente = new Date(fechaFinalizadoHasta);
                    
                    // Si la fecha inicial es 2025-11-09 00:00:00Z, esta línea la convierte a 2025-11-10 00:00:00Z
                    inicioDiaSiguiente.setTime(inicioDiaSiguiente.getTime() + milisegundosEnUnDia);
                    
                    whereClause.fecha_fin[Op.lt] = inicioDiaSiguiente;
        
                }
            }


            // Filtro 4: Se verifica si el usuario ha proporcionado al menos una de las fechas de creación
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


            // Filtro 5: Se verifica si el usuario ha proporcionado al menos una de las fechas de modificación
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
            
        const periodos = await Periodo_Model.findAll({
            // Aplicamos todas las condiciones construidas dinámicamente
            where: whereClause, 
            
            // Mantenemos el orden por fecha de actualización
            order: [
                ['updatedAt', 'DESC'] 
            ]
        });



        // --- Se devuelven los resultados formateados ---
        return periodos.map(instancia => PeriodoService.formatearPeriodo(instancia));
    }



// --------------------- Comprobación --------------------------

    // Verifica si el nuevo rango se solapa con cualquier otro periodo existente
    static async validarNoSolapamiento(nuevoPeriodo) {
        
        // Criterio de Solapamiento: (Inicio A (nuevo periodo) < Fin B (viejo periodo)) AND (Fin A (nuevo periodo)> Inicio B (viejo periodo))
        // En pocas palabras, se comprueba que el nuevo periodo inicie antes de que termine uno existente)
        const whereCondition = {
            [Op.and]: [
                { fecha_inicio: { [Op.lt]: nuevoPeriodo.fecha_fin } }, 
                { fecha_fin: { [Op.gt]: nuevoPeriodo.fecha_inicio } }
            ]
        };
        
        // Excluir el periodo si estamos en modo edición
        if (nuevoPeriodo.id_periodo) {
            whereCondition.id_periodo = { [Op.ne]: nuevoPeriodo.id_periodo };
        }

        const periodoSolapado = await Periodo_Model.findOne({
            where: whereCondition
        });

        if (periodoSolapado) {
            throw new Error(`Las fechas se solapan con el periodo existente: "${capitalizeFirstLetter(periodoSolapado.nombre)}".`);
        }
    }



// --------------------- Formateo --------------------------

    // Esta función complementa a las funciones "buscarPeriodos" y "obtenerPeriodoPorId", y sirve para formatear las claves que le llegará al usuario
    static formatearPeriodo(periodoInstance) {

        // Si no existe el periodo se devuelve null
        if (!periodoInstance) return null;

        const periodo = periodoInstance.toJSON(); 

        // --- Preparación de Fechas ---
        // Usamos new Date() para asegurar que la comparación sea con objetos Date/Timestamp válidos.
        const fechaInicio = new Date(periodo.fecha_inicio);
        const fechaFin = new Date(periodo.fecha_fin);
        const ahora = new Date();

        // --- Lógica para Determinar el Estado ---
        let estadoCalculado;

            // A) FINALIZADO: El período ya terminó.
            // Usamos el timestamp de la fecha de fin (es más seguro que comparar solo fechas si hay hora).
            if (fechaFin.getTime() < ahora.getTime()) {
                estadoCalculado = 'Finalizado';
            } 
            // B) EN CURSO: El período ha comenzado, pero aún no ha terminado.
            // La fecha de inicio es menor o igual al momento actual, Y la fecha de fin es mayor al momento actual.
            else if (fechaInicio.getTime() <= ahora.getTime() && fechaFin.getTime() >= ahora.getTime()) {
                estadoCalculado = 'En curso';
            }
            // C) FUTURO: El período aún no ha comenzado.
            else {
                estadoCalculado = 'Futuro';
            }

        return {
            id: periodo.id_periodo ?? null, 
            nombre: capitalizeFirstLetter(periodo.nombre ?? ''), 
            inicio: periodo.fecha_inicio ?? null,
            fin: periodo.fecha_fin ?? null,

            estado: estadoCalculado,
            
            fechaCreacion: periodo.createdAt ?? null,
            fechaActualizacion: periodo.updatedAt ?? null
        };
    }


}

module.exports = PeriodoService;

