// src/Utils/cargarModelos.js

const fs = require('fs');
const path = require('path');

const cargarModelos = (directorioModelos) => {

    // Lista de archivos a ignorar 
    const archivosAExcluir = ['associations.js']; 

    const modelosAgrupados = {};

    
    // Obtener la lista de archivos en el directorio
    // directoryModelos será la ruta a la carpeta 'src/Models'
    const archivos = fs.readdirSync(directorioModelos);

    archivos.forEach(archivo => {
        // 1. Filtrar solo archivos .js y excluir los archivos de utilidad
        if (archivo.endsWith('.js') && !archivosAExcluir.includes(archivo)) {
            
            // 2. Obtener la ruta completa
            const rutaCompleta = path.join(directorioModelos, archivo);
            
            // 3. Importar el módulo (el modelo de Sequelize)
            const modelo = require(rutaCompleta);
            
            // 4. Crear la clave del objeto en el formato deseado (ej: Asiento_Detalle)
            const nombreArchivoBase = archivo.replace('.js', ''); 
            const nombreModeloFormateado = formatModelName(nombreArchivoBase);
            
            // 5. Agregar al objeto agrupado
            modelosAgrupados[nombreModeloFormateado] = modelo;
        }
    });

    return modelosAgrupados;
};

/**
 * Convierte un nombre de archivo en snake_case (ej: asiento_detalle)
 * a PascalCase/Capitalized Snake Case (ej: Asiento_Detalle).
 * Esto asegura que el nombre de la clave coincida con el nombre de la variable original.
 * @param {string} filename - Nombre del archivo sin extensión (ej: 'asiento_detalle')
 * @returns {string} Nombre del modelo en formato PascalCase
 */
const formatModelName = (filename) => {
    
    // Dividir por guiones bajos
    const parts = filename.split('_'); 
    
    // Capitalizar la primera letra de cada parte
    const capitalizedParts = parts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
    );
    
    // Unir las partes con guion bajo
    return capitalizedParts.join('_'); // Ejemplo: 'Asiento_Detalle'
};

module.exports = {
    cargarModelos
};