// Esta función hace que la primera letra de una cadena de texto se coloque en mayúscula
exports.capitalizeFirstLetter =  (str)=> {
    if (!str) return ''; // Manejar nulos o vacíos

    const lowerCaseStr = String(str).toLowerCase();
    
    // 1. Tomar el primer carácter y ponerlo en mayúscula.
    // 2. Concatenar el resto de la cadena (desde la posición 1)
    return lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);
}


