const express = require('express');
const router = express.Router();
const cuentaBancariaController = require('../Controller/cuentaBancariaController');

// Rutas

router.get('/ContarPorEntidad', cuentaBancariaController.ContarPorEntidad);  

router.get('/Buscar/PorAprobar', cuentaBancariaController.buscarCuentasPorAprobar);  

router.get('/Buscar/Aprobadas', cuentaBancariaController.buscarCuentasAprobadas);  

router.get('/:id', cuentaBancariaController.obtenerCuentaBancariaPorId);

router.post('/CrearCuentaBancaria', cuentaBancariaController.crearCuentaBancaria);   

router.post('/AsociarCuenta', cuentaBancariaController.crearCuentaBancaria);   

router.post('/ComprobarExistencia', cuentaBancariaController.comprobarCuentaBancariaExistente);

router.put('/CambiarEstado/:id', cuentaBancariaController.cambiarEstadoCuentaBancaria);


// Aprobar y eliminar cuenta
router.put('/Aprobar', cuentaBancariaController.aprobarCuentaBancaria);

router.delete('/Eliminar', cuentaBancariaController.eliminarCuentaBancaria);


module.exports = router;