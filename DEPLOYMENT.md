# 🚀 Guía de Deployment - El Inge POS AI

## 📋 Descripción

Sistema de Punto de Venta (POS) para tienda de productos agrícolas con:
- ✅ Google Sheets como backend
- ✅ Google Drive para almacenamiento de imágenes
- ✅ Autenticación con Google OAuth2
- ✅ OCR para escaneo de productos
- ✅ Interfaz moderna con React + Vite + TailwindCSS

---

## 🔗 Repositorios

- **GitHub:** https://github.com/rodiphone220-sys/el-_inge_stock_app
- **Google Sheets:** https://docs.google.com/spreadsheets/d/13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc
- **Google Drive:** https://drive.google.com/drive/folders/1WEHDtOtDc4XC4EDQsyVowep5rto70DvQ

---

## 🎯 Deploy en Vercel (Paso a Paso)

### Opción 1: Deploy Automático (Recomendado)

#### 1. **Conectar GitHub con Vercel**
```
1. Ve a: https://vercel.com/new
2. Click en "Import Git Repository"
3. Selecciona tu repositorio: rodiphone220-sys/el-_inge_stock_app
4. Click "Import"
```

#### 2. **Configurar Build**
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 3. **Variables de Entorno (OPCIONAL)**
Si quieres personalizar algo, agrega:
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx1nfN662dZpGRZp1brE0I636ABZKX_m3Rdoe4Low_VXJkwKmKm6x5kY9DWv62B-2Xb/exec
```

#### 4. **Deploy**
```
Click en "Deploy"
Espera ~1-2 minutos
¡Listo! Tu app estará en: https://tu-app.vercel.app
```

---

### Opción 2: Deploy con Vercel CLI

#### 1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

#### 2. **Login**
```bash
vercel login
```

#### 3. **Deploy**
```bash
cd c:\rod_apps\el_inge_appv1
vercel
```

#### 4. **Seguir instrucciones**
- ¿Link to existing project? **No** (la primera vez)
- ¿What's your project's name? **el-inge-pos-app**
- ¿Which scope do you want to link to? **Tu cuenta**
- ¿Found project settings? **Yes**
- ¿Want to override the settings? **No**

#### 5. **Deploy a Producción**
```bash
vercel --prod
```

---

## 🔧 Configuración de Google Apps Script

### 1. **Verificar Web App URL**

En `src/lib/googleApi.ts`, asegúrate de que:
```typescript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx1nfN662dZpGRZp1brE0I636ABZKX_m3Rdoe4Low_VXJkwKmKm6x5kY9DWv62B-2Xb/exec";
```

### 2. **Verificar Permisos del Web App**

En Google Apps Script:
```
Deploy > Manage deployments
- Execute as: Me
- Who has access: Anyone
```

### 3. **Habilitar Google Drive API** (para imágenes)

En Google Cloud Console:
```
https://console.cloud.google.com/apis/library/drive.googleapis.com
Click "Enable"
```

---

## 🌐 Dominio Personalizado (Opcional)

### 1. **En Vercel Dashboard**
```
Project Settings > Domains
Agregar dominio: tudominio.com
```

### 2. **Configurar DNS**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. **Esperar propagación** (5-30 minutos)

---

## 📱 URLs Después del Deploy

| Ambiente | URL |
|----------|-----|
| **Development** | http://localhost:8080 |
| **Preview** | https://el-inge-pos-app-xxx.vercel.app |
| **Production** | https://el-inge-pos-app.vercel.app |
| **Dominio Personalizado** | https://tudominio.com |

---

## 🔍 Monitoreo y Logs

### 1. **Vercel Dashboard**
```
https://vercel.com/dashboard
Selecciona tu proyecto > Deployments > Click en el deploy > View Build Logs
```

### 2. **Google Apps Script Logs**
```
https://script.google.com/home/executions
Ver ejecuciones del Web App
```

### 3. **Google Sheets**
```
https://docs.google.com/spreadsheets/d/13agoUn9Cdp3UVjAtBtvYrTQljnSy0x85cIgWdU5Xshc
Ver productos, ventas, clientes, etc.
```

---

## 🐛 Solución de Problemas

### Error: "Failed to fetch" en Vercel

**Causa:** CORS o permisos de Google Apps Script

**Solución:**
1. Verifica que el Web App tenga: **Who has access: Anyone**
2. Haz un **nuevo deploy** del Web App en Apps Script
3. Actualiza `GOOGLE_SCRIPT_URL` en `src/lib/googleApi.ts`
4. Haz **commit y push** a GitHub

### Error: "404 Not Found" en Vercel

**Causa:** Problema con rutas de SPA

**Solución:**
El archivo `vercel.json` ya incluye rewrites para SPA. Verifica que exista.

### Error: "Build failed"

**Causa:** Errores de compilación

**Solución:**
```bash
# Prueba build localmente
npm run build

# Si falla, revisa los errores y corrígelos
# Luego haz commit y push
```

### Imágenes no se suben a Drive

**Causa:** Drive API no habilitada o permisos insuficientes

**Solución:**
1. Habilita Google Drive API en Google Cloud Console
2. Verifica que el folder ID sea correcto en `Code.gs`
3. Asegúrate de tener permisos de edición en el folder

---

## 📊 Flujo de Trabajo Recomendado

### Desarrollo Local
```bash
git pull origin main
npm install
npm run dev
# Hacer cambios
git add .
git commit -m "Descripción del cambio"
git push origin main
```

### Deploy a Producción
```bash
# Vercel detecta push a main automáticamente
# O manualmente:
vercel --prod
```

### Actualizar Google Apps Script
```
1. Editar Code.gs en Google Apps Script
2. Deploy > Manage deployments
3. Edit > New version
4. Deploy
5. Copiar nueva URL
6. Actualizar src/lib/googleApi.ts
7. Commit y push
```

---

## 🔐 Seguridad

### Variables Sensibles

**NO subir a GitHub:**
- `.env` files
- Credenciales
- API Keys

**Usar Vercel Environment Variables:**
```
Project Settings > Environment Variables
Agregar variables sensibles
```

### Google OAuth2

Para producción, configura correctamente:
```
Google Cloud Console > Credentials
Authorized JavaScript origins: https://tudominio.com
Authorized redirect URIs: https://tudominio.com
```

---

## 📈 Optimización

### 1. **Habilitar Caché**
Vercel ya incluye caché automático.

### 2. **Code Splitting**
Ya configurado en Vite.

### 3. **Imágenes Optimizadas**
Considera usar Next.js Image si migras a Next.js.

### 4. **Google Sheets Limits**
- 100 requests/minuto
- 6 minutos por ejecución
- 50 MB por request

---

## 🎉 Checklist Post-Deploy

- [ ] App carga en Vercel
- [ ] Login funciona
- [ ] CRUD de productos funciona
- [ ] Imágenes se suben a Drive
- [ ] Ventas se guardan en Sheets
- [ ] OCR funciona
- [ ] Google Login funciona (si está configurado)
- [ ] Dominio personalizado (si aplica)

---

## 📞 Soporte

### Recursos Útiles
- [Vercel Docs](https://vercel.com/docs)
- [Vite Docs](https://vitejs.dev)
- [Google Apps Script Docs](https://developers.google.com/apps-script)

### Contact
- **GitHub Issues:** https://github.com/rodiphone220-sys/el-_inge_stock_app/issues
- **Email:** rodiphone220@gmail.com

---

**¡Listo para deploy! 🚀**

**Versión:** 2.2  
**Última actualización:** 2026-03-24
