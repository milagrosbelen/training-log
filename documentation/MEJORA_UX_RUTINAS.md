# 🎨 Mejora de UX: Rutinas Predefinidas - Guía de Implementación

## 🎯 1️⃣ EXPLICACIÓN SIMPLE DEL FLUJO

### Flujo Actual (Problema):
1. Usuario escribe "Tren inferior" en tipo de entrenamiento
2. Aparece sección de grupos musculares
3. Usuario hace click en grupo
4. Se cargan todos los ejercicios del grupo

**Problema:** El usuario debe saber escribir "Tren inferior" o "Tren superior" exactamente.

### Flujo Nuevo (Solución):
1. Usuario escribe título libre: "Piernas + glúteos" (solo para identificar el día)
2. Ve claramente botones: "Tren inferior", "Tren superior", "Abdominales"
3. Hace click en un grupo → se muestran los ejercicios de ese grupo
4. Hace click en un ejercicio → se agrega a la lista (uno por uno)
5. Completa series, reps, peso

**Ventaja:** El usuario no necesita saber escribir nada, solo hacer clicks.

### Cambios Principales:

1. **Input de título:**
   - Label cambia a "Título del entrenamiento"
   - Placeholder: "Ej: Piernas + glúteos, Full body, etc."
   - Es solo para identificar el día, no afecta la funcionalidad

2. **Sección de grupos siempre visible:**
   - No depende de lo que escriba el usuario
   - Siempre muestra: "Tren inferior", "Tren superior", "Abdominales"
   - Diseño claro con botones grandes y visibles

3. **Selector de ejercicios:**
   - Al hacer click en un grupo, se muestran sus ejercicios
   - Cada ejercicio es un botón clickeable
   - Al hacer click, se agrega a la lista (uno por uno)

4. **Prevención de duplicados:**
   - Si el ejercicio ya está en la lista, no se agrega
   - Feedback visual si ya existe

---

## 🔄 FLUJO DE DATOS

```
Usuario escribe título → workoutType (solo texto libre)
    ↓
Usuario hace click en "Tren inferior" → selectedGroup = "Tren inferior"
    ↓
Se muestran ejercicios de ese grupo → availableExercises
    ↓
Usuario hace click en "Sentadilla" → loadExercise("Sentadilla")
    ↓
Se agrega a exercises[] → {id, name: "Sentadilla", weight: "", reps: "", sets: 1}
    ↓
Usuario completa datos → weight, reps, sets
    ↓
Guarda → localStorage (igual que antes)
```

---

## 📁 ARCHIVOS A MODIFICAR

### 1. `src/data/routines.js`
- **Cambio:** Agregar "Abdominales" como grupo de nivel superior
- **Razón:** "Abdominales" debe estar al mismo nivel que "Tren inferior" y "Tren superior"

### 2. `src/components/WorkoutDay.jsx`
- **Cambios:**
  - Cambiar label del input a "Título del entrenamiento"
  - Agregar sección siempre visible con botones de grupos
  - Agregar selector de ejercicios (se muestra al seleccionar grupo)
  - Modificar función para agregar ejercicios uno por uno
  - Mantener toda la lógica existente de guardado

---

## 💻 CÓDIGO IMPLEMENTADO

### Paso 1: Actualizar `src/data/routines.js`

Agregar "Abdominales" como grupo de nivel superior y función helper para obtener todos los grupos disponibles.

### Paso 2: Modificar `src/components/WorkoutDay.jsx`

1. Cambiar label y placeholder del input
2. Agregar estados para:
   - `selectedGroup`: Grupo seleccionado actualmente
   - `showExercises`: Si mostrar el selector de ejercicios
3. Agregar función para obtener ejercicios de un grupo
4. Agregar función para agregar un ejercicio individual
5. Agregar UI para grupos y ejercicios

---

## ✅ CÓMO PROBAR

### Prueba Completa:

1. **Selecciona un día en el calendario**
   - Cualquier día sin entrenamiento guardado

2. **Verás el nuevo input:**
   - Label: "Título del entrenamiento" (ya no dice "Tipo de entrenamiento")
   - Placeholder: "Ej: Piernas + glúteos, Full body, Cardio..."
   - Escribe cualquier título: "Piernas + glúteos"

3. **Verás la sección "Lista de ejercicios":**
   - Siempre visible (no depende de lo que escribas)
   - 3 botones grandes: "Tren inferior", "Tren superior", "Abdominales"

4. **Haz click en "Tren inferior":**
   - El botón se resalta (color teal)
   - Aparece una nueva sección debajo: "Selecciona un grupo muscular"
   - Se muestran 4 botones: "Cuádriceps", "Aductor", "Glúteos", "Isquios"

5. **Haz click en "Cuádriceps":**
   - El botón se resalta
   - Aparece otra sección: "Haz click en un ejercicio para agregarlo a tu lista"
   - Se muestran 3 ejercicios: "Sentadilla", "Prensa", "Sillón de cuádriceps"

6. **Haz click en "Sentadilla":**
   - Se agrega automáticamente a la lista de ejercicios
   - El botón "Sentadilla" se deshabilita y muestra "✓ Agregado"
   - El ejercicio aparece con:
     - Nombre: "Sentadilla" (ya cargado)
     - Series: 1 (valor por defecto)
     - Repeticiones: vacío
     - Peso: vacío

7. **Completa los datos:**
   - Series: 4
   - Repeticiones: 10
   - Peso: 80

8. **Agrega más ejercicios:**
   - Haz click en "Prensa" → se agrega
   - Haz click en "Sillón de cuádriceps" → se agrega
   - Completa sus datos

9. **Prueba otro grupo:**
   - Haz click en "Glúteos" (sin cambiar de grupo principal)
   - Se muestran 6 ejercicios de glúteos
   - Haz click en "Hip thrust" → se agrega

10. **Prueba "Abdominales":**
    - Haz click en el botón "Abdominales" (grupo principal)
    - Se muestran directamente los ejercicios (no hay subgrupos)
    - Haz click en "Plancha" → se agrega

11. **Guarda el entrenamiento:**
    - Completa duración (opcional)
    - Haz click en "GUARDAR ENTRENAMIENTO"
    - Verifica que se guarda correctamente

### Verificaciones importantes:

- ✅ No puedes agregar el mismo ejercicio dos veces (se deshabilita)
- ✅ Puedes mezclar ejercicios de diferentes grupos
- ✅ El título es independiente de los ejercicios que agregues
- ✅ Puedes agregar ejercicios manualmente con "Añadir Ejercicio Manual"

---

## 📝 RESUMEN DE CAMBIOS

### Archivos Modificados:

1. **`src/data/routines.js`**
   - Agregado "Abdominales" como grupo de nivel superior
   - Agregada función `getMainGroups()` para obtener grupos principales

2. **`src/components/WorkoutDay.jsx`**
   - Cambiado label de input a "Título del entrenamiento"
   - Eliminada lógica que detectaba "Tren inferior" o "Tren superior" del texto
   - Agregada sección siempre visible con grupos principales
   - Agregado selector de ejercicios que se muestra progresivamente
   - Modificada función para agregar ejercicios uno por uno
   - Agregada prevención de duplicados con feedback visual

### Mejoras de UX:

- ✅ Usuario no necesita saber escribir "Tren inferior" o "Tren superior"
- ✅ Todo es visual y con clicks
- ✅ Flujo progresivo: Grupo → Subgrupo → Ejercicio
- ✅ Feedback claro: botones deshabilitados cuando el ejercicio ya está agregado
- ✅ Título libre para identificar el entrenamiento

---

