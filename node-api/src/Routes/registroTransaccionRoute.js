const express = require('express');
const router = express.Router();
const registroTransaccionController = require('../Controller/registroTransaccionController');

// Rutas

router.get('/Buscar', registroTransaccionController.buscarTransacciones);  

//router.get('/ContarInscripciones', registroTransaccionController.contarInscripciones);  

//router.get('/ContarEstados', registroTransaccionController.obtenerEstadosTotales);  

router.get('/:id', registroTransaccionController.obtenerTransaccionPorId);

router.post('/CrearTransaccion', registroTransaccionController.crearTransaccionFinanciera);     
        
//router.put('/Modificar/:id', registroTransaccionController.actualizarObligacionFinanciera);    

module.exports = router;