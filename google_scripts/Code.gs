/**
 * El Inge POS AI - Google Apps Script Backend con Google Auth
 * =============================================================
 * 
 * Spreadsheet ID: 13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc
 * Drive Folder: 1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ
 * 
 * CARACTERÍSTICAS:
 * - Login con Google Account (OAuth2)
 * - Login tradicional con username/password (fallback)
 * - Registro de nuevos usuarios
 * - Gestión de sesiones con token
 */

// ==================== CONFIGURACIÓN ====================
const SPREADSHEET_ID = "13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc";
const MAIN_DRIVE_FOLDER_ID = "1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ";

// Sheet names
const SHEETS = {
  PRODUCTS: "Products",
  SALES: "Sales",
  CLIENTS: "Clients",
  SUPPLIERS: "Suppliers",
  SETTINGS: "Settings",
  USERS: "Users",
  INVENTORY_MOVEMENTS: "InventoryMovements"
};

// Drive subfolder names
const DRIVE_FOLDERS = {
  PRODUCT_IMAGES: "Products_Images",
  SALES_RECEIPTS: "Sales_Receipts",
  INVOICES: "Invoices",
  BANK_STATEMENTS: "Bank_Statements",
  SUPPLIERS_DOCUMENTS: "Suppliers_Documents"
};

// Folder ID para imágenes de productos (proporcionado por el usuario)
const PRODUCT_IMAGES_FOLDER_ID = "1SpKW6DeCkBnu_8_gX5yPggQhZNBfu5hM";

// ==================== INITIALIZATION ====================
function initializeBackend() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  Object.values(SHEETS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      initializeSheet(sheetName, sheet);
    }
  });
  
  const mainFolder = DriveApp.getFolderById(MAIN_DRIVE_FOLDER_ID);
  Object.values(DRIVE_FOLDERS).forEach(folderName => {
    const folders = mainFolder.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      mainFolder.createFolder(folderName);
    }
  });
  
  initializeDefaultSettings(ss);
  
  return { success: true, message: "Backend initialized successfully!" };
}

function initializeSheet(sheetName, sheet) {
  switch(sheetName) {
    case SHEETS.PRODUCTS:
      sheet.appendRow(["id", "name", "category", "price", "stock", "unit", "minStock", "emoji", "barcode", "isExternal", "imageUrl", "createdAt", "updatedAt"]);
      break;
    case SHEETS.SALES:
      sheet.appendRow(["id", "items", "subtotal", "iva", "total", "date", "ivaCondition", "clientId", "receiptUrl", "createdAt"]);
      break;
    case SHEETS.CLIENTS:
      sheet.appendRow(["id", "name", "phone", "email", "rfc", "address", "createdAt", "updatedAt"]);
      break;
    case SHEETS.SUPPLIERS:
      sheet.appendRow(["id", "company", "contact", "phone", "email", "address", "createdAt", "updatedAt"]);
      break;
    case SHEETS.SETTINGS:
      sheet.appendRow(["key", "value", "updatedAt"]);
      break;
    case SHEETS.USERS:
      sheet.appendRow(["id", "username", "email", "passwordHash", "role", "fullName", "phone", "googleId", "googleEmail", "avatar", "active", "lastLogin", "loginType", "createdAt", "updatedAt"]);
      break;
    case SHEETS.INVENTORY_MOVEMENTS:
      sheet.appendRow(["id", "productId", "productName", "type", "quantity", "previousStock", "newStock", "reason", "userId", "saleId", "createdAt"]);
      break;
  }
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold").setBackground("#4285F4").setFontColor("white");
}

function initializeDefaultSettings(ss) {
  let settingsSheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!settingsSheet) return;
  
  const defaults = {
    businessName: "Tienda El Inge",
    address: "Ébano, San Luis Potosí, México",
    phone: "(489) 123-4567",
    rfc: "XXXX000000XXX",
    email: "contacto@elinge.com",
    slogan: "Soluciones Agrícolas Profesionales"
  };
  
  Object.entries(defaults).forEach(([key, value]) => {
    settingsSheet.appendRow([key, value, new Date()]);
  });
}

