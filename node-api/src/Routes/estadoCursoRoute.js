const express = require('express');
const router = express.Router();
const EstadoCursoController = require('../Controller/estadoCursoController');

// Rutas
router.get('/ObtenerEstadosCurso', EstadoCursoController.obtenerEstadosCurso);  

module.exports = router;