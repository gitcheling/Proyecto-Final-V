/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/
const Banco_Model = require('../Models/banco'); 
const Cuenta_Bancaria_Model = require('../Models/cuenta_bancaria');
const Tipo_Cuenta_Model = require('../Models/tipo_cuenta_bancaria'); 
const Estado_Cuenta_Bancaria_Model = require('../Models/estado_cuenta_bancaria');  

const Entidad_Cuenta_Asociacion_Model = require('../Models/entidad_cuenta_asociacion'); 
const Tipo_Rol_Asociado_Model = require('../Models/tipo_rol_asociado'); 

const Entidad_Model = require('../Models/entidad'); 
const Docente_Model = require('../Models/docente'); 
const Estudiante_Model = require('../Models/estudiante'); 
const Proveedor_Model = require('../Models/proveedor'); 





// Se importan las funciones comúnes de validación
const { validarExistencia, validarIdNumerico, validarBooleano, validarSoloTexto, validarSoloNumeros, parseAndValidateDate} = require('../Utils/validators');

// Se importan las funciones comúnes
const { capitalizeFirstLetter} = require('../Utils/funciones');

// Se importa la clase "Op" que es necesaria para las operaciones de las clausulas WHERE de las consultas
const { Op } = require('sequelize'); 


class EntidadCuentaAsociacionService {

// Registro