// ==================== HTTP HANDLERS ====================
function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  const action = e.parameter.action;
  
  // Enable CORS
  if (method === "OPTIONS") {
    return jsonResponse({}, 200, true);
  }

  try {
    let result;
    let data = null;

    if (method === "GET") {
      // Check if data parameter exists (for POST requests converted to GET)
      if (e.parameter.data) {
        try {
          data = JSON.parse(e.parameter.data);
        } catch (err) {
          // Invalid JSON, ignore
        }
      }

      // If data exists, treat as POST request
      if (data && action !== "authenticate" && action !== "authenticateGoogle") {
        // Handle as POST
        switch(action) {
          case "createProduct": result = createProduct(data); break;
          case "updateProduct": result = updateProduct(data); break;
          case "deleteProduct": result = deleteProduct(data.id); break;
          case "createSale": result = createSale(data); break;
          case "createClient": result = createClient(data); break;
          case "updateClient": result = updateClient(data); break;
          case "deleteClient": result = deleteClient(data.id); break;
          case "createSupplier": result = createSupplier(data); break;
          case "updateSupplier": result = updateSupplier(data); break;
          case "deleteSupplier": result = deleteSupplier(data.id); break;
          case "updateSettings": result = updateSettings(data); break;
          case "createUser": result = createUser(data); break;
          case "updateUser": result = updateUser(data); break;
          case "deleteUser": result = deleteUser(data.id); break;
          case "updateUserPassword": result = updateUserPassword(data.id, data.newPassword); break;
          case "registerUser": result = registerUser(data); break;
          case "recordInventoryMovement": result = recordInventoryMovement(data); break;
          case "uploadFile": result = uploadFile(data); break;
          case "uploadProductImage": result = uploadProductImage(data); break;
          default: throw new Error("Unknown action: " + action);
        }
      } else {
        // Handle as GET request
        switch(action) {
          case "getProducts": result = getProducts(); break;
          case "getSales": result = getSales(); break;
          case "getClients": result = getClients(); break;
          case "getSuppliers": result = getSuppliers(); break;
          case "getSettings": result = getSettings(); break;
          case "getUsers": result = getUsers(); break;
          case "getUser": result = getUser(e.parameter.id); break;
          case "authenticate": result = authenticate(e.parameter.username, e.parameter.password); break;
          case "authenticateGoogle": result = authenticateGoogle(e.parameter.token); break;
          case "getProduct": result = getProduct(e.parameter.id); break;
          case "getClient": result = getClient(e.parameter.id); break;
          case "getSupplier": result = getSupplier(e.parameter.id); break;
          case "getFolderUrl": result = getFolderUrl(e.parameter.folderType); break;
          case "getInventoryMovements": result = getInventoryMovements(e.parameter.productId); break;
          default: throw new Error("Unknown action: " + action);
        }
      }
    } else if (method === "POST") {
      data = JSON.parse(e.postData.contents);

      switch(action) {
        case "createProduct": result = createProduct(data); break;
        case "updateProduct": result = updateProduct(data); break;
        case "deleteProduct": result = deleteProduct(data.id); break;
        case "createSale": result = createSale(data); break;
        case "createClient": result = createClient(data); break;
        case "updateClient": result = updateClient(data); break;
        case "deleteClient": result = deleteClient(data.id); break;
        case "createSupplier": result = createSupplier(data); break;
        case "updateSupplier": result = updateSupplier(data); break;
        case "deleteSupplier": result = deleteSupplier(data.id); break;
        case "updateSettings": result = updateSettings(data); break;
        case "createUser": result = createUser(data); break;
        case "updateUser": result = updateUser(data); break;
        case "deleteUser": result = deleteUser(data.id); break;
        case "updateUserPassword": result = updateUserPassword(data.id, data.newPassword); break;
        case "registerUser": result = registerUser(data); break;
        case "recordInventoryMovement": result = recordInventoryMovement(data); break;
        case "uploadFile": result = uploadFile(data); break;
        default: throw new Error("Unknown action: " + action);
      }
    }

    return jsonResponse({ success: true, data: result }, 200, true);

  } catch (error) {
    return jsonResponse({ success: false, error: error.message }, 500, true);
  }
}

