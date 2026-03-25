# 🎉 Integración Frontend-Backend Completada!

## ✅ Archivos Creados/Actualizados

### Nuevos Archivos:
1. **`src/lib/googleApi.ts`** - Cliente de API para Google Apps Script
2. **`src/hooks/useAuth.ts`** - Hook de autenticación
3. **`src/components/LoginScreen.tsx`** - Pantalla de Login

### Archivos Actualizados:
1. **`src/hooks/useStore.ts`** - Ahora conecta con Google Sheets
2. **`src/App.tsx`** - Incluye pantalla de Login
3. **`src/components/Header.tsx`** - Muestra usuario y botón de logout

---

## 🔌 URLs de Conexión

### Google Apps Script Web App:
```
https://script.google.com/macros/s/AKfycbz2kVit0MLK5j1SKGp6-dj2vXTTHz915QzqCAb-zzIbtgXr0pkLmURF6_c1PQoptSVA/exec
```

### Google Sheet:
```
https://docs.google.com/spreadsheets/d/13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc
```

### Google Drive:
```
https://drive.google.com/drive/folders/1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ
```

---

## 🔐 Credenciales de Acceso

| Campo | Valor |
|-------|-------|
| **Username** | admin |
| **Password** | admin123 |
| **Role** | admin |

---

## 🚀 Cómo Probar la Integración

### 1. Iniciar la App
```bash
npm run dev
# o
bun run dev
```

### 2. Acceder a la App
- Abre: http://localhost:5173 (o el puerto que uses)
- Deberías ver la pantalla de Login

### 3. Iniciar Sesión
- Username: `admin`
- Password: `admin123`
- Click en "INICIAR SESIÓN"

### 4. Verificar Datos
Una vez dentro, deberías ver:
- ✅ Los 12 productos de Syngenta cargados desde Google Sheets
- ✅ Tu nombre de usuario en el Header (arriba a la derecha)
- ✅ Botón de logout (campana con flecha)

---

## 📊 Flujo de Datos

### Al Iniciar la App:
1. `useStore` se inicializa con datos del catálogo local (backup)
2. Efecto `useEffect` carga datos desde Google Sheets:
   - Productos
   - Ventas
   - Clientes
   - Proveedores
   - Configuración

### Al Vender:
1. Se crea la venta en Google Sheets (`createSale`)
2. Se actualiza el inventario localmente
3. Se registran movimientos de inventario (`recordInventoryMovement`)

### Al CRUD:
1. Cada operación (crear, actualizar, eliminar) se guarda en Google Sheets
2. Si falla la API, se guarda localmente (fallback)
3. La UI se actualiza inmediatamente

---

## 🎯 Endpoints Utilizados

### Autenticación:
- `authenticate(username, password)` - Login de usuarios

### Productos:
- `getProducts()` - Cargar inventario
- `createProduct()` - Nuevo producto
- `updateProduct()` - Actualizar producto
- `deleteProduct()` - Eliminar producto

### Ventas:
- `getSales()` - Historial de ventas
- `createSale()` - Nueva venta
- `recordInventoryMovement()` - Registrar movimiento

### Clientes:
- `getClients()` - Listar clientes
- `createClient()` - Nuevo cliente
- `updateClient()` - Actualizar cliente
- `deleteClient()` - Eliminar cliente

### Proveedores:
- `getSuppliers()` - Listar proveedores
- `createSupplier()` - Nuevo proveedor
- `updateSupplier()` - Actualizar proveedor
- `deleteSupplier()` - Eliminar proveedor

### Configuración:
- `getSettings()` - Obtener configuración
- `updateSettings()` - Guardar configuración

---

## 🔧 Configuración Adicional

### Cambiar URL del Web App

Si necesitas actualizar la URL, edita:
```typescript
// src/lib/googleApi.ts
const GOOGLE_SCRIPT_URL = "TU_NUEVA_URL_AQUI";
```

### Persistencia de Sesión

La sesión se guarda en `localStorage` con la clave:
```
"el_inge_auth"
```

Para limpiar la sesión:
```javascript
localStorage.removeItem("el_inge_auth");
```

---

## 🐛 Solución de Problemas

### Error: "Failed to fetch"
**Causa:** CORS o URL incorrecta  
**Solución:** Verifica que el Web App esté deployado correctamente

### Error: "Unknown action: undefined"
**Causa:** El parámetro `action` no se está enviando  
**Solución:** Revisa `googleApi.ts`, la función `get()` o `post()`

### Los datos no se cargan
**Causa:** Google Sheets vacío o permisos  
**Solución:** 
1. Verifica que `runCompleteSetup()` se haya ejecutado
2. Revisa los permisos del Web App (Anyone)

### Login no funciona
**Causa:** Usuario no existe en Google Sheets  
**Solución:** 
1. Abre la hoja "Users" en Google Sheets
2. Verifica que el usuario admin exista
3. Si no, ejecuta `seedAdminUser()` en Apps Script

---

## 📝 Características de la Integración

### ✅ Lo que SÍ funciona:
- Login con autenticación real contra Google Sheets
- Carga de productos desde Google Sheets
- CRUD completo (Productos, Clientes, Proveedores)
- Ventas se guardan en Google Sheets
- Movimientos de inventario se registran
- Configuración del negocio se sincroniza
- Sesión persistente (localStorage)
- Fallback local si falla la API

### ⚠️ Lo que necesita mejora:
- No hay indicador de "guardando..." en tiempo real
- No hay reintento automático si falla la API
- Los productos externos no se guardan en Sheets
- No hay validación de sesión expirada
- No hay refresh token

---

## 🎨 Mejoras Futuras Sugeridas

1. **Indicadores de Sync:**
   - Mostrar estado de conexión (online/offline)
   - Spinner de "Guardando..." en operaciones

2. **Mejor Manejo de Errores:**
   - Reintento automático
   - Notificaciones toast de errores
   - Cola de operaciones pendientes

3. **Seguridad:**
   - Token con expiración
   - Refresh token automático
   - Encriptación más fuerte de passwords

4. **Performance:**
   - React Query para cache de datos
   - Paginación de ventas/clientes
   - Búsqueda server-side

5. **Funcionalidades:**
   - Subida de archivos (recibos, facturas)
   - Exportar datos a Excel/PDF
   - Backup automático

---

## 📞 Comandos Útiles para Debug

### En la consola del navegador:

```javascript
// Ver sesión actual
localStorage.getItem("el_inge_auth")

// Limpiar sesión
localStorage.removeItem("el_inge_auth")

// Probar API directamente
import { getProducts } from "@/lib/googleApi"
getProducts().then(console.log)

// Ver datos del store (desde React DevTools)
// Busca el hook useStore
```

---

## 🎉 ¡Listo!

Tu app ahora está completamente integrada con Google Sheets y Google Drive.

**Próximos pasos:**
1. ✅ Probar la app en desarrollo
2. ✅ Hacer build de producción (`npm run build`)
3. ✅ Desplegar a Vercel/Netlify
4. ✅ Compartir con tu equipo!

---

**Hecho con ❤️ para El Inge POS AI**  
**Versión:** 1.0  
**Fecha:** 2026-03-24
