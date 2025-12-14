const express = require('express');
const router = express.Router();
const EstadoGrupoController = require('../Controller/estadoGrupoController');

// Rutas
router.get('/ObtenerEstadosGrupo', EstadoGrupoController.obtenerEstadosGrupo);  

module.exports = router;