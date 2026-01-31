// src/utils/validations.js
/**
 * Conjunto de funciones de validación para formularios
 * Anti-hacking y validaciones robustas
 */

// ========================
// VALIDACIONES DE TEXTO
// ========================

/**
 * Valida que sea solo letras y espacios
 */
export const validarSoloLetras = (valor) => {
  if (!valor) return true; // Campo vacío es válido (validar requerido aparte)
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return regex.test(valor);
};

/**
 * Valida que sea solo números
 */
export const validarSoloNumeros = (valor) => {
  if (!valor) return true;
  const regex = /^[0-9]+$/;
  return regex.test(valor);
};

/**
 * Valida código de tachos (letras, números y algunos signos)
 */
export const validarCodigoTacho = (valor) => {
  if (!valor) return true;
  // Permite letras, números, guiones, guiones bajos
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(valor);
};

/**
 * Valida teléfono (exactamente 10 dígitos)
 */
export const validarTelefono = (valor) => {
  if (!valor) return true;
  const regex = /^[0-9]{10}$/;
  return regex.test(valor);
};

/**
 * Valida email con regex robusta
 */
export const validarEmail = (valor) => {
  if (!valor) return true;
  // Regex para validar emails
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Validación adicional: no más de 254 caracteres
  if (valor.length > 254) return false;
  return regex.test(valor);
};

/**
 * Valida contraseña (mínimo 8 caracteres, mayúscula, minúscula, número)
 */
export const validarContrasena = (valor) => {
  if (!valor) return true;
  
  // Mínimo 8 caracteres
  if (valor.length < 8) return false;
  
  // Al menos una mayúscula
  if (!/[A-Z]/.test(valor)) return false;
  
  // Al menos una minúscula
  if (!/[a-z]/.test(valor)) return false;
  
  // Al menos un número
  if (!/[0-9]/.test(valor)) return false;
  
  // No caracteres especiales peligrosos
  if (/[<>'"]/g.test(valor)) return false;
  
  return true;
};

/**
 * Valida que no sea muy corto (anti-hacking)
 */
export const validarLongitudMinima = (valor, minimo = 2) => {
  if (!valor) return true;
  return valor.trim().length >= minimo;
};

/**
 * Valida que no sea muy largo (anti-hacking, inyección SQL)
 */
export const validarLongitudMaxima = (valor, maximo = 255) => {
  if (!valor) return true;
  return valor.length <= maximo;
};

/**
 * Valida que no contenga caracteres peligrosos (SQL Injection, XSS)
 */
export const validarCaracteresPeligrosos = (valor) => {
  if (!valor) return true;
  
  // Caracteres peligrosos para SQL Injection y XSS
  const caracteresProhibidos = [
    '<', '>', '"', "'", ';', '--', '/*', '*/', 
    'DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT',
    'exec', 'execute', 'script', 'onclick', 'onerror'
  ];
  
  const textoMinuscula = valor.toLowerCase();
  
  return !caracteresProhibidos.some(caracter => 
    textoMinuscula.includes(caracter.toLowerCase())
  );
};

/**
 * Valida URL (si es necesario)
 */
export const validarURL = (valor) => {
  if (!valor) return true;
  try {
    new URL(valor);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Sanitiza entrada (elimina caracteres peligrosos)
 */
export const sanitizarEntrada = (valor) => {
  if (!valor) return '';
  
  let sanitizado = valor.toString();
  
  // Eliminar caracteres de control
  sanitizado = sanitizado.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Escapar caracteres HTML
  const elementoTemp = document.createElement('div');
  elementoTemp.textContent = sanitizado;
  sanitizado = elementoTemp.innerHTML;
  
  // Eliminar espacios múltiples
  sanitizado = sanitizado.replace(/\s+/g, ' ').trim();
  
  return sanitizado;
};

/**
 * Capitaliza primera letra, resto minúscula (para ubicaciones)
 */
export const capitalizarPrimerLetra = (valor) => {
  if (!valor) return '';
  return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
};

/**
 * Objeto de mensajes de error
 */
export const MENSAJES_ERROR = {
  SOLO_LETRAS: 'Solo se permiten letras y espacios',
  SOLO_NUMEROS: 'Solo se permiten números',
  SOLO_10_DIGITOS: 'El teléfono debe tener exactamente 10 dígitos',
  EMAIL_INVALIDO: 'Email inválido',
  CONTRASENA_DEBIL: 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula y número',
  MUY_CORTO: 'El campo es muy corto',
  MUY_LARGO: 'El campo excede la longitud máxima',
  CARACTERES_PELIGROSOS: 'El campo contiene caracteres no permitidos',
  URL_INVALIDA: 'URL inválida',
  CAMPO_REQUERIDO: 'Este campo es requerido',
  CODIGO_TACHO_INVALIDO: 'Solo se permiten letras, números, guiones y guiones bajos',
};

/**
 * Validador completo para un campo
 */
export const validarCampo = (valor, tipo, opciones = {}) => {
  const { requerido = false, minimo = 2, maximo = 255 } = opciones;
  
  // Validar requerido
  if (requerido && (!valor || valor.trim().length === 0)) {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }
  
  if (!valor || valor.trim().length === 0) {
    return { valido: true, error: null };
  }
  
  // Validar caracteres peligrosos
  if (!validarCaracteresPeligrosos(valor)) {
    return { valido: false, error: MENSAJES_ERROR.CARACTERES_PELIGROSOS };
  }
  
  // Validar longitud
  if (!validarLongitudMinima(valor, minimo)) {
    return { valido: false, error: MENSAJES_ERROR.MUY_CORTO };
  }
  
  if (!validarLongitudMaxima(valor, maximo)) {
    return { valido: false, error: MENSAJES_ERROR.MUY_LARGO };
  }
  
  // Validaciones específicas por tipo
  switch (tipo) {
    case 'nombre':
    case 'apellido':
    case 'ciudad':
    case 'provincia':
      if (!validarSoloLetras(valor)) {
        return { valido: false, error: MENSAJES_ERROR.SOLO_LETRAS };
      }
      break;
      
    case 'numero':
      if (!validarSoloNumeros(valor)) {
        return { valido: false, error: MENSAJES_ERROR.SOLO_NUMEROS };
      }
      break;
      
    case 'telefono':
      if (!validarTelefono(valor)) {
        return { valido: false, error: MENSAJES_ERROR.SOLO_10_DIGITOS };
      }
      break;
      
    case 'email':
      if (!validarEmail(valor)) {
        return { valido: false, error: MENSAJES_ERROR.EMAIL_INVALIDO };
      }
      break;
      
    case 'contrasena':
      if (!validarContrasena(valor)) {
        return { valido: false, error: MENSAJES_ERROR.CONTRASENA_DEBIL };
      }
      break;
      
    case 'codigo_tacho':
      if (!validarCodigoTacho(valor)) {
        return { valido: false, error: MENSAJES_ERROR.CODIGO_TACHO_INVALIDO };
      }
      break;
      
    case 'url':
      if (!validarURL(valor)) {
        return { valido: false, error: MENSAJES_ERROR.URL_INVALIDA };
      }
      break;
      
    default:
      break;
  }
  
  return { valido: true, error: null };
};
