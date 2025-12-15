const express = require('express');
const router = express.Router();
const obligacionFinancieraController = require('../Controller/obligacionFinancieraController');

// Rutas

router.get('/Buscar', obligacionFinancieraController.buscarObligaciones);  

//router.get('/ContarInscripciones', obligacionFinancieraController.contarInscripciones);  

//router.get('/ContarEstados', obligacionFinancieraController.obtenerEstadosTotales);  

router.get('/:id', obligacionFinancieraController.obtenerObligacionPorId);

router.post('/CrearObligacionFinanciera', obligacionFinancieraController.crearObligacionFinanciera);     
        
router.put('/Modificar/:id', obligacionFinancieraController.actualizarObligacionFinanciera);    

module.exports = router;