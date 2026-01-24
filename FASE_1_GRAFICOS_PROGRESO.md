# 📊 FASE 1: Gráficos de Progreso - Guía Didáctica

## 🎯 1️⃣ EXPLICACIÓN CONCEPTUAL

### ¿Qué son los gráficos de progreso?

Los gráficos de progreso son visualizaciones que muestran cómo cambian tus datos de entrenamiento a lo largo del tiempo. En lugar de solo ver números, verás líneas que suben o bajan, lo que te ayuda a entender tendencias.

### ¿Qué problema resuelven?

**Problema actual:** 
- Solo puedes ver estadísticas del mes actual
- No puedes ver cómo evolucionó tu peso en un ejercicio específico
- No puedes comparar visualmente tu progreso mes a mes
- Es difícil identificar tendencias (¿estoy mejorando o empeorando?)

**Solución:**
- **Gráfico de peso por ejercicio:** Muestra cómo cambió el peso que usaste en un ejercicio específico a lo largo del tiempo
- **Gráfico de entrenamientos por mes:** Muestra cuántos días entrenaste cada mes (útil para ver consistencia)
- **Gráfico de duración total:** Muestra cuánto tiempo total entrenaste cada mes

### ¿Cómo se integra en el flujo actual?

Actualmente tienes:
- Vista "Entrenamientos" → Calendario y registro
- Vista "Progreso" → Resumen mensual con estadísticas

**Nueva integración:**
- Agregaremos una nueva sección en la vista "Progreso" llamada "Gráficos de Progreso"
- Los gráficos usarán los mismos datos que ya tienes guardados (`workouts`)
- No modificaremos el flujo existente, solo agregaremos una nueva vista

---

## 🧠 2️⃣ DISEÑO DEL FLUJO LÓGICO

### ¿Qué datos voy a usar?

**Para el gráfico de peso por ejercicio:**
- Necesito: todos los entrenamientos guardados (`workouts`)
- Filtro: buscar ejercicios con el mismo nombre (ej: "Sentadilla")
- Extraer: fecha del entrenamiento + peso usado
- Resultado: array de puntos `[{date: "2026-01-15", weight: 80}, {date: "2026-01-20", weight: 85}, ...]`

**Para el gráfico de entrenamientos por mes:**
- Necesito: todos los entrenamientos guardados (`workouts`)
- Agrupar: por mes y año
- Contar: cuántos entrenamientos hay en cada mes
- Resultado: array `[{month: "Enero 2026", count: 12}, {month: "Febrero 2026", count: 15}, ...]`

**Para el gráfico de duración total:**
- Necesito: todos los entrenamientos guardados (`workouts`)
- Agrupar: por mes y año
- Sumar: duración total de todos los entrenamientos del mes
- Resultado: array `[{month: "Enero 2026", duration: 1800}, {month: "Febrero 2026", duration: 2100}, ...]`

### ¿Qué estados nuevos necesito?

**En App.jsx:**
- No necesito estados nuevos porque los gráficos solo leen datos existentes
- Los gráficos se mostrarán en la vista "Progreso" que ya existe

**En el componente de gráficos:**
- `selectedExercise`: para el gráfico de peso, necesito saber qué ejercicio mostrar
- `chartData`: datos procesados listos para mostrar en el gráfico

### ¿Qué componentes intervienen?

**Componentes nuevos a crear:**
1. `ProgressCharts.jsx` → Componente principal que contiene los 3 gráficos
2. `WeightProgressChart.jsx` → Gráfico de peso por ejercicio
3. `WorkoutsPerMonthChart.jsx` → Gráfico de entrenamientos por mes
4. `DurationChart.jsx` → Gráfico de duración total

**Componentes existentes a modificar:**
- `App.jsx` → Agregar la nueva sección de gráficos en la vista "Progreso"
- `MonthlySummary.jsx` → No se modifica, se agrega debajo

### ¿Cómo se conecta todo?

