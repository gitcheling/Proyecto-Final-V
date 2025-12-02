const express = require('express');
const router = express.Router();
const estadosCuentaBancariaController = require('../Controller/estadoCuentaBancariaController');

// Rutas
router.get('/Buscar', estadosCuentaBancariaController.obtenerEstadosCuentaBancaria);   

module.exports = router;