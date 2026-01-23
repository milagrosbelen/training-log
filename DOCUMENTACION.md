# 📚 Documentación: Aplicación de Registro de Entrenamientos

## 🎯 Descripción General

Aplicación web desarrollada en **React + Tailwind CSS** para registrar entrenamientos de gimnasio. Permite a los usuarios seleccionar días del calendario, registrar ejercicios con peso, repeticiones y series, y ver un resumen mensual de su progreso.

---

## 🏗️ Arquitectura de la Aplicación

### Estructura de Componentes

```
src/
├── App.jsx                 # Componente principal (manejo de estado y navegación)
├── main.jsx               # Punto de entrada de React
├── index.css              # Estilos globales de Tailwind
└── components/
    ├── Calendar.jsx       # Calendario interactivo
    ├── WorkoutDay.jsx     # Formulario de registro diario
    ├── ExerciseCard.jsx   # Card individual de ejercicio
    └── MonthlySummary.jsx # Resumen mensual con estadísticas
```

---

## 📦 Paso 1: Configuración Inicial

### 1.1 Instalación de Tailwind CSS

**Problema inicial:** Tailwind CSS no estaba configurado correctamente.

**Solución aplicada:**
```bash
# Reinstalación limpia de Tailwind v3 (estable)
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@^3.4.0 postcss@^8.4.35 autoprefixer@^10.4.17
npx tailwindcss init -p
```

**Archivos de configuración creados:**

**`tailwind.config.js`:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**`postcss.config.js`:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**`src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Explicación:** Estos archivos configuran Tailwind para escanear todos los archivos JS/JSX y procesar las clases CSS. PostCSS se encarga de aplicar los plugins de Tailwind.

---

## 🔧 Paso 2: Componente Principal (App.jsx)

### 2.1 Estado Global de la Aplicación

```javascript
const [workouts, setWorkouts] = useState([])
const [selectedDate, setSelectedDate] = useState("")
const [currentView, setCurrentView] = useState("calendar")
```

**Explicación:**
- `workouts`: Array que almacena todos los entrenamientos guardados
- `selectedDate`: Fecha seleccionada en el calendario (formato: "YYYY-MM-DD")
- `currentView`: Vista actual ("calendar" o "summary")

### 2.2 Persistencia con LocalStorage

```javascript
// Cargar entrenamientos al iniciar
useEffect(() => {
  const savedWorkouts = localStorage.getItem("workouts")
  if (savedWorkouts) {
    try {
      setWorkouts(JSON.parse(savedWorkouts))
    } catch (error) {
      console.error("Error al cargar entrenamientos:", error)
    }
  }
}, [])

// Guardar automáticamente cuando cambian
useEffect(() => {
  localStorage.setItem("workouts", JSON.stringify(workouts))
}, [workouts])
```

**Explicación:** 
- El primer `useEffect` carga los entrenamientos guardados cuando la app inicia
- El segundo `useEffect` guarda automáticamente cada vez que `workouts` cambia
- `localStorage` permite persistir datos en el navegador del usuario

### 2.3 Navegación Entre Vistas

```javascript
const handleDateSelect = (date) => {
  setSelectedDate(date)
  setCurrentView("calendar") // Mantener vista de calendario
}

