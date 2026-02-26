# Solución: "Dockerfile: no such file or directory" en Render

El Dockerfile **existe** en tu repo (está en la raíz). El error viene de la configuración del servicio en Render.

## Solución 1: Borrar y recrear con Blueprint (la más segura)

1. En [dashboard.render.com](https://dashboard.render.com), **eliminá el servicio** actual que está fallando.

2. **New** → **Blueprint** (no "Web Service").

3. Conectá el repo: `https://github.com/milagrosbelen/training-log`

4. Render leerá `render.yaml` y creará el servicio con la configuración correcta.

5. Agregá PostgreSQL (si no lo tenés) y las variables de entorno (APP_KEY, DB_*, etc.).

6. Deploy.

---

## Solución 2: Corregir el servicio actual

1. Entrá al servicio que falla → **Settings**.

2. En **Build & Deploy**:
   - **Root Directory**: borrá todo, debe quedar **vacío**
   - Si ves **Dockerfile Path** (en Advanced): poné `./Dockerfile` o `Dockerfile`

3. En **Environment** (arriba en la página del servicio):
   - Verificá que diga **Docker**. Si dice "PHP", "Node" u otro, Render no va a usar el Dockerfile.
   - Si no podés cambiarlo a Docker, **tenés que borrar el servicio y crear uno nuevo** eligiendo Docker desde el inicio.

4. Guardá y hacé **Manual Deploy** → **Clear build cache & deploy**.

---

## Solución 3: Si Render te pide Root Directory "backend"

Si por alguna razón necesitás usar `backend` como Root Directory:

1. **Root Directory**: `backend`
2. **Dockerfile Path**: `./Dockerfile` (el Dockerfile en backend/ se usará)
3. **Environment**: Docker

En ese caso se usará `backend/Dockerfile`, que también existe en tu repo.

---

## Verificación

Antes de hacer deploy, confirmá en GitHub que el Dockerfile está en la raíz:
https://github.com/milagrosbelen/training-log/blob/main/Dockerfile

Si ese link funciona, el archivo está bien subido.
