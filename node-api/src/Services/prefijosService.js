/* Se importa el modelo 

Nota: Sólo necesitamos éste modelo, ya que después de todo establecimos las asociaciones, si queremos hacer una consulta directa sobre
las tablas "clasificacion_cuenta" o "naturaleza"
*/

const Tipo_Identificacion_Model = require('../Models/tipo_identificacion'); 
const Prefijo_Identificacion_Model = require('../Models/prefijo_identificacion'); 

// Se importan las funciones comúnes de validación
const { validarExistencia, validarSoloNumeros} = require('../Utils/validators');


class PrefijosService {

    // Se obtienen los prefijos según el tipo de identificación
    async obtenerPrefijos(id) {

        validarExistencia(id, "id", true);

        validarSoloNumeros(id, "El tipo de identificación debe contener solo números (dígitos 0-9).")
        const tipo_Identificacion_Numerica = parseInt(id, 10);
        if (isNaN(tipo_Identificacion_Numerica) || tipo_Identificacion_Numerica < 1 || tipo_Identificacion_Numerica > 4) {
             throw new Error("El tipo de identificación no es válido.");
        }

        const resultado = await Tipo_Identificacion_Model.findByPk(tipo_Identificacion_Numerica, {
            // Usamos la asociación 'Prefijos' que definimos con 'as'
            include: [{
                model: Prefijo_Identificacion_Model, // El modelo de sequelize de la otra tabla
                as: 'prefijos_sociados', // El "as" definido en "tipo_identificacion"
                // Opcional: Especifica solo los atributos que se necesita del prefijo
                attributes: ['id_prefijo', 'letra_prefijo', 'descripcion'],

                through: {
                    attributes: []
                }
            }],
            // Opcional: No se necesita en éste caso los atributos del tipo_identificacion
            attributes: [] 
        });

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }
        return resultado.prefijos_sociados;
       
    }


}

module.exports = PrefijosService;