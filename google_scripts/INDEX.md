# 📁 ARCHIVOS EN ESTE DIRECTORIO

## google_scripts/

Este directorio contiene TODO lo necesario para conectar tu aplicación El Inge POS AI con Google Sheets y Google Drive.

---

## 📄 LISTA DE ARCHIVOS

### 1. `SETUP_UNICO.gs` ⭐ IMPORTANTE
**Propósito:** Script de configuración inicial de 1 sola ejecución  
**Qué hace:**
- Crea las 7 hojas de cálculo con encabezados
- Pobla 12 productos del catálogo Syngenta
- Crea usuario administrador (admin / admin123)
- Crea 5 carpetas en Google Drive

**Cómo usar:**
1. Copia y pega en Apps Script
2. Ejecuta `runCompleteSetup()`
3. ¡Listo!

**Tiempo:** 2-3 minutos

---

### 2. `Code.gs`
**Propósito:** Backend completo con API REST  
**Qué incluye:**
- Todos los endpoints GET y POST
- CRUD completo para: Products, Sales, Clients, Suppliers, Users, Settings
- Sistema de autenticación de usuarios
- Upload de archivos a Google Drive
- Registro de movimientos de inventario
- Hash de contraseñas (SHA-256)

**Cuándo usar:** Después del setup, para tener la API completa

---

### 3. `README.md`
**Propósito:** Documentación técnica detallada  
**Contenido:**
- Estructura de todas las hojas
- API endpoints completos
- Ejemplos de código
- Instrucciones de deploy
- Seguridad y permisos

**Para quién:** Desarrolladores que necesitan entender la API

---

### 4. `ANALISIS_COMPLETO.md`
**Propósito:** Análisis exhaustivo del proyecto  
**Contenido:**
- Descripción de los 10 módulos del frontend
- Estructura detallada de las 7 hojas
- Catálogo completo de productos
- Sistema de usuarios y roles
- Movimientos de inventario
- Estadísticas del proyecto

**Para quién:** Stakeholders y desarrolladores que necesitan contexto completo

---

### 5. `GUIA_RAPIDA.md`
**Propósito:** Tutorial paso a paso de 5 minutos  
**Contenido:**
- Instrucciones simples de seguir
- Capturas de pantalla mentales
- Solución de problemas comunes
- Comandos útiles

**Para quién:** Primera vez configurando el sistema

---

## 🚀 FLUJO DE TRABAJO RECOMENDADO

### Día 1: Setup Inicial (5 minutos)
```
1. Leer GUIA_RAPIDA.md
2. Ejecutar SETUP_UNICO.gs
3. Verificar hojas creadas en Google Sheets
4. Verificar carpetas en Google Drive
```

### Día 1: Deploy del Backend (5 minutos)
```
1. Copiar Code.gs a Apps Script
2. Deploy como Web App
3. Obtener URL del Web App
```

### Día 2: Conexión del Frontend (2-3 horas)
```
1. Crear src/lib/googleApi.ts
2. Actualizar src/hooks/useStore.ts
3. Crear pantalla de Login
4. Probar conexión
```

### Día 3: Pruebas y Ajustes (1-2 horas)
```
1. Probar CRUD de productos
2. Probar ventas
3. Probar autenticación
4. Ajustar detalles
```

---

## 📊 RESUMEN DE HOJAS DE CÁLCULO

| Hoja | Columnas | Datos Iniciales |
|------|----------|-----------------|
| Products | 13 | 12 productos Syngenta |
| Sales | 10 | Vacío (se llena con ventas) |
| Clients | 8 | Vacío |
| Suppliers | 8 | Vacío |
| Settings | 3 | 6 configuraciones por defecto |
| Users | 11 | 1 usuario admin |
| InventoryMovements | 11 | Vacío (se llena con movimientos) |

**Total:** 7 hojas, 66 columnas, 13 registros iniciales

---

## 📊 RESUMEN DE CARPETAS DRIVE

