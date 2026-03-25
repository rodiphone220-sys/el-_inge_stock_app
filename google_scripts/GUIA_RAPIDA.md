# ⚡ GUÍA RÁPIDA DE INICIO - 5 MINUTOS

## 🎯 Objetivo
Configurar el backend de Google Sheets y Drive para El Inge POS AI

---

## 📋 REQUISITOS PREVIOS

- ✅ Tener una cuenta de Google
- ✅ Tener el Google Sheet creado: `13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc`
- ✅ Tener la carpeta de Drive creada: `1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ`

---

## 🚀 PASOS DE CONFIGURACIÓN

### Paso 1: Abrir Google Sheet (30 segundos)
```
https://docs.google.com/spreadsheets/d/13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc
```

### Paso 2: Abrir Apps Script (30 segundos)
1. En el menú superior: **Extensiones** > **Apps Script**
2. Se abrirá una nueva pestaña con el editor de código

### Paso 3: Copiar el Código (1 minuto)
1. Abre el archivo: `google_scripts/SETUP_UNICO.gs`
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)
3. Pega en el editor de Apps Script (reemplaza todo lo existente)
4. Click en **Guardar** (icono de disco 💾)
5. Nombra el proyecto: "El Inge POS Backend"

### Paso 4: Ejecutar Setup (2 minutos)
1. En la barra superior, selecciona la función: `runCompleteSetup`
2. Click en **▶️ Ejecutar**
3. **IMPORTANTE:** Cuando pida permisos:
   - Click en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Click en "Configuración avanzada" (link pequeño)
   - Click en "Ir a El Inge POS Backend (no seguro)" 
   - Click en "Permitir"
4. Espera a que termine (verás mensajes de éxito)

### Paso 5: Verificar Resultados (30 segundos)
Deberías ver mensajes como:
```
✅ ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!
📋 Resumen:
   - 7 hojas creadas: Products, Sales, Clients, Suppliers, Settings, Users, InventoryMovements
   - 12 productos del catálogo Syngenta agregados
   - 1 usuario administrador creado (admin / admin123)
   - 5 carpetas de Drive creadas
```

### Paso 6: Verificar en Google Sheets (30 segundos)
1. Regresa a tu Google Sheet
2. Deberías ver 7 pestañas en la parte inferior:
   - Products
   - Sales
   - Clients
   - Suppliers
   - Settings
   - Users
   - InventoryMovements

### Paso 7: Verificar en Google Drive (30 segundos)
1. Abre: https://drive.google.com/drive/folders/1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ
2. Deberías ver 5 carpetas:
   - Products_Images
   - Sales_Receipts
   - Invoices
   - Bank_Statements
   - Suppliers_Documents

---

## ✅ DATOS CREADOS

### 📦 Productos (12 items)
- 5 Insecticidas (Denim, Ampligo, Engeo, Proclaim, Curacron)
- 3 Herbicidas (Gesaprim, Gramoxone, Flex)
- 2 Fungicidas (Bravo 720, Amistar)
- 1 Bioestimulante (Isabion)
- 1 Adherente (Adigor)

### 👤 Usuario Administrador
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** admin
- **Email:** admin@elinge.com

⚠️ **CAMBIA LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN!**

---

## 🔌 SIGUIENTE PASO: CONECTAR EL FRONTEND

Ahora necesitas conectar tu aplicación React a este backend:

1. **Deploy del Web App** (si aún no lo haces):
   - En Apps Script: **Deploy** > **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copia la URL que te dan

2. **Crear archivo de API** (en tu proyecto React):
   ```bash
   # En tu proyecto React, crea:
   src/lib/googleApi.ts
   ```

3. **Actualizar el store** para usar la API:
   ```bash
   # Actualiza:
   src/hooks/useStore.ts
   ```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "No tienes permiso"
- Asegúrate de ser el dueño del Google Sheet
- Verifica que el Spreadsheet ID es correcto
- Ejecuta desde TU cuenta de Google

### Error: "La hoja ya existe"
- El setup ya se ejecutó antes
- Las hojas existentes NO se modifican
- Puedes borrarlas y volver a ejecutar si quieres reiniciar

### Error: "No se pudo conectar con Drive"
- Verifica que el Folder ID es correcto
- Asegúrate de tener permisos en la carpeta
- La carpeta debe ser tuya o tener acceso de edición

### Error: "Script timeout"
- Es normal si es la primera vez
- Google pide permisos adicionales
- Vuelve a ejecutar la función

---

## 📞 COMANDOS ÚTILES EN APPS SCRIPT

### Verificar estado actual
```javascript
checkSetupStatus()
```

### Resetear TODO (PELIGROSO)
```javascript
dangerousResetDatabase()
```

### Exportar datos actuales
```javascript
exportCurrentData()
```

### Crear solo las hojas
```javascript
createAllSheets()
```

### Poblar solo productos
```javascript
seedProducts()
```

### Crear solo admin
```javascript
seedAdminUser()
```

---

## 📚 ARCHIVOS RELACIONADOS

| Archivo | Propósito |
|---------|-----------|
| `SETUP_UNICO.gs` | Script de configuración inicial (1-click) |
| `Code.gs` | Backend completo con todos los endpoints API |
| `README.md` | Documentación detallada de la API |
| `ANALISIS_COMPLETO.md` | Análisis exhaustivo del proyecto |

---

## 🎉 ¡LISTO!

Si llegaste hasta aquí, ya tienes:
- ✅ 7 hojas de cálculo configuradas
- ✅ 12 productos cargados
- ✅ 1 usuario administrador
- ✅ 5 carpetas de Drive organizadas

**Tiempo total estimado:** 5-7 minutos

---

**¿Siguiendo el tutorial?** Ahora continúa con la conexión del frontend React.

**¿Tienes dudas?** Revisa `ANALISIS_COMPLETO.md` para más detalles.
