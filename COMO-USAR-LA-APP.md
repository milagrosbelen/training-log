# Cómo hacer que la app funcione (paso a paso)

Para usar la app necesitás: **backend + base de datos + frontend**. Acá van las dos opciones más directas.

---

## OPCIÓN 1: Render (la que ya tenés)

### Paso 1: Crear PostgreSQL

1. Entrá a [dashboard.render.com](https://dashboard.render.com)
2. Clic en **New +** (arriba a la derecha)
3. Elegí **PostgreSQL**
4. Completá:
   - Name: `milogit-db`
   - Region: la misma que tu backend (ej: Oregon)
   - Plan: **Free**
5. Clic en **Create Database**
6. Esperá 1–2 minutos hasta que el estado sea **Available** (verde)

### Paso 2: Copiar la URL de la base

1. Entrá a la base de datos que creaste (milogit-db)
2. En la pestaña **Info**, buscá **Internal Database URL**
3. Clic en el ícono de copiar para copiar la URL completa
   - Va a verse así: `postgresql://usuario:contraseña@dpg-xxx.oregon-postgres.render.com/nombre`

### Paso 3: Pegar la URL en el backend

1. En el panel izquierdo, abrí tu **Web Service** (milogit-backend)
2. Arriba hacé clic en **Environment**
3. Clic en **Add Environment Variable** o **Edit**
4. Agregá estas variables (una por una):
   - **Key:** `DATABASE_URL` | **Value:** pegá la URL que copiaste
   - **Key:** `DB_CONNECTION` | **Value:** `pgsql`
5. Si no tenés `APP_KEY`, agregá:
   - **Key:** `APP_KEY`
   - **Value:** ejecutá en tu PC `cd backend` y `php artisan key:generate --show` y pegá el resultado (ej: `base64:abc123...`)
6. Clic en **Save Changes**

### Paso 4: Redesplegar

1. En el mismo servicio, clic en **Manual Deploy** (arriba)
2. Elegí **Deploy latest commit**
3. Esperá 3–5 minutos
4. Cuando diga **Live** en verde, ya está funcionando

### Paso 5: Probar

1. Copiá la URL de tu backend (ej: `https://milogit-backend.onrender.com`)
2. Probá en el navegador: `https://tu-backend.onrender.com/api` — debería responder algo tipo JSON
3. En tu frontend (Vercel o local), configurá `VITE_API_URL` = `https://tu-backend.onrender.com/api`
4. Abrí la app y probá registrarte / iniciar sesión

---

## OPCIÓN 2: Railway (alternativa más simple)

Railway conecta la base de datos al proyecto casi automático.

1. Entrá a [railway.app](https://railway.app) y creá cuenta
2. **New Project** → **Deploy from GitHub repo**
3. Elegí tu repo `training-log`
4. En **Settings** del proyecto:
   - **Root Directory:** `backend`
   - **Build Command:** (vacío, usa Docker)
   - **Start Command:** (vacío, usa Docker)
5. Agregá PostgreSQL: **New** → **Database** → **PostgreSQL**
6. Railway inyecta `DATABASE_URL` automáticamente
7. Agregá solo `APP_KEY` (generado con `php artisan key:generate --show`)
8. **Generate Domain** para la URL pública
9. Deploy

---

## Si algo falla

### "Exited with status 1"
- Revisá que `DATABASE_URL` esté bien copiada (sin espacios, URL completa)
- Revisá que `APP_KEY` exista y sea válido

### "could not connect to server"
- La base de datos tiene que estar **Available**
- Usá la **Internal Database URL**, no la External
- Backend y base tienen que estar en la **misma región**

### La app carga pero no hace login
- `VITE_API_URL` en el frontend debe ser `https://tu-backend.onrender.com/api`
- Sin la barra final: `/api` (no `/api/`)

### El backend se "duerme" después de un rato
- En el plan Free de Render, pasa tras ~15 min sin uso
- La primera visita puede tardar ~1 minuto en despertar; es normal

---

## Resumen mínimo

| Qué hacer | Dónde |
|-----------|-------|
| Crear PostgreSQL | Render → New → PostgreSQL |
| Copiar Internal Database URL | En la base de datos → Info |
| Pegar como DATABASE_URL | Backend → Environment |
| Generar APP_KEY | `php artisan key:generate --show` |
| Deploy | Manual Deploy |
| Configurar frontend | VITE_API_URL = backend + /api |
