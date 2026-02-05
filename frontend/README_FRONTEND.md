# Frontend de MiLogit

## ¿Qué es el Frontend?

El **frontend** es la parte "visible" de tu aplicación. Es lo que el usuario ve y con lo que interactúa en el navegador.

**Analogía del restaurante**:
- **Frontend** = El comedor donde los clientes ven el menú y piden comida
- **Backend** = La cocina donde se prepara la comida

El frontend:
- ✅ Muestra la interfaz visual (botones, formularios, gráficos)
- ✅ Recibe acciones del usuario (clic en botón, escribir texto)
- ✅ Envía peticiones al backend para obtener/guardar datos
- ✅ Muestra los datos que recibe del backend

## ¿Qué Tecnologías Usa?

- **React**: Librería para crear interfaces de usuario
- **Vite**: Herramienta que facilita desarrollar con React (muy rápida)
- **Tailwind CSS**: Framework para estilos (diseño visual)
- **Recharts**: Librería para crear gráficos

## Estructura del Frontend

```
frontend/
├── src/                    ← Código fuente de React
│   ├── components/         ← Componentes reutilizables
│   ├── utils/              ← Funciones auxiliares
│   ├── data/               ← Datos estáticos
│   ├── App.jsx             ← Componente principal
│   └── main.jsx             ← Punto de entrada
├── public/                 ← Archivos estáticos (imágenes, etc.)
├── index.html              ← HTML principal
├── vite.config.js          ← Configuración de Vite
├── tailwind.config.js      ← Configuración de Tailwind
├── postcss.config.js       ← Configuración de PostCSS
├── eslint.config.js        ← Configuración de ESLint
├── package.json            ← Dependencias y scripts
└── README_FRONTEND.md      ← Esta documentación
```

### ¿Qué hace cada carpeta/archivo?

#### `src/`
Contiene todo el código de React:
- **`App.jsx`**: Componente principal de la aplicación
- **`main.jsx`**: Punto de entrada (aquí se "monta" React en el HTML)
- **`components/`**: Componentes reutilizables (botones, gráficos, etc.)
- **`utils/`**: Funciones auxiliares (cálculos, formateo de fechas, etc.)
- **`data/`**: Datos estáticos (rutinas predefinidas, etc.)

#### `public/`
Archivos estáticos que se sirven directamente:
- Imágenes
- Iconos
- Cualquier archivo que no necesita procesamiento

#### `index.html`
El HTML principal. Aquí es donde React "se monta" (se inserta en el `<div id="root">`).

#### `vite.config.js`
Configuración de Vite (la herramienta de desarrollo).

#### `tailwind.config.js`
Configuración de Tailwind CSS (los estilos).

#### `package.json`
Define:
- Qué librerías necesita el frontend (react, tailwind, etc.)
- Qué comandos puedes ejecutar (`npm run dev`, `npm run build`)

## ¿Cómo se Inicia el Frontend?

### Paso 1: Instalar Dependencias

Primero, necesitas instalar las librerías que usa el frontend:

```bash
cd frontend
npm install
```

**¿Qué hace esto?**
Descarga todas las librerías necesarias (react, tailwind, etc.) y las guarda en `node_modules/`.

### Paso 2: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

**¿Qué hace esto?**
- Inicia Vite (el servidor de desarrollo)
- Compila el código React
- Abre la aplicación en el navegador (normalmente en `http://localhost:5173`)

### Paso 3: Ver la Aplicación

Deberías ver en la terminal:

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abre tu navegador y ve a `http://localhost:5173`

## ¿Qué Puerto Usa?

El frontend usa el **puerto 5173** (o 5174 si 5173 está ocupado).

**¿Por qué este puerto?**
Es el puerto por defecto de Vite. Puedes cambiarlo si quieres, pero no es necesario.

**¿Por qué puertos diferentes del backend?**
Porque son dos programas diferentes:
- **Backend** (puerto 3000) → Servidor que maneja datos
- **Frontend** (puerto 5173) → Interfaz visual en el navegador