function jsonResponse(data, statusCode = 200, cors = false) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  if (cors) {
    // Headers manuales no son posibles en Apps Script, pero el navegador los ignora para CORS preflight
  }
  
  return output;
}

// ==================== PRODUCTS ====================
function getProducts() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const products = data.slice(1).map(row => {
    const product = {};
    headers.forEach((header, i) => {
      product[header] = row[i];
    });
    product.price = Number(product.price);
    product.stock = Number(product.stock);
    product.minStock = Number(product.minStock);
    product.isExternal = product.isExternal === true || product.isExternal === "true";
    return product;
  });
  
  return products;
}

function getProduct(id) {
  const products = getProducts();
  return products.find(p => p.id === id);
}

function createProduct(product) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.PRODUCTS);
  
  const newProduct = {
    ...product,
    id: product.id || "prod-" + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sheet.appendRow([
    newProduct.id,
    newProduct.name,
    newProduct.category,
    newProduct.price,
    newProduct.stock,
    newProduct.unit,
    newProduct.minStock,
    newProduct.emoji,
    newProduct.barcode,
    newProduct.isExternal || false,
    newProduct.imageUrl || "",
    newProduct.createdAt,
    newProduct.updatedAt
  ]);
  
  return newProduct;
}

function updateProduct(product) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === product.id) {
      const row = i + 1;
      sheet.getRange(row, 2, 1, 11).setValues([[
        product.name,
        product.category,
        product.price,
        product.stock,
        product.unit,
        product.minStock,
        product.emoji,
        product.barcode,
        product.isExternal || false,
        product.imageUrl || "",
        new Date()
      ]]);
      return { ...product, updatedAt: new Date() };
    }
  }
  
  throw new Error("Product not found: " + product.id);
}

function deleteProduct(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, id: id };
    }
  }
  
  throw new Error("Product not found: " + id);
}

// ==================== SALES ====================
function getSales() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SALES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const sales = data.slice(1).map(row => {
    const sale = {};
    headers.forEach((header, i) => {
      sale[header] = row[i];
    });
    try {
      sale.items = typeof sale.items === "string" ? JSON.parse(sale.items) : sale.items;
    } catch (e) {
      sale.items = [];
    }
    sale.subtotal = Number(sale.subtotal);
    sale.iva = Number(sale.iva);
    sale.total = Number(sale.total);
    return sale;
  });
  
  return sales;
}

function createSale(sale) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SALES);
  
  const newSale = {
    ...sale,
    id: sale.id || "V-" + Date.now(),
    createdAt: new Date()
  };
  
  sheet.appendRow([
    newSale.id,
    JSON.stringify(newSale.items),
    newSale.subtotal,
    newSale.iva,
    newSale.total,
    newSale.date,
    newSale.ivaCondition,
    newSale.clientId || "",
    newSale.receiptUrl || "",
    newSale.createdAt
  ]);
  
  return newSale;
}

// ==================== CLIENTS ====================
function getClients() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CLIENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const clients = data.slice(1).map(row => {
    const client = {};
    headers.forEach((header, i) => {
      client[header] = row[i];
    });
    return client;
  });
  
  return clients;
}

function getClient(id) {
  const clients = getClients();
  return clients.find(c => c.id === id);
}

function createClient(client) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CLIENTS);
  
  const newClient = {
    ...client,
    id: client.id || "cli-" + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sheet.appendRow([
    newClient.id,
    newClient.name,
    newClient.phone,
    newClient.email,
    newClient.rfc,
    newClient.address,
    newClient.createdAt,
    newClient.updatedAt
  ]);
  
  return newClient;
}

