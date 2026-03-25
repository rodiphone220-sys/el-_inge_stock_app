# 📊 ANÁLISIS COMPLETO DEL PROYECTO - El Inge POS AI

## 🔍 Resumen Ejecutivo

**Tipo de Aplicación:** Sistema Punto de Venta (POS) para tienda de productos agrícolas  
**Versión:** v2.0  
**Tecnología:** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui  
**Backend Propuesto:** Google Sheets + Google Drive vía Google Apps Script

---

## 📱 MÓDULOS DE LA APLICACIÓN

### 1. 💰 POS (Punto de Venta / Caja)
**Componente:** `POSScreen.tsx`

**Funcionalidades:**
- Catálogo de productos con grid interactivo
- Carrito de compras en tiempo real
- Cálculo de subtotal, IVA (16% o exento) y total
- Escáner de código de barras integrado
- Productos externos (sin control de inventario)
- Kits predefinidos (combinación de productos)
- Generación de ticket PDF

**Datos que maneja:**
- Productos del inventario
- Carrito de compras (temporal)
- Ventas finalizadas
- Configuración de IVA

---

### 2. 📸 Escáner
**Componentes:** `ScannerScreen.tsx`, `BarcodeScanner.tsx`

**Funcionalidades:**
- Lectura de códigos de barras con cámara
- Feedback visual y de vibración
- Búsqueda de productos por barcode
- Compatible con dispositivos móviles

**Datos que maneja:**
- Códigos de barras de productos

---

### 3. 📦 Inventario
**Componente:** `InventoryScreen.tsx`

**Funcionalidades:**
- CRUD completo de productos
- Búsqueda por nombre o código de barras
- Filtro por categoría
- Alertas de stock bajo (visual con ícono)
- Control de stock mínimo
- Productos categorizados por colores

**Datos que maneja:**
- Productos (CRUD)
- Categorías: insecticida, herbicida, fungicida, fertilizante, adherente, bioestimulante, externo

---

### 4. 👥 Clientes
**Componente:** `ClientsScreen.tsx`

**Funcionalidades:**
- CRUD completo de clientes
- Búsqueda por nombre o RFC
- Información de contacto completa

**Datos que maneja:**
- Clientes (CRUD)
- Campos: nombre, teléfono, email, RFC, dirección

---

### 5. 🚛 Proveedores
**Componente:** `SuppliersScreen.tsx`

**Funcionalidades:**
- CRUD completo de proveedores
- Búsqueda por empresa o contacto
- Información completa de contacto

**Datos que maneja:**
- Proveedores (CRUD)
- Campos: empresa, contacto, teléfono, email, dirección

---

### 6. 📊 Análisis
**Componente:** `AnalysisScreen.tsx`

**Funcionalidades:**
- Estadísticas de ventas (total ventas, ingresos, piezas vendidas)
- Alertas de stock (productos bajos y agotados)
- Propuesta de compra automática
- Historial de ventas recientes
- Gráficas y métricas

**Datos que maneja:**
- Ventas históricas
- Inventario actual
- Alertas de stock

---

### 7. ⚙️ Ajustes
**Componente:** `SettingsScreen.tsx`

**Funcionalidades:**
- Configuración del negocio
- Vista previa de ticket
- Datos fiscales del negocio

**Datos que maneja:**
- Nombre del negocio
- Dirección
- Teléfono
- RFC
- Email
- Eslogan

---

### 8. ℹ️ Info
**Componente:** `InfoScreen.tsx`

**Funcionalidades:**
- Información de la aplicación
- Horarios y ubicación
- Calendario agrícola (Primavera-Verano, Otoño-Invierno)
- Tip para instalar como PWA

**Datos que maneja:**
- Información estática (no requiere persistencia)

---

### 9. 🧾 Ticket PDF
**Componente:** `TicketPDF.tsx`

**Funcionalidades:**
- Vista previa de ticket de venta
- Impresión directa
- Descarga como PDF
- Diseño térmico 80mm

**Datos que maneja:**
- Venta finalizada
- Configuración del negocio

---

### 10. 📦 Producto Externo
**Componente:** `AddExternalProductModal.tsx`

**Funcionalidades:**
- Agregar productos no catalogados
- No afecta inventario
- Precio y cantidad personalizables

**Datos que maneja:**
- Productos temporarios de venta

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS (Google Sheets)

