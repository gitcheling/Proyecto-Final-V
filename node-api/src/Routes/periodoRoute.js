const express = require('express');
const router = express.Router();
const periodoController = require('../Controller/periodoController');

// Rutas

router.get('/Buscar', periodoController.buscarPeriodos);  

router.get('/:id', periodoController.obtenerPeriodoPorId);

router.post('/CrearPeriodo', periodoController.crearPeriodo);     
        
router.put('/Modificar/:id', periodoController.actualizarPeriodo);    


module.exports = router;