```
App.jsx (tiene workouts en estado)
    ↓
    Pasa workouts como prop
    ↓
MonthlySummary.jsx (resumen mensual actual)
    ↓
ProgressCharts.jsx (nuevo componente)
    ↓
    ├─ WeightProgressChart.jsx
    ├─ WorkoutsPerMonthChart.jsx
    └─ DurationChart.jsx
```

**Flujo de datos:**
1. `App.jsx` tiene `workouts` en su estado (ya existe)
2. Cuando estás en vista "Progreso", se muestra `MonthlySummary` y `ProgressCharts`
3. `ProgressCharts` recibe `workouts` como prop
4. Cada gráfico procesa los datos que necesita
5. Los gráficos se renderizan con los datos procesados

---

## 🛠️ 3️⃣ PASO A PASO DE IMPLEMENTACIÓN

### Paso 1: Instalar librería de gráficos

**¿Qué archivo voy a modificar?**
- `package.json` (se actualizará automáticamente)

**¿Qué voy a agregar?**
- Librería `recharts` para crear gráficos profesionales

**¿Por qué Recharts?**
- Es una librería popular y bien mantenida
- Está diseñada específicamente para React
- Es fácil de usar y entender
- No requiere configuración compleja
- Tiene buenos gráficos de línea, barras, etc.

**Comando:**
```bash
npm install recharts
```

### Paso 2: Crear utilidades para procesar datos

**¿Qué archivo voy a crear?**
- `src/utils/chartData.js`

**¿Qué voy a agregar?**
- Funciones que procesan `workouts` y devuelven datos listos para gráficos

**¿Por qué separar la lógica?**
- **Separación de responsabilidades:** Los componentes se encargan de mostrar, las utilidades de procesar
- **Reutilización:** Puedo usar estas funciones en diferentes componentes
- **Testeo:** Es más fácil testear funciones puras
- **Mantenibilidad:** Si cambio cómo proceso los datos, solo modifico un archivo

### Paso 3: Crear componente de gráfico de peso

**¿Qué archivo voy a crear?**
- `src/components/WeightProgressChart.jsx`

**¿Qué voy a agregar?**
- Componente que muestra un gráfico de línea con el peso usado en un ejercicio a lo largo del tiempo
- Selector para elegir qué ejercicio mostrar

**¿Por qué este orden?**
- Es el gráfico más útil para el usuario (ver progreso en ejercicios específicos)
- Es el más complejo (necesita selección de ejercicio)

### Paso 4: Crear gráfico de entrenamientos por mes

**¿Qué archivo voy a crear?**
- `src/components/WorkoutsPerMonthChart.jsx`

**¿Qué voy a agregar?**
- Gráfico de barras que muestra cuántos entrenamientos hubo cada mes

### Paso 5: Crear gráfico de duración total

**¿Qué archivo voy a crear?**
- `src/components/DurationChart.jsx`

**¿Qué voy a agregar?**
- Gráfico de área que muestra la duración total entrenada cada mes

### Paso 6: Crear componente contenedor

**¿Qué archivo voy a crear?**
- `src/components/ProgressCharts.jsx`

**¿Qué voy a agregar?**
- Componente que contiene los 3 gráficos
- Organiza el layout y el diseño

### Paso 7: Integrar en App.jsx

**¿Qué archivo voy a modificar?**
- `src/App.jsx`

**¿Qué voy a agregar?**
- Importar `ProgressCharts`
- Mostrar `ProgressCharts` en la vista "Progreso", debajo de `MonthlySummary`

**¿Por qué en App.jsx?**
- Es el componente principal que controla qué vista mostrar
- Ya tiene acceso a `workouts` en su estado
- Mantiene la estructura clara

---

## 📝 4️⃣ EXPLICACIÓN DEL CÓDIGO

### Archivo: `src/utils/chartData.js`

**¿Por qué este archivo existe?**
- **Separación de responsabilidades:** La lógica de procesamiento está separada de los componentes visuales
- **Reutilización:** Estas funciones pueden usarse en diferentes componentes
- **Testeo:** Es más fácil testear funciones puras (sin efectos secundarios)

**Funciones principales:**

