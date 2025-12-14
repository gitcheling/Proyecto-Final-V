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
const { capitalizeFirstLetter, traducirMes} = require('../Utils/funciones');


// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op, fn, col } = require('sequelize'); 

class DocenteService {

// -------------------------- Creación ------------------------------------

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

// -------------------------- Modificación ------------------------------------

    async cambiarEstadoDocente(id, nuevoEstado) {

        console.log(String(nuevoEstado))
        if(!validarExistencia(id, "id", false)){
            return null;
        }

        validarExistencia(nuevoEstado, "nuevo estado", true);

        // Se valida el id
        const id_limpio = String(id).trim();
        validarIdNumerico(id_limpio, "El id no tiene el formato correcto");

        // Se valida el nuevo estado
        const estado_limpio = String(nuevoEstado).trim();
        validarIdNumerico(estado_limpio, "El nuevo estado no tiene el formato correcto");

        const estado_Numerico = parseInt(estado_limpio, 10);
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


// -------------------------- Obtención ------------------------------------

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
                        attributes: ['numero_identificacion', 'nombre', 'apellido', 'estado', 'email', "telefono"], // Estos son los campos que se traerán de la tabla asociada (tipo_entidad)
                    
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
                    },
                    { 
                        association: 'grupos', 
                        attributes: ['id_grupo', 'id_curso', 'id_periodo', 'id_modalidad', 'nombre'],
                        include: [
                            { 
                                association: 'curso', 
                                attributes: ['nombre'] 
                            },
                            { 
                                association: 'periodo', 
                                attributes: ['nombre'] 
                            },
                            {
                                association: 'modalidad',
                                attributes: ['nombre']
                            },
                            {
                                association: 'estado_grupo',
                                attributes: ['nombre']
                            }
                        ]
                    }
                ]
        });


        
        return DocenteService.formatearDocente(docente);
       
    }


    // Permite buscar docentes basandose en filtros
    async buscarDocentes(criteriosBusqueda = {}) {
        

        const {docenteWhere, entidadWhere} = this.generarWhereClause(criteriosBusqueda);


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
                    attributes: ['numero_identificacion', 'nombre', 'apellido', 'estado', 'telefono', 'email'] 
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


    // Obtiene el conteo por mes de docentes, lo que es necesario para los gráficos
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
                columna = "Docente.createdAt";
                break;
            case "modificados":
                columna = "Docente.updatedAt";
                break;
            default:
                columna = "Docente.createdAt";
        }
        
        const {docenteWhere, entidadWhere} = this.generarWhereClause(criteriosBusqueda);


        // Se agregar el filtro de "Realmente Modificados"
        if (conceptoLimpio === "modificados") {
        
            const whereModificado = { [Op.gt]: col('Docente.createdAt') }; 
            
            if (docenteWhere.updatedAt) {
                
                docenteWhere.updatedAt = {
                    [Op.and]: [
                        docenteWhere.updatedAt, 
                        whereModificado            
                    ]
                };
            } else {

                docenteWhere.updatedAt = whereModificado;
            }
        }

        
        // Definición de las expresiones SQL para Agregación
        const atributosDeAgregacion = [
            // A) Conteo: COUNT(Docente.id_estudiante)
            // Nota: EL nombre de la tabla debe coincidir con el del modelo
            [fn('COUNT', col('Docente.id_docente')), 'conteo'],
            
            // B) Etiqueta de Mes: TO_CHAR("createdAt", 'Month YYYY')
            [
                fn('TO_CHAR', col(columna), 'Month YYYY'), 
                'mes'
            ],
            
            // C) Ordenamiento Técnico: DATE_TRUNC('month', "createdAt")
            [fn('DATE_TRUNC', 'month', col(columna)), 'fecha_orden']
        ];


        // Ejecutar la Consulta de Agregación
        const resultadosAgregados = await Docente_Model.findAll({
            
            // Aplicamos los filtros directos de la tabla "Docente"
            where: docenteWhere, 
            
            attributes: atributosDeAgregacion,
            
            include: [
                { 
                    association: 'entidad', // JOIN con la tabla de Entidad
                    
                    // Aplicamos los filtros de ENTIDAD generados
                    where: entidadWhere, 
                    
                    // Si hay filtros en la Entidad, forzamos INNER JOIN (required: true).
                    required: Object.keys(entidadWhere).length > 0, 
                    
                    // No necesitamos seleccionar atributos de la entidad ni inclusiones anidadas aquí.
                    attributes: [] 
                }
            ],

            // Agrupar por las expresiones de fecha
            group: [
                fn('TO_CHAR', col(columna), 'Month YYYY'),
                fn('DATE_TRUNC', 'month', col(columna))
            ],
            
            // Ordenar por el valor numérico de la fecha truncada para orden cronológico
            order: [
                [fn('DATE_TRUNC', 'month', col(columna)), 'ASC'] 
            ],
            
            // Configuraciones necesarias para consultas con GROUP BY y JOIN:
            raw: true,
            subQuery: false,
            duplicating: false
        });

        return resultadosAgregados.map(item => ({
            mes: traducirMes(item.mes), 
            conteo: parseInt(item.conteo, 10)
        }));
    }

    

    // Obtiene la cantidad total de docentes según cada estado para los gráficos
    async obtenerEstadosTotales(criteriosBusqueda = {}) {
        
        const { docenteWhere, entidadWhere } = this.generarWhereClause(criteriosBusqueda);

    
        const resultadosAgregados = await Docente_Model.findAll({
    
            // Aplicamos los filtros directos de la tabla Estudiante
            where: docenteWhere, 
            
            // Atributos a seleccionar
            attributes: [
                // A) Conteo total de docentes por grupo (estado)
                [fn('COUNT', col('Docente.id_docente')), 'conteo']
                
            ],
            
            // Inclusión de las tablas necesarias (JOINs)
            include: [
                { 
                    // JOIN con la tabla de Entidad (para aplicar filtros de nombre, apellido, etc.)
                    association: 'entidad', 
                    where: entidadWhere, 
                    // Forzamos INNER JOIN si hay filtros de entidad para que el conteo solo incluya los que cumplen
                    required: Object.keys(entidadWhere).length > 0, 
                    attributes: [] // No necesitamos datos de Entidad en el resultado final
                },
                { 
                    // JOIN con la tabla Estado_Docente (para obtener el nombre del estado para la agrupación)
                    association: 'estado_docente', // Usa el alias definido en la asociación ('Estado_Docente')
                    attributes: ['nombre'] // Solo necesitamos el nombre del estado
                }
            ],

            // 3. Agrupación: Agrupamos por el nombre del estado académico
            group: [
                // Referenciamos la columna 'nombre' a través de su alias de asociación (es decir, "estado_")
                col('estado_docente.nombre') 
            ],
            
            // Ordenar por el nombre del estado académico
            order: [
                [col('estado_docente.nombre'), 'ASC'] 
            ],
            
            // Configuraciones necesarias para GROUP BY y JOIN:
            raw: true,
            subQuery: false,
            duplicating: false
        });

        // Formatear y Devolver el resultado
        // El resultado de la consulta será algo como: 
        // [{ conteo: '150', estado_entidad: true }, { conteo: '50', estado_entidad: false }]
        
        // Mapeamos el resultado a un objeto simple para el gráfico:
        const estadosTotales = {}; 
        
        resultadosAgregados.forEach(item => {
            // La clave del nombre del estado en el objeto 'raw' de Sequelize se construye con el alias de la asociación
            const nombreEstado = item['estado_docente.nombre'];
            const conteoNumerico = parseInt(item.conteo, 10);
            
            if (nombreEstado) {
                // Utilizamos el nombre del estado como clave en el objeto final
                estadosTotales[nombreEstado] = conteoNumerico;
            }
        });

        // Ejemplo de retorno: { 'Activo': 150, 'Retirado': 20, 'Moroso': 5 }
        return estadosTotales;

    }
    

