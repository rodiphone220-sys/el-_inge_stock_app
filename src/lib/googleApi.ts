/**
 * El Inge POS AI - Google Apps Script API Client
 * ================================================
 *
 * Cliente para conectar el frontend React con el backend de Google Apps Script
 *
 * Web App URL: https://script.google.com/macros/s/AKfycbx1nfN662dZpGRZp1brE0I636ABZKX_m3Rdoe4Low_VXJkwKmKm6x5kY9DWv62B-2Xb/exec
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx1nfN662dZpGRZp1brE0I636ABZKX_m3Rdoe4Low_VXJkwKmKm6x5kY9DWv62B-2Xb/exec";

// ==================== TIPOS ====================

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  minStock: number;
  emoji: string;
  barcode: string;
  isExternal: boolean;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  iva: number;
  total: number;
  date: string;
  ivaCondition: "aplica" | "exento";
  clientId?: string;
  receiptUrl?: string;
  createdAt?: Date;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  rfc: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Supplier {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  fullName: string;
  phone: string;
  active: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  rfc: string;
  email: string;
  slogan: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== FUNCIONES BASE ====================

/**
 * Hacer petición GET a Google Apps Script
 */
async function get<T>(action: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.append("action", action);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      // Sin headers personalizados para evitar CORS preflight
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`Error en GET ${action}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}

/**
 * Hacer petición POST a Google Apps Script (usando GET para evitar CORS preflight)
 */
async function post<T>(action: string, body: any): Promise<ApiResponse<T>> {
  try {
    // Google Apps Script no soporta CORS preflight, usamos GET en lugar de POST
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.append("action", action);

    // Convertimos el body a string y lo pasamos como parámetro
    const bodyParam = JSON.stringify(body);
    url.searchParams.append("data", bodyParam);

    const response = await fetch(url.toString(), {
      method: "GET",
      // Sin headers personalizados para evitar CORS preflight
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`Error en POST ${action}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}

// ==================== PRODUCTOS ====================

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  return get<Product[]>("getProducts");
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  return get<Product>("getProduct", { id });
}

export async function createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Product>> {
  return post<Product>("createProduct", product);
}

export async function updateProduct(product: Product): Promise<ApiResponse<Product>> {
  return post<Product>("updateProduct", product);
}

export async function deleteProduct(id: string): Promise<ApiResponse<{ success: boolean }>> {
  return post<{ success: boolean }>("deleteProduct", { id });
}

// ==================== VENTAS ====================

export async function getSales(): Promise<ApiResponse<Sale[]>> {
  return get<Sale[]>("getSales");
}

export async function createSale(sale: Omit<Sale, "createdAt">): Promise<ApiResponse<Sale>> {
  return post<Sale>("createSale", sale);
}

// ==================== CLIENTES ====================

export async function getClients(): Promise<ApiResponse<Client[]>> {
  return get<Client[]>("getClients");
}

export async function getClient(id: string): Promise<ApiResponse<Client>> {
  return get<Client>("getClient", { id });
}

