const express = require('express');
const router = express.Router();
const entidadCuentaAsociacionController = require('../Controller/entidadCuentaAsociacionController');

// Rutas

router.get('/ContarPorEntidad', entidadCuentaAsociacionController.ContarPorEntidad);  

router.get('/ObtenerEntidadesAsociadas/:id', entidadCuentaAsociacionController.obtenerEntidadesAsociadas);  

router.post('/AsociarCuenta', entidadCuentaAsociacionController.asociarCuentasBancarias);   

router.put('/CambiarEstado/:id', entidadCuentaAsociacionController.cambiarEstadoAsociacion);


module.exports = router;