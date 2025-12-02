/**
 * Valida si existe un elemento (al recibir datos de formularios es fundamental)
 * @param {string} valor - El valor a validar.
 * @param {string} error - El error que se lanzará si no se cumple la validación
 */
const validarExistencia = (valor, campo, lanzarError) => {
    
    // 1. Verificar si el valor es null o undefined
    // (Estos son los únicos "falsy" que siempre queremos excluir, 
    // aparte de las cadenas vacías/con espacios)
    if (valor === null || typeof valor === 'undefined') {

        if(lanzarError){throw new Error(`El campo '${campo}', es obligatorio`);}
        else{return false;}

    }

    // 2. Verificar si es una cadena de texto
    if (typeof valor === 'string' && valor.trim().length === 0) {

        if(lanzarError){throw new Error(`El campo '${campo}', es obligatorio`);}
        else{return false;}
    }

    return true;

};


/**
 * Valida si un id es un número entero mayor a cero
 * @param {int} id - El id a validar.
 * @param {string} error - El error que se lanzará si no se cumple la validación
 */
const validarIdNumerico = (id, error) => {
    validarSoloNumeros(id, error);
    const idNumerico = parseInt(id, 10);
    if (isNaN(idNumerico) || idNumerico <= 0) {
        throw new Error(error);
    }
    return idNumerico;
};


/**
 * Valida si una cadena solo contiene texto (letras, espacios, tildes).
 * @param {string} nombre - El nombre a validar
 * @param {string} error - El error que se lanzará si no se cumple la validación
 */
const validarSoloTexto = (texto, error) => {

    // Verificar si la cadena contiene CUALQUIER dígito (0-9).
    if (/\d/.test(texto)) {
        throw new Error(error);
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(texto)) {
        throw new Error(error);
    }
    return true;
};


/**
 * Valida si una cadena solo contiene texto (letras, espacios, tildes, barra inclinada, guión y guión bajo).
 * @param {string} nombre - El nombre a validar
 * @param {string} error - El error que se lanzará si no se cumple la validación
 */
const validarSoloTextoPermisivo = (texto, error) => {

    // 1. Verificar si la cadena contiene CUALQUIER dígito (0-9).
    if (/\d/.test(texto)) {
        throw new Error(error);
    }
    
    // 2. Si no contiene dígitos, verificar que solo contenga los caracteres permitidos
    // Este RegEx ya no necesita verificar dígitos, solo caracteres especiales.
    // Usamos el RegEx anterior para asegurar que solo se usan los caracteres que quieres:
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s/\-_]+$/.test(texto)) {
         throw new Error(error);
    }
    return true;
};


/**
 * Valida si una cadena solo contiene números
 * @param {string} numeros - Los números a validar
 * @param {string} error - El error que se lanzará si no se cumple la validación
 */
const validarSoloNumeros = (numeros, error) => {
    // [0-9] coincide con cualquier dígito.
    if (!/^[0-9]+$/.test(numeros)) {
        throw new Error(error);
    }
    return true;
};


/**
 * Valida si una cadena solo contiene números o guión
 * @param {string} numeros - Los números a validar
 * @param {string} error - El error que se lanzará si no se cumple la validación
 */
const validarSoloNumerosYGuion = (numeros, error) => {
    // [0-9] coincide con cualquier dígito.
    if (!/^[0-9-]+$/.test(numeros)) {
        throw new Error(error);
    }
    return true;
};


/**
 * Valida si una elemento es un booleano
 * @param {bool} booleano - El booleano a validar
 * @param {string} error - El error que se lanzará si no se cumple la validación
 */
const validarBooleano = (valor, error) => {

    booleano = valor;

    // Se maneja el caso de string (es decir, si se mandó una cadena de texto se convierte a bool)
    if (typeof valor === 'string') {

        // Se pone todo en minúscula y se quitan espacios en blanco que pudieran haber al inicio y al final de la cadena
        const lowerCaseValue = valor.toLowerCase().trim();
        
        if (lowerCaseValue === 'true') {
            booleano = true; // Convertir la cadena 'true' al booleano true
        } else if (lowerCaseValue === 'false') {
            booleano = false; // Convertir la cadena 'false' al booleano false
        }

        // Si no es ni "true" ni "false", el texto se deja igual, de todas formas no pasará la validación si es así

    }

    if (typeof booleano !== 'boolean') {
        throw new Error(error);
    }
    return true;
};



/**
 * Valida y parsea una cadena de fecha, aceptando formatos YYYY-MM-DD o ISO completo.
 * @param {string} dateString - La cadena de fecha a validar.
 * @returns {Date|null} Un objeto Date válido si el formato y la fecha son correctos, o null si falla.
 */
