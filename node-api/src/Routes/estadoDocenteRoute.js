const express = require('express');
const router = express.Router();
const EstadoDocenteController = require('../Controller/estadoDocenteController');

// Rutas
router.get('/ObtenerEstadosDocente', EstadoDocenteController.obtenerEstadosDocente);  

module.exports = router;