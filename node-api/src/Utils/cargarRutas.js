const fs = require('fs');
const path = require('path');
const express = require('express');

/**
 * Carga dinámicamente todos los archivos de ruta de un directorio y los aplica 
 * a la instancia principal de Express.
 * * @param {express.Application} app - La instancia de la aplicación Express.
 * @param {string} rutaRaiz - El prefijo de ruta general (ej: '/api/v1').
 * @param {string} directorioRutas - La ruta absoluta a la carpeta de Routes.
 */
function cargarRutas(app, rutaRaiz, directorioRutas) {
    
    // Leer todos los archivos en el directorio de rutas
    const archivos = fs.readdirSync(directorioRutas);

    archivos.forEach(archivo => {
        // Asegurarse de que solo procesamos archivos JavaScript (que son rutas)
        if (archivo.endsWith('Route.js')) {
            
            // Excluir cualquier archivo que no sea una ruta específica (ej: index.js de rutas)
            if (archivo === 'index.js') { 
                return;
            }

            // 1. Obtener la ruta completa del archivo de ruta
            const rutaCompleta = path.join(directorioRutas, archivo);
            
            // 2. Importar el módulo de ruta (el router de Express)
            const router = require(rutaCompleta);
            
            // 3. Crear el path URL basado en el nombre del archivo (ej: estudianteRoute.js -> /Estudiantes)
            // Remover 'Route.js' y capitalizar la primera letra (o usar el nombre exacto que necesites)
            const nombreBase = archivo.replace('Route.js', '');
            
            // Convertir a formato PascalCase (o el deseado) para la URL
            const nombreRuta = nombreBase.charAt(0).toUpperCase() + nombreBase.slice(1);
            
            // 4. Registrar la ruta en la aplicación Express
            const pathUrl = `${rutaRaiz}/${nombreRuta}`; // Agregamos 's' para pluralizar
            
            app.use(pathUrl, router);
            console.log(`[Ruta] Montada: ${pathUrl}`);

        }
    });
}

module.exports = {
    cargarRutas
};