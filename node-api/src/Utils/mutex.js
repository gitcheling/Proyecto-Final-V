const { Mutex } = require('async-mutex');

// Se crea una instancia (un mutex) y se guarda en la variable (se usará para crear estudiantes, si se necesita otro mutex se puede crear)
const crearEstudianteMutex = new Mutex();

// Se exporta
module.exports = {
    crearEstudianteMutex
};