// -------------------------- Auxiliar ------------------------------------

    // Esta función complementa a las funciones "buscarDocentes" y "obtenerDocentePorId", y sirve para formatear las claves que le llegará al usuario
    static formatearDocente(docenteInstance) {

        // Si no existe la entidad se devuelve null
        if (!docenteInstance) return null;

        const docente = docenteInstance.toJSON(); 
        

        // Función auxiliar para convertir booleanos a "Si"/"No"
        // Nota: si recibe "undefined" sería: "undefined === true" es false
        const boolToText = (value) => value === true ? "Si" : "No";

        // -------------------------------------------------------------
        // Procesar la lista de grupos (si existe)
        // Se mapea la lista para formatear cada grupo individualmente
        // -------------------------------------------------------------
        const gruposFormateados = docente.grupos 
            ? docente.grupos.map(g => DocenteService.formatearGrupo(g)) 
            : []; // Devuelve un array vacío si no hay grupos (o si viene de buscarDocentes)
            

        return {
            id: docente.id_docente, 

            entidad: {
                numero_identificacion: docente.entidad?.numero_identificacion ?? null,
                nombre: docente.entidad?.nombre ? capitalizeFirstLetter(docente.entidad.nombre.toString()) : null,
                apellido: docente.entidad?.apellido ? capitalizeFirstLetter(docente.entidad.apellido.toString()) : null,
                telefono: docente.entidad?.telefono ?? null,
                email: docente.entidad?.email ?? null,
                numero_identificacion: docente.entidad?.numero_identificacion ?? null,

                estado: docente.entidad?.estado ?? null,

                prefijo: {
                    letra_prefijo: docente.entidad.prefijo.letra_prefijo?.toString() ?? null,
                }
            },

            estado: {
                id: docente.estado_docente?.id_estado_docente ?? null,
                nombre: docente.estado_docente?.nombre ?? null,
                descripcion: docente.estado_docente?.descripcion ?? null,

                // Si no existe se envía "undefined"
                permite_asignacion: boolToText(docente.estado_docente?.permite_asignacion),
                aplica_pago: boolToText(docente.estado_docente?.aplica_pago)
            },
            
            grupos: gruposFormateados,
       
            fechaCreacion: docente.createdAt,
            fechaActualizacion: docente.updatedAt 
        };

    }


    // Función auxiliar para formatear la estructura de un grupo (ya que está anidado)
    static formatearGrupo = (grupo) => {
        if (!grupo) return null;

        return {
            id: grupo.id_grupo,
            nombre: capitalizeFirstLetter(grupo.nombre),
        
            curso: {
                nombre: capitalizeFirstLetter(grupo.curso?.nombre ?? ""),
            },
            periodo: {
                nombre: capitalizeFirstLetter(grupo.periodo?.nombre ?? ""),
            },
            modalidad: {
                nombre: capitalizeFirstLetter(grupo.modalidad?.nombre ?? ""),
            }
        };
    };


    // Función Auxiliar que genera la "whereClause" sin ejecutar la consulta
    generarWhereClause(criteriosBusqueda = {}) {
        
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

                        docenteWhere.id_estado_docente = estado_Numerico;
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


        return {docenteWhere, entidadWhere};
    }   


}

module.exports = DocenteService;