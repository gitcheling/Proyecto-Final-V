const Curso_Model = require('../Models/curso'); 
const Categoria_Curso_Model = require('../Models/categoria_curso'); 
const Estado_Curso_Model = require('../Models/estado_curso'); 

const Grupo_Model = require('../Models/grupo'); 
const Periodo_Model = require('../Models/periodo');

// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarSoloTexto, validarSoloNumeros, validarLongitudCadena, validarEmail, validarSoloNumerosYGuion, validarTelefonoVenezolano, validarBooleano, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter} = require('../Utils/funciones');

// Importamos la clase del periodo para usar su función estática de obtener el periodo en transcurso
const PeriodoService = require('../services/PeriodoService'); // Ajusta la ruta

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 

class CursoService {

    // Se crea un curso
    async crearCurso({nombre, descripcion, categoria, total_clases}) {

        // ------------------ Validaciones de existencia de formulario ------------------------

            // Validamos que existan todos los datos
            validarExistencia(nombre, "nombre", true);
            validarExistencia(descripcion, "descripcion", true);
            validarExistencia(categoria, "categoria", true);
            validarExistencia(total_clases, "total_clases", true);

        // ------------------ Validaciones de formato ------------------------

            // Se valida el nombre
            const nombreLimpio = String(nombre).trim().toLowerCase();
            validarLongitudCadena(nombreLimpio, 5, 50, "El nombre no cumple con la longitud requerida (de 5 a 50 caracteres).");

            // Se valida la descripción
            const descripcionLimpia = String(descripcion).trim();
            validarLongitudCadena(descripcionLimpia,20, 255, "La descripcion no cumple con la longitud requerida (de 20 a 255 caracteres).");

            // Se valida la categoría
            const categoriaLimpia = String(categoria).trim();
            validarIdNumerico(categoriaLimpia, "La categoría debe contener solo números (dígitos 0-9).")

            // Se valida el total de clases
            const totalClasesLimpio = String(total_clases).trim();
            validarIdNumerico(totalClasesLimpio, "El total de clases debe contener solo números mayores a cero.")

            /* Nota: Se tomará en cuenta que el mínimo de clases son de 12 y de máximo son de 160:
            
                Mínimo: 3 meses (de la duración mínima del periodo) × 4 semanas/mes × 1 clase/semana = 12 clases.

                Máximo: 8 meses (de la duración máxima del periodo) × 4 semanas/mes = 32 semanas.
                Si es semi-intensivo (3 clases/semana): 32 semanas × 3 = 96 clases.
                Si es muy intensivo (5 clases/semana): 32 semanas × 5 = 160 clases.
            
            */
            const totalClasesNumerico = parseInt(totalClasesLimpio, 10);
            if (isNaN(totalClasesNumerico) || totalClasesNumerico < 12 || totalClasesNumerico > 160) {
                throw new Error("La cantidad total de clases no es válida (12 mínimo y 160 máximo).");
            }   

           

        // ------------------ Validaciones de existencia en la base de datos ------------------------

            // Se valida que exista la categoría
            const categoriaObjeto = await Categoria_Curso_Model.findOne({ where: { id_categoria_curso : categoriaLimpia } });
            if(!categoriaObjeto){
                throw new Error(`La categoría especificada no existe.`);
            }

            // Ahora se valida que tenga un padre (para que se vaya a guardar el curso en base a una subcategoría, no a una categoría)
            if(!categoriaObjeto.id_categoria_padre){
                throw new Error(`Debes seleccionar una subcategoría para el curso, no una categoría.`);
            }

            // Se valida que el nombre no se repita
            if(await Curso_Model.findOne({ where: { nombre : nombreLimpio } })){
                throw new Error(`Ya existe un curso con ese nombre.`);
            }


            const Data = {
                nombre: nombreLimpio, 
                descripcion: descripcionLimpia,        
                id_categoria: categoriaLimpia, 
                total_clases: totalClasesNumerico,
                id_estado: 1 
            };

            // Se manda a crear el nuevo curso
            const nuevoCurso = await Curso_Model.create(Data);

            // Renombramos las propiedades a regresar (para que el cliente no vea los nombres de las columnas de la base de datos)
            return {
                id: nuevoCurso.id_curso,
                nombre: nuevoCurso.nombre, 
                descripcion: nuevoCurso.descripcion, 
                estado: "Activo", 
                permite_grupos: "Si", 
               
                fechaCreacion: nuevoCurso.createdAt,
                fechaActualizacion: nuevoCurso.updatedAt
                
            };
    }


