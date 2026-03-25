# 🔐 Configuración de Google OAuth2

## 📋 Overview

La aplicación ahora soporta **Google Sign-In** para autenticación segura y automática de usuarios.

---

## 🚀 Pasos para Configurar Google OAuth2

### Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Click en **"Select a project"** > **"NEW PROJECT"**
3. Nombre: `El Inge POS AI`
4. Click en **"CREATE"**

---

### Paso 2: Configurar OAuth Consent Screen

1. En el menú lateral: **APIs & Services** > **OAuth consent screen**
2. Selecciona **"External"** (usuarios fuera de tu organización)
3. Click en **"CREATE"**

4. Llena el formulario:
   - **App name**: El Inge POS AI
   - **User support email**: tu-email@gmail.com
   - **App logo**: (opcional)
   - **App domain**: 
     - Production: `https://tu-app.vercel.app`
     - Development: dejar vacío por ahora
   - **Contact email**: tu-email@gmail.com

5. Click en **"SAVE AND CONTINUE"**

6. **Scopes**: No agregues scopes por ahora (solo necesitamos el perfil básico)
   - Click en **"SAVE AND CONTINUE"**

7. **Test users**: Agrega tu email personal para pruebas
   - Click en **"ADD USER"**
   - Ingresa tu email de Google
   - Click en **"SAVE AND CONTINUE"**

8. Review y **"BACK TO DASHBOARD"**

---

### Paso 3: Crear Credenciales OAuth

1. En el menú lateral: **APIs & Services** > **Credentials**
2. Click en **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**

3. **Application type**: **Web application**

4. **Name**: `El Inge POS Web`

5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   https://tu-app.vercel.app  (cuando hagas deploy)
   ```

6. **Authorized redirect URIs**:
   ```
   http://localhost:5173
   http://localhost:3000
   https://tu-app.vercel.app
   ```

7. Click en **"CREATE"**

8. **Copia el Client ID** - Lo necesitarás en el siguiente paso!

---

### Paso 4: Actualizar el Código Frontend

1. Abre: `src/components/LoginScreen.tsx`

2. Busca esta línea (alrededor de la línea 53):
   ```typescript
   client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
   ```

3. Reemplaza con tu Client ID:
   ```typescript
   client_id: "1234567890-abcdefghijklmnop.apps.googleusercontent.com",
   ```

---

### Paso 5: Actualizar el Backend (Google Apps Script)

El backend ya está configurado para aceptar tokens de Google. No necesitas cambiar nada en `Code.gs`.

La función `authenticateGoogle(token)` ya:
- ✅ Valida el token JWT de Google
- ✅ Verifica que no haya expirado
- ✅ Extrae email, nombre, avatar del usuario
- ✅ Busca o crea el usuario automáticamente en Google Sheets

---

### Paso 6: Probar el Login con Google

1. Inicia la app en desarrollo:
   ```bash
   npm run dev
   ```

2. En la pantalla de login, haz click en **"Continuar con Google"**

3. Selecciona tu cuenta de Google

4. Deberías ser autenticado y redirigido a la app

5. **Usuario nuevo**: Se crea automáticamente en la hoja "Users" con:
   - googleId: El ID de tu cuenta Google
   - googleEmail: Tu email de Gmail
   - avatar: Tu foto de perfil
   - role: "user" (puedes cambiarlo manualmente en Sheets a "admin")

---

## 🎯 Flujo de Autenticación

### Login Tradicional (Username/Password):
```
Usuario ingresa credenciales
       ↓
Frontend envía a /authenticate
       ↓
Backend verifica password hash
       ↓
Retorna user + token
       ↓
Guarda en localStorage
       ↓
Acceso concedido
```

### Login con Google:
```
Usuario click "Continuar con Google"
       ↓
Google muestra popup de autenticación
       ↓
Usuario selecciona cuenta
       ↓
Google retorna ID Token (JWT)
       ↓
Frontend envía token a /authenticateGoogle
       ↓
Backend valida token JWT
       ↓
Backend extrae: email, nombre, avatar
       ↓
¿Usuario existe? → Login
       ↓