1. **`getAllExerciseNames(workouts)`**
   - **Qué hace:** Extrae todos los nombres únicos de ejercicios de todos los entrenamientos
   - **Cómo funciona:**
     - Usa un `Set` para evitar duplicados
     - Recorre todos los entrenamientos y sus ejercicios
     - Filtra nombres vacíos
     - Ordena alfabéticamente
   - **Retorna:** Array de strings con nombres de ejercicios

2. **`getWeightHistoryForExercise(exerciseName, workouts)`**
   - **Qué hace:** Obtiene el historial de peso para un ejercicio específico
   - **Cómo funciona:**
     - Busca en todos los entrenamientos el ejercicio con el nombre especificado
     - Extrae fecha y peso de cada ocurrencia
     - Ordena por fecha (más antiguo primero)
   - **Retorna:** Array de objetos `{date, weight, volume, dateLabel}`

3. **`getWorkoutsPerMonth(workouts)`**
   - **Qué hace:** Cuenta cuántos entrenamientos hay en cada mes
   - **Cómo funciona:**
     - Agrupa entrenamientos por mes-año usando un objeto
     - Cuenta cuántos hay en cada grupo
     - Formatea etiquetas (ej: "Enero 2026")
   - **Retorna:** Array de objetos `{monthLabel, count, year, month}`

4. **`getDurationPerMonth(workouts)`**
   - **Qué hace:** Suma la duración total entrenada en cada mes
   - **Cómo funciona:**
     - Similar a `getWorkoutsPerMonth` pero suma duraciones
     - Convierte minutos a horas
   - **Retorna:** Array de objetos `{monthLabel, durationHours, year, month}`

### Archivo: `src/components/WeightProgressChart.jsx`

**Conceptos de React usados:**

1. **`useState`**
   ```javascript
   const [selectedExercise, setSelectedExercise] = useState("")
   ```
   - **Qué es:** Hook para manejar estado local del componente
   - **Por qué lo uso:** Necesito recordar qué ejercicio está seleccionado
   - **Cómo funciona:** 
     - `selectedExercise` es el valor actual
     - `setSelectedExercise` es la función para cambiarlo
     - Cuando cambia, React re-renderiza el componente

2. **`useMemo`**
   ```javascript
   const exerciseNames = useMemo(() => {
     return getAllExerciseNames(workouts)
   }, [workouts])
   ```
   - **Qué es:** Hook para optimizar cálculos costosos
   - **Por qué lo uso:** `getAllExerciseNames` puede ser lento con muchos entrenamientos
   - **Cómo funciona:**
     - Solo recalcula si `workouts` cambia
     - Si `workouts` no cambia, devuelve el valor memorizado
   - **Beneficio:** Mejora el rendimiento

3. **`useEffect`**
   ```javascript
   useEffect(() => {
     if (exerciseNames.length > 0 && !selectedExercise) {
       setSelectedExercise(exerciseNames[0])
     }
   }, [exerciseNames, selectedExercise])
   ```
   - **Qué es:** Hook para efectos secundarios (cambios que no son renderizado)
   - **Por qué lo uso:** Inicializar el ejercicio seleccionado automáticamente
   - **Cómo funciona:**
     - Se ejecuta después del render
     - Solo si `exerciseNames` o `selectedExercise` cambian
     - Si hay ejercicios disponibles y ninguno seleccionado, selecciona el primero

**Flujo de datos:**
```
workouts (prop) 
  → getAllExerciseNames() 
  → exerciseNames (estado memorizado)
  → selectedExercise (estado)
  → getWeightHistoryForExercise()
  → weightHistory (estado memorizado)
  → LineChart (render)
```

### Archivo: `src/components/WorkoutsPerMonthChart.jsx`

**Conceptos similares:**
- Usa `useMemo` para calcular `chartData`
- Usa `BarChart` de Recharts (gráfico de barras)
- Más simple que WeightProgressChart (no necesita estado local)

### Archivo: `src/components/DurationChart.jsx`

**Conceptos similares:**
- Usa `useMemo` para calcular `chartData`
- Usa `AreaChart` de Recharts (gráfico de área)
- Incluye gradiente de color para el área

