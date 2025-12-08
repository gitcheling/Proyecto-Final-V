const express = require('express');
const router = express.Router();
const categoriaCursoController = require('../Controller/categoriaCursoController');

// Rutas

router.get('/BuscarCategorias', categoriaCursoController.buscarCategorias);

module.exports = router;