# 🏋️ FASE 3: Rutinas Predefinidas - Guía Didáctica

## 🎯 1️⃣ EXPLICACIÓN CONCEPTUAL DE LA SOLUCIÓN

### ¿Qué problema resuelve?

**Problema actual:**
- El usuario debe escribir manualmente cada ejercicio
- Tiene que recordar los nombres de los ejercicios
- Es lento y tedioso registrar un entrenamiento completo
- Muchos clicks y escritura manual

**Solución:**
- Sistema de rutinas predefinidas organizadas por grupo muscular
- El usuario solo selecciona el grupo muscular y los ejercicios se cargan automáticamente
- Solo completa series, repeticiones y peso (los datos numéricos)
- Mucho más rápido y menos propenso a errores

### ¿Cómo funciona conceptualmente?

1. **Estructura de datos:**
   - Objeto/diccionario que contiene todas las rutinas organizadas
   - Estructura: `Tipo de entrenamiento → Grupo muscular → Lista de ejercicios`

2. **Flujo de usuario:**
   ```
   Usuario selecciona "Tren inferior"
     ↓
   Se muestran grupos musculares (Cuádriceps, Aductor, Glúteos, Isquios)
     ↓
   Usuario hace click en "Cuádriceps"
     ↓
   Se cargan automáticamente: Sentadilla, Prensa, Sillón de cuádriceps
     ↓
   Usuario solo completa: series, repeticiones, peso
   ```

3. **Prevención de duplicados:**
   - Antes de agregar un ejercicio, verificar si ya existe en la lista
   - Si existe, no agregarlo de nuevo
   - Evita que el usuario tenga ejercicios duplicados por error

### ¿Cómo se integra con el código existente?

- **NO modifica:** Cómo se guardan los entrenamientos, localStorage, estructura de datos
- **Solo agrega:** Lógica para cargar ejercicios predefinidos
- **Mantiene:** Todo el flujo actual de guardado, edición, eliminación
- **Mejora:** La experiencia de usuario sin cambiar la arquitectura

---

## 🔄 2️⃣ EXPLICACIÓN DEL FLUJO DE DATOS

### Flujo actual (sin rutinas predefinidas):

```
Usuario hace click en "Añadir Ejercicio"
  ↓
Se crea un ejercicio vacío {id, name: "", weight: "", reps: "", sets: 1}
  ↓
Usuario escribe manualmente el nombre
  ↓
Usuario completa peso, reps, series
  ↓
Se guarda en el estado local de WorkoutDay
  ↓
Al guardar, se envía a App.jsx
  ↓
Se guarda en localStorage
```

### Flujo nuevo (con rutinas predefinidas):

```
Usuario selecciona "Tren inferior" en Tipo de entrenamiento
  ↓
Se muestra selector de grupo muscular
  ↓
Usuario hace click en "Cuádriceps"
  ↓
Se obtienen ejercicios de la rutina: ["Sentadilla", "Prensa", "Sillón de cuádriceps"]
  ↓
Para cada ejercicio:
  - Verificar si ya existe en la lista actual
  - Si NO existe, crear ejercicio con nombre predefinido
  - Peso, reps, sets quedan vacíos (usuario los completa)
  ↓
Se agregan a la lista de ejercicios existente
  ↓
Usuario completa solo peso, reps, series
  ↓
Resto del flujo igual (guardado, localStorage, etc.)
```

### Estructura de datos de rutinas:

```javascript
const ROUTINES = {
  "Tren inferior": {
    "Cuádriceps": ["Sentadilla", "Prensa", "Sillón de cuádriceps"],
    "Aductor": ["Sentadilla sumo", "Máquina de aductor", "Sentadilla lateral"],
    "Glúteos": ["Hip thrust", "Subidas al cajón", "Peso muerto", "Patada de glúteos", "Patada lateral", "Abducción con banda"],
    "Isquios": ["Peso muerto", "Sillón de isquios"]
  },
  "Tren superior": {
    "Espalda": ["Dominadas", "Jalón al pecho", "Remo sentado", "Pull over"],
    "Pecho": ["Press inclinado", "Press de banca", "Flexiones", "Cruce de polea", "Fondos"],
    "Hombros": ["Press militar", "Vuelos laterales"],
    "Tríceps": ["Extensión de tríceps"],
    "Bíceps": ["Banco Scott", "Barra W", "Martillo"],
    "Abdominales": ["Crunch normal", "Elevación de piernas", "Plancha"]
  }
}
```