### Archivo: `src/components/ProgressCharts.jsx`

**Conceptos:**
- **Componente contenedor:** Agrupa otros componentes
- **Props drilling:** Pasa `workouts` a cada gráfico hijo
- **Layout responsivo:** Usa Tailwind grid para adaptarse a diferentes pantallas

**Layout explicado:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="md:col-span-2"> {/* Gráfico de peso - ocupa 2 columnas */}
  <div> {/* Gráfico de entrenamientos - 1 columna */}
  <div> {/* Gráfico de duración - 1 columna */}
</div>
```

### Archivo: `src/App.jsx`

**Cambios realizados:**
1. **Import:** Agregué `import ProgressCharts from "./components/ProgressCharts"`
2. **Render:** Agregué `<ProgressCharts workouts={workouts} />` en la vista "summary"

**Flujo completo:**
```
App.jsx (estado: workouts)
  ↓ pasa como prop
ProgressCharts
  ↓ pasa como prop a cada gráfico
WeightProgressChart, WorkoutsPerMonthChart, DurationChart
```

---

## ✅ 5️⃣ CÓMO PROBARLO

### Preparación: Crear datos de prueba

1. **Abre la app** (`npm run dev`)
2. **Registra al menos 2 entrenamientos con el mismo ejercicio:**
   - Selecciona un día (ej: 15 de enero)
   - Tipo: "Piernas"
   - Agrega ejercicio: "Sentadilla", peso: 80kg, reps: 10, series: 4
   - Guarda
   - Selecciona otro día (ej: 20 de enero)
   - Tipo: "Piernas"
   - Agrega ejercicio: "Sentadilla", peso: 85kg, reps: 10, series: 4
   - Guarda

3. **Registra entrenamientos en diferentes meses:**
   - Si estás en enero, registra algunos en enero
   - Navega al mes anterior o siguiente y registra algunos más

### Prueba del gráfico de peso por ejercicio:

1. **Ve a la vista "Progreso"** (botón en el header)
2. **Desplázate hacia abajo** hasta ver "Gráficos de Progreso"
3. **Deberías ver:**
   - Título: "Gráficos de Progreso"
   - Primer gráfico: "Progreso de Peso por Ejercicio"
   - Un dropdown con ejercicios disponibles
4. **Selecciona "Sentadilla"** en el dropdown
5. **Deberías ver:**
   - Un gráfico de línea con 2 puntos
   - Un punto en 80kg (15 de enero)
   - Un punto en 85kg (20 de enero)
   - Una línea conectando ambos puntos
6. **Pasa el mouse sobre los puntos:**
   - Deberías ver un tooltip con información detallada

### Prueba del gráfico de entrenamientos por mes:

1. **En la misma vista "Progreso"**
2. **Desplázate hasta el segundo gráfico**
3. **Deberías ver:**
   - Título: "Entrenamientos por Mes"
   - Un gráfico de barras
   - Una barra por cada mes con entrenamientos
   - La altura de cada barra representa la cantidad de entrenamientos

### Prueba del gráfico de duración:

1. **En la misma vista "Progreso"**
2. **Desplázate hasta el tercer gráfico**
3. **Deberías ver:**
   - Título: "Duración Total por Mes"
   - Un gráfico de área (línea con área rellena debajo)
   - El área muestra la duración total entrenada cada mes

### Verificación de responsividad:

1. **Abre las herramientas de desarrollador** (F12)
2. **Activa el modo responsive** (Ctrl+Shift+M)
3. **Prueba diferentes tamaños:**
   - Mobile: Los gráficos deberían apilarse verticalmente
   - Tablet/Desktop: Los gráficos de entrenamientos y duración deberían estar lado a lado

---

## 🎓 6️⃣ QUÉ APRENDISTE COMO DESARROLLADORA

### Conceptos de React que usaste:

#### 1. **Estado (State)**
- **Qué es:** Información que puede cambiar y afecta el renderizado
- **Ejemplo:** `selectedExercise` en WeightProgressChart
- **Cuándo usar:** Cuando necesitas que el componente "recuerde" algo que puede cambiar
- **Cómo funciona:** Cuando cambias el estado con `setState`, React re-renderiza automáticamente

#### 2. **Props (Properties)**
- **Qué es:** Datos que un componente padre pasa a un componente hijo
- **Ejemplo:** `workouts` que App.jsx pasa a ProgressCharts
- **Cuándo usar:** Para pasar datos de un componente a otro
- **Regla importante:** Props son de solo lectura, no se modifican directamente

#### 3. **Lifting State Up**
- **Qué es:** Mover el estado a un componente padre común
- **Ejemplo:** `workouts` está en App.jsx y se pasa a varios componentes hijos
- **Por qué:** Para compartir datos entre componentes hermanos
- **En este caso:** Todos los gráficos necesitan los mismos datos (workouts)

#### 4. **Hooks de React**

**useState:**
- Para manejar estado local
- Retorna: `[valor, funciónParaCambiarlo]`

**useEffect:**
- Para efectos secundarios (cambios que no son renderizado)
- Se ejecuta después del render
- Puede tener dependencias para controlar cuándo se ejecuta

**useMemo:**
- Para optimizar cálculos costosos
- Memoriza el resultado
- Solo recalcula si las dependencias cambian

#### 5. **Separación de Componentes**
- **Por qué separar:**
  - Cada componente tiene una responsabilidad única
  - Es más fácil de mantener
  - Es más fácil de testear
  - Es más fácil de reutilizar

- **Estructura que usamos:**
  ```
  App.jsx (orquestador)
    ↓
  ProgressCharts.jsx (contenedor)
    ↓
  WeightProgressChart.jsx (gráfico específico)
  WorkoutsPerMonthChart.jsx (gráfico específico)
  DurationChart.jsx (gráfico específico)
  ```

#### 6. **Lógica de Negocio Separada**
- **Qué es:** La lógica de procesamiento de datos separada de los componentes
- **Dónde:** `src/utils/chartData.js`
- **Por qué:**
  - Componentes se enfocan en mostrar (presentación)
  - Utilidades se enfocan en procesar (lógica)
  - Más fácil de testear
  - Más fácil de reutilizar

#### 7. **Componentes Funcionales**
- **Qué es:** Componentes escritos como funciones (no clases)
- **Ventajas:**
  - Más simples de escribir
  - Más fáciles de entender
  - Permiten usar hooks
  - Es el estándar moderno de React

### Patrones de Diseño que usaste:

1. **Container/Presentational Pattern:**
   - `ProgressCharts` es el contenedor (organiza)
   - Los gráficos individuales son presentacionales (muestran)

2. **Custom Hooks (implícito):**
   - `useMemo` para cálculos optimizados
   - Podrías extraer esto a un hook personalizado si se repite mucho

3. **Composition:**
   - Construyes componentes complejos combinando componentes simples
   - `ProgressCharts` compone 3 gráficos

### Conceptos de Recharts que aprendiste:

1. **ResponsiveContainer:** Hace los gráficos responsive automáticamente
2. **LineChart/BarChart/AreaChart:** Diferentes tipos de gráficos
3. **XAxis/YAxis:** Ejes del gráfico
4. **Tooltip:** Información al pasar el mouse
5. **Legend:** Leyenda del gráfico
6. **CartesianGrid:** Cuadrícula de fondo

### Mejores Prácticas que aplicaste:

1. ✅ **Separación de responsabilidades**
2. ✅ **Componentes pequeños y enfocados**
3. ✅ **Optimización con useMemo**
4. ✅ **Código comentado y explicado**
5. ✅ **Nombres descriptivos**
6. ✅ **Layout responsivo**

---

## 🎉 ¡FELICITACIONES!

Has implementado exitosamente la **Fase 1: Gráficos de Progreso**. 

**Lo que lograste:**
- ✅ 3 gráficos interactivos funcionando
- ✅ Integración con el código existente sin romper nada
- ✅ Código bien organizado y comentado
- ✅ Layout responsivo

**Próximo paso:** Cuando estés listo, podemos continuar con la **Fase 2: Comparar Entrenamientos**.

---