Ambos pueden funcionar al mismo tiempo sin conflictos.

## ¿Cómo se Comunica con el Backend?

El frontend **NO se conecta directamente a SQL Server**. En su lugar:

1. El frontend hace peticiones HTTP al backend
2. El backend se conecta a SQL Server
3. El backend devuelve los datos al frontend
4. El frontend muestra los datos en la pantalla

**Ejemplo de flujo:**

```
Usuario hace clic en "Ver entrenamientos"
    ↓
Frontend envía: GET http://localhost:3000/workouts
    ↓
Backend recibe la petición
    ↓
Backend consulta SQL Server
    ↓
Backend devuelve los datos al frontend
    ↓
Frontend muestra los entrenamientos en pantalla
```

**¿Por qué no conectarse directamente a SQL Server?**
- **Seguridad**: No queremos exponer la base de datos directamente
- **Control**: El backend valida y procesa los datos antes de guardarlos
- **Separación**: Frontend solo se preocupa de mostrar, backend de procesar

## Comandos Útiles

### Iniciar el servidor de desarrollo
```bash
npm run dev
```

**¿Qué hace?**
- Inicia Vite
- Compila React en tiempo real
- Recarga automáticamente cuando cambias código

### Compilar para producción
```bash
npm run build
```

**¿Qué hace?**
- Crea una versión optimizada de la aplicación
- Los archivos se guardan en `dist/`
- Esta versión es más rápida pero no tiene recarga automática

### Ver la versión de producción
```bash
npm run preview
```

**¿Qué hace?**
- Muestra cómo se verá la app en producción
- Usa los archivos compilados de `dist/`

### Verificar código (linting)
```bash
npm run lint
```

**¿Qué hace?**
- Revisa el código en busca de errores o problemas de estilo

## Archivos Importantes

### `src/App.jsx`
El componente principal. Aquí se define la estructura general de la aplicación.

### `src/components/`
Componentes reutilizables:
- `Calendar.jsx` → Calendario de entrenamientos
- `ProgressCharts.jsx` → Gráficos de progreso
- `WorkoutDay.jsx` → Vista de un día de entrenamiento
- Y más...

### `src/utils/`
Funciones auxiliares:
- `dateUtils.js` → Funciones para trabajar con fechas
- `chartData.js` → Funciones para preparar datos de gráficos
- `exerciseProgress.js` → Cálculos de progreso

## Solución de Problemas

### Error: "Cannot find module 'react'"

**Causa**: No se instalaron las dependencias.

**Solución**:
```bash
cd frontend
npm install
```

### Error: "Port 5173 already in use"

**Causa**: Ya hay otro programa usando el puerto 5173.

**Solución**:
1. Cierra el otro programa
2. O Vite automáticamente usará el puerto 5174

### La aplicación no se conecta al backend

**Causa**: El backend no está corriendo.

**Solución**:
1. Asegúrate de que el backend esté corriendo en el puerto 3000
2. Verifica que puedas acceder a `http://localhost:3000/health`

### Los estilos no se aplican

**Causa**: Tailwind no está configurado correctamente.

**Solución**:
1. Verifica que `tailwind.config.js` esté en la raíz de `frontend/`
2. Verifica que `postcss.config.js` esté configurado
3. Reinicia el servidor de desarrollo

## Resumen

- **¿Qué es?** La interfaz visual que el usuario ve y usa
- **¿Dónde está?** En la carpeta `frontend/`
- **¿Cómo se inicia?** `cd frontend && npm run dev`
- **¿Qué puerto usa?** Puerto 5173 (o 5174)
- **¿Qué hace?** Muestra la interfaz, recibe acciones del usuario, se comunica con el backend

---

**Siguiente paso**: Lee `README_GENERAL.md` para entender cómo trabajan juntos frontend y backend.