const parseAndValidateDate = (dateString) => {

    if (!dateString) return null;

    // Limpieza y Validación:
    const codigoLimpio = String(dateString).trim();

    // Si después de limpiar quedó vacío, se salta el filtro.
    if (!codigoLimpio) {

        return null;
    } 

    // Patrón 1: YYYY-MM-DD (Fecha simple, sin hora)
    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/; 

    // Patrón 2: YYYY-MM-DDTHH:mm:ssZ (ISO 8601 completo, acepta variaciones de milisegundos y Z/+-hh:mm)
    // Este patrón es más complejo debido a las variaciones de zona horaria, pero se enfoca en el formato ISO.
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|([+-]\d{2}:\d{2}))?$/;

    // --- 1. Verificación de Formato ---
    if (!dateOnlyRegex.test(dateString) && !isoRegex.test(dateString)) {
        throw new Error(`ERROR de formato: Se esperaba YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ. Recibido: ${dateString}`); 
    }
    
    // Decimos que la fecha final es la traída (siempre y cuando venga con fecha y hora)
    let finalDateString = dateString;

    // Si es solo fecha sin hora pasa por aquí
    if (dateOnlyRegex.test(dateString)) {
        // Al añadir 'T00:00:00.000Z', forzamos a new Date() a interpretar la fecha como UTC,
        finalDateString = `${dateString}T00:00:00.000Z`;
    }

    // --- 3. Creación y Validación de Validez ---
    const date = new Date(finalDateString); // Usa la cadena neutralizada

    // Usamos isNaN(date.getTime()) para verificar si el objeto Date es "Invalid Date"
    if (isNaN(date.getTime())) {
        // En este punto, solo debería fallar por fechas inválidas (ej. 2025-02-30)
        console.error(`ERROR de validez: La fecha es inválida (ej. día 32). Recibido: ${dateString}`);
        throw new Error(`La fecha proporcionada "${dateString}" es inválida.`);
    }
    
    // Devuelve el objeto Date, que ahora es consistentemente UTC.
    return date;

};



/**
 * Valida si la longitud de una cadena está dentro de un rango especificado.
 *
 * @param {string} cadena - La cadena a validar.
 * @param {number} min - La longitud mínima requerida (inclusive).
 * @param {number} max - La longitud máxima permitida (inclusive).
 * @returns {boolean} - true si la longitud de la cadena es >= min y <= max, de lo contrario, false.
 */
const validarLongitudCadena = (cadena, min, max, error) =>  {
  if (typeof cadena !== 'string') {
    // Manejar el caso de que no sea una cadena si es necesario
    return false;
  }

  const longitud = cadena.length;

  // Comprueba si la longitud está entre min y max, ambos inclusive
  if(!(longitud >= min && longitud <= max)){
    throw new Error(error); 
  }
}
       

/**
 * Valida si una cadena cumple con el formato básico de un correo electrónico.
 *
 * @param {string} email - La cadena de texto a validar.
 * @returns {boolean} - true si el formato es válido, de lo contrario, false.
 */
const validarEmail = (email, error) => {
  // Expresión regular estándar para la mayoría de los casos de uso
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if(!re.test(String(email).toLowerCase())){
    throw new Error(error); 
  }
}


/**
 * Valida si una cadena es un número de teléfono de 11 dígitos (formato local de Venezuela).
 *
 * @param {string} telefono - La cadena de texto a validar.
 * @returns {boolean} - true si es un número de 11 dígitos exactos, de lo contrario, false.
 */
const validarTelefonoVenezolano = (telefono, error) => {
  // Expresión regular: ^\d{11}$
  // ^       -> Inicio de la cadena
  // \d{11}  -> Exactamente 11 dígitos (0-9)
  // $       -> Fin de la cadena
  const re = /^\d{11}$/;
  
  if(!re.test(String(telefono).toLowerCase())){
    throw new Error(error); 
  }

}





exports.validarExistencia = validarExistencia;
exports.validarIdNumerico = validarIdNumerico;
exports.validarSoloNumeros = validarSoloNumeros;
exports.validarSoloTexto = validarSoloTexto;
exports.validarSoloTextoPermisivo = validarSoloTextoPermisivo;
exports.validarSoloNumerosYGuion = validarSoloNumerosYGuion;
exports.validarBooleano = validarBooleano;
exports.parseAndValidateDate = parseAndValidateDate;
exports.validarLongitudCadena = validarLongitudCadena;
exports.validarEmail = validarEmail;
exports.validarTelefonoVenezolano = validarTelefonoVenezolano;

