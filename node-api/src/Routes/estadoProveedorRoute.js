const express = require('express');
const router = express.Router();
const EstadoProveedorController = require('../Controller/estadoProveedorController');

// Rutas
router.get('/ObtenerEstadosProveedor', EstadoProveedorController.obtenerEstadosProveedor);  

module.exports = router;