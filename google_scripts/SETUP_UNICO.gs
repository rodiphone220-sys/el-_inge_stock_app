/**
 * ============================================================================
 * EL INGE POS AI - SETUP COMPLETO (1-CLICK SETUP)
 * ============================================================================
 *
 * Este script crea TODAS las hojas del Google Sheet y las pobla con datos iniciales.
 *
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc
 * 2. Extensiones > Apps Script
 * 3. Pega este código completo (SOLO si NO tienes Code.gs)
 * 4. Guarda y ejecuta la función "runCompleteSetup()"
 * 5. ¡Listo! Tendrás todas las hojas creadas y pobladas.
 *
 * Spreadsheet ID: 13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc
 * Drive Folder: 1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ
 *
 * NOTA: Si ya tienes Code.gs en este proyecto, las constantes se comparten automáticamente.
 */

// ==================== CONFIGURACIÓN ====================
// Las constantes SPREADSHEET_ID y MAIN_DRIVE_FOLDER_ID ya están en Code.gs
// Si usas este archivo SOLO, descomenta las siguientes líneas:

// const SPREADSHEET_ID = "13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc";
// const MAIN_DRIVE_FOLDER_ID = "1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ";

// Verificar que las constantes existan
if (typeof SPREADSHEET_ID === 'undefined') {
  throw new Error("SPREADSHEET_ID no está definido. Asegúrate de tener Code.gs en este proyecto O descomentar las constantes arriba.");
}
if (typeof MAIN_DRIVE_FOLDER_ID === 'undefined') {
  throw new Error("MAIN_DRIVE_FOLDER_ID no está definido. Asegúrate de tener Code.gs en este proyecto O descomentar las constantes arriba.");
}

// ==================== FUNCIÓN PRINCIPAL DE SETUP ====================
/**
 * EJECUTA ESTO UNA SOLA VEZ PARA CONFIGURAR TODO
 */
function runCompleteSetup() {
  Logger.log("🚀 Iniciando configuración completa...");
  
  try {
    // Paso 1: Crear todas las hojas
    Logger.log("📊 Paso 1/4: Creando hojas de cálculo...");
    createAllSheets();
    
    // Paso 2: Poblar catálogo de productos Syngenta
    Logger.log("📦 Paso 2/4: Poblando catálogo de productos...");
    seedProducts();
    
    // Paso 3: Crear usuario administrador por defecto
    Logger.log("👤 Paso 3/4: Creando usuario administrador...");
    seedAdminUser();
    
    // Paso 4: Crear carpetas de Drive
    Logger.log("📁 Paso 4/4: Creando carpetas de Google Drive...");
    createDriveFolders();
    
    Logger.log("✅ ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!");
    Logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    Logger.log("📋 Resumen:");
    Logger.log("   - 7 hojas creadas: Products, Sales, Clients, Suppliers, Settings, Users, InventoryMovements");
    Logger.log("   - 12 productos del catálogo Syngenta agregados");
    Logger.log("   - 1 usuario administrador creado (admin / admin123)");
    Logger.log("   - 5 carpetas de Drive creadas");
    Logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return {
      success: true,
      message: "Setup completado exitosamente",
      sheets: 7,
      products: 12,
      users: 1,
      folders: 5
    };
    
  } catch (error) {
    Logger.log("❌ ERROR: " + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== CREAR TODAS LAS HOJAS ====================
function createAllSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Definición de todas las hojas y sus columnas
  const sheetsConfig = {
    "Products": [
      "id", "name", "category", "price", "stock", "unit", "minStock", 
      "emoji", "barcode", "isExternal", "imageUrl", "createdAt", "updatedAt"
    ],
    "Sales": [
      "id", "items", "subtotal", "iva", "total", "date", "ivaCondition", 
      "clientId", "receiptUrl", "createdAt"
    ],
    "Clients": [
      "id", "name", "phone", "email", "rfc", "address", "createdAt", "updatedAt"
    ],
    "Suppliers": [
      "id", "company", "contact", "phone", "email", "address", "createdAt", "updatedAt"
    ],
    "Settings": [
      "key", "value", "updatedAt"
    ],
    "Users": [
      "id", "username", "email", "passwordHash", "role", "fullName", 
      "phone", "active", "lastLogin", "createdAt", "updatedAt"
    ],
    "InventoryMovements": [
      "id", "productId", "productName", "type", "quantity", "previousStock", 
      "newStock", "reason", "userId", "saleId", "createdAt"
    ]
  };
  
  // Crear cada hoja si no existe
  Object.keys(sheetsConfig).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log("   ✓ Hoja creada: " + sheetName);
    } else {
      Logger.log("   ⚠ Hoja ya existe: " + sheetName);
    }
    
    // Configurar encabezados
    const headers = sheetsConfig[sheetName];
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    
    // Estilar encabezados
    headerRange.setFontWeight("bold")
      .setBackground("#4285F4")
      .setFontColor("#FFFFFF")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
    
    // Ajustar ancho de columnas
    sheet.setColumnWidths(1, headers.length, 100);
    
    // Congelar primera fila
    sheet.setFrozenRows(1);
  });
  
  Logger.log("   ✅ Todas las hojas configuradas");
}