| Carpeta | Propósito |
|---------|-----------|
| Products_Images | Fotos de productos |
| Sales_Receipts | Recibos de ventas (PDF) |
| Invoices | Facturas de compras |
| Bank_Statements | Estados de cuenta |
| Suppliers_Documents | Documentos de proveedores |

**Total:** 5 carpetas

---

## 🔌 ENDPOINTS DE LA API

### GET (Lectura)
- `getProducts`, `getProduct`
- `getSales`
- `getClients`, `getClient`
- `getSuppliers`, `getSupplier`
- `getSettings`
- `getUsers`, `getUser`
- `authenticate`
- `getFolderUrl`
- `getInventoryMovements`

**Total:** 11 endpoints

### POST (Escritura)
- `createProduct`, `updateProduct`, `deleteProduct`
- `createSale`
- `createClient`, `updateClient`, `deleteClient`
- `createSupplier`, `updateSupplier`, `deleteSupplier`
- `updateSettings`
- `createUser`, `updateUser`, `deleteUser`
- `updateUserPassword`
- `recordInventoryMovement`
- `uploadFile`

**Total:** 17 endpoints

**Grand Total:** 28 endpoints API

---

## 🎯 PRÓXIMOS PASOS (Frontend React)

### Archivos a crear:

1. **`src/lib/googleApi.ts`**
   - Cliente HTTP para Google Apps Script
   - Funciones para cada endpoint
   - Manejo de errores y CORS

2. **`src/hooks/useAuth.ts`**
   - Autenticación de usuarios
   - Manejo de sesión
   - Control de roles

3. **`src/pages/Login.tsx`**
   - Pantalla de login
   - Formulario de usuario/contraseña
   - Redirección después de login

4. **`src/components/UsersScreen.tsx`**
   - CRUD de usuarios
   - Gestión de roles
   - Cambio de contraseña

### Archivos a actualizar:

1. **`src/hooks/useStore.ts`**
   - Reemplazar estado local con llamadas a API
   - Mantener compatibilidad
   - Agregar loading states

2. **`src/App.tsx`**
   - Agregar ruta de Login
   - Proteger rutas con autenticación
   - Manejar sesión expirada

3. **`src/components/Header.tsx`**
   - Mostrar usuario logueado
   - Botón de logout
   - Información de sesión

---

## 📞 RECURSOS ADICIONALES

### Google Apps Script
- [Documentación oficial](https://developers.google.com/apps-script)
- [Guía de Web Apps](https://developers.google.com/apps-script/guides/web)
- [Límites y cuotas](https://developers.google.com/apps-script/guides/services/quotas)

### Google Sheets API
- [Spreadsheet API](https://developers.google.com/sheets/api)
- [Drive API](https://developers.google.com/drive/api)

### React
- [React Query](https://tanstack.com/query) - Para manejo de datos
- [React Router](https://reactrouter.com) - Para rutas
- [Zustand](https://zustand-demo.pmnd.rs) - Para estado global (alternativa a hooks)

---

## 🔐 CREDENCIALES POR DEFECTO

### Usuario Administrador
```
Username: admin
Password: admin123
Role: admin
```

### IDs de Recursos
```
Spreadsheet ID: 13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc
Drive Folder ID: 1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ
```

---

## ⚠️ IMPORTANTE

1. **Seguridad:** Cambia la contraseña de admin después del primer login
2. **Backups:** Exporta datos regularmente con `exportCurrentData()`
3. **Permisos:** No compartas el Web App URL públicamente
4. **Rate Limits:** Google limita a ~100 requests/minuto
5. **Producción:** Considera usar Firebase para mayor seguridad

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa `GUIA_RAPIDA.md` - Solución de problemas comunes
2. Revisa `ANALISIS_COMPLETO.md` - Contexto detallado
3. Revisa el **Execution Log** en Apps Script
4. Verifica los permisos de tu cuenta de Google

---

**Hecho con ❤️ para El Inge POS AI**  
**Versión:** 1.0  
**Fecha:** 2026-03-24
