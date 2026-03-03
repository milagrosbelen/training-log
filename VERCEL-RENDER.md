# Conectar Vercel (frontend) con Render (backend)

Guía paso a paso para que tu app funcione: frontend en Vercel y backend en Render.

---

## Paso 1: Desplegar el backend en Render

### 1.1 Crear base de datos PostgreSQL en Render

1. Entrá a [render.com](https://render.com) e iniciá sesión
2. **New** → **PostgreSQL**
3. Nombre: `milogit-db` (o el que quieras)
4. **Create Database**
5. Esperá a que esté listo y **anotá** (en **Connection**):
   - **Internal Database URL** (o Host, Port, Database, Username, Password)

### 1.2 Crear el Web Service (backend)

1. **New** → **Web Service**
2. Conectá tu repo de GitHub (`registro-entrenamiento` o como se llame)
3. Configuración:
   - **Name:** `milogit-backend`
   - **Region:** la más cercana a vos
   - **Runtime:** **Docker**
   - **Root Directory:** dejalo **vacío** (el Dockerfile está en la raíz)
   - Dejá Build y Start Command vacíos

4. **Environment Variables** → **Add Environment Variable**. Agregá:

   | Key | Value |
   |-----|-------|
   | `APP_NAME` | MiLogit |
   | `APP_ENV` | production |
   | `APP_DEBUG` | false |
   | `APP_KEY` | `base64:xxxx` (ver abajo cómo generarlo) |
   | `APP_URL` | `https://milogit-backend.onrender.com` (o la URL que te asigne Render) |
   | `DB_CONNECTION` | pgsql |
   | `DB_HOST` | *(host de tu PostgreSQL en Render)* |
   | `DB_PORT` | 5432 |
   | `DB_DATABASE` | *(nombre de la DB)* |
   | `DB_USERNAME` | *(usuario)* |
   | `DB_PASSWORD` | *(contraseña)* |

   Si Render te da una **Database URL**, podés usar solo `DATABASE_URL` en vez de DB_HOST, DB_PORT, etc. (Laravel la interpreta automáticamente).

5. **Create Web Service**

**Generar APP_KEY:** en tu máquina, dentro de la carpeta `backend`:

```bash
cd backend
php artisan key:generate --show
```

Copiá el valor y usalo en `APP_KEY`.

### 1.3 Anotar la URL del backend

Cuando termine el deploy, Render te da una URL tipo:
`https://milogit-backend.onrender.com`

**Importante:** la URL de la API es esa misma + `/api`, por ejemplo:
`https://milogit-backend.onrender.com/api`

---

## Paso 2: Configurar Vercel (frontend)

1. Entrá a [vercel.com](https://vercel.com) → tu proyecto
2. **Settings** → **Environment Variables**
3. Agregá una variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://milogit-backend.onrender.com/api` *(reemplazá con tu URL real de Render)*
   - **Environment:** Production (y Preview si querés)

4. **Save**
5. **Deployments** → los tres puntitos del último deploy → **Redeploy**

---

## Paso 3: Verificar que CORS esté bien

El archivo `backend/config/cors.php` ya tiene configurado tu dominio de Vercel. Si tu app tiene otra URL, actualizá `allowed_origins` con la URL correcta.

---

## Paso 4: Probar

1. Abrí tu app en Vercel: `https://training-log-drab.vercel.app` (o la URL que tengas)
2. Registrá un usuario o iniciá sesión
3. Si todo está bien, no deberías ver errores de CORS y los datos se guardan en la base de datos de Render

---

## Resumen de URLs

| Servicio | URL ejemplo |
|----------|-------------|
| Frontend (Vercel) | `https://training-log-drab.vercel.app` |
| Backend (Render) | `https://milogit-backend.onrender.com` |
| **API (para VITE_API_URL)** | `https://milogit-backend.onrender.com/api` |

---

## Errores comunes

### "No 'Access-Control-Allow-Origin' header"
- Revisá que `VITE_API_URL` termine en `/api`
- Revisá que el backend en Render esté corriendo y responda

### "Failed to load resource: net::ERR_FAILED"
- Comprobá que la URL del backend sea correcta y que Render no esté dormido (el plan gratuito “duerme” después de inactividad)
