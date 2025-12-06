const express = require('express');
const router = express.Router();
const docenteController = require('../Controller/docenteController');

// Rutas

router.get('/Buscar', docenteController.buscarDocentes);  

router.get('/:id', docenteController.obtenerDocentePorId);

router.post('/CrearDocente', docenteController.crearDocente);  

router.put('/CambiarEstado/:id', docenteController.cambiarEstadoDocente);


module.exports = router;