const handleSaveWorkout = (workoutData) => {
  const existingIndex = workouts.findIndex((w) => w.date === workoutData.date)
  
  if (existingIndex >= 0) {
    // Actualizar entrenamiento existente
    const updatedWorkouts = [...workouts]
    updatedWorkouts[existingIndex] = workoutData
    setWorkouts(updatedWorkouts)
  } else {
    // Agregar nuevo entrenamiento
    setWorkouts([...workouts, workoutData])
  }
}
```

**Explicación:**
- `handleDateSelect`: Al hacer clic en un día, se selecciona y muestra el formulario debajo del calendario
- `handleSaveWorkout`: Busca si ya existe un entrenamiento para esa fecha. Si existe, lo actualiza; si no, lo agrega nuevo

### 2.4 Estructura del Render Principal

```jsx
return (
  <div className="min-h-screen bg-slate-900 text-white">
    {/* Header con navegación */}
    <header className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      {/* Navegación entre "Entrenamientos" y "Progreso" */}
    </header>

    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {currentView === "calendar" && (
        <div className="space-y-6">
          <Calendar ... />
          {selectedDate && (
            <div className="space-y-6 pt-2 border-t border-slate-700/50">
              <h2>Entrenamiento del día</h2>
              <WorkoutDay ... />
            </div>
          )}
        </div>
      )}
    </main>
  </div>
)
```

**Explicación:**
- Header sticky que permanece visible al hacer scroll
- Contenedor principal centrado con `max-w-6xl mx-auto`
- Cuando hay una fecha seleccionada, se muestra el formulario debajo del calendario con un separador visual (`border-t`)

---

## 📅 Paso 3: Componente Calendar

### 3.1 Lógica del Calendario

```javascript
const [currentMonth, setCurrentMonth] = useState(new Date())

const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  const days = []
  
  // Días vacíos al inicio (para alinear con días de la semana)
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }
  
  return days
}
```

**Explicación:**
- `currentMonth`: Mes actual que se está mostrando
- `getDaysInMonth`: Genera un array con todos los días del mes
- Los `null` al inicio permiten que el primer día caiga en el día correcto de la semana
- Ejemplo: Si el mes empieza en miércoles, agrega 3 `null` antes del día 1

### 3.2 Indicadores Visuales

```javascript
const hasWorkout = (date) => {
  if (!date) return false
  const dateStr = date.toISOString().split("T")[0]
  return workouts.some((w) => w.date === dateStr)
}

const isSelected = (date) => {
  if (!date) return false
  const dateStr = date.toISOString().split("T")[0]
  return selectedDate === dateStr
}

const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}
```

**Explicación:**
- `hasWorkout`: Verifica si un día tiene entrenamiento guardado (muestra un punto indicador)
- `isSelected`: Verifica si un día está actualmente seleccionado (resaltado en verde)
- `isToday`: Verifica si un día es hoy (borde especial)

### 3.3 Renderizado del Calendario

```jsx
<div className="grid grid-cols-7 gap-1.5">
  {days.map((date, index) => {
    if (!date) {
      return <div key={`empty-${index}`} className="aspect-square" />
    }
    
    const dateStr = date.toISOString().split("T")[0]
    const workout = hasWorkout(date)
    const selected = isSelected(date)
    const today = isToday(date)
    
    return (
      <button
        onClick={() => handleDateClick(date)}
        className={`
          aspect-square rounded-lg transition-all duration-200 text-sm font-medium
          flex items-center justify-center relative
          ${selected 
            ? "bg-teal-500 text-black shadow-md shadow-teal-500/30 scale-105" 
            : "bg-slate-700/50 text-slate-200 hover:bg-slate-700 hover:scale-105"
          }
          ${today && !selected ? "ring-2 ring-teal-400/50" : ""}
        `}
      >
        {date.getDate()}
        {workout && !selected && (
          <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-teal-400 rounded-full" />
        )}
      </button>
    )
  })}
</div>
```

**Explicación:**
- Grid de 7 columnas (una por cada día de la semana)
- Cada día es un botón clickeable con estados visuales diferentes
- Si está seleccionado: fondo verde (`bg-teal-500`)
- Si tiene entrenamiento: punto indicador debajo
- Si es hoy: borde especial (`ring-2`)

---

## 💪 Paso 4: Componente WorkoutDay (Formulario de Registro)

### 4.1 Manejo de Duración (Horas y Minutos)

```javascript
// Convertir minutos totales a horas y minutos separados
const getDurationFromMinutes = (minutes) => {
  if (!minutes) return { hours: 0, minutes: 0 }
  return {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  }
}