    async asociarCuentasBancarias({entidad, concepto, cuentasIds}) {

        // --------------- Validaciones de existencia de datos ------------------
            validarExistencia(entidad, "entidad", true);
            validarExistencia(concepto, "concepto", true);

            if (!cuentasIds || cuentasIds.length === 0) {
                throw new Error(`No se han proporcionado cuentas para asociar.`);
            }

        // --------------- Validaciones de formato  ------------------
            const entidad_limpia = String(entidad).trim();
            validarIdNumerico(entidad_limpia, "La entidad no tiene el formato correcto");
            if (entidad_limpia == 1) {
                throw new Error(`No se puede asociar una cuenta bancaria a la Academia, sólo puede hacerse de forma interna`);
            }

            const concepto_limpio = String(concepto).trim().toLowerCase();
            if(!["docente", "estudiante", "proveedor"].includes(concepto_limpio)){
                throw new Error(`El concepto no es válido.`);
            }

            const idsLimpios = cuentasIds.map((idString, index) => {
                // Configuramos el mensaje de error
                const campo = `cuenta Nº ${index + 1}`; 
                // Eliminamos espacios al inicio/final
                const id_limpio =  String(idString).trim();


                validarExistencia(id_limpio, `La ${campo} enviada no es válida`, true);
                
                validarIdNumerico(id_limpio, `La ${campo} enviada no es válida`);

                return parseInt(id_limpio, 10);
            });


        // --------------- Validaciones de unicidad  ------------------

            // Se verifica de que el cliente no envíe IDs repetidos
            const idsUnicos = new Set(idsLimpios);
            if (idsUnicos.size !== idsLimpios.length) {
                // Encuentra los IDs que aparecen más de una vez
                const idsDuplicados = idsLimpios.filter((id, index) => idsLimpios.indexOf(id) !== index);
                // Crea un array con solo los IDs duplicados sin repetirlos en el mensaje de error
                const idsDuplicadosUnicos = [...new Set(idsDuplicados)];
                
                throw new Error(`Se encontraron IDs de cuentas bancarias duplicados en la solicitud: ${idsDuplicadosUnicos.join(', ')}.`);
            }


        // --------------- Validaciones de existencia  ------------------

            // Se comprueba que exista una entidad con ese id
            const entidad_objeto = await Entidad_Model.findByPk(entidad_limpia);
            if (!entidad_objeto) {
                // La Entidad  no existe, no se puede crear la cuenta bancaria
                throw new Error(`La entidad solicitada no está registrada.`);
            }
            const id_entidad = entidad_objeto.id_entidad;


            // Se comprueba que la entidad exista como docente, estudiante o proveedor antes de asociarle una cuenta
            let registro_especifico;
            const nombre_tabla_especifica = concepto_limpio; // "docente", "estudiante", "proveedor"
            switch (concepto_limpio) {
                case 'docente':
                    registro_especifico = await Docente_Model.findByPk(id_entidad);
                    break;
                case 'estudiante':
                    registro_especifico = await Estudiante_Model.findByPk(id_entidad);
                    break;
                case 'proveedor':
                    registro_especifico = await Proveedor_Model.findByPk(id_entidad);
                    break;
                // No se necesita default, ya que concepto_limpio ya se validó antes.
            }
            if (!registro_especifico) {
                throw new Error(`La Entidad con ID ${id_entidad} no está registrada como ${nombre_tabla_especifica}.`);
            }
        

            // Se comprueba que exista el rol
            const rol = await Tipo_Rol_Asociado_Model.findOne({
                where: {
                    nombre: concepto_limpio,
                },
                // Opcional: Solo traer el ID para optimizar la consulta
                attributes: ['id_tipo_rol'] 
            });
            if (!rol) {
                throw new Error(`El solicitado no existe.`);
            }


            // Se verifica si todos los IDs de las cuentas existen.
            const cuentasExistentes = await Cuenta_Bancaria_Model.findAll({
                where: {
                    id_cuenta_bancaria: idsLimpios
                },
                attributes: ['id_cuenta_bancaria'] 
            });
            // Si la cantidad de cuentas encontradas NO es igual a la cantidad de cuentas solicitadas, hay un error.
            if (cuentasExistentes.length !== idsLimpios.length) {
                
                // Lógica para determinar qué IDs faltan (para un mensaje de error útil)
                const idsEncontrados = new Set(cuentasExistentes.map(c => c.id_cuenta_bancaria));
                const idsFaltantes = idsLimpios.filter(id => !idsEncontrados.has(id));

                throw new Error(`Los siguientes IDs de cuentas bancarias no existen en el sistema: ${idsFaltantes.join(', ')}.`);
            }


            // Se verifica que la combinación (id_entidad_asociada + id_rol + id_cuenta_bancaria) no exista ya.
            const asociacionesExistentes = await Entidad_Cuenta_Asociacion_Model.findAll({
                where: {
                    id_entidad_asociada: id_entidad,
                    id_tipo_rol: rol.id_tipo_rol,
                    // Busca si existe alguna asociación para la ENTIDAD/ROL con CUALQUIERA de los IDs de cuenta ÚNICOS.
                    id_cuenta_bancaria: idsLimpios
                },
                attributes: ['id_cuenta_bancaria']
            });
            if (asociacionesExistentes.length > 0) {
                const cuentasYaAsociadas = asociacionesExistentes.map(a => a.id_cuenta_bancaria);
                throw new Error(`La entidad ya tiene la siguiente(s) cuenta(s) asociada(s) para este rol: ${cuentasYaAsociadas.join(', ')}.`);
            }

            
        // --------------- Validaciones de estado ------------------
       

            // VERIFICACIÓN DE ESTADO DE CUENTA (NO PENDIENTE DE APROBACIÓN) ---
            // Buscamos si ALGUNA de las cuentas está en estado 5 (Pendiente de Aprobación).
            const CUENTA_PENDIENTE_APROBACION_ID = 5; 
            
            const cuentasPendientes = await Cuenta_Bancaria_Model.findAll({
                where: {
                    id_cuenta_bancaria: idsLimpios, // IDs de cuenta validados
                    id_estado_cuenta: CUENTA_PENDIENTE_APROBACION_ID
                },
                attributes: ['id_cuenta_bancaria']
            });

            if (cuentasPendientes.length > 0) {
                const cuentasNoAprobadas = cuentasPendientes.map(c => c.id_cuenta_bancaria);
                throw new Error(`Las siguientes cuentas están pendientes de aprobación y no pueden ser asociadas: ${cuentasNoAprobadas.join(', ')}.`);
            }


            // VALIDACIÓN DE ESTADO OPERABLE (las cuentas en que su estado de cuenta tiene "permite_operacion: true") ---
            // Encontramos todos los IDs de estados de cuenta que NO permiten operación
            const estadosNoOperables = await Estado_Cuenta_Bancaria_Model.findAll({
                where: {
                    permite_operacion: false
                },
                attributes: ['id_estado_cuenta']
            });
            
            const idsEstadosNoOperables = estadosNoOperables.map(e => e.id_estado_cuenta);

            // 2. Buscamos qué cuentas solicitadas tienen uno de esos estados no operables
            const cuentasNoOperables = await Cuenta_Bancaria_Model.findAll({
                where: {
                    id_cuenta_bancaria: { [Op.in]: idsLimpios }, // Cuentas que queremos asociar
                    id_estado_cuenta: { [Op.in]: idsEstadosNoOperables } // Cuentas cuyo estado NO permite operación
                },
                attributes: ['id_cuenta_bancaria']
            });

            if (cuentasNoOperables.length > 0) {
                const cuentasConProblemas = cuentasNoOperables.map(c => c.id_cuenta_bancaria);
                
                throw new Error(`Las siguientes cuentas no tienen un estado operable y no pueden ser asociadas: ${cuentasConProblemas.join(', ')}.`);
            }



        // --------------- Guardado en la base de datos ------------------

            // 1. Mapear el array de IDs
            const promesasDeCreacion = idsLimpios.map(cuentaId => {
                
                // 2. Por cada ID, creamos un objeto de datos a guardar
                const datosAsociacion = {
                    id_cuenta_bancaria: cuentaId,
                    id_entidad_asociada: id_entidad, 
                    id_tipo_rol: rol.id_tipo_rol,
                    es_vigente: true
                    
                };
                
                // 3. Devolver la promesa de creación (sin esperar aquí)
                return Entidad_Cuenta_Asociacion_Model.create(datosAsociacion);
            });

            // 4. Esperar que TODAS las promesas se resuelvan
            // Sequelize guardará todos los registros simultáneamente (batch insert).
            await Promise.all(promesasDeCreacion);

            return true; 


    }


// Modificación

