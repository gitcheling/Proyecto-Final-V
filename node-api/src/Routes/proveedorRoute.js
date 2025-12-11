const express = require('express');
const router = express.Router();
const proveedorController = require('../Controller/proveedorController');

// Rutas

router.get('/Buscar', proveedorController.buscarProveedores);  

router.get('/ContarProveedores', proveedorController.contarProveedores);  

router.get('/ContarEstados', proveedorController.obtenerEstadosTotales);  

router.get('/:id', proveedorController.obtenerProveedorPorId);

router.post('/CrearProveedor', proveedorController.crearProveedor);     
        
router.put('/Modificar/:id', proveedorController.modificarProveedor);

module.exports = router;