const initialDuration = getDurationFromMinutes(workout?.duration || 0)
const [durationHours, setDurationHours] = useState(initialDuration.hours)
const [durationMinutes, setDurationMinutes] = useState(initialDuration.minutes)
```

**Explicación:**
- Al cargar un entrenamiento existente, se convierte la duración total (en minutos) a horas y minutos separados
- `Math.floor(minutes / 60)`: Calcula las horas completas
- `minutes % 60`: Calcula los minutos restantes (módulo 60)

### 4.2 Gestión de Ejercicios

```javascript
const addExercise = () => {
  const newExercise = {
    id: Date.now(), // ID único basado en timestamp
    name: "",
    weight: "",
    reps: "",
    sets: 1,
  }
  setExercises([...exercises, newExercise])
}

const updateExercise = (updatedExercise) => {
  setExercises(
    exercises.map((ex) => 
      ex.id === updatedExercise.id ? updatedExercise : ex
    )
  )
}

const deleteExercise = (exerciseId) => {
  setExercises(exercises.filter((ex) => ex.id !== exerciseId))
}
```

**Explicación:**
- `addExercise`: Crea un nuevo ejercicio vacío y lo agrega al array
- `updateExercise`: Busca el ejercicio por ID y lo reemplaza con la versión actualizada
- `deleteExercise`: Filtra el array eliminando el ejercicio con el ID especificado

### 4.3 Guardado del Entrenamiento

```javascript
const handleSave = () => {
  // Convertir horas y minutos a minutos totales
  const totalMinutes = (durationHours * 60) + durationMinutes
  
  onSave({
    date,
    type: workoutType,
    duration: totalMinutes,
    exercises,
  })
}
```

**Explicación:**
- Antes de guardar, convierte las horas y minutos a un total en minutos
- Ejemplo: 1 hora y 30 minutos = 90 minutos
- Envía todos los datos al componente padre (App.jsx) que maneja el guardado

### 4.4 Estructura del Formulario

```jsx
<div className="space-y-6">
  {/* Selector de tipo de entrenamiento */}
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
    <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)}>
      {/* Opciones: Espalda, Piernas, Pecho, etc. */}
    </select>
  </div>
  
  {/* Duración: Horas y Minutos */}
  <div className="bg-slate-800/50 ...">
    <input type="number" value={durationHours} ... /> H
    <input type="number" value={durationMinutes} ... /> MIN
  </div>
  
  {/* Lista de ejercicios */}
  <div className="space-y-4">
    {exercises.map((exercise) => (
      <ExerciseCard key={exercise.id} ... />
    ))}
    <button onClick={addExercise}>Añadir Ejercicio</button>
  </div>
</div>
```

**Explicación:**
- Cada sección está en su propia card con fondo semitransparente (`bg-slate-800/50`)
- `space-y-6`: Espaciado vertical consistente entre secciones
- Los ejercicios se mapean en `ExerciseCard` componentes individuales

---

## 🏋️ Paso 5: Componente ExerciseCard

### 5.1 Estado del Ejercicio

```javascript
const [weight, setWeight] = useState(exercise.weight || "")
const [reps, setReps] = useState(exercise.reps || "")
const [sets, setSets] = useState(exercise.sets || 1)

// Sincronizar cuando el ejercicio cambia externamente
useEffect(() => {
  setWeight(exercise.weight || "")
  setReps(exercise.reps || "")
  setSets(exercise.sets || 1)
}, [exercise])
```

**Explicación:**
- Cada campo tiene su propio estado local
- `useEffect` sincroniza el estado cuando el ejercicio cambia desde el padre
- Esto permite edición fluida sin perder datos

### 5.2 Handlers de Actualización

```javascript
const handleWeightChange = (newWeight) => {
  setWeight(newWeight)
  onUpdate({
    ...exercise,
    weight: newWeight,
    reps,
    sets,
  })
}
```

**Explicación:**
- Cada cambio en un input actualiza:
  1. El estado local (`setWeight`)
  2. El ejercicio completo llamando a `onUpdate` con todos los datos actualizados
- Esto permite que el padre (WorkoutDay) siempre tenga los datos más recientes

### 5.3 Diseño Simplificado de Inputs

```jsx
<div className="grid grid-cols-3 gap-4 sm:gap-6">
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-2.5">
      Peso (kg)
    </label>
    <input
      type="number"
      value={weight}
      onChange={(e) => handleWeightChange(e.target.value)}
      className="w-full h-12 bg-slate-700/50 text-white text-center px-3 rounded-lg text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
      placeholder="0"
      min="0"
      step="0.5"
    />
  </div>
  {/* Similar para Reps y Series */}