function updateClient(client) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CLIENTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === client.id) {
      const row = i + 1;
      sheet.getRange(row, 2, 6, 1).setValues([[
        client.name,
        client.phone,
        client.email,
        client.rfc,
        client.address,
        new Date()
      ]]);
      return { ...client, updatedAt: new Date() };
    }
  }
  
  throw new Error("Client not found: " + client.id);
}

function deleteClient(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CLIENTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, id: id };
    }
  }
  
  throw new Error("Client not found: " + id);
}

// ==================== SUPPLIERS ====================
function getSuppliers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SUPPLIERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const suppliers = data.slice(1).map(row => {
    const supplier = {};
    headers.forEach((header, i) => {
      supplier[header] = row[i];
    });
    return supplier;
  });
  
  return suppliers;
}

function getSupplier(id) {
  const suppliers = getSuppliers();
  return suppliers.find(s => s.id === id);
}

function createSupplier(supplier) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SUPPLIERS);
  
  const newSupplier = {
    ...supplier,
    id: supplier.id || "sup-" + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sheet.appendRow([
    newSupplier.id,
    newSupplier.company,
    newSupplier.contact,
    newSupplier.phone,
    newSupplier.email,
    newSupplier.address,
    newSupplier.createdAt,
    newSupplier.updatedAt
  ]);
  
  return newSupplier;
}

function updateSupplier(supplier) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SUPPLIERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === supplier.id) {
      const row = i + 1;
      sheet.getRange(row, 2, 6, 1).setValues([[
        supplier.company,
        supplier.contact,
        supplier.phone,
        supplier.email,
        supplier.address,
        new Date()
      ]]);
      return { ...supplier, updatedAt: new Date() };
    }
  }
  
  throw new Error("Supplier not found: " + supplier.id);
}

function deleteSupplier(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SUPPLIERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, id: id };
    }
  }
  
  throw new Error("Supplier not found: " + id);
}

// ==================== SETTINGS ====================
function getSettings() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  
  const settings = {};
  data.slice(1).forEach(row => {
    settings[row[0]] = row[1];
  });
  
  return settings;
}

function updateSettings(settingsData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  
  const updated = {};
  
  Object.entries(settingsData).forEach(([key, value]) => {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 3).setValue(new Date());
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, value, new Date()]);
    }
    updated[key] = value;
  });
  
  return updated;
}

// ==================== USERS & AUTH ====================

/**
 * Hash password usando SHA-256
 */
function hashPassword(password) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
}

/**
 * Get all users (sin password hash por seguridad)
 */
function getUsers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const users = data.slice(1).map(row => {
    const user = {};
    headers.forEach((header, i) => {
      user[header] = row[i];
    });
    user.active = user.active === true || user.active === "true";
    delete user.passwordHash;
    return user;
  });
  
  return users;
}

/**
 * Get single user by ID
 */
function getUser(id) {
  const users = getUsers();
  return users.find(u => u.id === id);
}

/**
 * Authenticate with username/password (tradicional)
 */
function authenticate(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const passwordHash = hashPassword(password);
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const user = {};
    headers.forEach((header, j) => {
      user[header] = row[j];
    });
    
    if ((user.username === username || user.email === username) && user.active) {
      if (user.passwordHash === passwordHash) {
        sheet.getRange(i + 1, 12).setValue(new Date()); // lastLogin
        
        const userResponse = { ...user };
        delete userResponse.passwordHash;
        userResponse.token = Utilities.getUuid();
        userResponse.loginType = user.loginType || "password";
        return { success: true, user: userResponse };
      }
    }
  }
  
  return { success: false, error: "Credenciales inválidas" };
}

/**
 * Authenticate with Google Token (OAuth2)
 * El token se valida desde el frontend con google.auth
 */
