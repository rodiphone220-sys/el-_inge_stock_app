/**
 * ============================================================================
 * EL INGE POS AI - ACTUALIZACIÓN DE HOJA USERS
 * ============================================================================
 * 
 * Este archivo contiene funciones para actualizar la hoja Users con las
 * columnas necesarias para Google Auth.
 * 
 * INSTRUCCIONES:
 * 1. Copia ESTE CONTENIDO en un archivo llamado "setup.gs" en Apps Script
 * 2. NO reemplaces Code.gs - este archivo es complementario
 * 3. Ejecuta las funciones desde el dropdown de Apps Script
 */

// ==================== ACTUALIZAR HOJA USERS ====================

/**
 * Actualiza la hoja Users con columnas para Google Auth
 */
function updateUsersSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Users");
  
  if (!sheet) {
    throw new Error("Users sheet not found");
  }
  
  // Get current headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const requiredColumns = [
    "id", "username", "email", "passwordHash", "role", "fullName", "phone",
    "googleId", "googleEmail", "avatar", "active", "lastLogin", "loginType",
    "createdAt", "updatedAt"
  ];
  
  // Check missing columns
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length === 0) {
    Logger.log("✅ Users sheet already has all columns");
    return;
  }
  
  Logger.log("Missing columns: " + missingColumns.join(", "));
  
  // Add missing columns
  const currentColumns = headers.length;
  const newColumns = requiredColumns.length - currentColumns;
  
  if (newColumns > 0) {
    // Insert new columns
    for (let i = 0; i < newColumns; i++) {
      sheet.insertColumnAfter(currentColumns + i);
    }
    
    // Update headers
    const newHeaders = requiredColumns.map((col, index) => {
      if (index < headers.length) {
        return headers[index];
      }
      return col;
    });
    
    sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    
    // Style new columns
    sheet.getRange(1, currentColumns + 1, 1, newColumns)
      .setFontWeight("bold")
      .setBackground("#4285F4")
      .setFontColor("#FFFFFF");
    
    Logger.log("✅ Columns added successfully");
  }
  
  // Update existing admin user with loginType
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const username = data[i][1]; // Column B
    if (username === "admin") {
      // Column M is loginType (column 13)
      sheet.getRange(i + 1, 13).setValue("password");
      Logger.log("Admin user updated with loginType: password");
    }
  }
}

// ==================== VERIFICAR HOJA USERS ====================

/**
 * Verifica que la hoja Users tenga todas las columnas necesarias
 */
function verifyUsersSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Users");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const required = ["googleId", "googleEmail", "avatar", "loginType"];
  const missing = required.filter(col => !headers.includes(col));
  
  if (missing.length > 0) {
    Logger.log("❌ Missing columns: " + missing.join(", "));
    return { success: false, missing: missing };
  } else {
    Logger.log("✅ All columns present!");
    Logger.log("Columns: " + headers.join(" | "));
    return { success: true, columns: headers };
  }
}

// ==================== VER TODOS LOS USUARIOS ====================

/**
 * Muestra todos los usuarios en la hoja Users
 */
function listAllUsers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  Logger.log("=== USERS LIST ===");
  Logger.log("Total users: " + (data.length - 1));
  
  for (let i = 1; i < data.length; i++) {
    const user = {};
    headers.forEach((h, j) => {
      user[h] = data[i][j];
    });
    
    Logger.log("User #" + i + ":");
    Logger.log("  - ID: " + user.id);
    Logger.log("  - Username: " + user.username);
    Logger.log("  - Email: " + user.email);
    Logger.log("  - Role: " + user.role);
    Logger.log("  - Login Type: " + (user.loginType || "N/A"));
    Logger.log("---");
  }
}

// ==================== AGREGAR USUARIO DE PRUEBA ====================

/**
 * Agrega un usuario de prueba para Google Auth
 */
function addTestGoogleUser() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Users");
  
  const testUser = {
    id: "user-test-google-" + Date.now(),
    username: "testgoogle",
    email: "test@gmail.com",
    passwordHash: "",
    role: "user",
    fullName: "Test Google User",
    phone: "",
    googleId: "1234567890",
    googleEmail: "test@gmail.com",
    avatar: "https://lh3.googleusercontent.com/a/default-user",
    active: true,
    lastLogin: new Date(),
    loginType: "google",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sheet.appendRow([
    testUser.id,
    testUser.username,
    testUser.email,
    testUser.passwordHash,
    testUser.role,
    testUser.fullName,
    testUser.phone,
    testUser.googleId,
    testUser.googleEmail,
    testUser.avatar,
    testUser.active,
    testUser.lastLogin,
    testUser.loginType,
    testUser.createdAt,
    testUser.updatedAt
  ]);
  
  Logger.log("✅ Test Google user added: " + testUser.username);
  Logger.log("  Email: " + testUser.email);
  Logger.log("  Login Type: " + testUser.loginType);
}
