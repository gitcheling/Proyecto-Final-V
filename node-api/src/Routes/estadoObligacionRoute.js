const express = require('express');
const router = express.Router();
const EstadoObligacionController = require('../Controller/estadoObligacionController');

// Rutas
router.get('/ObtenerEstadosObligacion', EstadoObligacionController.obtenerEstadosObligacion);  

module.exports = router;