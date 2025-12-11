// Esta función hace que la primera letra de una cadena de texto se coloque en mayúscula
exports.capitalizeFirstLetter =  (str)=> {
    if (!str) return ''; // Manejar nulos o vacíos

    const lowerCaseStr = String(str).toLowerCase();
    
    // 1. Tomar el primer carácter y ponerlo en mayúscula.
    // 2. Concatenar el resto de la cadena (desde la posición 1)
    return lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);
}


/**
 * Traduce el nombre completo del mes de inglés a español.
 * Asume que el formato de entrada es "Month YYYY" (Ej: "November 2025").
 * @param {string} mesAnio Cadena de mes y año en inglés.
 * @returns {string} Cadena de mes y año en español.
 */
exports.traducirMes = (mesAnio) =>{

    if (!mesAnio) return mesAnio;

    // Mapa de traducción de mes completo
    const mapaMeses = {
        'January': 'Enero',
        'February': 'Febrero',
        'March': 'Marzo',
        'April': 'Abril',
        'May': 'Mayo',
        'June': 'Junio',
        'July': 'Julio',
        'August': 'Agosto',
        'September': 'Septiembre',
        'October': 'Octubre',
        'November': 'Noviembre',
        'December': 'Diciembre'
    };

    // Separamos el mes del resto de la cadena (el año)
    const partes = mesAnio.trim().split(' ');

    // Tomamos el primer elemento (el nombre del mes en inglés)
    const mesIngles = partes[0]; 

    // Si la traducción existe, reemplazamos el nombre
    if (mapaMeses[mesIngles]) {
        // Reconstruimos la cadena con el mes traducido
        partes[0] = mapaMeses[mesIngles];

        const resultadoLimpio = partes.join(' ');

        // Limpiamos espacios duplicados (uno o más espacios reemplazados por uno solo, ya que entre el mes y el año salían dos espacios)
        return resultadoLimpio.replace(/\s+/g, ' ').trim();
    }

    // Si no se encuentra (o no es un formato esperado), se devuelve el original
    return mesAnio;
}


