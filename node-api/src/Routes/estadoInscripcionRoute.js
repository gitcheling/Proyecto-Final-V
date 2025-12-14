const express = require('express');
const router = express.Router();
const EstadoInscripcionController = require('../Controller/estadoInscripcionController');

// Rutas
router.get('/ObtenerEstadosInscripcion', EstadoInscripcionController.obtenerEstadosInscripcion);  

module.exports = router;