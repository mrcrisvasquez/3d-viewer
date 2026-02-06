# Guía de Despliegue para crisvasquez.com/3dviewer

Esta guía te muestra cómo desplegar tu 3D Model Viewer en `crisvasquez.com/3dviewer`.

## Opción 1: Vercel (Recomendado - Gratis y Fácil)

Vercel es perfecto para apps React/Vite. Ofrece:
- ✅ Hosting gratuito ilimitado
- ✅ HTTPS automático
- ✅ Despliegues automáticos desde Git
- ✅ CDN global
- ✅ Dominio personalizado gratis

### Paso 1: Preparar el proyecto

1. **Crear repositorio en GitHub** (si no lo tienes ya):
   ```bash
   cd "/Volumes/Extreme SSD/CRIS/2026/3D/axis-aligner"
   git init
   git add .
   git commit -m "Initial commit - 3D Model Viewer"
   ```

2. **Crear repositorio en GitHub.com**:
   - Ve a https://github.com/new
   - Nombra el repositorio (ej: `3d-model-viewer`)
   - Haz clic en "Create repository"

3. **Subir el código**:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/3d-model-viewer.git
   git branch -M main
   git push -u origin main
   ```

### Paso 2: Desplegar en Vercel

1. **Crear cuenta en Vercel**:
   - Ve a https://vercel.com
   - Haz clic en "Sign Up"
   - Regístrate con tu cuenta de GitHub

2. **Importar proyecto**:
   - En el dashboard de Vercel, haz clic en "Add New..." → "Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configurar el proyecto**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (dejar por defecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   
4. **Haz clic en "Deploy"** y espera 1-2 minutos

### Paso 3: Configurar el dominio personalizado en Vercel

1. **En el dashboard de tu proyecto en Vercel**:
   - Ve a "Settings" → "Domains"
   - Añade `crisvasquez.com`

2. **Vercel te dará instrucciones para configurar DNS**. Anota los valores que te proporciona.

### Paso 4: Configurar GoDaddy

1. **Iniciar sesión en GoDaddy**:
   - Ve a https://dcc.godaddy.com/manage/dns
   - Selecciona tu dominio `crisvasquez.com`

2. **Añadir registros DNS** (según las instrucciones de Vercel):
   
   **Si Vercel te pide un registro A:**
   - Tipo: `A`
   - Nombre: `@`
   - Valor: `76.76.21.21` (IP de Vercel)
   - TTL: `600`

   **Si Vercel te pide un registro CNAME:**
   - Tipo: `CNAME`
   - Nombre: `@` o `www`
   - Valor: `cname.vercel-dns.com`
   - TTL: `600`

3. **Esperar propagación**: Puede tardar de 5 minutos a 48 horas (normalmente menos de 1 hora)

### Paso 5: Configurar el Subdirectorio `/3dviewer`

Ahora configuramos para que la app esté en `/3dviewer`:

1. **Modificar `vite.config.ts`** (añade la línea `base`):
   ```typescript
   export default defineConfig(({ mode }) => ({
     base: '/3dviewer/',  // ← AÑADIR ESTA LÍNEA
     server: {
       host: "::",
       port: 8080,
       // ...resto del código
     },
     // ...
   }));
   ```

2. **Crear archivo `vercel.json`** en la raíz del proyecto:
   ```json
   {
     "rewrites": [
       {
         "source": "/3dviewer/:path*",
         "destination": "/3dviewer/:path*"
       }
     ]
   }
   ```

3. **Hacer commit y push**:
   ```bash
   git add .
   git commit -m "Configure for /3dviewer subdirectory"
   git push
   ```

Vercel automáticamente re-desplegará tu app. ¡Listo! Tu viewer estará en `crisvasquez.com/3dviewer`

---

## Opción 2: Netlify (Alternativa Gratis)

Similar a Vercel, también muy fácil:

### Pasos rápidos:

1. **Crear cuenta en Netlify**: https://netlify.com
2. **Conectar con GitHub** y selecciona tu repositorio
3. **Configuración de build**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: (dejar vacío)

4. **Configurar dominio personalizado**:
   - Settings → Domain management → Add custom domain
   - Sigue las instrucciones para configurar DNS en GoDaddy

5. **Para subdirectorio** `/3dviewer`:
   - Modifica `vite.config.ts` igual que en Vercel
   - Crea `netlify.toml`:
     ```toml
     [[redirects]]
       from = "/3dviewer/*"
       to = "/3dviewer/:splat"
       status = 200
     ```

---

## Opción 3: GitHub Pages (Gratis, Solo Sitios Estáticos)

Si prefieres GitHub Pages:

1. **Instalar gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Añadir al `package.json`**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Modificar `vite.config.ts`**:
   ```typescript
   base: '/3d-model-viewer/',  // nombre del repositorio
   ```

4. **Desplegar**:
   ```bash
   npm run deploy
   ```

5. **Configurar dominio en GitHub**:
   - Settings → Pages → Custom domain: `crisvasquez.com`
   - En GoDaddy, añade un CNAME apuntando a `tu-usuario.github.io`

---

## Recomendación Final

**Te recomiendo Vercel** porque:
- ✅ Es el más fácil de configurar
- ✅ Despliegues automáticos cuando hagas cambios
- ✅ HTTPS gratis y automático
- ✅ Excelente rendimiento global
- ✅ Soporta subdirectorios fácilmente

¿Quieres que te ayude a configurarlo paso a paso?
