# 🔧 SOLUCIÓN - Imagen no se guarda en Drive

## ❌ Problema:
```
Error en POST uploadProductImage: TypeError: Failed to fetch
```

La imagen **SÍ se muestra** en la app (se guarda en base64 temporalmente) pero **NO se sube a Google Drive**.

---

## ✅ Solución: Nuevo Deploy con Permisos Correctos

### Paso 1: En Apps Script

1. Abre: https://script.google.com/
2. Selecciona tu proyecto
3. Click en **"Deploy"** > **"Manage deployments"**
4. Click en el ícono de **lápiz** (editar) en tu deployment activo
5. En **"Version"**, selecciona: **"New version"**
6. Description: "Fix upload images"
7. Click en **"Deploy"**

### Paso 2: Verificar Permisos

En la ventana de deploy, asegúrate de:

| Configuración | Valor Correcto |
|--------------|----------------|
| **Execute as** | Me (tu email) |
| **Who has access** | Anyone (cualquiera) |

**IMPORTANTE:** Debe decir **"Anyone"** NO "Anyone with Google account"

### Paso 3: Copiar Nueva URL

Después del deploy, copia la NUEVA URL del Web App.

### Paso 4: Actualizar Frontend

En `src/lib/googleApi.ts`:

```typescript
const GOOGLE_SCRIPT_URL = "TU_NUEVA_URL_AQUI";
```

### Paso 5: Rebuild

```bash
npm run build
```

---

## 🧪 Verificar que Funciona

### 1. Abre la consola (F12)

### 2. Sube una imagen de producto

### 3. Deberías ver:

**ANTES (Error):**
```
❌ Error subiendo imagen: Failed to fetch
```

**DESPUÉS (Éxito):**
```
✅ Imagen subida automáticamente desde OCR: https://drive.google.com/...
📦 Respuesta de Google Sheets: { success: true, data: {...} }
✅ Producto guardado en Google Sheets
```

### 4. Verifica en Google Drive:

Abre: https://drive.google.com/drive/folders/1SpKW6DeCkBnu_8_gX5yPggQhZNBfu5hM

Deberías ver:
```
📁 Products_Images/
   ├── product_prod-1234567890.jpg
   └── product_prod-0987654321.jpg
```

---

## 🐛 Si Sigue Fallando

### Causa Posible 1: Permisos del Folder

Verifica que el folder `1SpKW6DeCkBnu_8_gX5yPggQhZNBfu5hM`:
- ✅ Sea tuyo (lo creaste tú)
- ✅ Tengas permisos de edición
- ✅ No esté compartido con restricciones

### Causa Posible 2: API No Habilitada

En Google Cloud Console:
1. Ve a: https://console.cloud.google.com/apis/library/drive.googleapis.com
2. Verifica que **Google Drive API** esté **HABILITADA**

### Causa Posible 3: Cuota Excedida

Google Apps Script tiene límites:
- 100 requests/minuto
- 6 minutos por ejecución
- 50 MB por request

Si excedes los límites, espera 1 minuto e intenta de nuevo.

---

## 📝 Flujo Correcto

```
1. OCR analiza imagen
   ↓
2. Imagen se guarda en base64 (temporal)
   ↓
3. Click "GUARDAR PRODUCTO"
   ↓
4. Se sube imagen a Google Drive
   ↓
5. Drive retorna URL: https://drive.google.com/uc?id=ABC123
   ↓
6. Producto se guarda en Sheets con imageUrl
   ↓
7. ✅ Imagen visible en lista de productos
```

---

## 🎯 Verificación Final

### En la Consola del Navegador:

Busca estos logs:

```javascript
// Al subir imagen:
✅ Imagen subida automáticamente desde OCR: https://drive.google.com/uc?id=...

// Al guardar producto:
📦 Intentando guardar producto: { name: "ALBARDÓN", imageUrl: "https://..." }
📦 Respuesta de Google Sheets: { success: true, data: {...} }
✅ Producto guardado en Google Sheets: {...}
```

### En Google Sheets:

Hoja "Products", columna `imageUrl`:
```
https://drive.google.com/uc?id=1ABC123XYZ...
```

### En Google Drive:

Folder: `1SpKW6DeCkBnu_8_gX5yPggQhZNBfu5hM`
```
✅ product_prod-1234567890.jpg (visible)
```

---

## ⚡ Solución Rápida

Si necesitas una solución rápida mientras arreglas el deploy:

### Opción A: Usar Imgur (gratis, sin auth)
- Sube imágenes a Imgur en lugar de Drive
- Más rápido, sin problemas de CORS

### Opción B: Base64 en Google Sheets
- Guarda imagen como base64 directamente en Sheets
- Limitado a imágenes pequeñas (<100KB)

### Opción C: Firebase Storage
- Más robusto, requiere configuración
- Mejor para producción

---

**¿Ya hiciste el nuevo deploy? ¿Funcionó?** 🚀