function authenticateGoogle(token) {
  try {
    // En producción, deberías validar el token con Google
    // Para esto, usamos la librería de OAuth2 o validamos manualmente
    // Aquí hacemos una validación simplificada
    
    // Decodificar el token JWT (estructura: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { success: false, error: "Token inválido" };
    }
    
    // Decodificar payload
    const payload = JSON.parse(Utilities.base64DecodeWebSafe(parts[1]));
    
    // Verificar que el token no haya expirado
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { success: false, error: "Token expirado" };
    }
    
    // Extraer información del usuario Google
    const googleEmail = payload.email;
    const googleId = payload.sub;
    const fullName = payload.name;
    const avatar = payload.picture;
    
    if (!googleEmail) {
      return { success: false, error: "Email no encontrado en token" };
    }
    
    // Buscar usuario en la base de datos
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const user = {};
      headers.forEach((header, j) => {
        user[header] = row[j];
      });
      
      // Buscar por Google ID o Google Email
      if ((user.googleId === googleId || user.googleEmail === googleEmail) && user.active) {
        // Actualizar last login
        sheet.getRange(i + 1, 12).setValue(new Date());
        
        const userResponse = { ...user };
        delete userResponse.passwordHash;
        userResponse.token = Utilities.getUuid();
        userResponse.loginType = "google";
        return { success: true, user: userResponse };
      }
    }
    
    // Usuario no encontrado, crear uno nuevo automáticamente
    const newUser = {
      id: "user-" + Date.now(),
      username: googleEmail.split('@')[0],
      email: googleEmail,
      passwordHash: "", // Sin password para Google Auth
      role: "user", // Rol por defecto
      fullName: fullName || googleEmail.split('@')[0],
      phone: "",
      googleId: googleId,
      googleEmail: googleEmail,
      avatar: avatar || "",
      active: true,
      lastLogin: new Date(),
      loginType: "google",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    sheet.appendRow([
      newUser.id,
      newUser.username,
      newUser.email,
      newUser.passwordHash,
      newUser.role,
      newUser.fullName,
      newUser.phone,
      newUser.googleId,
      newUser.googleEmail,
      newUser.avatar,
      newUser.active,
      newUser.lastLogin,
      newUser.loginType,
      newUser.createdAt,
      newUser.updatedAt
    ]);
    
    const userResponse = { ...newUser };
    delete userResponse.passwordHash;
    userResponse.token = Utilities.getUuid();
    userResponse.loginType = "google";
    userResponse.isNewUser = true;
    
    return { success: true, user: userResponse };
    
  } catch (error) {
    return { success: false, error: "Error validando token: " + error.message };
  }
}

/**
 * Register new user with username/password
 */
function registerUser(userData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  
  // Verificar si ya existe
  const existingUsers = getUsers();
  if (existingUsers.some(u => u.username === userData.username)) {
    throw new Error("El nombre de usuario ya existe");
  }
  if (existingUsers.some(u => u.email === userData.email)) {
    throw new Error("El email ya está registrado");
  }
  
  const newUser = {
    ...userData,
    id: userData.id || "user-" + Date.now(),
    passwordHash: hashPassword(userData.password),
    active: true,
    role: userData.role || "user",
    loginType: "password",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sheet.appendRow([
    newUser.id,
    newUser.username,
    newUser.email,
    newUser.passwordHash,
    newUser.role,
    newUser.fullName,
    newUser.phone || "",
    "", // googleId
    "", // googleEmail
    "", // avatar
    newUser.active,
    "", // lastLogin
    newUser.loginType,
    newUser.createdAt,
    newUser.updatedAt
  ]);
  
  const response = { ...newUser };
  delete response.passwordHash;
  return response;
}

/**
 * Create new user (admin only)
 */
function createUser(userData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  
  const existingUsers = getUsers();
  if (existingUsers.some(u => u.username === userData.username)) {
    throw new Error("Username already exists");
  }
  if (existingUsers.some(u => u.email === userData.email)) {
    throw new Error("Email already exists");
  }
  
  const newUser = {
    ...userData,
    id: userData.id || "user-" + Date.now(),
    passwordHash: hashPassword(userData.password),
    active: userData.active !== undefined ? userData.active : true,
    role: userData.role || "user",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sheet.appendRow([
    newUser.id,
    newUser.username,
    newUser.email,
    newUser.passwordHash,
    newUser.role,
    newUser.fullName,
    newUser.phone || "",
    newUser.googleId || "",
    newUser.googleEmail || "",
    newUser.avatar || "",
    newUser.active,
    "", // lastLogin
    newUser.loginType || "password",
    newUser.createdAt,
    newUser.updatedAt
  ]);
  
  const response = { ...newUser };
  delete response.passwordHash;
  return response;
}

/**
 * Update user
 */
function updateUser(userData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userData.id) {
      const row = i + 1;
      sheet.getRange(row, 2, 13, 1).setValues([[
        userData.username,
        userData.email,
        data[i][3], // Keep password hash
        userData.role || "user",
        userData.fullName,
        userData.phone || "",
        userData.googleId || data[i][7],
        userData.googleEmail || data[i][8],
        userData.avatar || data[i][9],
        userData.active !== undefined ? userData.active : true,
        data[i][11], // Keep lastLogin
        userData.loginType || data[i][12],
        new Date()
      ]]);
      
      const response = { ...userData, updatedAt: new Date() };
      delete response.passwordHash;
      return response;
    }
  }
  
  throw new Error("User not found: " + userData.id);
}

