/* Archivo para inicializar las asociaciones (se importan todos los modelos y mandamos a ejecutar las asociaciones, con el fin de que
se pueda relacionar las claves foráneas con sus tablas). Por ejemplo, sin estas asociaciones si queremos obtener los datos de una tabla
se obtendrán las claves foráneas que tenga, y no nos interesa algo como "1" o "2", por lo que con las asociaciones podemos decir que se
vaya a la tabla foránea y nos traiga los datos de esa clave (asi ya no se tendría "1" o "2, sino los datos de esas claves")
*/


const path = require('path');

// Se importa la función para cargar todos los modelos 
const { cargarModelos } = require('../Utils/cargarModelos');

// Se define la ruta a la carpeta de modelos
const RUTA_MODELOS = path.join(__dirname, '..', 'Models'); // Asegúrate que esta ruta sea correcta

/* Carga dinámica de los modelos (esto reemplaza todas las líneas de 'require' comentadas)

Nota: con esto todos los modelos se cargan en memoria al iniciar el servidor, y luego cada vez que un archivo importe un modelo, 
simplemente lo importa desde la memoria, no tiene que volver a cargar el modelo (bendito sea Node.js) 
*/
const modelosAgrupados = cargarModelos(RUTA_MODELOS);

console.log(modelosAgrupados);


/* Se importan todos los modelos (de la carpeta "Models")


const Asiento_Detalle = require('../Models/asiento_detalle');
const Asiento_Encabezado = require('../Models/asiento_encabezado');
const Asignacion_Docente = require('../Models/asignacion_docente');
const Asignacion_Horario_Grupo = require('../Models/asignacion_horario_grupo');
const Banco = require('../Models/banco');
const Bloque_Horario = require('../Models/bloque_horario');
const Categoria_Curso = require('../Models/categoria_curso');
const Clasificacion_Cuenta = require('../Models/clasificacion_cuenta'); 
const Cuenta_Bancaria = require('../Models/cuenta_bancaria'); 
const Curso = require('../Models/curso'); 
const Detalle_Factura = require('../Models/detalle_factura'); 
const Dia = require('../Models/dia'); 
const Divisa = require('../Models/divisa'); 
const Docente = require('../Models/docente'); 
const Entidad_Cuenta_Bancaria = require('../Models/entidad_cuenta_bancaria'); 
const Entidad = require('../Models/entidad'); 
const Estado_Academico = require('../Models/estado_academico'); 
const Estado_Cuenta_Bancaria = require('../Models/estado_cuenta_bancaria'); 
const Estado_Docente = require('../Models/estado_docente');
const Estado_Factura = require('../Models/estado_factura'); 
const Estado_Grupo = require('../Models/estado_grupo');   
const Estado_Inscripcion = require('../Models/estado_inscripcion');  
const Estado_Plan = require('../Models/estado_plan'); 
const Estudiante = require('../Models/estudiante'); 
const Facturas_Gasto = require('../Models/facturas_gasto'); 
const Fuente_Asiento = require('../Models/fuente_asiento');
const Grupo = require('../Models/grupo'); 
const Inscripcion = require('../Models/inscripcion');  
const Liquidacion_Nomina = require('../Models/liquidacion_nomina');
const Naturaleza = require('../Models/naturaleza');
const Pagos_Docentes = require('../Models/pagos_docentes'); 
const Pagos_Estudiantes = require('../Models/pagos_estudiantes'); 
const Pagos_Proveedores = require('../Models/pagos_proveedores'); 
const Plan_Cuenta = require('../Models/plan_cuenta'); 
const Plan_Pago = require('../Models/plan_pago'); 
const Prefijo_Identificacion = require('../Models/prefijo_identificacion'); 
const Proveedor = require('../Models/proveedor'); 
const Registro_Horas = require('../Models/registro_horas'); 
const Regla_Prefijo_Documento = require('../Models/regla_prefijo_documento');
const Tarifa_Docente_Grupo = require('../Models/tarifa_docente_grupo'); 
const Tasa_Cambio = require('../Models/tasa_cambio'); 
const Tipo_Comprobante = require('../Models/tipo_comprobante'); 
const Tipo_Cuenta_Bancaria = require('../Models/tipo_cuenta_bancaria'); 
const Tipo_Entidad_Pagable = require('../Models/tipo_entidad_pagable'); 
const Tipo_Entidad = require('../Models/tipo_entidad'); 
const Tipo_Identificacion = require('../Models/tipo_identificacion');
const Tipo_Pago = require('../Models/tipo_pago'); 
const Tipo_Proveedor = require('../Models/tipo_proveedor'); 


// ... [Importar todos los otros modelos aquí] ...


// Se agrupan los modelos
const modelosAgrupados = { 
    Asiento_Detalle,
    Asiento_Encabezado,
    Asignacion_Docente,
    Asignacion_Horario_Grupo,
    Banco, 
    Bloque_Horario,
    Categoria_Curso, 
    Clasificacion_Cuenta,
    Cuenta_Bancaria,
    Curso,
    Detalle_Factura,
    Dia,
    Divisa,
    Docente,
    Entidad_Cuenta_Bancaria,
    Entidad,
    Estado_Academico,
    Estado_Cuenta_Bancaria,
    Estado_Docente,
    Estado_Factura,
    Estado_Grupo,
    Estado_Inscripcion,
    Estado_Plan,
    Estudiante,
    Facturas_Gasto,
    Fuente_Asiento,
    Grupo,
    Inscripcion,
    Liquidacion_Nomina,
    Naturaleza,
    Pagos_Docentes,
    Pagos_Estudiantes,
    Pagos_Proveedores,
    Plan_Cuenta,
    Plan_Pago,
    Prefijo_Identificacion,
    Proveedor,
    Registro_Horas,
    Regla_Prefijo_Documento,
    Tarifa_Docente_Grupo,
    Tasa_Cambio,
    Tipo_Comprobante,
    Tipo_Cuenta_Bancaria,
    Tipo_Entidad_Pagable,
    Tipo_Entidad,
    Tipo_Identificacion,
    Tipo_Pago,
    Tipo_Proveedor
    // ... [Incluir todos los demás modelos] ...
}; */

// Función para establecer las relaciones
const setupAssociations = () => {

    // Se hace un bucle para que haga todas las asociaciones de todos los modelos agrupados (y asi no ir uno por uno manualmente)
    Object.values(modelosAgrupados).forEach(model => {

        // Se comprueba si el modelo tiene la función "associate" (indicando que hay asociaciones que colocamos)
        if (model.associate) {

            // Ejecutamos la función, mandando como parámetro todos los modelos agrupados (y asi desde el modelo se use el que corresponde)
            model.associate(modelosAgrupados); // Ejecuta Cuenta.associate({Cuenta, Naturaleza, ...})
        }

    });

    console.log("Asociaciones de Sequelize establecidas.");
};

module.exports = { setupAssociations, modelosAgrupados };