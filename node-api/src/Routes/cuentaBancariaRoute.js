const express = require('express');
const router = express.Router();
const cuentaBancariaController = require('../Controller/cuentaBancariaController');

// Rutas

// Cuentas bancarias por aprobar
router.get('/Buscar/PorAprobar', cuentaBancariaController.buscarCuentasPorAprobar);  

// Cuentas bancarias aprobadas
router.get('/Buscar/Aprobadas', cuentaBancariaController.buscarCuentasAprobadas);  

// Cuentas bancarias aprobadas de un titular
router.get('/Buscar/Aprobadas/Titular/:id', cuentaBancariaController.obtenerCuentasBancariasDeTitular);  

// Cuentas bancarias según un rol
router.get('/Buscar/PorRoL', cuentaBancariaController.obtenerCuentasBancariasPorRol);  

// Cuentas bancarias según un rol (solo los ids)
router.get('/Buscar/IdsPorRoL', cuentaBancariaController.obtenerIdsCuentasBancariasPorRol);  

router.get('/:id', cuentaBancariaController.obtenerCuentaBancariaPorId);

router.post('/CrearCuentaBancaria', cuentaBancariaController.crearCuentaBancaria);   

router.post('/ComprobarExistencia', cuentaBancariaController.comprobarCuentaBancariaExistente);

router.put('/CambiarEstado/:id', cuentaBancariaController.cambiarEstadoCuentaBancaria);


// Aprobar y eliminar cuenta
router.put('/Aprobar', cuentaBancariaController.aprobarCuentaBancaria);

router.delete('/Eliminar', cuentaBancariaController.eliminarCuentaBancaria);


module.exports = router;