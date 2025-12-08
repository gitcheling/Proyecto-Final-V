const express = require('express');
const router = express.Router();
const cursoController = require('../Controller/cursoController');

// Rutas

router.get('/Buscar', cursoController.buscarCursos);  

router.get('/:id', cursoController.obtenerCursoPorId);

router.post('/CrearCurso', cursoController.crearCurso);     
        
router.put('/Modificar/:id', cursoController.actualizarCurso);    



module.exports = router;