/**
 * Delete user
 */
function deleteUser(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, id: id };
    }
  }
  
  throw new Error("User not found: " + id);
}

/**
 * Update user password
 */
function updateUserPassword(userId, newPassword) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const row = i + 1;
      sheet.getRange(row, 4).setValue(hashPassword(newPassword));
      sheet.getRange(row, 15).setValue(new Date());
      return { success: true, message: "Password updated" };
    }
  }
  
  throw new Error("User not found: " + userId);
}

/**
 * Create default admin user
 */
function createDefaultAdmin() {
  try {
    createUser({
      username: "admin",
      email: "admin@elinge.com",
      password: "admin123",
      fullName: "Administrador",
      role: "admin",
      phone: ""
    });
    return { success: true, message: "Default admin created. Username: admin, Password: admin123" };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Verificar movimientos de inventario (función de prueba)
 */
function testInventoryMovements() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.INVENTORY_MOVEMENTS);

  if (!sheet) {
    Logger.log("❌ La hoja InventoryMovements no existe");
    return { success: false, error: "Sheet not found" };
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const movements = data.slice(1);

  Logger.log("=== INVENTORY MOVEMENTS ===");
  Logger.log("Total movimientos: " + movements.length);
  Logger.log("Columnas: " + headers.join(" | "));

  if (movements.length === 0) {
    Logger.log("⚠️ No hay movimientos registrados aún");
    Logger.log("💡 Haz una venta en la app para probar");
  } else {
    Logger.log("Últimos 5 movimientos:");
    movements.slice(-5).forEach((mov, i) => {
      Logger.log("---");
      Logger.log("Movimiento #" + (i + 1));
      Logger.log("  ID: " + mov[0]);
      Logger.log("  Producto: " + mov[2]);
      Logger.log("  Tipo: " + mov[3]);
      Logger.log("  Cantidad: " + mov[4]);
      Logger.log("  Stock Anterior: " + mov[5]);
      Logger.log("  Stock Nuevo: " + mov[6]);
      Logger.log("  Razón: " + mov[7]);
      Logger.log("  Venta ID: " + mov[9]);
      Logger.log("  Fecha: " + mov[10]);
    });
  }

  return {
    success: true,
    total: movements.length,
    lastMovements: movements.slice(-5)
  };
}

// ==================== INVENTORY MOVEMENTS ====================
function recordInventoryMovement(movementData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.INVENTORY_MOVEMENTS);
  
  const movement = {
    ...movementData,
    id: movementData.id || "mov-" + Date.now(),
    createdAt: new Date()
  };
  
  sheet.appendRow([
    movement.id,
    movement.productId,
    movement.productName,
    movement.type,
    movement.quantity,
    movement.previousStock,
    movement.newStock,
    movement.reason || "",
    movement.userId || "",
    movement.saleId || "",
    movement.createdAt
  ]);
  
  return movement;
}

