const express = require('express');
const router = express.Router();
const cuentaController = require('../Controller/cuentaController');

// Rutas
// No se usa de momento
router.get('/', cuentaController.obtenerCuentas);  
router.get('/Buscar', cuentaController.buscarCuentas);         
router.get('/:id', cuentaController.obtenerCuentaPorId);


router.post('/ComprobarCuenta', cuentaController.comprobarCuentaExistente);
router.post('/CrearCuenta', cuentaController.crearCuenta);     
        
router.put('/Modificar/:id', cuentaController.actualizarCuenta);      
router.put('/CambiarEstado/:id', cuentaController.cambiarEstadoCuenta);

module.exports = router;