    // Se manda a actualizar un curso
    /*Nota: Los campos que no se deben modificar son:

        -id_curso	Llave Primaria (PK). Identificador único y absoluto. Nunca debe cambiar.
        
        -total_clases: El total de clases (no debe permitirse modificar siempre y cuando se esté transcurriendo un periodo y haya
        un grupo en estado "en curso" en base al curso a editar)
    */
    async actualizarCurso(id, nombre, descripcion, categoria, total_clases, estado) {

        // ------------------ Validaciones de existencia de formulario ------------------------
        
            validarExistencia(id, "id", true);
            validarExistencia(nombre, "nombre", true);
            validarExistencia(descripcion, "descripcion", true);
            validarExistencia(categoria, "categoria", true);
            validarExistencia(total_clases, "total_clases", true);
            validarExistencia(estado, "estado", true);

        // ------------------ Validaciones de formato ------------------------

            // Se valida el id
            const idLimpio = String(id).trim();
            validarIdNumerico(idLimpio, "El id no tiene el formato correcto");

            // Se valida el nombre
            const nombreLimpio = String(nombre).trim().toLowerCase();
            validarLongitudCadena(nombreLimpio,5, 50, "El nombre no cumple con la longitud requerida (de 5 a 50 caracteres).");

            // Se valida la descripción
            const descripcionLimpia = String(descripcion).trim().toLowerCase();
            validarLongitudCadena(descripcionLimpia, 20, 255, "La descripcion no cumple con la longitud requerida (de 20 a 255 caracteres).");

            // Se valida la categoría
            const categoriaLimpia = String(categoria).trim();
            validarIdNumerico(categoriaLimpia, "La categoría debe contener solo números (dígitos 0-9).")

            // Se valida el total de clases
            const totalClasesLimpio = String(total_clases).trim();
            validarIdNumerico(totalClasesLimpio, "El total de clases debe contener solo números mayores a cero.")

            /* Nota: Se tomará en cuenta que el mínimo de clases son de 12 y de máximo son de 160:
            
                Mínimo: 3 meses (de la duración mínima del periodo) × 4 semanas/mes × 1 clase/semana = 12 clases.

                Máximo: 8 meses (de la duración máxima del periodo) × 4 semanas/mes = 32 semanas.
                Si es semi-intensivo (3 clases/semana): 32 semanas × 3 = 96 clases.
                Si es muy intensivo (5 clases/semana): 32 semanas × 5 = 160 clases.
            
            */
            const totalClasesNumerico = parseInt(totalClasesLimpio, 10);
            if (isNaN(totalClasesNumerico) || totalClasesNumerico < 12 || totalClasesNumerico > 160) {
                throw new Error("La cantidad total de clases no es válida (12 mínimo y 160 máximo).");
            }   

            // Se valida el estado
            const estadoLimpio = String(estado).trim();
            validarIdNumerico(estadoLimpio, "El estado no es correcto.");
            const estadoNumerico = parseInt(estadoLimpio, 10);
            if (isNaN(estadoNumerico) || estadoNumerico < 1 || estadoNumerico > 3) {
                throw new Error("El estado no tiene el formato correcto.");
            }   

           
        // ------------------ Validaciones de existencia en la base de datos ------------------------

            // Se valida que exista el curso a editar
            const cursoObjeto = await Curso_Model.findByPk(idLimpio);
            if(!cursoObjeto){
                throw new Error(`El curso especificado no existe.`);
            }


            // Se valida que exista la categoría
            const categoriaObjeto = await Categoria_Curso_Model.findOne({ where: { id_categoria_curso : categoriaLimpia } });
            if(!categoriaObjeto){
                throw new Error(`La categoría especificada no existe.`);
            }

            // Ahora se valida que tenga un padre (para que se vaya a guardar el curso en base a una subcategoría, no a una categoría)
            if(!categoriaObjeto.id_categoria_padre){
                throw new Error(`Debes seleccionar una subcategoría para el curso, no una categoría.`);
            }

            // Se comprueba que si el nombre es distinto, no exista ya uno en la base de datos
            if(cursoObjeto.nombre != nombreLimpio){
                if(await Curso_Model.findOne({ where: { 
                                                    nombre : nombreLimpio,
                                                    id_curso: {
                                                        [Op.ne]: cursoObjeto.id_curso
                                                    }

                } })){
                    throw new Error(`Ya existe un curso con ese nombre.`);
                }
            }


            // Si se está cambiando el total de clases
            if(total_clases != cursoObjeto.total_clases){

                const periodoActual = await PeriodoService.obtenerPeriodoEnCurso();

                /* Si existe un periodo actual, se debe evaluar que no exista ya un grupo del curso en este periodo (porque cambiar
                la cantidad de clases del curso significa destruír la planificación del grupo) */
                if (periodoActual) {
                    
                    // Buscar Grupos Existentes para el Curso en el Período Actual
                    const totalGruposEnCurso = await Grupo_Model.count({
                        where: {
                            id_curso: cursoObjeto.id_curso,
                            id_periodo: periodoActual.id_periodo
                        }
                    });

                    // Aplicar la Regla de Negocio
                    if (totalGruposEnCurso > 0) {
                        // Regla: Si hay grupos asignados en el período actual, no se puede cambiar el total de clases.
                        throw new Error(
                            `No se puede modificar el total de clases porque el curso tiene grupos existentes en el periodo actual (${periodoActual.nombre}).`
                        );
                    }
                }

            }


    // Si pasa la validación, se hace la actualización

        const [filasAfectadas] = await Curso_Model.update(
            { // Objeto con los campos a actualizar
                nombre: nombreLimpio, 
                descripcion: descripcionLimpia,
                id_categoria: categoriaLimpia,         
                total_clases: totalClasesNumerico, 
                id_estado: estadoNumerico,
             }, 
             
            { where: { id_curso: cursoObjeto.id_curso } } 
        );

        // Se devuelve el objeto actualizado
        if (filasAfectadas === 0) {
            // Aunque improbable después de findByPk, se maneja.
            return null;
        }
        
    
        return true;
    }



