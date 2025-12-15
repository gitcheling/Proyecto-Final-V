const express = require('express');
const router = express.Router();
const conceptoFinancieroController = require('../Controller/conceptoFinancieroController');

// Rutas

router.get('/BuscarConceptosFinancieros', conceptoFinancieroController.buscarConceptos);

module.exports = router;