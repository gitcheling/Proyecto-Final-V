const express = require('express');
const router = express.Router();
const inscripcionController = require('../Controller/inscripcionController');

// Rutas

router.get('/Buscar', inscripcionController.buscarInscripciones);  

router.get('/ContarInscripciones', inscripcionController.contarInscripciones);  

router.get('/ContarEstados', inscripcionController.obtenerEstadosTotales);  

router.get('/:id', inscripcionController.obtenerInscripcionPorId);

router.post('/CrearInscripcion', inscripcionController.crearInscripcion);     
        
router.put('/Modificar/:id', inscripcionController.actualizarInscripcion);    

module.exports = router;