const express = require('express');
const router = express.Router();
const estudianteController = require('../Controller/estudianteController');

// Rutas

router.get('/Buscar', estudianteController.buscarEstudiantes);  

router.get('/:id', estudianteController.obtenerEstudiantePorId);

router.post('/CrearEstudiante', estudianteController.crearEstudiante);     
        
router.put('/CambiarEstado/:id', estudianteController.cambiarEstadoEstudiante);

module.exports = router;