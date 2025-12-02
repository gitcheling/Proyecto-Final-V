const express = require('express');
const router = express.Router();
const EstadoAcademicoController = require('../Controller/estadoAcademicoController');

// Rutas
router.get('/ObtenerEstadosAcademicos', EstadoAcademicoController.obtenerEstadosAcademicos);  

module.exports = router;