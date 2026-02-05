# 🎯 Nueva Lógica de Rendimiento General - Implementación

## 📋 Objetivo

Implementar un sistema de rendimiento general que considere peso, repeticiones y series de manera inteligente, donde:
- **Peso tiene prioridad**: Si el peso cambia, ese cambio determina el rendimiento
- **Si peso es igual**: Se evalúan repeticiones y series para determinar el rendimiento

---

## 🧠 Lógica de Comparación

### Reglas de Evaluación

1. **Rendimiento MEJORA** si:
   - El peso aumenta, O
   - El peso se mantiene igual Y (las repeticiones aumentan O las series aumentan)

2. **Rendimiento es IGUAL** si:
   - Peso, repeticiones y series son todos iguales

3. **Rendimiento EMPEORA** si:
   - El peso baja, O
   - El peso se mantiene igual Y (las repeticiones bajan O las series bajan)

### Ejemplos Prácticos

| Peso | Reps | Series | Peso Anterior | Reps Anterior | Series Anterior | Resultado |
|------|------|--------|---------------|---------------|-----------------|-----------|
| 60kg | 12   | 3      | 55kg          | 12            | 3               | ✅ Mejora (peso subió) |
| 60kg | 12   | 3      | 60kg          | 10            | 3               | ✅ Mejora (peso igual, reps subieron) |
| 60kg | 12   | 3      | 60kg          | 12            | 2               | ✅ Mejora (peso igual, series subieron) |
| 60kg | 12   | 3      | 60kg          | 12            | 3               | ⚠️ Igual (todo igual) |
| 60kg | 12   | 3      | 65kg          | 12            | 3               | ❌ Empeora (peso bajó) |
| 60kg | 12   | 3      | 60kg          | 15            | 3               | ❌ Empeora (peso igual, reps bajaron) |
| 60kg | 12   | 3      | 60kg          | 12            | 4               | ❌ Empeora (peso igual, series bajaron) |

---

## 📝 Plan de Implementación

### Archivo 1: `src/utils/exerciseProgress.js`

**Función a modificar:** `getExerciseProgressStatus()`

**Cambios necesarios:**

1. Extraer valores de peso, reps y series del ejercicio actual y anterior
2. Implementar la lógica de comparación jerárquica:
   - Primero comparar peso
   - Si peso es igual, comparar reps y series
3. Retornar un solo `status` general (no separado por peso/volumen)
4. Mantener datos de diferencias para mostrar información detallada

**Estructura del objeto retornado:**

```javascript
{
  status: "improved" | "same" | "worse" | "first",
  previousWeight: number,
  currentWeight: number,
  weightDifference: number,
  previousReps: number,
  currentReps: number,
  repsDifference: number,
  previousSets: number,
  currentSets: number,
  setsDifference: number,
  // Información adicional para debugging/visualización
  comparisonDetails: {
    weightChanged: boolean,
    repsChanged: boolean,
    setsChanged: boolean,
    reason: string // "peso aumentó" | "reps aumentaron" | etc.
  }
}
```

### Archivo 2: `src/components/WorkoutSummary.jsx`

**Función a modificar:** `getProgressIndicator()`

**Cambios necesarios:**

1. Simplificar para mostrar un solo indicador general
2. Mostrar mensaje descriptivo basado en qué cambió
3. Mantener colores según el estado general

**Visualización esperada:**

```
Sentadilla
🟢 Mejoró: peso +5kg
```

```
Sentadilla
🟢 Mejoró: reps +2 (peso igual)
```

```
Sentadilla
🟡 Sin cambios
```

```
Sentadilla
🔴 Empeoró: peso -2.5kg
```

---

## 🔧 Implementación Detallada

### Paso 1: Nueva Lógica en `exerciseProgress.js`

```javascript
export function getExerciseProgressStatus(currentExercise, currentDate, allWorkouts) {
  // Validación inicial...
  
  // Extraer valores actuales
  const currentWeight = parseFloat(currentExercise.weight) || 0
  const currentReps = parseInt(currentExercise.reps) || 0
  const currentSets = parseInt(currentExercise.sets) || 1
  
  // Buscar ejercicio anterior...
  const lastExercise = findLastExerciseOccurrence(...)
  
  if (!lastExercise) {
    return { status: "first", ... }
  }
  
  // Extraer valores anteriores
  const previousWeight = parseFloat(lastExercise.weight) || 0
  const previousReps = parseInt(lastExercise.reps) || 0
  const previousSets = parseInt(lastExercise.sets) || 1
  
  // Calcular diferencias
  const weightDiff = currentWeight - previousWeight
  const repsDiff = currentReps - previousReps
  const setsDiff = currentSets - previousSets
  
  // LÓGICA DE COMPARACIÓN JERÁRQUICA
  
  let status
  let reason
  
  // Caso 1: Peso cambió (tiene prioridad)
  if (weightDiff > 0) {
    status = "improved"
    reason = `peso +${weightDiff.toFixed(1)}kg`
  } else if (weightDiff < 0) {
    status = "worse"
    reason = `peso ${weightDiff.toFixed(1)}kg`
  } 
  // Caso 2: Peso igual, evaluar reps y series
  else {
    const repsImproved = repsDiff > 0
    const setsImproved = setsDiff > 0
    const repsWorsened = repsDiff < 0
    const setsWorsened = setsDiff < 0
    
    if (repsImproved || setsImproved) {
      status = "improved"
      if (repsImproved && setsImproved) {
        reason = `reps +${repsDiff}, series +${setsDiff} (peso igual)`
      } else if (repsImproved) {
        reason = `reps +${repsDiff} (peso igual)`
      } else {
        reason = `series +${setsDiff} (peso igual)`
      }
    } else if (repsWorsened || setsWorsened) {
      status = "worse"
      if (repsWorsened && setsWorsened) {
        reason = `reps ${repsDiff}, series ${setsDiff} (peso igual)`
      } else if (repsWorsened) {
        reason = `reps ${repsDiff} (peso igual)`
      } else {
        reason = `series ${setsDiff} (peso igual)`
      }
    } else {
      status = "same"
      reason = "sin cambios"
    }
  }
  
  return {
    status,
    previousWeight,
    currentWeight,
    weightDifference: weightDiff,
    previousReps,
    currentReps,
    repsDifference: repsDiff,
    previousSets,
    currentSets,
    setsDifference: setsDiff,
    comparisonDetails: {
      weightChanged: weightDiff !== 0,
      repsChanged: repsDiff !== 0,
      setsChanged: setsDiff !== 0,
      reason
    }
  }
}
```