// ==================== POBLAR PRODUCTOS ====================
function seedProducts() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Products");
  
  // Catálogo completo Syngenta
  const products = [
    { id: "1", name: "Denim", category: "insecticida", price: 850, stock: 24, unit: "Lt", minStock: 5, emoji: "🛡️", barcode: "7501234560010" },
    { id: "2", name: "Ampligo", category: "insecticida", price: 1200, stock: 18, unit: "Lt", minStock: 4, emoji: "⚔️", barcode: "7501234560027" },
    { id: "3", name: "Engeo", category: "insecticida", price: 780, stock: 30, unit: "Lt", minStock: 6, emoji: "🎯", barcode: "7501234560034" },
    { id: "4", name: "Proclaim", category: "insecticida", price: 950, stock: 12, unit: "Kg", minStock: 3, emoji: "💥", barcode: "7501234560041" },
    { id: "5", name: "Gesaprim", category: "herbicida", price: 320, stock: 45, unit: "Lt", minStock: 10, emoji: "🌾", barcode: "7501234560058" },
    { id: "6", name: "Gramoxone", category: "herbicida", price: 280, stock: 38, unit: "Lt", minStock: 8, emoji: "🔥", barcode: "7501234560065" },
    { id: "7", name: "Flex", category: "herbicida", price: 450, stock: 20, unit: "Lt", minStock: 5, emoji: "💪", barcode: "7501234560072" },
    { id: "8", name: "Isabion", category: "bioestimulante", price: 680, stock: 22, unit: "Lt", minStock: 5, emoji: "🌱", barcode: "7501234560089" },
    { id: "9", name: "Bravo 720", category: "fungicida", price: 520, stock: 15, unit: "Lt", minStock: 4, emoji: "🍄", barcode: "7501234560096" },
    { id: "10", name: "Amistar", category: "fungicida", price: 1100, stock: 10, unit: "Lt", minStock: 3, emoji: "✨", barcode: "7501234560102" },
    { id: "11", name: "Adigor", category: "adherente", price: 380, stock: 28, unit: "Lt", minStock: 6, emoji: "🧲", barcode: "7501234560119" },
    { id: "12", name: "Curacron", category: "insecticida", price: 620, stock: 16, unit: "Lt", minStock: 4, emoji: "🐛", barcode: "7501234560126" }
  ];
  
  // Insertar productos
  products.forEach((product, index) => {
    const row = index + 2; // +2 porque empieza en 1 y hay encabezado
    sheet.getRange(row, 1, 1, 13).setValues([[
      product.id,
      product.name,
      product.category,
      product.price,
      product.stock,
      product.unit,
      product.minStock,
      product.emoji,
      product.barcode,
      false, // isExternal
      "",    // imageUrl
      new Date(),
      new Date()
    ]]);
  });
  
  Logger.log("   ✅ " + products.length + " productos agregados");
}