</div>
```

**Explicación:**
- Grid de 3 columnas iguales para Peso, Reps y Series
- Inputs grandes (`h-12`) con texto grande (`text-lg sm:text-xl`)
- Sin botones adicionales, solo inputs numéricos simples
- Estados focus con anillo verde (`focus:ring-2 focus:ring-teal-500`)

---

## 📊 Paso 6: Componente MonthlySummary

### 6.1 Cálculo de Estadísticas

```javascript
// Filtrar entrenamientos del mes actual
const monthWorkouts = workouts.filter((workout) => {
  const workoutDate = new Date(workout.date)
  return workoutDate.getMonth() === month && workoutDate.getFullYear() === year
})

// Días de entrenamiento
const totalDays = new Date(year, month + 1, 0).getDate()
const daysWithWorkout = monthWorkouts.length
const trainingPercentage = Math.round((daysWithWorkout / totalDays) * 100)
```

**Explicación:**
- Filtra solo los entrenamientos del mes y año especificados
- Calcula el porcentaje de días entrenados dividiendo días con entrenamiento por total de días del mes

### 6.2 Volumen Total

```javascript
const totalVolume = monthWorkouts.reduce((total, workout) => {
  const workoutVolume = workout.exercises.reduce((sum, exercise) => {
    const weight = parseFloat(exercise.weight) || 0
    const reps = parseInt(exercise.reps) || 0
    const sets = parseInt(exercise.sets) || 1
    return sum + weight * reps * sets
  }, 0)
  return total + workoutVolume
}, 0)
```

**Explicación:**
- **Volumen** = Peso × Repeticiones × Series
- Para cada ejercicio: multiplica peso, reps y series
- Suma todos los ejercicios de todos los entrenamientos del mes
- Ejemplo: 80kg × 10 reps × 4 series = 3,200 kg

### 6.3 Promedio de Duración

```javascript
const totalDuration = monthWorkouts.reduce((sum, workout) => 
  sum + (workout.duration || 0), 0
)
const averageDuration = daysWithWorkout > 0 
  ? Math.round(totalDuration / daysWithWorkout) 
  : 0
```

**Explicación:**
- Suma todas las duraciones de entrenamientos del mes
- Divide por cantidad de días entrenados para obtener el promedio

### 6.4 Gráfico Circular de Progreso

```jsx
<div className="relative w-32 h-32">
  <svg className="transform -rotate-90 w-32 h-32">
    {/* Círculo de fondo */}
    <circle
      cx="64" cy="64" r="56"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
      className="text-slate-700/50"
    />
    {/* Círculo de progreso */}
    <circle
      cx="64" cy="64" r="56"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
      strokeDasharray={`${(trainingPercentage / 100) * 301.59} 301.59`}
      className="text-teal-500 transition-all duration-500"
      strokeLinecap="round"
    />
  </svg>
  {/* Texto centrado */}
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <span className="text-2xl font-bold">{trainingPercentage}%</span>
    <span className="text-xs text-slate-400">{daysWithWorkout}/{totalDays} días</span>
  </div>
