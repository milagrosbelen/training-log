# MiLogit - Guía General del Proyecto

## 📋 Introducción

Este documento explica cómo funciona **MiLogit** como un todo. Cómo se relacionan el frontend y el backend, y cómo fluyen los datos entre ellos.

---

## 🏗️ Arquitectura del Proyecto

MiLogit está dividido en **dos partes principales**:

```
┌─────────────────────────────────────────────────────────┐
│                    APLICACIÓN MILOGIT                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐              ┌──────────────┐        │
│  │   FRONTEND   │              │   BACKEND    │        │
│  │              │              │              │        │
│  │  React +     │   HTTP       │  Node.js +   │        │
│  │  Vite +      │ ◄──────────► │  Express +   │        │
│  │  Tailwind    │   Requests   │  mssql       │        │
│  │              │              │              │        │
│  │  Puerto 5173 │              │  Puerto 3000 │        │
│  └──────────────┘              └──────┬───────┘        │
│                                        │                 │
│                                        │ SQL             │
│                                        ▼                 │
│                                 ┌──────────────┐        │
│                                 │ SQL SERVER   │        │
│                                 │              │        │
│                                 │ Base: MiLogit│        │
│                                 └──────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### ¿Qué es el Frontend?

El **frontend** es lo que el usuario **ve y toca**:
- La interfaz visual (botones, formularios, gráficos)
- Lo que aparece en el navegador
- La experiencia del usuario

**Tecnologías**: React, Vite, Tailwind CSS

**Ubicación**: Carpeta `frontend/`

**Puerto**: 5173 (o 5174)

### ¿Qué es el Backend?

El **backend** es lo que el usuario **NO ve**:
- El servidor que procesa las peticiones
- La conexión a la base de datos
- La lógica de negocio

**Tecnologías**: Node.js, Express, mssql

**Ubicación**: Carpeta `backend/`

**Puerto**: 3000

### ¿Qué es SQL Server?

**SQL Server** es la base de datos donde se **guardan permanentemente** los entrenamientos:
- Todos los datos están aquí
- El backend se conecta aquí para leer/escribir
- El frontend **NUNCA** se conecta directamente aquí

**Ubicación**: En tu computadora (servidor local)

**Base de datos**: MiLogit

---

## 🔄 Flujo de Datos: Cómo Funciona Todo Junto

### Ejemplo 1: Ver Todos los Entrenamientos

```
1. Usuario abre la aplicación en el navegador
   └─ Frontend (React) se carga en http://localhost:5173

2. Usuario hace clic en "Ver entrenamientos"
   └─ Frontend necesita los datos

3. Frontend envía petición HTTP:
   GET http://localhost:3000/workouts
   └─ Petición va al backend

4. Backend recibe la petición
   └─ Express procesa la petición

5. Backend consulta SQL Server:
   SELECT * FROM Workouts
   └─ Usa el pool de conexiones

6. SQL Server devuelve los datos
   └─ Backend recibe los entrenamientos

7. Backend responde al frontend:
   {
     "total": 5,
     "workouts": [...]
   }

8. Frontend recibe los datos
   └─ React actualiza la interfaz

9. Usuario ve los entrenamientos en pantalla
   └─ Todo funcionó correctamente
```

### Ejemplo 2: Guardar un Nuevo Entrenamiento

```
1. Usuario llena el formulario y hace clic en "Guardar"
   └─ Frontend tiene los datos del formulario

2. Frontend envía petición HTTP:
   POST http://localhost:3000/workouts
   Body: {
     "fecha": "2024-01-20",
     "tipoEntrenamiento": "Fuerza",
     "duracionMinutos": 60
   }
   └─ Petición va al backend

3. Backend recibe la petición
   └─ Express extrae los datos del body

4. Backend valida los datos
   └─ Verifica que todos los campos requeridos estén presentes

5. Backend guarda en SQL Server:
   INSERT INTO Workouts (...)
   └─ Usa el pool de conexiones

6. SQL Server guarda el entrenamiento
   └─ Devuelve el ID del nuevo entrenamiento

7. Backend responde al frontend:
   {
     "mensaje": "Entrenamiento guardado exitosamente",
     "id": 1,
     "datos": {...}
   }

8. Frontend recibe la confirmación
   └─ React muestra un mensaje de éxito

9. Frontend actualiza la lista de entrenamientos
   └─ Hace otra petición GET /workouts para refrescar
```

---

## 🚀 Cómo Iniciar Todo el Proyecto

### Paso 1: Preparar el Backend

```bash
# Ir a la carpeta del backend
cd backend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el servidor
npm start
```

**Deberías ver:**
```
✅ CONEXIÓN EXITOSA A SQL SERVER
🚀 Servidor funcionando en http://localhost:3000
```

**Mantén esta terminal abierta** (el backend debe seguir corriendo).

### Paso 2: Preparar el Frontend

Abre **otra terminal** (deja la del backend corriendo):

```bash
# Ir a la carpeta del frontend
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

**Deberías ver:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Paso 3: Abrir la Aplicación

Abre tu navegador y ve a: `http://localhost:5173`

**¡Listo!** Ahora tienes:
- ✅ Backend corriendo en puerto 3000
- ✅ Frontend corriendo en puerto 5173
- ✅ Ambos comunicándose correctamente

---

## 🔌 ¿Por Qué Dos Puertos Diferentes?

### Analogía: Dos Casas Diferentes

Imagina que tienes dos casas:
- **Casa 1 (Backend)**: Dirección "Calle Principal #3000"
- **Casa 2 (Frontend)**: Dirección "Calle Principal #5173"

Cada casa tiene su propia dirección (puerto) para que puedas encontrarla.