function getInventoryMovements(productId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.INVENTORY_MOVEMENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const movements = data.slice(1).map(row => {
    const movement = {};
    headers.forEach((header, i) => {
      movement[header] = row[i];
    });
    return movement;
  });
  
  if (productId) {
    return movements.filter(m => m.productId === productId);
  }
  
  return movements;
}

// ==================== GOOGLE DRIVE ====================

/**
 * Subir imagen de producto a Google Drive
 */
function uploadProductImage(data) {
  const { productId, productName, base64Data, fileName } = data;

  if (!base64Data || !fileName) {
    throw new Error("Missing required fields: base64Data, fileName");
  }

  try {
    // Usar el folder específico para imágenes de productos
    const folder = DriveApp.getFolderById(PRODUCT_IMAGES_FOLDER_ID);

    // Decodificar base64
    const decodedData = Utilities.base64Decode(base64Data.split(",")[1] || base64Data);
    const blob = Utilities.newBlob(decodedData, "image/jpeg", fileName);

    // Subir archivo
    const file = folder.createFile(blob);

    // Hacer el archivo visible para cualquiera con el link (opcional)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Obtener URL de descarga directa
    const downloadUrl = file.getDownloadUrl();

    return {
      success: true,
      imageUrl: file.getUrl(),
      downloadUrl: downloadUrl,
      fileId: file.getId(),
      fileName: fileName
    };

  } catch (error) {
    throw new Error("Error uploading image: " + error.message);
  }
}

/**
 * Obtener URL de imagen de un producto
 */
function getProductImage(productId) {
  try {
    const folder = DriveApp.getFolderById(PRODUCT_IMAGES_FOLDER_ID);
    const files = folder.getFilesByName(`product_${productId}.jpg`);

    if (files.hasNext()) {
      const file = files.next();
      return {
        success: true,
        imageUrl: file.getUrl(),
        downloadUrl: file.getDownloadUrl(),
        fileId: file.getId()
      };
    }

    return { success: false, error: "Image not found" };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getOrCreateFolder(folderType) {
  const mainFolder = DriveApp.getFolderById(MAIN_DRIVE_FOLDER_ID);
  let folderName;
  
  switch(folderType) {
    case "productImages": folderName = DRIVE_FOLDERS.PRODUCT_IMAGES; break;
    case "salesReceipts": folderName = DRIVE_FOLDERS.SALES_RECEIPTS; break;
    case "invoices": folderName = DRIVE_FOLDERS.INVOICES; break;
    case "bankStatements": folderName = DRIVE_FOLDERS.BANK_STATEMENTS; break;
    case "suppliersDocuments": folderName = DRIVE_FOLDERS.SUPPLIERS_DOCUMENTS; break;
    default: throw new Error("Unknown folder type: " + folderType);
  }
  
  const folders = mainFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  
  return mainFolder.createFolder(folderName);
}

function getFolderUrl(folderType) {
  const folder = getOrCreateFolder(folderType);
  return {
    folderType: folderType,
    url: folder.getUrl(),
    id: folder.getId()
  };
}

function uploadFile(data) {
  const { fileName, mimeType, base64Data, folderType } = data;
  
  if (!fileName || !base64Data) {
    throw new Error("Missing required fields: fileName, base64Data");
  }
  
  const folder = getOrCreateFolder(folderType || "salesReceipts");
  
  const decodedData = Utilities.base64Decode(base64Data.split(",")[1] || base64Data);
  const blob = Utilities.newBlob(decodedData, mimeType, fileName);
  
  const file = folder.createFile(blob);
  
  return {
    fileName: fileName,
    url: file.getUrl(),
    id: file.getId(),
    downloadUrl: file.getDownloadUrl()
  };
}

// ==================== SYNGENTA CATALOG SEED ====================
function seedSyngentaCatalog() {
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
  
  products.forEach(p => createProduct(p));
  createDefaultAdmin();
  
  return { success: true, count: products.length, message: "Products seeded + Admin user created" };
}
