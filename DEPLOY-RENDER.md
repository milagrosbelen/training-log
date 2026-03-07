# Deploy Backend Laravel en Render – Guía paso a paso

Tu frontend React + Tailwind ya está en Vercel. Esta guía te lleva a desplegar el backend Laravel en Render desde cero.

---

## Requisitos previos

- Cuenta en [Render](https://render.com) (gratis)
- Repo en GitHub con el código del proyecto
- PostgreSQL local (solo para desarrollo; en Render usamos PostgreSQL de Render)

---

## Parte 1: Crear PostgreSQL en Render

1. Entrá a [Render Dashboard](https://dashboard.render.com)
2. **New +** → **PostgreSQL**
3. Configurá:
   - **Name:** `milogit-db`
   - **Database:** `milogit` (o el que quieras)
   - **User:** se genera automáticamente
   - **Region:** la más cercana (ej. Oregon)
4. **Create Database**
5. Esperá 1–2 minutos hasta que esté **Available**
6. En **Info** → **Internal Database URL**, copiá la URL (ej: `postgres://user:pass@host/dbname?sslmode=require`)

> Guardá esa URL; la vas a usar en el siguiente paso.

---

## Parte 2: Crear Web Service (Backend)

1. En el Dashboard de Render, **New +** → **Web Service**
2. Conectá tu repo de GitHub si aún no está conectado
3. Seleccioná el repo `registro-entrenamiento` (o como se llame)
4. Configurá:

   | Campo | Valor |
   |-------|-------|
   | **Name** | `milogit-backend` |
   | **Region** | La misma que la base de datos |
   | **Runtime** | **Docker** |
   | **Root Directory** | *(dejalo vacío)* |
   | **Build Command** | *(dejalo vacío – Docker se encarga)* |
   | **Start Command** | *(dejalo vacío – el Dockerfile tiene el CMD)* |

5. **Instance Type:** Free (si usás el plan gratuito)

---

## Parte 3: Variables de entorno en Render

En la misma pantalla del Web Service, bajá hasta **Environment Variables** → **Add Environment Variable**.

Agregá todas estas variables (reemplazá los valores según corresponda):

### Obligatorias

| Key | Value |
|-----|-------|
| `APP_NAME` | `MiLogit` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | *(ver abajo cómo generarla)* |
| `APP_URL` | `https://milogit-backend.onrender.com` *(cambialo por tu URL real después del primer deploy)* |
| `DATABASE_URL` | *(pegá la Internal Database URL que copiaste del PostgreSQL)* |

### Cómo generar APP_KEY

En tu máquina local, dentro de la carpeta `backend`:

```bash
cd backend
php artisan key:generate --show
```

Copiá el valor (ej: `base64:xxxxxxxxxxxx`) y usalo en `APP_KEY`.

---

## Parte 4: Agregar DATABASE_URL

Hay dos formas. **Cerrá** la ventana "Add from .env" (esa es para pegar un archivo .env completo, no la usamos).

### Opción A: Manual (la más simple)

1. En el Dashboard de Render, entrá a tu base de datos **PostgreSQL** (`milogit-db`)
2. En **Info** o **Connections**, copiá la **Internal Database URL**  
   (algo como `postgres://user:password@host/database?sslmode=require`)
3. Volvé a tu **Web Service** → pestaña **Environment**
4. Clic en **Add Environment Variable** (el botón normal, no "Add from .env")
5. En el formulario que aparece:
   - **Key:** `DATABASE_URL`
   - **Value:** pegá la URL que copiaste
6. **Add**

### Opción B: Add from Render

Si ves la opción **Add from Render** (a veces aparece junto a "Add Environment Variable"):

1. Clic en **Add from Render**
2. Seleccioná tu base de datos `milogit-db`
3. Elegí **Internal Database URL**
4. Se agregará automáticamente como `DATABASE_URL`

> Si no encontrás "Add from Render", usá la Opción A.

---

## Parte 5: Crear el Web Service

1. **Create Web Service**
2. Render va a hacer el build con Docker (tarda unos minutos)
3. Cuando termine, anotá la URL del servicio, por ejemplo: `https://milogit-backend-xxxx.onrender.com`

---

## Parte 6: Actualizar APP_URL

1. En el Web Service → **Environment**
2. Editá `APP_URL` y poné tu URL real: `https://milogit-backend-xxxx.onrender.com`
3. **Save Changes** → Render va a hacer un redeploy automático

---

## Parte 7: Configurar Vercel (Frontend) – Proxy (sin CORS)

El proyecto usa **proxy** para evitar CORS: Vercel redirige `/api/*` al backend. Las requests son same-origin.

1. **NO agregues** `VITE_API_URL` en Vercel. Si existe, **eliminala**. El frontend usa `/api` y Vercel hace proxy.
2. Verificá que `vercel.json` en la raíz tenga tu URL de Render:
   ```json
   { "rewrites": [{ "source": "/api/:path*", "destination": "https://milogit-backend-xxxx.onrender.com/api/:path*" }] }
   ```
3. **Redeploy** en Vercel para aplicar cambios.

---

## Parte 8: CORS

Con el proxy de Vercel, el frontend llama a `/api` (mismo dominio). **No hay CORS** porque no hay cross-origin. Si usás `VITE_API_URL` directa al backend, configurá CORS en `backend/config/cors.php`.

---

## Resumen de URLs

| Qué | URL ejemplo |
|-----|-------------|
| Frontend (Vercel) | `https://tu-proyecto.vercel.app` |
| Backend (Render) | `https://milogit-backend-xxxx.onrender.com` |
| **API (para VITE_API_URL)** | `https://milogit-backend-xxxx.onrender.com/api` |

---

## Errores frecuentes y soluciones

### "connection to server at 127.0.0.1 failed" / 500

**Causa:** Laravel no recibe `DATABASE_URL`.

**Solución:**
- Render → Web Service → Environment → confirmá que `DATABASE_URL` esté definida
- Si usás PostgreSQL de Render, vinculalo con "Add from Render" o pegá la Internal Database URL manualmente
- **Manual Deploy** después de cambiar variables

---

### "No 'Access-Control-Allow-Origin' header"

**Causa:** CORS bloqueando el frontend.

**Solución:**
- Revisá que `VITE_API_URL` termine en `/api`
- Revisá que la URL del frontend esté en `allowed_origins` o en `allowed_origins_patterns` en `cors.php`

---

### El frontend no conecta con el backend

**Revisá:**
1. Que `VITE_API_URL` en Vercel sea `https://tu-backend.onrender.com/api`
2. Que hayas hecho **Redeploy** en Vercel después de agregar la variable
3. Que el backend responda: probá `https://tu-backend.onrender.com/api` en el navegador

---

### El backend se "duerme" (plan gratuito)

En el plan gratuito, Render apaga el servicio tras ~15 minutos de inactividad. La primera request puede tardar 30–60 segundos en responder.

---

## Estructura del proyecto

```
registro-entrenamiento/
├── backend/           # Laravel API
├── src/               # React frontend
├── Dockerfile         # En la raíz, para Render
└── DEPLOY-RENDER.md   # Esta guía
```

El Dockerfile:
- Instala dependencias de Composer
- Ejecuta migraciones al iniciar
- Usa el puerto `PORT` que asigna Render
- No usa `config:cache` para respetar las variables de entorno de Render

---

## Checklist final

- [ ] PostgreSQL creado en Render
- [ ] Web Service creado con Runtime: Docker
- [ ] Variables: `APP_KEY`, `APP_ENV`, `APP_DEBUG`, `APP_URL`, `DATABASE_URL`
- [ ] `APP_URL` con la URL real del backend
- [ ] `VITE_API_URL` en Vercel con `https://....onrender.com/api`
- [ ] Redeploy del frontend en Vercel
- [ ] Probado: registro / login desde el frontend en producción