---

## 🧠 3️⃣ QUÉ ESTADOS NUEVOS SE AGREGAN Y POR QUÉ

### Estados nuevos en `WorkoutDay.jsx`:

1. **`showMuscleGroups` (boolean)**
   - **Qué es:** Indica si se deben mostrar los grupos musculares
   - **Por qué:** Solo mostrar cuando el tipo de entrenamiento es "Tren inferior" o "Tren superior"
   - **Valor inicial:** `false`
   - **Cuándo cambia:** Cuando `workoutType` es "Tren inferior" o "Tren superior"

2. **`selectedMuscleGroup` (string)**
   - **Qué es:** Grupo muscular seleccionado actualmente
   - **Por qué:** Para saber qué ejercicios cargar cuando el usuario hace click
   - **Valor inicial:** `""`
   - **Cuándo cambia:** Cuando el usuario hace click en un grupo muscular

### ¿Por qué estos estados?

- **Separación de responsabilidades:** 
  - `workoutType` → Tipo general de entrenamiento
  - `selectedMuscleGroup` → Grupo muscular específico seleccionado
  - `showMuscleGroups` → Control de UI (mostrar/ocultar)

- **Control de flujo:**
  - Permite mostrar/ocultar la sección de grupos musculares
  - Permite saber qué ejercicios cargar cuando el usuario selecciona un grupo

---

## 📁 4️⃣ QUÉ ARCHIVOS SE MODIFICAN

### Archivos a crear:

1. **`src/data/routines.js`**
   - **Qué contiene:** Objeto con todas las rutinas predefinidas
   - **Por qué separado:** Para mantener el código organizado y fácil de modificar
   - **Estructura:** Diccionario anidado con rutinas

### Archivos a modificar:

1. **`src/components/WorkoutDay.jsx`**
   - **Qué se agrega:**
     - Import de rutinas
     - Estados nuevos (`showMuscleGroups`, `selectedMuscleGroup`)
     - Función para obtener grupos musculares según tipo de entrenamiento
     - Función para cargar ejercicios de un grupo muscular
     - UI para mostrar grupos musculares
     - Lógica para prevenir duplicados
   - **Qué NO se modifica:**
     - Lógica de guardado
     - Estructura de datos de ejercicios
     - Validaciones existentes
     - Estilos (solo se agregan elementos, no se cambian estilos existentes)

---

## 💻 5️⃣ CÓDIGO COMENTADO

### Archivo 1: `src/data/routines.js`

**¿Qué contiene?**
- Objeto `ROUTINES` con todas las rutinas predefinidas
- Funciones helper para obtener grupos musculares y ejercicios

**Estructura del objeto ROUTINES:**
```javascript
ROUTINES = {
  "Tren inferior": {
    "Cuádriceps": ["Sentadilla", "Prensa", ...],
    "Aductor": [...],
    ...
  },
  "Tren superior": {
    "Espalda": [...],
    "Pecho": [...],
    ...
  }
}
```

**Funciones exportadas:**

1. **`getMuscleGroups(workoutType)`**
   - **Input:** "Tren inferior" o "Tren superior"
   - **Output:** Array de grupos musculares (ej: ["Cuádriceps", "Aductor", ...])
   - **Cómo funciona:** Usa `Object.keys()` para obtener las claves del objeto

2. **`getExercisesForMuscleGroup(workoutType, muscleGroup)`**
   - **Input:** Tipo de entrenamiento y grupo muscular
   - **Output:** Array de nombres de ejercicios
   - **Cómo funciona:** Accede a `ROUTINES[tipo][grupo]` y retorna el array

### Archivo 2: `src/components/WorkoutDay.jsx` - Modificaciones

#### 1. Imports agregados:

```javascript
import { useState, useEffect, useMemo } from "react"
// useMemo agregado para optimización

import { getMuscleGroups, getExercisesForMuscleGroup } from "../data/routines"
// Importar funciones helper de rutinas
```

#### 2. Estados nuevos:

```javascript
const [showMuscleGroups, setShowMuscleGroups] = useState(false)
const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("")
```

**Explicación:**
- `showMuscleGroups`: Controla si se muestra la sección de grupos musculares
- `selectedMuscleGroup`: Guarda qué grupo muscular está seleccionado (para feedback visual)

#### 3. useMemo para calcular si mostrar grupos musculares:

```javascript
const shouldShowMuscleGroups = useMemo(() => {
  return workoutType === "Tren inferior" || workoutType === "Tren superior"
}, [workoutType])
```