</div>
```

**Explicación:**
- SVG con dos círculos superpuestos
- Círculo de fondo: gris estático
- Círculo de progreso: usa `strokeDasharray` para mostrar el porcentaje
  - `301.59` es la circunferencia (2π × 56)
  - El primer valor es la parte dibujada basada en el porcentaje
- Texto centrado con `absolute` positioning

---

## 🎨 Paso 7: Diseño y UX

### 7.1 Mobile First

```css
/* Ejemplo de clases responsivas */
className="text-base sm:text-lg md:text-xl"
className="p-4 sm:p-6"
className="grid grid-cols-1 md:grid-cols-2"
```

**Explicación:**
- `sm:`, `md:`, `lg:` son breakpoints de Tailwind
- Diseño base para mobile, luego se adapta a pantallas más grandes
- Ejemplo: texto `text-base` en mobile, `text-lg` en tablets, `text-xl` en desktop

### 7.2 Cards con Efectos Visuales

```jsx
className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50"
```

**Explicación:**
- `bg-slate-800/50`: Fondo semitransparente (50% opacidad)
- `backdrop-blur-sm`: Efecto de desenfoque del fondo
- `rounded-xl`: Bordes redondeados grandes
- `shadow-md`: Sombra sutil para profundidad
- `border border-slate-700/50`: Borde sutil semitransparente

### 7.3 Estados Interactivos

```jsx
className="hover:bg-slate-700 transition-all duration-200"
className="focus:ring-2 focus:ring-teal-500"
className="active:scale-[0.98]"
```

**Explicación:**
- `hover:`: Cambios al pasar el mouse
- `focus:`: Cambios al enfocar (inputs, botones)
- `active:`: Cambios al hacer clic (escala ligeramente)
- `transition-all duration-200`: Transiciones suaves

---

## 🔄 Flujo Completo de la Aplicación

### Flujo de Usuario:

1. **Usuario abre la app** → Carga entrenamientos desde localStorage
2. **Usuario hace clic en un día del calendario** → Se selecciona la fecha y aparece el formulario debajo
3. **Usuario selecciona tipo de entrenamiento** → Dropdown con opciones
4. **Usuario ingresa duración** → Inputs separados de horas y minutos
5. **Usuario hace clic en "Añadir Ejercicio"** → Se crea una nueva card de ejercicio vacía
6. **Usuario ingresa datos del ejercicio** → Nombre, peso, reps, series (inputs simples)
7. **Usuario hace clic en "Guardar"** → Se guarda en localStorage y se actualiza el calendario
8. **Usuario hace clic en "Progreso"** → Ve el resumen mensual con estadísticas

### Flujo de Datos:

```
App.jsx (Estado global)
    ↓
Calendar.jsx (Muestra días, indica entrenamientos)
    ↓
WorkoutDay.jsx (Formulario de registro)
    ↓
ExerciseCard.jsx (Card individual de ejercicio)
    ↓
localStorage (Persistencia)
```

---

## 📝 Resumen de Funcionalidades

✅ **Calendario interactivo** con indicadores visuales
✅ **Registro de entrenamientos** por día
✅ **Múltiples ejercicios** por entrenamiento
✅ **Duración** en horas y minutos
✅ **Tipo de entrenamiento** seleccionable
✅ **Persistencia** automática en localStorage
✅ **Resumen mensual** con estadísticas
✅ **Diseño mobile-first** responsive
✅ **UI moderna** con Tailwind CSS

---

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

---

## 📚 Tecnologías Utilizadas

- **React 19.2.0**: Librería para construir interfaces de usuario
- **Tailwind CSS 3.4.19**: Framework de CSS utility-first
- **Lucide React**: Librería de íconos
- **Vite**: Herramienta de build y desarrollo
- **LocalStorage API**: Persistencia de datos en el navegador

---

## 🎯 Mejoras Futuras Posibles

- [ ] Autenticación de usuarios
- [ ] Sincronización con backend
- [ ] Gráficos de progreso más detallados
- [ ] Comparación de entrenamientos entre fechas
- [ ] Exportación de datos a CSV/PDF
- [ ] Rutinas predefinidas
- [ ] Recordatorios de entrenamiento

---

**Desarrollado con ❤️ usando React + Tailwind CSS**