export async function createClient(client: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Client>> {
  return post<Client>("createClient", client);
}

export async function updateClient(client: Client): Promise<ApiResponse<Client>> {
  return post<Client>("updateClient", client);
}

export async function deleteClient(id: string): Promise<ApiResponse<{ success: boolean }>> {
  return post<{ success: boolean }>("deleteClient", { id });
}

// ==================== PROVEEDORES ====================

export async function getSuppliers(): Promise<ApiResponse<Supplier[]>> {
  return get<Supplier[]>("getSuppliers");
}

export async function getSupplier(id: string): Promise<ApiResponse<Supplier>> {
  return get<Supplier>("getSupplier", { id });
}

export async function createSupplier(supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Supplier>> {
  return post<Supplier>("createSupplier", supplier);
}

export async function updateSupplier(supplier: Supplier): Promise<ApiResponse<Supplier>> {
  return post<Supplier>("updateSupplier", supplier);
}

export async function deleteSupplier(id: string): Promise<ApiResponse<{ success: boolean }>> {
  return post<{ success: boolean }>("deleteSupplier", { id });
}

// ==================== USUARIOS ====================

export async function getUsers(): Promise<ApiResponse<User[]>> {
  return get<User[]>("getUsers");
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  return get<User>("getUser", { id });
}

/**
 * Autenticación tradicional con username/password
 */
export async function authenticate(username: string, password: string): Promise<ApiResponse<{ success: boolean; user: User; token: string }>> {
  return get<{ success: boolean; user: User; token: string }>("authenticate", { username, password });
}

/**
 * Autenticación con Google OAuth2
 * @param token - Token de ID de Google
 */
export async function authenticateGoogle(token: string): Promise<ApiResponse<{ success: boolean; user: User; token: string; isNewUser?: boolean }>> {
  return get<{ success: boolean; user: User; token: string; isNewUser?: boolean }>("authenticateGoogle", { token });
}

/**
 * Registro de nuevo usuario con username/password
 */
export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: "admin" | "user";
  phone?: string;
}): Promise<ApiResponse<User>> {
  return post<User>("registerUser", userData);
}

export async function createUser(user: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string }): Promise<ApiResponse<User>> {
  return post<User>("createUser", user);
}

export async function updateUser(user: User): Promise<ApiResponse<User>> {
  return post<User>("updateUser", user);
}

export async function deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {
  return post<{ success: boolean }>("deleteUser", { id });
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
  return post<{ success: boolean }>("updateUserPassword", { id: userId, newPassword });
}

// ==================== CONFIGURACIÓN ====================

export async function getSettings(): Promise<ApiResponse<BusinessSettings>> {
  return get<BusinessSettings>("getSettings");
}

export async function updateSettings(settings: Partial<BusinessSettings>): Promise<ApiResponse<BusinessSettings>> {
  return post<BusinessSettings>("updateSettings", settings);
}

// ==================== ARCHIVOS (DRIVE) ====================

export interface UploadFileParams {
  fileName: string;
  mimeType: string;
  base64Data: string;
  folderType?: "productImages" | "salesReceipts" | "invoices" | "bankStatements" | "suppliersDocuments";
}

export async function uploadFile(params: UploadFileParams): Promise<ApiResponse<{ fileName: string; url: string; id: string; downloadUrl: string }>> {
  return post<{ fileName: string; url: string; id: string; downloadUrl: string }>("uploadFile", params);
}

/**
 * Subir imagen de producto a Google Drive
 */
export async function uploadProductImage(params: {
  productId: string;
  productName: string;
  base64Data: string;
  fileName: string;
}): Promise<ApiResponse<{ imageUrl: string; downloadUrl: string; fileId: string; fileName: string }>> {
  return post<{ imageUrl: string; downloadUrl: string; fileId: string; fileName: string }>("uploadProductImage", params);
}

export async function getProductImage(productId: string): Promise<ApiResponse<{ imageUrl: string; downloadUrl: string; fileId: string }>> {
  return get<{ imageUrl: string; downloadUrl: string; fileId: string }>("getProductImage", { productId });
}

export async function getFolderUrl(folderType: string): Promise<ApiResponse<{ folderType: string; url: string; id: string }>> {
  return get<{ folderType: string; url: string; id: string }>("getFolderUrl", { folderType });
}

// ==================== MOVIMIENTOS DE INVENTARIO ====================

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: "sale" | "restock" | "adjustment" | "return";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId: string;
  saleId?: string;
  createdAt: Date;
}

export async function getInventoryMovements(productId?: string): Promise<ApiResponse<InventoryMovement[]>> {
  return get<InventoryMovement[]>("getInventoryMovements", productId ? { productId } : {});
}

export async function recordInventoryMovement(movement: Omit<InventoryMovement, "id" | "createdAt">): Promise<ApiResponse<InventoryMovement>> {
  return post<InventoryMovement>("recordInventoryMovement", movement);
}