**¿Qué hace?**
- Calcula si `workoutType` es uno de los tipos predefinidos
- Solo recalcula cuando `workoutType` cambia
- Retorna `true` o `false`

**¿Por qué useMemo?**
- Optimización: solo recalcula cuando es necesario
- Evita cálculos innecesarios en cada render

#### 4. useEffect para actualizar showMuscleGroups:

```javascript
useEffect(() => {
  setShowMuscleGroups(shouldShowMuscleGroups)
  if (!shouldShowMuscleGroups) {
    setSelectedMuscleGroup("")
  }
}, [shouldShowMuscleGroups])
```

**¿Qué hace?**
- Actualiza `showMuscleGroups` cuando `shouldShowMuscleGroups` cambia
- Si el tipo de entrenamiento no es predefinido, limpia la selección

**¿Por qué useEffect?**
- Es un efecto secundario: actualizar estado basado en otro estado
- Se ejecuta después del render

#### 5. useMemo para obtener grupos musculares disponibles:

```javascript
const availableMuscleGroups = useMemo(() => {
  if (!shouldShowMuscleGroups) return []
  return getMuscleGroups(workoutType)
}, [workoutType, shouldShowMuscleGroups])
```

**¿Qué hace?**
- Obtiene los grupos musculares para el tipo de entrenamiento actual
- Solo calcula si `shouldShowMuscleGroups` es true
- Retorna array vacío si no hay grupos disponibles

#### 6. Función para cargar ejercicios:

```javascript
const loadExercisesFromMuscleGroup = (muscleGroup) => {
  // 1. Obtener ejercicios del grupo
  const exerciseNames = getExercisesForMuscleGroup(workoutType, muscleGroup)
  
  if (exerciseNames.length === 0) return

  // 2. Filtrar ejercicios que ya existen (prevenir duplicados)
  const newExercises = exerciseNames
    .filter((exerciseName) => {
      const exists = exercises.some(
        (ex) => ex.name && ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
      )
      return !exists // Solo agregar si NO existe
    })
    .map((exerciseName) => ({
      id: Date.now() + Math.random() * 1000,
      name: exerciseName,
      weight: "",
      reps: "",
      sets: 1,
    }))

  // 3. Agregar a la lista existente
  if (newExercises.length > 0) {
    setExercises([...exercises, ...newExercises])
    setSelectedMuscleGroup(muscleGroup)
  }
}
```

**Explicación paso a paso:**

1. **Obtener ejercicios:** Llama a `getExercisesForMuscleGroup()` con el tipo y grupo
2. **Filtrar duplicados:** 
   - Para cada ejercicio, verifica si ya existe en `exercises`
   - Comparación case-insensitive (no distingue mayúsculas/minúsculas)
   - Solo mantiene los que NO existen
3. **Crear objetos de ejercicio:**
   - Para cada nombre, crea un objeto con estructura estándar
   - `id`: único (timestamp + random)
   - `name`: nombre predefinido
   - `weight`, `reps`: vacíos (usuario completa)
   - `sets`: 1 por defecto
4. **Agregar a la lista:**
   - Usa spread operator: `[...exercises, ...newExercises]`
   - Actualiza `selectedMuscleGroup` para feedback visual

**¿Por qué prevenir duplicados?**
- Evita que el usuario tenga el mismo ejercicio dos veces
- Mejor experiencia de usuario
- Datos más limpios

#### 7. UI para mostrar grupos musculares:

```jsx
{showMuscleGroups && availableMuscleGroups.length > 0 && (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
    <h3>Grupos Musculares</h3>
    <p>Haz click en un grupo muscular para cargar sus ejercicios automáticamente</p>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {availableMuscleGroups.map((muscleGroup) => (
        <button
          key={muscleGroup}
          onClick={() => loadExercisesFromMuscleGroup(muscleGroup)}
          className={...}
        >
          {muscleGroup}
        </button>
      ))}
    </div>
  </div>
)}
```

**Explicación:**

1. **Renderizado condicional:**
   - `showMuscleGroups &&`: Solo muestra si es true
   - `availableMuscleGroups.length > 0`: Solo muestra si hay grupos disponibles

2. **Grid responsivo:**
   - `grid-cols-2`: 2 columnas en mobile
   - `sm:grid-cols-3`: 3 columnas en pantallas más grandes