    // Se obtiene un solo curso por el id
    async obtenerCursoPorId(id) {

        validarExistencia(id, "id", true);

        const idLimpio = String(id).trim();
        validarIdNumerico(idLimpio, "El ID proporcionado no es un número entero válido o positivo.");

        // Método de Sequelize para buscar una entidad por su Primary Key
        const curso = await Curso_Model.findByPk(idLimpio, {

                attributes: [// Atributos de la tabla principal (curso)                
                    'id_curso', 'nombre', 'descripcion', 'id_categoria', 
                    'total_clases', 'id_estado', 'createdAt', 'updatedAt'
                ],
                include: [ /*Le indica a Sequelize que debe realizar operaciones JOIN para traer datos de las 
                    tablas relacionadas definidas en las asociaciones del modelo*/
                    { 
                        association: 'estado', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "curso")
                        attributes: ['id_estado_curso', 'nombre', 'permite_nuevos_grupos' ] // Estos son los campos que se traerán de la tabla asociada (estado_curso)
                    },
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
        });
        
        return CursoService.formatearCurso(curso);
       
    }



    // Permite buscar cursos basandose en filtros
    async buscarCursos(criteriosBusqueda = {}) {
        
        // Objeto que contendrá todas las condiciones de filtro combinadas con AND
        const whereClause = {};
        const includeClause = []; // Usaremos esta variable para la JOIN/INCLUDES

        // 1. Obtener y limpiar los criterios de búsqueda (usando desestructuración)
        const { 
            nombre, 
            categoria,
            subcategoria,
            cantidad_clases_minima,
            cantidad_clases_maxima,
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


        // Variable para guardar los datos en limpio
        let codigoLimpio = null;

        // Variables para las fechas
            let inicioDiaSiguiente = null;
            // Suma 24 horas (86,400,000 milisegundos)
            const milisegundosEnUnDia = 24 * 60 * 60 * 1000;


        // --- 2. Aplicar filtros solo si existen ---

            // Filtro Nombre 
            if (validarExistencia(nombre, "", false)) {

                // Limpieza y Validación:
                codigoLimpio = String(nombre).trim();

                // Si después de limpiar quedó vacío, se salta el filtro.
                if (codigoLimpio) {

                    validarLongitudCadena(codigoLimpio, 1, 30, "El nombre no cumple con la longitud requerida (de 1 a 30 caracteres).");

                    whereClause.nombre = {
                        [Op.iLike]: `%${codigoLimpio}%`
                    }; 
                }
            }

            // --------------------------------------------------------
            // FILTROS DE CATEGORÍA (Autoexcluyentes)
            // --------------------------------------------------------
            
            const subcategoriaLimpia = validarExistencia(subcategoria, "", false) ? parseInt(subcategoria, 10) : null;
            const categoriaLimpia = validarExistencia(categoria, "", false) ? parseInt(categoria, 10) : null;

            // Los datos a traer de la base de datos
            let categoriaInclude = { 
                model: Categoria_Curso_Model,
                as: 'categoria', // Alias que debe coincidir con el modelo curso.js
                attributes: ['id_categoria_curso', 'nombre', 'id_categoria_padre'],
                
                // Se trae la categoría padre
                include: [
                    {
                        association: 'categoria_padre', // Se usa el alias del modelo "categoria_curso"
                        attributes: ['id_categoria_curso', 'nombre']
                    }
                ]
            };

            if (subcategoriaLimpia) {
                // A) Filtrar por SUB-CATEGORÍA (Nivel Hijo)
                // Si se manda una subcategoría, se busca directamente por el id_categoria del curso.
                whereClause.id_categoria = subcategoriaLimpia;
                includeClause.push(categoriaInclude); // Incluye la categoría para traer sus datos.

            } else if (categoriaLimpia) {
                // B) Filtrar por CATEGORÍA (Nivel Padre)
                // Se debe buscar cursos cuya categoría tenga como padre a 'categoriaLimpia'.
                
                // Añadimos el filtro a la configuración del include de categoría
                categoriaInclude.required = true; // INNER JOIN
                categoriaInclude.where = {
                    id_categoria_padre: categoriaLimpia // Condición en la tabla de categorías
                };
                includeClause.push(categoriaInclude);

            }else {
                // C) Ningún filtro de categoría: Solo incluye la categoría para traer sus datos.
                includeClause.push(categoriaInclude);
            }


            // --------------------------------------------------------
            // FILTROS DE RANGO NUMÉRICO (total_clases)
            // --------------------------------------------------------
            
            const minClasesExiste = validarExistencia(cantidad_clases_minima, "", false);
            const maxClasesExiste = validarExistencia(cantidad_clases_maxima, "", false);
            
            if (minClasesExiste || maxClasesExiste) {
                // Inicializamos total_clases como un objeto para albergar los operadores
                whereClause.total_clases = {};
                
            
                if (minClasesExiste) {
                    validarSoloNumeros(cantidad_clases_minima, "La cantidad de clases mínima debe ser un número.");
                    const minNum = parseInt(cantidad_clases_minima, 10);
                    
                    // Requisito: total_clases MAYOR o IGUAL (>=) a la mínima
                    whereClause.total_clases[Op.gte] = minNum; 
                }

                if (maxClasesExiste) {
                    validarSoloNumeros(cantidad_clases_maxima, "La cantidad de clases máxima debe ser un número.");
                    const maxNum = parseInt(cantidad_clases_maxima, 10);
                    
                    // Requisito: total_clases MENOR o IGUAL (<=) a la máxima
                    whereClause.total_clases[Op.lte] = maxNum; 
                }

                // Validación extra: Asegurar que el mínimo no sea mayor que el máximo (opcional, pero útil)
                if (minClasesExiste && maxClasesExiste && parseInt(cantidad_clases_minima) > parseInt(cantidad_clases_maxima)) {
                    throw new Error("La cantidad de clases mínima no puede ser mayor que la máxima.");
                }
            }

         
            
            // Filtro: Estado 
            if (validarExistencia(estado, "", false)) {  
                
                validarIdNumerico(estado, "El estado debe contener solo números (dígitos 0-9).");
                const estadoNumerico = parseInt(estado, 10);
                if ( !(isNaN(estadoNumerico) || estadoNumerico < 1 || estadoNumerico > 3)) {

                    whereClause.id_estado = estadoNumerico;
                }; 

            }
  
            //Filtro: Se verifica si el usuario ha proporcionado al menos una de las fechas de creación
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

            // Filtro: Se verifica si el usuario ha proporcionado al menos una de las fechas de modificación
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

            const cursos = await Curso_Model.findAll({
                where: whereClause, 
                
                // Aplicamos el include que se construyó (para el filtro de categoría padre)
                include: [ 
                    ...includeClause,
                    // Mantener otras asociaciones que se quiera traer 
                    { 
                        association: 'estado', // Esto debe coincidir exactamente con el alias (as) que se le dió a la relación en el modelo (en este caso "curso")
                        attributes: ['id_estado_curso', 'nombre', 'permite_nuevos_grupos' ] // Estos son los campos que se traerán de la tabla asociada (estado_curso)
                    }
                ],
                order: [
                    ['updatedAt', 'DESC'] 
                ]
            });



            // --- Se devuelven los resultados formateados ---
            return cursos.map(instancia => CursoService.formatearCurso(instancia));
    }



    // Esta función complementa a las funciones "buscarCursos" y "obtenerCursoPorId", y sirve para formatear las claves que le llegará al usuario
    static formatearCurso(cursoInstance) {

        // Si no existe la entidad se devuelve null
        if (!cursoInstance) return null;

        const curso = cursoInstance.toJSON(); 

        return {
            id: curso.id_curso, 
            nombre: capitalizeFirstLetter(curso.nombre), 
            descripcion: capitalizeFirstLetter(curso.descripcion),        
            total_clases: curso.total_clases,

            estado: {
                id: curso.estado?.id_estado_curso ?? null,
                nombre: curso.estado?.nombre ?? null,
                permite_grupos: curso.estado.permite_nuevos_grupos == true ? "Si": "No"
            },

            categoria: {
                id: curso.categoria?.id_categoria_curso ?? null,
                nombre: curso.categoria?.nombre ?? null,
                padre: curso.categoria?.id_categoria_padre ?? null,

                categoria_padre:{
                    id: curso.categoria?.categoria_padre?.id_categoria_curso ?? null,
                    nombre: curso.categoria?.categoria_padre?.nombre ?? null
                }
            },
            
            
            fechaCreacion: curso.createdAt,
            fechaActualizacion: curso.updatedAt 
        };

    }


}

module.exports = CursoService;