/**
 * Generador de Códigos de Barras EAN-13
 * =======================================
 * 
 * Genera códigos de barras válidos para productos sin código del fabricante.
 * Los códigos generados pueden ser leídos por el escáner de código de barras.
 */

/**
 * Calcular dígito verificador para EAN-13
 * @param {string} code - Los primeros 12 dígitos
 * @returns {number} - Dígito verificador (0-9)
 */
export function calculateEAN13CheckDigit(code: string): number {
  if (code.length !== 12) {
    throw new Error("El código debe tener 12 dígitos");
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i]);
    // Posiciones impares (0, 2, 4...) se multiplican por 1
    // Posiciones pares (1, 3, 5...) se multiplican por 3
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Generar código EAN-13 válido
 * @param {string} prefix - Prefijo de 2-3 dígitos (ej: "750" para México)
 * @param {number} productCode - Código de producto de 9-10 dígitos
 * @returns {string} - Código EAN-13 completo de 13 dígitos
 */
export function generateEAN13(prefix: string = "750", productCode: number): string {
  // Asegurar que el prefix tenga 3 dígitos
  const prefixPadded = prefix.padStart(3, "0").substring(0, 3);
  
  // Convertir productCode a string y rellenar a 9 dígitos
  const productCodeStr = productCode.toString().padStart(9, "0");
  
  // Combinar prefix + productCode (12 dígitos)
  const code12 = prefixPadded + productCodeStr;
  
  // Calcular dígito verificador
  const checkDigit = calculateEAN13CheckDigit(code12);
  
  // Retornar código completo de 13 dígitos
  return code12 + checkDigit;
}

/**
 * Generar código EAN-13 desde un string (nombre de producto)
 * @param {string} productName - Nombre del producto
 * @returns {string} - Código EAN-13 único basado en el nombre
 */
export function generateEAN13FromName(productName: string): string {
  // Crear hash simple del nombre
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    const char = productName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }
  
  // Usar hash como base para el código de producto
  // Tomar valor absoluto y asegurar que sea positivo
  const productCode = Math.abs(hash) % 1000000000; // Máximo 9 dígitos
  
  // Generar EAN-13 con prefijo mexicano (750)
  return generateEAN13("750", productCode);
}

/**
 * Validar código EAN-13
 * @param {string} ean - Código de 13 dígitos
 * @returns {boolean} - True si es válido
 */
export function validateEAN13(ean: string | undefined | null): boolean {
  if (!ean || typeof ean !== 'string' || ean.length !== 13) {
    return false;
  }

  const checkDigit = parseInt(ean[12]);
  const calculatedCheckDigit = calculateEAN13CheckDigit(ean.substring(0, 12));

  return checkDigit === calculatedCheckDigit;
}

/**
 * Formatear código EAN-13 para visualización
 * @param {string} ean - Código de 13 dígitos
 * @returns {string} - Código formateado (ej: "750-123456-0010-5")
 */
export function formatEAN13(ean: string): string {
  if (ean.length !== 13) {
    return ean;
  }
  
  // Formato: PPP-PPPPPP-PPPP-D
  // Prefijo - Producto - Dígito verificador
  return `${ean.substring(0, 3)}-${ean.substring(3, 9)}-${ean.substring(9, 12)}-${ean[12]}`;
}