3. **Botones:**
   - Cada botón representa un grupo muscular
   - `onClick`: Llama a `loadExercisesFromMuscleGroup()`
   - Estilo condicional: resalta el grupo seleccionado

**Estilos:**
- Si está seleccionado: fondo teal, texto negro
- Si no está seleccionado: fondo gris, texto blanco, hover effect

---

## 🧪 6️⃣ CÓMO PROBAR LA FUNCIONALIDAD PASO A PASO

### Preparación:

1. **Abre la app:**
   ```bash
   npm run dev
   ```

2. **Selecciona un día en el calendario** (cualquier día sin entrenamiento guardado)
   - Deberías ver el formulario de "Entrenamiento del día"

### Prueba 1: Tren Inferior - Cuádriceps

**Paso 1: Seleccionar tipo de entrenamiento**
- En el campo "Tipo de entrenamiento", escribe exactamente: **"Tren inferior"**
- Presiona Enter o haz click fuera del campo

**Paso 2: Verificar que aparezca la sección de grupos musculares**
- Debe aparecer automáticamente una nueva card debajo del input de tipo
- Título: "Grupos Musculares"
- Deberías ver 4 botones: "Cuádriceps", "Aductor", "Glúteos", "Isquios"
- Los botones deben tener estilo gris (no seleccionados aún)

**Paso 3: Cargar ejercicios de Cuádriceps**
- Haz click en el botón "Cuádriceps"
- El botón debe cambiar a color teal (seleccionado)
- Deben agregarse automáticamente 3 ejercicios a la lista:
  - ✅ Sentadilla
  - ✅ Prensa
  - ✅ Sillón de cuádriceps

**Paso 4: Verificar estructura de ejercicios cargados**
- Cada ejercicio debe tener:
  - ✅ Nombre ya completado (no editable directamente, pero puedes editarlo)
  - ✅ Campo de Series: 1 (valor por defecto)
  - ✅ Campo de Repeticiones: vacío
  - ✅ Campo de Peso (kg): vacío

**Paso 5: Completar datos de los ejercicios**
- En "Sentadilla": 
  - Series: 4
  - Repeticiones: 10
  - Peso: 80
- En "Prensa":
  - Series: 3
  - Repeticiones: 12
  - Peso: 100
- En "Sillón de cuádriceps":
  - Series: 3
  - Repeticiones: 15
  - Peso: 50

**Paso 6: Verificar prevención de duplicados**
- Haz click nuevamente en "Cuádriceps"
- ✅ NO deben agregarse ejercicios duplicados
- ✅ Debe seguir habiendo solo 3 ejercicios
- ✅ El botón sigue resaltado (seleccionado)

### Prueba 2: Agregar otro grupo muscular (Glúteos)

**Paso 1: Con los ejercicios de Cuádriceps ya cargados**
- Deberías tener 3 ejercicios en la lista

**Paso 2: Cargar ejercicios de Glúteos**
- Haz click en el botón "Glúteos"
- El botón debe cambiar a color teal
- "Cuádriceps" debe volver a gris (solo un grupo seleccionado a la vez)

**Paso 3: Verificar ejercicios agregados**
- Deben agregarse 6 ejercicios nuevos:
  - ✅ Hip thrust
  - ✅ Subidas al cajón
  - ✅ Peso muerto
  - ✅ Patada de glúteos
  - ✅ Patada lateral
  - ✅ Abducción con banda
- Ahora deberías tener **9 ejercicios en total** (3 de Cuádriceps + 6 de Glúteos)

**Paso 4: Verificar que no se duplican**
- Haz click nuevamente en "Glúteos"
- ✅ NO deben agregarse ejercicios duplicados
- ✅ Siguen siendo 9 ejercicios

### Prueba 3: Tren Superior

**Paso 1: Cambiar tipo de entrenamiento**
- Borra "Tren inferior" del campo "Tipo de entrenamiento"
- Escribe: **"Tren superior"**
- Presiona Enter o haz click fuera

**Paso 2: Verificar grupos musculares**
- Debe aparecer la sección "Grupos Musculares" con 6 botones:
  - ✅ Espalda
  - ✅ Pecho
  - ✅ Hombros
  - ✅ Tríceps
  - ✅ Bíceps
  - ✅ Abdominales

**Paso 3: Cargar ejercicios de Pecho**
- Haz click en "Pecho"
- Deben agregarse 5 ejercicios:
  - ✅ Press inclinado
  - ✅ Press de banca
  - ✅ Flexiones
  - ✅ Cruce de polea
  - ✅ Fondos