    async cambiarEstadoAsociacion(id, nuevoEstado) {

        // --------------- Validaciones de existencia de datos ------------------
            validarExistencia(id, "id", true);
            validarExistencia(nuevoEstado, "nuevoEstado", true);


         // --------------- Validaciones de formato ------------------

            const id_limpio = String(id).trim().toLowerCase();
            validarIdNumerico(id_limpio, "El id es obligatorio");
            
            // Se valida el nuevo estado
            validarBooleano(nuevoEstado, "El estado solo puede ser verdadero o falso (true/false).")

        // --------------- Validaciones de existencia en la base de datos ------------------


            // Se valida la existencia de la cuenta, si no existe se regresa null
            if(!await Entidad_Cuenta_Asociacion_Model.findByPk(id_limpio)){
                throw new Error(`La asociación no existe.`);
            };

            // Solo se actualiza la columna 'estado'
            const [filasAfectadas] = await Entidad_Cuenta_Asociacion_Model.update(
                { es_vigente: nuevoEstado }, 
                { where: { id_asociacion: id_limpio } }
            );

            if (filasAfectadas === 0) {       
                return null;      
            }

            return true;
    }


// Obtención


    // Se obtienen las entidades asociadas a una cuenta bancaria
    async obtenerEntidadesAsociadas(id) {

        validarExistencia(id, "id", true);

        const id_limpio = String(id).trim();

        validarIdNumerico(id_limpio, "El ID proporcionado no es un número entero válido o positivo.");


        // Se obtienen las entidades y el estado de las asociaciones
        const cuenta = await Cuenta_Bancaria_Model.findOne({
            where: { id_cuenta_bancaria: id_limpio },
            
            // Atributos de la Cuenta Bancaria que NO son necesarios
            attributes: ['id_cuenta_bancaria'], // Solo necesitamos el ID para el filtro y la referencia
            
            // INCLUSIONES
            include: [
                {
                    // Alias de la asociación Many-to-Many definida en "cuenta_bancaria"
                    association: 'entidades_pago', 
                    
                    // Atributos de la Entidad asociada
                    attributes: ['id_entidad', 'nombre', 'apellido', 'numero_identificacion', 'estado'], 

                    // Include anidado para el Prefijo de la Entidad
                    include: [
                        {
                            association: 'prefijo', // Alias definido en el modelo Entidad
                            attributes: ['letra_prefijo'] 
                        },
                        {
                            association: 'tipo_entidad', // Alias definido en el modelo Entidad
                            attributes: ['nombre'] 
                        }
                    ],
                    
                    // Traer los datos de la Tabla Intermedia (Entidad_Cuenta_Asociacion)
                    through: {

                        // Atributos de la tabla intermedia que queremos
                        attributes: ['id_asociacion', 'es_vigente', 'id_tipo_rol'],
                        
                    }
                }
            ],
        });

        // 3. Verificación de resultado
        if (!cuenta) {
            throw new Error(`La cuenta bancaria con ID ${id_limpio} no fue encontrada.`);
        }

        /*  Se obtienen los tipos de rol aparte
        Nota: Se intentó traer en una misma consulta todos los datos y Sequelize da error diciendo que no existe la asociación
        "tipo_rol" en "entidad", por lo que para evitar errores se traen los datos y los tipos de rol por separado y se juntan
        en la función de formateo */
        const mapaRoles = await this.obtenerMapaDeRoles();

        return EntidadCuentaAsociacionService.formatearEntidadesAsociadas(cuenta, mapaRoles);

    }


