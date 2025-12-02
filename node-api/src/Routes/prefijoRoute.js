const express = require('express');
const router = express.Router();
const prefijosController = require('../Controller/prefijoController');

// Rutas

router.get('/BuscarPrefijos/:id', prefijosController.obtenerPrefijos);   

module.exports = router;