**Paso 4: Cargar ejercicios de Bíceps**
- Haz click en "Bíceps"
- Deben agregarse 3 ejercicios más:
  - ✅ Banco Scott
  - ✅ Barra W
  - ✅ Martillo
- Ahora deberías tener 8 ejercicios en total (5 de Pecho + 3 de Bíceps)

### Prueba 4: Guardado y persistencia

**Paso 1: Completar algunos datos**
- Completa peso, reps y sets en algunos ejercicios
- Completa duración del entrenamiento (opcional)

**Paso 2: Guardar entrenamiento**
- Haz click en "GUARDAR ENTRENAMIENTO"
- ✅ No debe haber errores
- ✅ El entrenamiento se guarda correctamente

**Paso 3: Verificar en el calendario**
- El día debe mostrar un candado 🔒 (entrenamiento guardado)
- Haz click en el día nuevamente
- ✅ Debe mostrarse el resumen con todos los ejercicios
- ✅ Todos los ejercicios deben aparecer con sus datos

**Paso 4: Verificar persistencia**
- Recarga la página (F5)
- ✅ Los datos deben persistir
- ✅ El entrenamiento debe seguir guardado

### Prueba 5: Tipo de entrenamiento personalizado

**Paso 1: Escribir tipo personalizado**
- Borra "Tren superior" del campo
- Escribe: **"Cardio"** (o cualquier otro texto)

**Paso 2: Verificar que NO aparezca sección de grupos**
- ✅ NO debe aparecer la sección "Grupos Musculares"
- ✅ Debe funcionar como antes (agregar ejercicios manualmente con "Añadir Ejercicio")

**Paso 3: Verificar funcionalidad manual**
- Haz click en "Añadir Ejercicio"
- ✅ Debe funcionar normalmente
- ✅ Puedes escribir el nombre manualmente

### Prueba 6: Casos edge (opcional)

**Paso 1: Cambiar entre tipos predefinidos**
- Escribe "Tren inferior" → aparece sección de grupos
- Cambia a "Tren superior" → debe cambiar los grupos disponibles
- Cambia a "Cardio" → debe desaparecer la sección

**Paso 2: Mezclar ejercicios predefinidos y manuales**
- Carga ejercicios de "Cuádriceps"
- Agrega un ejercicio manual: "Estocadas"
- ✅ Ambos deben coexistir sin problemas

**Paso 3: Editar nombre de ejercicio predefinido**
- Carga ejercicios de "Pecho"
- Edita el nombre "Press de banca" a "Press de banca inclinado"
- ✅ Debe permitir editar sin problemas
- ✅ Al guardar, debe guardarse con el nombre editado

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Crear archivo `src/data/routines.js` con todas las rutinas
- [x] Modificar `WorkoutDay.jsx` para:
  - [x] Importar rutinas
  - [x] Agregar estados nuevos
  - [x] Detectar cuando el tipo es "Tren inferior" o "Tren superior"
  - [x] Mostrar grupos musculares
  - [x] Cargar ejercicios al hacer click en grupo muscular
  - [x] Prevenir duplicados
  - [x] Mantener toda la funcionalidad existente
- [x] Probar todos los casos de uso
- [x] Verificar que no se rompió nada existente

## 🎓 CONCEPTOS QUE APRENDISTE

### 1. **Estructura de Datos Anidada**

**Qué es:**
- Objetos dentro de objetos (diccionarios anidados)
- Estructura jerárquica: Tipo → Grupo → Ejercicios

**Ejemplo:**
```javascript
ROUTINES["Tren inferior"]["Cuádriceps"] → ["Sentadilla", "Prensa", ...]
```

**Cuándo usar:**
- Cuando tienes datos organizados jerárquicamente
- Cuando necesitas acceso rápido por clave

### 2. **Renderizado Condicional**

**Qué es:**
- Mostrar/ocultar elementos según condiciones
- En React se hace con operadores lógicos (`&&`, `||`, `? :`)

**Ejemplo:**
```jsx
{showMuscleGroups && availableMuscleGroups.length > 0 && (
  <div>...</div>
)}
```

**Cuándo usar:**
- Cuando quieres mostrar elementos solo en ciertas condiciones
- Mejora la UX mostrando solo lo relevante

### 3. **Prevención de Duplicados**

**Qué es:**
- Verificar si un elemento ya existe antes de agregarlo
- Evita datos duplicados

