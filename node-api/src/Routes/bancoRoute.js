const express = require('express');
const router = express.Router();
const bancoController = require('../Controller/bancoController');

// Rutas

router.get('/Buscar', bancoController.obtenerBancos);   

module.exports = router;