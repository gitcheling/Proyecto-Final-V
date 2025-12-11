const express = require('express');
const router = express.Router();
const entidadController = require('../Controller/entidadController');

// Rutas

router.get('/Buscar', entidadController.buscarEntidades);  

router.get('/ContarEntidades', entidadController.contarEntidades);  

router.get('/ContarEstados', entidadController.obtenerEstadosTotales);  

router.get('/BuscarPrefijos/:id', entidadController.obtenerPrefijos);   

router.get('/:id', entidadController.obtenerEntidadPorId);

router.post('/ComprobarEntidad', entidadController.comprobarEntidadExistente);

router.post('/CrearEntidad', entidadController.crearEntidad);     
        
router.put('/Modificar/:id', entidadController.actualizarEntidad);    

router.put('/CambiarEstado/:id', entidadController.cambiarEstadoEntidad);

module.exports = router;