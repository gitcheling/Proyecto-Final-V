const express = require('express');
const router = express.Router();
const tipoComprobanteController = require('../Controller/tipoComprobanteController');

// Rutas
router.get('/ObtenerTiposComprobante', tipoComprobanteController.obtenerTiposComprobante);  

module.exports = router;