const express = require('express');
const router = express.Router();
const ModalidadClaseController = require('../Controller/modalidadClaseController');

// Rutas
router.get('/ObtenerModalidades', ModalidadClaseController.obtenerModalidadesClase);  

module.exports = router;