**Cómo se implementa:**
```javascript
const exists = exercises.some(
  (ex) => ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
)
if (!exists) {
  // Agregar ejercicio
}
```

**Conceptos usados:**
- `Array.some()`: Verifica si algún elemento cumple una condición
- Comparación case-insensitive: `.toLowerCase()` para normalizar

### 4. **Separación de Datos y Lógica**

**Qué es:**
- Datos en un archivo, lógica en otro
- Facilita mantenimiento y escalabilidad

**Estructura:**
```
src/
  data/
    routines.js  ← Datos (qué ejercicios hay)
  components/
    WorkoutDay.jsx  ← Lógica (cómo se usan)
```

**Beneficios:**
- Fácil modificar ejercicios sin tocar componentes
- Reutilizable en otros componentes
- Código más organizado

### 5. **Estados Derivados**

**Qué es:**
- Estados calculados a partir de otros estados
- No se guardan directamente, se calculan

**Ejemplo:**
```javascript
const shouldShowMuscleGroups = useMemo(() => {
  return workoutType === "Tren inferior" || workoutType === "Tren superior"
}, [workoutType])
```

**Cuándo usar:**
- Cuando un valor depende de otro
- Para evitar estados redundantes

### 6. **useMemo para Optimización**

**Qué es:**
- Hook que memoriza el resultado de un cálculo
- Solo recalcula si las dependencias cambian

**Cuándo usar:**
- Cálculos que pueden ser costosos
- Valores derivados de props/estado
- Para mejorar rendimiento

### 7. **Manejo de Eventos con Parámetros**

**Qué es:**
- Pasar parámetros a funciones de evento
- Útil cuando tienes múltiples elementos similares

**Ejemplo:**
```jsx
{muscleGroups.map((group) => (
  <button onClick={() => loadExercisesFromMuscleGroup(group)}>
    {group}
  </button>
))}
```

**Por qué arrow function:**
- Permite pasar el parámetro `group`
- Se ejecuta solo cuando se hace click

### 8. **Spread Operator para Arrays**

**Qué es:**
- Operador `...` que expande un array
- Útil para combinar arrays sin mutar

**Ejemplo:**
```javascript
setExercises([...exercises, ...newExercises])
```

**Qué hace:**
- Crea un nuevo array con todos los ejercicios existentes
- Agrega los nuevos ejercicios al final
- No modifica el array original (inmutabilidad)

### 9. **Comparación Case-Insensitive**

**Qué es:**
- Comparar strings sin distinguir mayúsculas/minúsculas
- Normalizar antes de comparar

**Ejemplo:**
```javascript
ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
```

**Por qué:**
- Evita duplicados por diferencias de mayúsculas
- Mejor experiencia de usuario

### 10. **Feedback Visual**

**Qué es:**
- Mostrar al usuario qué está seleccionado
- Cambiar estilos según el estado

**Ejemplo:**
```jsx
className={
  selectedMuscleGroup === muscleGroup
    ? "bg-teal-500 text-black"  // Seleccionado
    : "bg-slate-700 text-white" // No seleccionado
}
```

**Beneficios:**
- Mejor UX
- Usuario sabe qué está activo
- Interfaz más clara

---

## 🎉 ¡FELICITACIONES!

Has implementado exitosamente la **Fase 3: Rutinas Predefinidas**.

**Lo que lograste:**
- ✅ Sistema de rutinas predefinidas funcionando
- ✅ Reducción significativa de inputs manuales
- ✅ Prevención de duplicados
- ✅ Integración sin romper funcionalidad existente
- ✅ Código bien organizado y comentado

**Mejoras de UX logradas:**
- ⚡ Más rápido: Cargar ejercicios con un click
- 🎯 Más simple: Solo completar datos numéricos
- 💪 Más motivador: Menos fricción al registrar entrenamientos

**Próximos pasos posibles:**
- Agregar más rutinas predefinidas
- Permitir crear rutinas personalizadas
- Guardar rutinas favoritas del usuario

---

## 🎓 CONCEPTOS QUE APRENDERÁS

1. **Estructura de datos anidada:** Objetos dentro de objetos
2. **Renderizado condicional:** Mostrar/ocultar elementos según estado
3. **Prevención de duplicados:** Verificar antes de agregar
4. **Separación de datos:** Datos en archivo separado de la lógica
5. **Manejo de eventos:** onClick para cargar ejercicios
6. **Estados derivados:** Calcular qué mostrar basado en otros estados

---

