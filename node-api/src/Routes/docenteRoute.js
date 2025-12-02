const express = require('express');
const router = express.Router();
const docenteController = require('../Controller/docenteController');

// Rutas

router.get('/Buscar', docenteController.buscarDocentes);  

router.get('/ObtenerEstadosDocente', docenteController.obtenerEstadosDocente);  

router.get('/:id', docenteController.obtenerDocentePorId);

router.post('/CrearDocente', docenteController.crearDocente);     
        
// router.put('/Modificar/:id', docenteController.cambiarEstadoEstudiante);

module.exports = router;