// ==================== CREAR USUARIO ADMIN ====================
function seedAdminUser() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Users");
  
  // Hash simple para la contraseña (SHA-256)
  const passwordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, "admin123");
  
  // Datos del admin
  const adminData = [
    "user-admin-001",     // id
    "admin",               // username
    "admin@elinge.com",    // email
    passwordHash,          // passwordHash
    "admin",               // role
    "Administrador",       // fullName
    "",                    // phone
    true,                  // active
    "",                    // lastLogin
    new Date(),            // createdAt
    new Date()             // updatedAt
  ];
  
  sheet.appendRow(adminData);
  
  Logger.log("   ✅ Usuario administrador creado");
  Logger.log("      Username: admin");
  Logger.log("      Password: admin123");
  Logger.log("      ⚠️ CAMBIA LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN!");
}

// ==================== CREAR CARPETAS DRIVE ====================
function createDriveFolders() {
  const mainFolder = DriveApp.getFolderById(MAIN_DRIVE_FOLDER_ID);
  
  const folderNames = [
    "Products_Images",
    "Sales_Receipts",
    "Invoices",
    "Bank_Statements",
    "Suppliers_Documents"
  ];
  
  folderNames.forEach(folderName => {
    const folders = mainFolder.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      mainFolder.createFolder(folderName);
      Logger.log("   ✓ Carpeta creada: " + folderName);
    } else {
      Logger.log("   ⚠ Carpeta ya existe: " + folderName);
    }
  });
  
  Logger.log("   ✅ Todas las carpetas configuradas");
}

// ==================== FUNCIONES ADICIONALES ÚTILES ====================

/**
 * Verificar el estado actual del setup
 */
function checkSetupStatus() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const status = {
    sheets: [],
    totalProducts: 0,
    totalUsers: 0,
    totalSales: 0,
    totalClients: 0,
    totalSuppliers: 0
  };
  
  // Verificar hojas
  const expectedSheets = ["Products", "Sales", "Clients", "Suppliers", "Settings", "Users", "InventoryMovements"];
  expectedSheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    status.sheets.push({
      name: sheetName,
      exists: sheet !== null,
      rows: sheet ? sheet.getLastRow() - 1 : 0 // -1 por encabezado
    });
  });
  
  // Contar datos
  const productsSheet = ss.getSheetByName("Products");
  if (productsSheet) status.totalProducts = productsSheet.getLastRow() - 1;
  
  const usersSheet = ss.getSheetByName("Users");
  if (usersSheet) status.totalUsers = usersSheet.getLastRow() - 1;
  
  const salesSheet = ss.getSheetByName("Sales");
  if (salesSheet) status.totalSales = salesSheet.getLastRow() - 1;
  
  const clientsSheet = ss.getSheetByName("Clients");
  if (clientsSheet) status.totalClients = clientsSheet.getLastRow() - 1;
  
  const suppliersSheet = ss.getSheetByName("Suppliers");
  if (suppliersSheet) status.totalSuppliers = suppliersSheet.getLastRow() - 1;
  
  Logger.log("📊 ESTADO ACTUAL DEL SETUP:");
  Logger.log(JSON.stringify(status, null, 2));
  
  return status;
}

/**
 * Resetear completamente la base de datos (PELIGROSO - BORRA TODO)
 */
function dangerousResetDatabase() {
  if (!Browser.msgBox("¿ESTÁS SEGURO? Esto borrará TODOS los datos.", Browser.Buttons.YES_NO) === "YES") {
    return { success: false, message: "Operación cancelada" };
  }
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Eliminar todas las hojas excepto la primera
  const sheets = ss.getSheets();
  sheets.forEach((sheet, index) => {
    if (index > 0) {
      ss.deleteSheet(sheet);
    } else {
      // Limpiar la primera hoja
      sheet.clear();
    }
  });
  
  Logger.log("⚠️ BASE DE DATOS RESETEADA");
  Logger.log("Ahora ejecuta runCompleteSetup() para configurar de nuevo");
  
  return { success: true, message: "Database reset complete" };
}

/**
 * Exportar configuración actual a JSON
 */
function exportCurrentData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = {};
  
  const sheetNames = ["Products", "Sales", "Clients", "Suppliers", "Settings", "Users"];
  
  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const values = sheet.getDataRange().getValues();
      const headers = values[0];
      data[sheetName] = values.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });
    }
  });
  
  Logger.log("📦 Datos exportados: " + JSON.stringify(data).length + " bytes");
  return data;
}