    // Se obtienen los roles
    async obtenerMapaDeRoles() {
        const roles = await Tipo_Rol_Asociado_Model.findAll({
            attributes: ['id_tipo_rol', 'nombre']
        });
        
        // Creamos un mapa para búsqueda rápida: { 1: 'Docente', 2: 'Estudiante', ... }
        return roles.reduce((map, rol) => {
            map[rol.id_tipo_rol] = capitalizeFirstLetter(rol.nombre);
            return map;
        }, {});
    }



// Conteo

    /* Ésta función cuenta las cuentas bancarias que tiene una entidad según un rol */
    async ContarPorEntidad(id, rol) {

        if(!validarExistencia(id, "", false)){
            throw new Error(`Debe proporcionar el id de la entidad.`);
        }

        if(!validarExistencia(rol, "", false)){
            throw new Error(`Debe proporcionar el rol de la entidad.`);
        }

        const idLimpio = String(id).trim();
        const rolLimpio = String(rol).trim().toLowerCase();

        // Se valida el id
        validarIdNumerico(idLimpio, "El id no tiene el formato correcto");

        // Se valida el rol
        validarSoloTexto(rolLimpio, "El rol debe contener solo texto.");

        if(!["docente", "proveedor", "estudiante"].includes(rolLimpio)){
            throw new Error(`El rol proporcionado no es válido.`);
        }

        const tipo_rol_objeto = await await Tipo_Rol_Asociado_Model.findOne({
            where: {
                nombre: rolLimpio
            }
        })
        
        // Se valida la existencia de la entidad, si no existe se regresa null
        const entidad = await Entidad_Model.findByPk(idLimpio)

        if(!entidad){
            throw new Error(`la entidad solicitada no existe.`);
        };

        const totalCuentasAsociadas = await Entidad_Cuenta_Asociacion_Model.count({
            
            where: {
                id_entidad_asociada: entidad.id_entidad,
                id_tipo_rol: tipo_rol_objeto.id_tipo_rol
            }
        });

        return totalCuentasAsociadas;
    }



// Formateo

    static formatearEntidadesAsociadas(cuentaInstance, mapaRoles) { 
        
        const entidades_asociadas = cuentaInstance.entidades_pago ?? [];

        return entidades_asociadas.map(entidadAsociada => {
            
            const asociacionIntermedia = entidadAsociada.Entidad_Cuenta_Asociacion; 
            const idRol = asociacionIntermedia?.id_tipo_rol;
            
            return {
                // ... (Datos de la Entidad asociada)
                entidad: {
                    id: entidadAsociada.id_entidad ?? null,
                    nombre: capitalizeFirstLetter(entidadAsociada.nombre) ?? null,
                    apellido: capitalizeFirstLetter(entidadAsociada.apellido) ?? null,
                    numero_identificacion: entidadAsociada.numero_identificacion ?? null,
                    estado: entidadAsociada.estado ?? null,
                    prefijo: {letra_prefijo : entidadAsociada.prefijo?.letra_prefijo ?? null},
                    tipo_entidad: {tipo_entidad : entidadAsociada.tipo_entidad?.nombre ?? null}
                },
                
                // Datos de la Asociación (Tabla Intermedia)
                asociacion: {
                    id_asociacion: asociacionIntermedia?.id_asociacion ?? null,
                    es_vigente: asociacionIntermedia?.es_vigente ?? false,
                    id_rol: idRol ?? null, // Dejamos el ID por si es útil
                
                    rol: mapaRoles[idRol] ?? null 
                }
            };

        });
    }

}


module.exports = EntidadCuentaAsociacionService;