### Hoja 1: Products
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| id | String | ID único | "1" |
| name | String | Nombre del producto | "Denim" |
| category | String | Categoría | "insecticida" |
| price | Number | Precio unitario | 850 |
| stock | Number | Stock actual | 24 |
| unit | String | Unidad de medida | "Lt" |
| minStock | Number | Stock mínimo alerta | 5 |
| emoji | String | Emoji representativo | "🛡️" |
| barcode | String | Código de barras | "7501234560010" |
| isExternal | Boolean | ¿Producto externo? | false |
| imageUrl | String | URL de imagen en Drive | "" |
| createdAt | Date | Fecha creación | 2026-03-24 |
| updatedAt | Date | Última actualización | 2026-03-24 |

---

### Hoja 2: Sales
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| id | String | ID de venta | "V-1234567890" |
| items | JSON | Array de productos vendidos | `[{"product":{...}, "quantity":2}]` |
| subtotal | Number | Subtotal antes de IVA | 1000 |
| iva | Number | Monto de IVA | 160 |
| total | Number | Total final | 1160 |
| date | String | Fecha y hora de venta | "24/3/2026 10:30:00" |
| ivaCondition | String | Condición de IVA | "aplica" o "exento" |
| clientId | String | ID del cliente (opcional) | "cli-123" |
| receiptUrl | String | URL del recibo en Drive | "" |
| createdAt | Date | Fecha de creación | 2026-03-24 |

---

### Hoja 3: Clients
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| id | String | ID único de cliente | "cli-1234567890" |
| name | String | Nombre completo | "Juan Pérez" |
| phone | String | Teléfono | "(489) 123-4567" |
| email | String | Correo electrónico | "juan@email.com" |
| rfc | String | RFC | "PEPJ800101XXX" |
| address | String | Dirección completa | "Calle Principal #123" |
| createdAt | Date | Fecha creación | 2026-03-24 |
| updatedAt | Date | Última actualización | 2026-03-24 |

---

### Hoja 4: Suppliers
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| id | String | ID único de proveedor | "sup-1234567890" |
| company | String | Nombre de empresa | "Syngenta México" |
| contact | String | Persona de contacto | "María González" |
| phone | String | Teléfono | "(55) 1234-5678" |
| email | String | Correo electrónico | "contacto@syngenta.com" |
| address | String | Dirección completa | "Av. Reforma 123, CDMX" |
| createdAt | Date | Fecha creación | 2026-03-24 |
| updatedAt | Date | Última actualización | 2026-03-24 |

---

### Hoja 5: Settings
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| key | String | Clave de configuración | "businessName" |
| value | String | Valor de configuración | "Tienda El Inge" |
| updatedAt | Date | Última actualización | 2026-03-24 |

**Configuraciones por defecto:**
- businessName: "Tienda El Inge"
- address: "Ébano, San Luis Potosí, México"
- phone: "(489) 123-4567"
- rfc: "XXXX000000XXX"
- email: "contacto@elinge.com"
- slogan: "Soluciones Agrícolas Profesionales"

---

### Hoja 6: Users ⭐ NUEVA
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| id | String | ID único de usuario | "user-admin-001" |
| username | String | Nombre de usuario | "admin" |
| email | String | Correo electrónico | "admin@elinge.com" |
| passwordHash | String | Hash SHA-256 de contraseña | "abc123..." |
| role | String | Rol del usuario | "admin" o "user" |
| fullName | String | Nombre completo | "Administrador" |
| phone | String | Teléfono | "(489) 123-4567" |
| active | Boolean | ¿Cuenta activa? | true |
| lastLogin | Date | Último inicio de sesión | 2026-03-24 |
| createdAt | Date | Fecha creación | 2026-03-24 |
| updatedAt | Date | Última actualización | 2026-03-24 |

---

### Hoja 7: InventoryMovements ⭐ NUEVA
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| id | String | ID único de movimiento | "mov-1234567890" |
| productId | String | ID del producto | "1" |
| productName | String | Nombre del producto | "Denim" |
| type | String | Tipo de movimiento | "sale", "restock", "adjustment", "return" |
| quantity | Number | Cantidad del movimiento | -2 (venta) o +50 (reposición) |
| previousStock | Number | Stock anterior | 24 |
| newStock | Number | Stock nuevo | 22 |
| reason | String | Razón del movimiento | "Venta V-123" |
| userId | String | ID del usuario que hizo el cambio | "user-admin-001" |
| saleId | String | ID de venta relacionada (si aplica) | "V-123" |
| createdAt | Date | Fecha del movimiento | 2026-03-24 |

---

## 📂 ESTRUCTURA DE GOOGLE DRIVE

