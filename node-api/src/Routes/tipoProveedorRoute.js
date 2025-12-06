const express = require('express');
const router = express.Router();
const TipoProveedorController = require('../Controller/tipoProveedorController');

// Rutas
router.get('/ObtenerTiposProveedor', TipoProveedorController.obtenerTiposProveedor);  

module.exports = router;