### ¿Por Qué No el Mismo Puerto?

**No puedes usar el mismo puerto** porque:
- Cada programa necesita su propio "número de puerta"
- Si dos programas usan el mismo puerto, hay conflicto
- Es como tener dos casas con la misma dirección (confuso)

### ¿Cómo se Comunican?

El frontend **llama** al backend usando su dirección (puerto 3000):

```javascript
// En el frontend
fetch('http://localhost:3000/workouts')
  .then(response => response.json())
  .then(data => {
    // Usar los datos
  });
```

El backend **escucha** en su puerto (3000) y responde.

---

## 📁 Estructura del Proyecto

```
registro-entrenamiento/
│
├── backend/                    ← TODO LO DEL SERVIDOR
│   ├── index.js               ← Servidor Express + endpoints
│   ├── database.sql           ← Script para crear la BD
│   ├── package.json           ← Dependencias del backend
│   └── README_BACKEND.md      ← Documentación del backend
│
├── frontend/                   ← TODO LO DE LA INTERFAZ
│   ├── src/                   ← Código React
│   │   ├── components/        ← Componentes
│   │   ├── utils/            ← Funciones auxiliares
│   │   └── App.jsx           ← Componente principal
│   ├── public/               ← Archivos estáticos
│   ├── index.html            ← HTML principal
│   ├── vite.config.js        ← Configuración Vite
│   ├── package.json          ← Dependencias del frontend
│   └── README_FRONTEND.md    ← Documentación del frontend
│
└── README_GENERAL.md         ← Esta documentación
```

---

## 🎯 Comandos Rápidos

### Iniciar Backend
```bash
cd backend
npm start
```

### Iniciar Frontend
```bash
cd frontend
npm run dev
```

### Instalar Dependencias (Backend)
```bash
cd backend
npm install
```

### Instalar Dependencias (Frontend)
```bash
cd frontend
npm install
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué separar frontend y backend?

**Ventajas**:
- ✅ **Claridad**: Es más fácil entender qué hace cada parte
- ✅ **Mantenimiento**: Puedes cambiar uno sin afectar el otro
- ✅ **Escalabilidad**: Puedes tener múltiples frontends (web, móvil) usando el mismo backend
- ✅ **Seguridad**: La base de datos no está expuesta directamente

### ¿El frontend puede conectarse directamente a SQL Server?

**No, y no debería**. El frontend:
- ❌ NO tiene acceso directo a SQL Server
- ✅ Solo se comunica con el backend mediante HTTP
- ✅ El backend es el único que toca la base de datos

**¿Por qué?**
- **Seguridad**: No queremos exponer credenciales de la base de datos
- **Control**: El backend valida y procesa los datos antes de guardarlos
- **Separación de responsabilidades**: Cada parte hace lo suyo

### ¿Qué pasa si el backend no está corriendo?

Si el frontend intenta hacer una petición y el backend no está corriendo:
- ❌ La petición falla
- ❌ El frontend muestra un error
- ✅ El frontend sigue funcionando (solo no puede obtener/guardar datos)

**Solución**: Asegúrate de que el backend esté corriendo antes de usar el frontend.

### ¿Puedo tener el frontend y backend en la misma carpeta?

**Técnicamente sí**, pero **no es recomendable** porque:
- ❌ Se mezcla todo y es confuso
- ❌ Es difícil mantener
- ❌ No es una buena práctica

**Mejor práctica**: Separar frontend y backend en carpetas diferentes (como lo tenemos ahora).

### ¿Qué comando uso para cada cosa?

| Acción | Comando | Dónde |
|--------|---------|-------|
| Iniciar backend | `npm start` | En `backend/` |
| Iniciar frontend | `npm run dev` | En `frontend/` |
| Instalar dependencias backend | `npm install` | En `backend/` |
| Instalar dependencias frontend | `npm install` | En `frontend/` |

---

## 📚 Documentación Adicional

- **`backend/README_BACKEND.md`** → Explica el backend en detalle
- **`frontend/README_FRONTEND.md`** → Explica el frontend en detalle
- **`backend/PASO_*.md`** → Documentación técnica del backend

---

## 🎓 Conceptos Clave para Entender

### Frontend vs Backend

**Frontend**:
- Lo que el usuario ve
- Interfaz visual
- Se ejecuta en el navegador
- Puerto 5173

**Backend**:
- Lo que el usuario NO ve
- Lógica y procesamiento
- Se ejecuta en tu computadora (servidor)
- Puerto 3000

### HTTP Requests

El frontend se comunica con el backend usando **peticiones HTTP**:
- **GET** → Obtener datos
- **POST** → Crear datos
- **PUT** → Actualizar datos
- **DELETE** → Eliminar datos

### Base de Datos

SQL Server es donde se **guardan permanentemente** los datos:
- El backend es el único que se conecta aquí
- El frontend nunca toca la base de datos directamente
- Todos los entrenamientos están guardados aquí

---

## ✅ Checklist de Inicio

Antes de empezar a desarrollar, asegúrate de:

- [ ] Backend instalado (`cd backend && npm install`)
- [ ] Frontend instalado (`cd frontend && npm install`)
- [ ] SQL Server corriendo
- [ ] Base de datos `MiLogit` creada
- [ ] Backend corriendo (`cd backend && npm start`)
- [ ] Frontend corriendo (`cd frontend && npm run dev`)
- [ ] Puedes acceder a `http://localhost:5173`
- [ ] Puedes acceder a `http://localhost:3000/health`

---

¡Felicidades! 🎉 Ahora entiendes cómo funciona MiLogit como un todo.

**Siguiente paso**: Empieza a desarrollar. Si tienes dudas, consulta los README específicos de cada parte.




