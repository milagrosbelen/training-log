# Conectar Vercel (frontend) con Render (backend)

> **Guía completa paso a paso:** Ver [DEPLOY-RENDER.md](./DEPLOY-RENDER.md) para desplegar todo desde cero sin errores.

Resumen rápido:

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

   **Opción A – DATABASE_URL (recomendada):** Si vinculás el PostgreSQL al Web Service, Render inyecta `DATABASE_URL`. Solo agregá:
   | Key | Value |
   |-----|-------|
   | `APP_NAME` | MiLogit |
   | `APP_ENV` | production |
   | `APP_DEBUG` | false |
   | `APP_KEY` | `base64:xxxx` (ver abajo) |
   | `APP_URL` | `https://tu-servicio.onrender.com` |

   **Opción B – Variables manuales:** Si no usás DATABASE_URL:
   | Key | Value |
   |-----|-------|
   | `APP_NAME` | MiLogit |
   | `APP_ENV` | production |
   | `APP_DEBUG` | false |
   | `APP_KEY` | `base64:xxxx` |
   | `APP_URL` | `https://tu-servicio.onrender.com` |
   | `DB_CONNECTION` | pgsql |
   | `DB_HOST` | *(host de PostgreSQL en Render)* |
   | `DB_PORT` | 5432 |
   | `DB_DATABASE` | *(nombre)* |
   | `DB_USERNAME` | *(usuario)* |
   | `DB_PASSWORD` | *(contraseña)* |
   | `DB_SSLMODE` | require |

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

### config:cache rompe las variables de entorno en Render

**Problema:** Si usás `php artisan config:cache` en el CMD del Dockerfile, Laravel genera un archivo de configuración cacheado (`bootstrap/cache/config.php`). Ese archivo guarda los valores de `.env` en el momento en que corre el comando. En Render, las variables de entorno (`DATABASE_URL`, `APP_KEY`, etc.) se **inyectan cuando el contenedor inicia**, no durante el build. Si cacheás la config, Laravel lee el cache (posiblemente vacío o incorrecto) y no las variables reales.

**Solución:** No usar `config:cache` en producción con Render. El Dockerfile correcto es:

```dockerfile
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
```

**Incorrecto:**
```dockerfile
CMD ["sh", "-c", "php artisan migrate --force && php artisan config:cache && php artisan serve ..."]
```

### Variables de base de datos (DB_* o DATABASE_URL)

**Problema:** Las migraciones fallan si Laravel no encuentra la conexión a la base de datos.

**Solución:** Configurá las variables en Render → tu Web Service → **Environment**:
- **Opción A:** `DATABASE_URL` = Internal Database URL (de tu PostgreSQL en Render)
- **Opción B:** `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSLMODE`

Render asigna `PORT` automáticamente; usá `${PORT:-8000}` para escuchar en el puerto correcto.

### "connection to server at 127.0.0.1 failed" / 500 Internal Server Error
El backend intenta conectar a localhost. **DATABASE_URL no llega al contenedor.**

**Solución:**
1. Render → PostgreSQL → **Info** → copiar **Internal Database URL**
2. Render → Web Service → **Environment** → Add: `DATABASE_URL` = URL copiada
3. **Save** → **Manual Deploy**

O vinculá el PostgreSQL al Web Service con **Add Database** para que Render inyecte DATABASE_URL.

### "No 'Access-Control-Allow-Origin' header"
- Revisá que `VITE_API_URL` termine en `/api`
- Revisá que el backend en Render esté corriendo y responda

### "Failed to load resource: net::ERR_FAILED"
- Comprobá que la URL del backend sea correcta y que Render no esté dormido (el plan gratuito “duerme” después de inactividad)