```
Main Folder: 1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ
│
├── 📁 Products_Images/
│   └── Imágenes de productos (opcional)
│
├── 📁 Sales_Receipts/
│   └── Recibos de ventas en PDF
│
├── 📁 Invoices/
│   └── Facturas de compras
│
├── 📁 Bank_Statements/
│   └── Estados de cuenta bancarios
│
└── 📁 Suppliers_Documents/
    └── Documentos de proveedores
```

---

## 🎨 CATÁLOGO DE PRODUCTOS (Syngenta)

### Insecticidas (🔵 Azul)
| ID | Nombre | Precio | Stock | Emoji | Barcode |
|----|--------|--------|-------|-------|---------|
| 1 | Denim | $850 | 24 Lt | 🛡️ | 7501234560010 |
| 2 | Ampligo | $1200 | 18 Lt | ⚔️ | 7501234560027 |
| 3 | Engeo | $780 | 30 Lt | 🎯 | 7501234560034 |
| 4 | Proclaim | $950 | 12 Kg | 💥 | 7501234560041 |
| 12 | Curacron | $620 | 16 Lt | 🐛 | 7501234560126 |

### Herbicidas (🟡 Amarillo)
| ID | Nombre | Precio | Stock | Emoji | Barcode |
|----|--------|--------|-------|-------|---------|
| 5 | Gesaprim | $320 | 45 Lt | 🌾 | 7501234560058 |
| 6 | Gramoxone | $280 | 38 Lt | 🔥 | 7501234560065 |
| 7 | Flex | $450 | 20 Lt | 💪 | 7501234560072 |

### Fungicidas (🔵 Azul)
| ID | Nombre | Precio | Stock | Emoji | Barcode |
|----|--------|--------|-------|-------|---------|
| 9 | Bravo 720 | $520 | 15 Lt | 🍄 | 7501234560096 |
| 10 | Amistar | $1100 | 10 Lt | ✨ | 7501234560102 |

### Bioestimulantes (🟢 Verde)
| ID | Nombre | Precio | Stock | Emoji | Barcode |
|----|--------|--------|-------|-------|---------|
| 8 | Isabion | $680 | 22 Lt | 🌱 | 7501234560089 |

### Adherentes (🔵 Azul)
| ID | Nombre | Precio | Stock | Emoji | Barcode |
|----|--------|--------|-------|-------|---------|
| 11 | Adigor | $380 | 28 Lt | 🧲 | 7501234560119 |

---

## 🎯 KITS PREDEFINIDOS

| Kit ID | Nombre | Productos | Descripción |
|--------|--------|-----------|-------------|
| kit-cogollero | Kit Gusano Cogollero | Denim + Adigor | Control de gusano cogollero |
| kit-maleza | Kit Control Maleza | Gesaprim + Gramoxone | Control de malezas |
| kit-proteccion | Kit Protección Total | Ampligo + Amistar + Adigor | Protección completa de cultivos |

---

## 👥 SISTEMA DE USUARIOS

### Roles Disponibles
- **admin**: Acceso completo a todas las funciones
- **user**: Acceso limitado (solo POS y funciones básicas)

### Usuario por Defecto (después del setup)
| Campo | Valor |
|-------|-------|
| Username | admin |
| Password | admin123 |
| Role | admin |
| Email | admin@elinge.com |

**⚠️ IMPORTANTE:** Cambiar la contraseña después del primer login

### Funcionalidades de Usuarios
- Autenticación (login/logout)
- Control de acceso por roles
- Registro de último login
- Historial de movimientos por usuario
- Cambio de contraseña

---

## 📊 MOVIMIENTOS DE INVENTARIO

### Tipos de Movimientos
1. **sale**: Salida por venta (automático al finalizar venta)
2. **restock**: Entrada por reposición de inventario
3. **adjustment**: Ajuste manual (corrección de inventario)
4. **return**: Devolución de cliente

### Ejemplo de Movimiento
```json
{
  "id": "mov-1234567890",
  "productId": "1",
  "productName": "Denim",
  "type": "sale",
  "quantity": -2,
  "previousStock": 24,
  "newStock": 22,
  "reason": "Venta V-1234567890",
  "userId": "user-admin-001",
  "saleId": "V-1234567890",
  "createdAt": "2026-03-24T10:30:00"
}
```

---

## 🔌 API ENDPOINTS (Google Apps Script)

