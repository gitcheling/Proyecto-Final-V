const express = require('express');
const router = express.Router();
const grupoController = require('../Controller/grupoController');

// Rutas

router.get('/Buscar', grupoController.buscargrupos);  

router.get('/ContarGrupos', grupoController.contarGrupos);  

router.get('/ContarEstados', grupoController.obtenerEstadosTotales);  

router.get('/:id', grupoController.obtenerGrupoPorId);

router.post('/CrearGrupo', grupoController.crearGrupo);     
        
router.put('/Modificar/:id', grupoController.actualizarGrupo);    

module.exports = router;