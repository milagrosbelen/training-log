# Despliegue de MiLogit para uso desde celular

Para que otros usuarios usen la app desde sus celulares, necesitás:

1. **Frontend en Vercel** ✅ (ya lo tenés)
2. **Backend en internet** (Railway, Render, Fly.io, etc.)
3. **Base de datos en la nube** (PostgreSQL)

---

## Paso 1: Desplegar el backend

### Opción A: Railway (recomendado)

1. Creá cuenta en [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub** → seleccioná tu repo
3. Elegí solo la carpeta `backend` como root (o configurá el build)
4. Agregá un servicio **PostgreSQL** desde el marketplace
5. Conectá el servicio Laravel a la base de datos (Railway te da las variables)
6. Variables de entorno en Railway para el backend:

   ```
   APP_NAME=MiLogit
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://tu-backend.up.railway.app
   
   DB_CONNECTION=pgsql
   DB_HOST=<de Railway>
   DB_PORT=5432
   DB_DATABASE=<de Railway>
   DB_USERNAME=<de Railway>
   DB_PASSWORD=<de Railway>
   ```

7. Comandos de build/deploy típicos para Laravel en Railway:
   - Build: `composer install --no-dev`
   - Start: `php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT`

8. Anotá la URL pública del backend (ej: `https://milogit-backend.up.railway.app`)

### Opción B: Render (con Docker)

**Opción B1: Usar Blueprint (recomendado)**

1. [render.com](https://render.com) → **New** → **Blueprint**
2. Conectá el repo de GitHub (training-log o el que uses)
3. Render leerá `render.yaml` y creará el servicio con la config correcta
4. Agregá PostgreSQL desde el Dashboard y las variables de entorno

**Opción B2: Crear Web Service manualmente**

1. [render.com](https://render.com) → **New** → **Web Service**
2. Conectá el repo de GitHub
3. En **Environment**: elegí **Docker** (no PHP ni Node)
4. **Root Directory**: dejalo **completamente vacío**
5. No pongas Build Command ni Start Command
6. Agregá PostgreSQL y variables de entorno

**Variables de entorno (Settings → Environment):**

```
APP_NAME=MiLogit
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:xxxx  (generar con: php artisan key:generate --show)
APP_URL=https://tu-servicio.onrender.com

DB_CONNECTION=pgsql
DB_HOST=<host de Render PostgreSQL>
DB_PORT=5432
DB_DATABASE=<nombre>
DB_USERNAME=<usuario>
DB_PASSWORD=<contraseña>
```

---

**Si aparece "Dockerfile: no such file or directory":**

1. Entrá al servicio en Render → **Settings**
2. **Root Directory**: borrá todo, debe quedar vacío
3. **Environment**: debe ser **Docker** (si dice PHP u otro, cambiá a Docker)
4. Guardá y hacé **Manual Deploy**

Si ya tenés Root Directory vacío y sigue fallando, **borrá el servicio** y crealo de nuevo con **New → Blueprint** (usá el `render.yaml` del repo).

---

## Paso 2: Configurar CORS en el backend

En `backend/config/cors.php`, si querés restringir orígenes (más seguro):

```php
'allowed_origins' => [
    'https://tu-app.vercel.app',
    'https://tu-dominio.com',
],
```

O dejá `['*']` para aceptar cualquier origen (funciona pero es menos seguro).

---

## Paso 3: Configurar Vercel (frontend)

1. En el proyecto de Vercel: **Settings** → **Environment Variables**
2. Agregá:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://tu-backend.up.railway.app/api` (la URL de tu backend + `/api`)
3. Hacé un **redeploy** para que tome la variable

---

## Paso 4: Verificar

- Abrí la URL de Vercel desde el celular
- Registrá un usuario o iniciá sesión
- Los datos se guardan en la base de datos del backend

---

## Resumen de URLs

| Dónde           | URL ejemplo                                  |
|-----------------|-----------------------------------------------|
| Frontend (Vercel) | `https://milogit.vercel.app`                 |
| Backend (Railway) | `https://milogit-backend.up.railway.app`     |
| API             | `https://milogit-backend.up.railway.app/api` |