### Paso 2: Visualización Simplificada en `WorkoutSummary.jsx`

```javascript
const getProgressIndicator = (exercise) => {
  if (!allWorkouts || !workout) return null
  
  const progress = getExerciseProgressStatus(exercise, workout.date, allWorkouts)
  
  // Primer registro
  if (progress.status === "first") {
    return (
      <span className="text-xs font-medium text-teal-400 flex items-center gap-1.5 mt-0.5">
        <span className="text-base">🆕</span>
        <span>Primer registro</span>
      </span>
    )
  }
  
  // Determinar color e icono según estado
  const statusConfig = {
    improved: {
      color: "text-green-400",
      icon: "bg-green-400",
      shadow: "shadow-green-400/50",
      label: "Mejoró"
    },
    same: {
      color: "text-yellow-400",
      icon: "bg-yellow-400",
      shadow: "shadow-yellow-400/50",
      label: "Sin cambios"
    },
    worse: {
      color: "text-red-400",
      icon: "bg-red-400",
      shadow: "shadow-red-400/50",
      label: "Empeoró"
    }
  }
  
  const config = statusConfig[progress.status] || statusConfig.same
  
  return (
    <span className={`text-xs font-medium ${config.color} flex items-center gap-1.5 mt-0.5`}>
      <span className={`w-2.5 h-2.5 rounded-full ${config.icon} shadow-sm ${config.shadow}`}></span>
      <span>{config.label}: {progress.comparisonDetails.reason}</span>
    </span>
  )
}
```

---

## ✅ Casos de Prueba

### Caso 1: Peso aumenta
- **Actual**: 60kg, 12 reps, 3 sets
- **Anterior**: 55kg, 12 reps, 3 sets
- **Resultado**: ✅ Mejora - "peso +5kg"

### Caso 2: Peso igual, reps aumentan
- **Actual**: 60kg, 12 reps, 3 sets
- **Anterior**: 60kg, 10 reps, 3 sets
- **Resultado**: ✅ Mejora - "reps +2 (peso igual)"

### Caso 3: Peso igual, series aumentan
- **Actual**: 60kg, 12 reps, 4 sets
- **Anterior**: 60kg, 12 reps, 3 sets
- **Resultado**: ✅ Mejora - "series +1 (peso igual)"

### Caso 4: Todo igual
- **Actual**: 60kg, 12 reps, 3 sets
- **Anterior**: 60kg, 12 reps, 3 sets
- **Resultado**: ⚠️ Igual - "sin cambios"

### Caso 5: Peso baja
- **Actual**: 60kg, 12 reps, 3 sets
- **Anterior**: 65kg, 12 reps, 3 sets
- **Resultado**: ❌ Empeora - "peso -5kg"

### Caso 6: Peso igual, reps bajan
- **Actual**: 60kg, 10 reps, 3 sets
- **Anterior**: 60kg, 12 reps, 3 sets
- **Resultado**: ❌ Empeora - "reps -2 (peso igual)"

### Caso 7: Peso igual, series bajan
- **Actual**: 60kg, 12 reps, 2 sets
- **Anterior**: 60kg, 12 reps, 3 sets
- **Resultado**: ❌ Empeora - "series -1 (peso igual)"

### Caso 8: Peso igual, reps y series aumentan
- **Actual**: 60kg, 12 reps, 4 sets
- **Anterior**: 60kg, 10 reps, 3 sets
- **Resultado**: ✅ Mejora - "reps +2, series +1 (peso igual)"

---

## 🎨 Consideraciones de UI

### Mensajes Sugeridos

**Mejora:**
- "Mejoró: peso +5kg"
- "Mejoró: reps +2 (peso igual)"
- "Mejoró: series +1 (peso igual)"
- "Mejoró: reps +2, series +1 (peso igual)"

**Igual:**
- "Sin cambios"

**Empeora:**
- "Empeoró: peso -2.5kg"
- "Empeoró: reps -2 (peso igual)"
- "Empeoró: series -1 (peso igual)"
- "Empeoró: reps -2, series -1 (peso igual)"

### Colores Mantenidos
- 🟢 Verde: Mejora
- 🟡 Amarillo: Igual
- 🔴 Rojo: Empeora
- 🔵 Azul/Teal: Primer registro

---

## 🔄 Compatibilidad

- La función retorna `status` (compatible con código existente)
- Se eliminan `volumeStatus` y comparaciones de volumen separadas
- Se simplifica la visualización a un solo indicador
- Los datos de diferencias se mantienen para posibles usos futuros

---

## 📊 Resumen de Cambios

1. **Lógica más inteligente**: Considera peso, reps y series de manera jerárquica
2. **Visualización simplificada**: Un solo indicador general en lugar de dos
3. **Mensajes descriptivos**: Explica qué cambió y por qué
4. **Mantiene compatibilidad**: El código existente sigue funcionando








