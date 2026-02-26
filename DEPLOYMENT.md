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

### Opción B: Render

1. [render.com](https://render.com) → New → Web Service
2. Conectá el repo y apuntá a la carpeta `backend`
3. Agregá un servicio **PostgreSQL** desde Render
4. Configurá variables de entorno igual que arriba
5. Comando de start: `php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT`

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