¿Usuario nuevo? → Crear automáticamente
       ↓
Retorna user + token
       ↓
Guarda en localStorage
       ↓
Acceso concedido
```

---

## 📊 Estructura de Usuarios en Google Sheets

### Hoja "Users" - Columnas Actualizadas:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único |
| username | String | Nombre de usuario |
| email | String | Email |
| passwordHash | String | Hash (vacío para Google Auth) |
| role | String | "admin" o "user" |
| fullName | String | Nombre completo |
| phone | String | Teléfono |
| **googleId** | String | ID de cuenta Google ⭐ |
| **googleEmail** | String | Email de Gmail ⭐ |
| **avatar** | String | URL de foto de perfil ⭐ |
| active | Boolean | Cuenta activa |
| lastLogin | Date | Último login |
| **loginType** | String | "google" o "password" ⭐ |
| createdAt | Date | Fecha creación |
| updatedAt | Date | Última actualización |

---

## 🔐 Seguridad

### Tokens de Google:
- ✅ Validados con JWT decode
- ✅ Verificación de expiración
- ✅ Extracción segura de datos

### Tokens de Sesión:
- ✅ UUID único por sesión
- ✅ Guardado en localStorage
- ✅ Enviado en cada petición

### Passwords:
- ✅ Hash SHA-256
- ✅ Nunca se envían por la red
- ✅ No se retornan en respuestas API

---

## 🐛 Solución de Problemas

### Error: "invalid_client"
**Causa:** Client ID incorrecto  
**Solución:** Verifica que el Client ID en `LoginScreen.tsx` sea correcto

### Error: "redirect_uri_mismatch"
**Causa:** El dominio no está en los Authorized redirect URIs  
**Solución:** Agrega tu dominio en Google Cloud Console

### Error: "Token expirado"
**Causa:** El token de Google caducó (1 hora)  
**Solución:** El usuario debe iniciar sesión nuevamente

### El botón de Google no aparece
**Causa:** Script de Google no cargó  
**Solución:** 
1. Revisa la consola del navegador
2. Verifica que el dominio esté autorizado
3. Prueba en modo incógnito

### Usuario no se crea automáticamente
**Causa:** Error en `authenticateGoogle`  
**Solución:** 
1. Revisa el log de ejecuciones en Apps Script
2. Verifica que la hoja "Users" tenga las columnas correctas

---

## 🎨 Personalización

### Cambiar el Tema del Botón

En `LoginScreen.tsx`, modifica la configuración:

```typescript
google.accounts.id.renderButton(buttonContainer, {
  theme: "outline",  // "outline" | "filled_blue" | "filled_black"
  size: "large",     // "large" | "medium" | "small"
  width: "100%",
  text: "signin_with",  // "signin_with" | "signup_with" | "continue_with"
});
```

### Logo de la App

En el OAuth Consent Screen, puedes subir tu logo para que aparezca en el popup de Google.

---

## 📝 Notas Importantes

1. **Test Users**: Mientras la app esté en modo "Testing", solo los usuarios en la lista de "Test users" pueden iniciar sesión.

2. **Producción**: Para publicar, necesitas verificar tu app en Google (puede requerir revisión).

3. **Límites**: 
   - 100 usuarios en modo testing
   - Ilimitados en producción (después de verificación)

4. **Privacidad**: Debes tener una política de privacidad si manejas datos de usuarios.

---

## 🔗 Recursos Útiles

- [Google Identity Services Docs](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth2 Playground](https://developers.google.com/oauthplayground/)
- [JWT Decoder](https://jwt.io/)

---

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Google Cloud
- [ ] OAuth Consent Screen configurado
- [ ] Credenciales OAuth creadas
- [ ] Client ID copiado
- [ ] Frontend actualizado con Client ID
- [ ] Dominios autorizados configurados
- [ ] Test users agregados
- [ ] Login probado exitosamente
- [ ] Hoja "Users" con columnas actualizadas

---

**Hecho con ❤️ para El Inge POS AI**  
**Versión:** 2.1 con Google OAuth2  
**Fecha:** 2026-03-24
