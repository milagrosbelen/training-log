# Backend de MiLogit

## ¿Qué es el Backend?

El **backend** es la parte "invisible" de tu aplicación. Es como la **cocina de un restaurante**:

- **Frontend** = El comedor donde los clientes ven el menú y piden comida
- **Backend** = La cocina donde se prepara la comida y se gestiona todo

El backend:
- ✅ Recibe peticiones del frontend
- ✅ Se conecta a la base de datos SQL Server
- ✅ Procesa información
- ✅ Envía respuestas de vuelta al frontend

## ¿Qué Tecnologías Usa?

- **Node.js**: Permite ejecutar JavaScript fuera del navegador (en tu computadora)
- **Express**: Librería que facilita crear servidores web
- **mssql**: Librería para conectarse a SQL Server
- **SQL Server**: Base de datos donde se guardan los entrenamientos

## Estructura del Backend

```
backend/
├── index.js          ← Archivo principal del servidor
├── database.sql      ← Script para crear la base de datos
├── package.json      ← Dependencias y scripts
└── README_BACKEND.md ← Esta documentación
```

### ¿Qué hace cada archivo?

#### `index.js`
Este es el **archivo principal** del backend. Contiene:
- Configuración de Express (el servidor)
- Configuración de conexión a SQL Server
- Todos los endpoints (rutas) de la API
- Lógica para guardar/obtener entrenamientos

**¿Qué es un endpoint?**
Un endpoint es como una "dirección" en tu servidor. Por ejemplo:
- `GET /workouts` → Obtiene todos los entrenamientos
- `POST /workouts` → Guarda un nuevo entrenamiento
- `GET /health` → Verifica que el servidor funciona

#### `database.sql`
Script SQL que crea:
- La base de datos `MiLogit`
- La tabla `Workouts` con sus columnas

**¿Cuándo se usa?**
Solo una vez, cuando configuras la base de datos por primera vez. Lo ejecutas en SQL Server Management Studio.

#### `package.json`
Define:
- Qué librerías necesita el backend (express, mssql)
- Qué comandos puedes ejecutar (`npm start`, `npm run dev`)

## ¿Cómo se Inicia el Backend?

### Paso 1: Instalar Dependencias

Primero, necesitas instalar las librerías que usa el backend:

```bash
cd backend
npm install
```

**¿Qué hace esto?**
Descarga todas las librerías necesarias (express, mssql) y las guarda en `node_modules/`.

### Paso 2: Iniciar el Servidor

```bash
npm start
```

O también puedes usar:

```bash
node index.js
```

**¿Qué hace esto?**
- Inicia el servidor Node.js
- Se conecta a SQL Server
- Escucha peticiones en el puerto 3000

### Paso 3: Verificar que Funciona

Deberías ver en la terminal:

```
🔄 [INICIO] Intentando conectar a SQL Server...
✅ CONEXIÓN EXITOSA A SQL SERVER
🚀 Servidor funcionando en http://localhost:3000
```

## ¿Qué Puerto Usa?

El backend usa el **puerto 3000**.

**¿Qué es un puerto?**
Un puerto es como el "número de puerta" de tu servidor. Es la forma de identificar qué servicio está corriendo.

- **Puerto 3000** → Backend (Node.js + Express)
- **Puerto 5173** → Frontend (React + Vite)

**¿Por qué puertos diferentes?**
Porque son dos programas diferentes corriendo al mismo tiempo:
- El backend escucha en el puerto 3000
- El frontend escucha en el puerto 5173
- Ambos pueden funcionar simultáneamente sin conflictos

## ¿Cómo se Conecta a SQL Server?

### Configuración

El backend se conecta usando **Windows Authentication** (tu cuenta de Windows). No necesitas usuario ni contraseña.

La configuración está en `index.js`:

```javascript
const dbConfig = {
  server: 'DESKTOP-661FQLM\\SQL',  // Tu servidor SQL Server
  database: 'MiLogit',              // Nombre de la base de datos
  authentication: {
    type: 'ntlm'                    // Windows Authentication
  }
};
```

### Flujo de Conexión

1. El servidor inicia
2. Intenta conectarse a SQL Server usando tu cuenta de Windows
3. Si la conexión es exitosa, crea un "pool" de conexiones
4. El pool se mantiene activo durante toda la ejecución
5. Los endpoints usan el pool para hacer queries

**¿Qué es un pool?**
Un pool es un conjunto de conexiones listas para usar. Es más eficiente que crear una conexión nueva cada vez.

## Endpoints Disponibles

### GET /health
Verifica que el servidor funciona.

**Ejemplo:**
```bash
curl http://localhost:3000/health
```

**Respuesta:**
```json
{
  "status": "ok"
}
```

### GET /test-db
Prueba la conexión a SQL Server.

**Ejemplo:**
```bash
curl http://localhost:3000/test-db
```

### GET /workouts
Obtiene todos los entrenamientos.

**Ejemplo:**
```bash
curl http://localhost:3000/workouts
```

### POST /workouts
Guarda un nuevo entrenamiento.

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/workouts \
  -H "Content-Type: application/json" \
  -d '{"fecha":"2024-01-20","tipoEntrenamiento":"Fuerza","duracionMinutos":60}'
```

### GET /workouts/:id
Obtiene un entrenamiento por su ID.

**Ejemplo:**
```bash
curl http://localhost:3000/workouts/1
```

### PUT /workouts/:id
Actualiza un entrenamiento.

**Ejemplo:**
```bash
curl -X PUT http://localhost:3000/workouts/1 \
  -H "Content-Type: application/json" \
  -d '{"fecha":"2024-01-20","tipoEntrenamiento":"Cardio","duracionMinutos":30}'
```

### DELETE /workouts/:id
Elimina un entrenamiento.

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/workouts/1
```

## Comandos Útiles

### Iniciar el servidor
```bash
npm start
```

### Ver logs en tiempo real
Los logs aparecen automáticamente en la terminal cuando:
- El servidor inicia
- Llega una petición
- Hay un error

### Detener el servidor
Presiona `Ctrl + C` en la terminal donde está corriendo.

## Solución de Problemas

### Error: "No hay conexión a la base de datos"

**Causa**: SQL Server no está corriendo o la conexión falló.

**Solución**:
1. Verifica que SQL Server esté corriendo
2. Verifica que la base de datos `MiLogit` exista
3. Revisa los logs del servidor al iniciar

### Error: "Cannot find module 'express'"

**Causa**: No se instalaron las dependencias.

**Solución**:
```bash
cd backend
npm install
```

### Error: "Port 3000 already in use"

**Causa**: Ya hay otro programa usando el puerto 3000.

**Solución**:
1. Cierra el otro programa
2. O cambia el puerto en `index.js` (línea 19)

## Resumen

- **¿Qué es?** El servidor que maneja la lógica y se conecta a la base de datos
- **¿Dónde está?** En la carpeta `backend/`
- **¿Cómo se inicia?** `cd backend && npm start`
- **¿Qué puerto usa?** Puerto 3000
- **¿Qué hace?** Recibe peticiones, procesa datos, se conecta a SQL Server

---

**Siguiente paso**: Lee `README_FRONTEND.md` para entender el frontend.




