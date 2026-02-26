# Pasos para que funcione en Render

## ¿Qué cambiar?

Ahora la app **arranca aunque la base de datos falle**. Eso evita el error "Exited with status 1". El deploy debería quedar en **Live** (verde).

Pero hasta que conectes PostgreSQL, la API va a fallar en login/registro. Para que funcione completo:

---

## 1. Crear PostgreSQL en Render

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **PostgreSQL**
2. Name: `milogit-db` | Region: igual que el backend | Plan: **Free**
3. **Create Database**
4. Esperar 1–2 min hasta que diga **Available**

---

## 2. Conectar la base al backend

1. Abrí la base `milogit-db` en Render
2. En **Info**, copiá **Internal Database URL**
3. Abrí tu servicio backend → **Environment**
4. **Add** → Key: `DATABASE_URL` | Value: pegar la URL
5. Verificá que tengas `APP_KEY` (generado con `php artisan key:generate --show`)
6. Guardá

---

## 3. Volver a desplegar

1. **Manual Deploy** → **Deploy latest commit**
2. Las migraciones deberían correr bien
3. La app debería funcionar

---

## Resumen

| Sin PostgreSQL | Con PostgreSQL conectado |
|----------------|--------------------------|
| Deploy = Live ✅ | Deploy = Live ✅ |
| API falla en login | Todo funciona ✅ |