### GET Endpoints
```
?action=getProducts              - Obtener todos los productos
?action=getProduct&id=1          - Obtener producto específico
?action=getSales                 - Obtener todas las ventas
?action=getClients               - Obtener todos los clientes
?action=getClient&id=cli-1       - Obtener cliente específico
?action=getSuppliers             - Obtener todos los proveedores
?action=getSupplier&id=sup-1     - Obtener proveedor específico
?action=getSettings              - Obtener configuración
?action=getUsers                 - Obtener todos los usuarios
?action=getUser&id=user-1        - Obtener usuario específico
?action=authenticate&username=admin&password=xxx - Autenticar usuario
?action=getFolderUrl&folderType=salesReceipts - Obtener URL de carpeta Drive
?action=getInventoryMovements&productId=1 - Obtener movimientos de producto
```

### POST Endpoints
```
?action=createProduct            - Crear producto
?action=updateProduct            - Actualizar producto
?action=deleteProduct            - Eliminar producto
?action=createSale               - Crear venta
?action=createClient             - Crear cliente
?action=updateClient             - Actualizar cliente
?action=deleteClient             - Eliminar cliente
?action=createSupplier           - Crear proveedor
?action=updateSupplier           - Actualizar proveedor
?action=deleteSupplier           - Eliminar proveedor
?action=updateSettings           - Actualizar configuración
?action=createUser               - Crear usuario
?action=updateUser               - Actualizar usuario
?action=deleteUser               - Eliminar usuario
?action=updateUserPassword       - Cambiar contraseña
?action=recordInventoryMovement  - Registrar movimiento de inventario
?action=uploadFile               - Subir archivo a Drive
```

---

## 🚀 SETUP EN 1 CLICK

### Archivo: `SETUP_UNICO.gs`

**Función Principal:** `runCompleteSetup()`

**Qué hace:**
1. ✅ Crea las 7 hojas de cálculo con encabezados
2. ✅ Pobla 12 productos del catálogo Syngenta
3. ✅ Crea usuario administrador (admin / admin123)
4. ✅ Crea 5 carpetas en Google Drive

**Cómo ejecutar:**
1. Abre Google Sheet > Extensiones > Apps Script
2. Pega el contenido de `SETUP_UNICO.gs`
3. Selecciona `runCompleteSetup` en el dropdown
4. Click en "Run" ▶️
5. ¡Listo!

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend (Google Apps Script)
- [ ] Copiar `Code.gs` al editor de Apps Script
- [ ] Ejecutar `runCompleteSetup()` desde `SETUP_UNICO.gs`
- [ ] Deploy como Web App
- [ ] Copiar URL del Web App

### Frontend (React)
- [ ] Crear `src/lib/googleApi.ts` - Cliente de API
- [ ] Actualizar `src/hooks/useStore.ts` - Conectar a Google Sheets
- [ ] Crear pantalla de Login
- [ ] Agregar control de sesiones
- [ ] Implementar upload de archivos a Drive
- [ ] Agregar auditoría de movimientos de inventario

---

## 📊 ESTADÍSTICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| Componentes React | 66 archivos .tsx |
| Hooks personalizados | 3 archivos |
| Tipos de datos | 8 interfaces |
| Módulos principales | 10 pantallas |
| Hojas de Google Sheets | 7 hojas |
| Carpetas de Drive | 5 carpetas |
| Productos catálogo | 12 productos Syngenta |
| Kits predefinidos | 3 kits |
| Roles de usuario | 2 roles (admin, user) |
| Tipos de movimiento | 4 tipos |

---

## 🔐 SEGURIDAD

### Contraseñas
- Hash SHA-256 antes de guardar
- Nunca se envía password hash en respuestas API
- Validación de fortaleza de contraseña (pendiente)

### Sesiones
- Token simple generado por UUID
- LastLogin tracking
- Control de usuarios activos/inactivos

### Permisos
- Admin: Acceso total
- User: Acceso limitado a POS

---

## 📞 INFORMACIÓN DE CONTACTO

**Negocio:** Tienda El Inge  
**Ubicación:** Ébano, San Luis Potosí, México  
**Especialidad:** Productos Syngenta  
**Horario:** Lun-Sáb 8:00 AM - 6:00 PM

---

## 📝 NOTAS ADICIONALES

1. **Productos Externos:** No afectan inventario, stock = 999
2. **IVA:** Toggle entre "aplica" (16%) y "exento" (0%)
3. **Kits:** Agregan múltiples productos al carrito con un click
4. **Tickets:** Formato térmico 80mm, imprimible y descargable como PDF
5. **PWA:** La app puede instalarse como aplicación nativa en móviles

---

**Documento generado:** 2026-03-24  
**Versión del análisis:** 1.0  
**Archivos relacionados:** `Code.gs`, `SETUP_UNICO.gs`, `README.md`
