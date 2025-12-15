const express = require('express');
const router = express.Router();
const divisaController = require('../Controller/divisaController');

// Rutas
router.get('/ObtenerDivisas', divisaController.obtenerDivisas);  

module.exports = router;