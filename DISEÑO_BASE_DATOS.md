# 🗄️ Diseño de Base de Datos para MiLogit

## 📋 Introducción

Imagina que tienes varias hojas de Excel que están relacionadas entre sí. Cada hoja guarda un tipo de información diferente, pero están conectadas para poder encontrar toda la información de un entrenamiento completo.

---

## 📊 Las Tablas (Hojas de Excel)

Vamos a tener **4 tablas principales**:

1. **Usuarios** - Para identificar a cada persona
2. **Entrenamientos** - La información general de cada sesión de entrenamiento
3. **Ejercicios** - Los ejercicios que se hacen en cada entrenamiento
4. **Series** - Cada serie individual de cada ejercicio

---

## 1️⃣ Tabla: USUARIOS

**¿Qué guarda?**  
Información básica de cada persona que usa la aplicación.

**Campos (Columnas):**

| Campo | Tipo | ¿Para qué sirve? | Ejemplo |
|-------|------|------------------|---------|
| **id** | Número único | Identificador único de cada usuario. Es como el número de documento, pero automático. | 1, 2, 3... |
| **nombre** | Texto | El nombre de la persona | "Juan Pérez" |
| **email** | Texto | El correo electrónico para iniciar sesión | "juan@email.com" |
| **fecha_creacion** | Fecha | Cuándo se registró en la app | "2024-01-15" |

**Ejemplo de datos:**
```
id | nombre      | email           | fecha_creacion
---|-------------|-----------------|---------------
1  | Juan Pérez  | juan@email.com  | 2024-01-15
2  | María López | maria@email.com | 2024-01-20
```

**¿Por qué esta tabla?**  
Aunque por ahora la app es individual, es bueno tenerla para el futuro. Permite que múltiples personas usen la misma aplicación sin mezclar sus datos.

---

## 2️⃣ Tabla: ENTRENAMIENTOS

**¿Qué guarda?**  
La información general de cada sesión de entrenamiento (fecha, tipo, duración, notas).

**Campos (Columnas):**

| Campo | Tipo | ¿Para qué sirve? | Ejemplo |
|-------|------|------------------|---------|
| **id** | Número único | Identificador único de cada entrenamiento | 1, 2, 3... |
| **usuario_id** | Número | Conecta este entrenamiento con un usuario específico. Es como una referencia a la tabla Usuarios. | 1 (se refiere al usuario con id=1) |
| **fecha** | Fecha | El día en que se hizo el entrenamiento | "2024-03-15" |
| **tipo** | Texto | Tipo de entrenamiento (Espalda, Piernas, Pecho, etc.) | "Espalda" |
| **duracion_minutos** | Número | Cuánto duró el entrenamiento en minutos | 90 (1 hora y media) |
| **notas** | Texto largo | Notas generales del entrenamiento (opcional) | "Muy buena sesión, me sentí fuerte" |
| **fecha_creacion** | Fecha y hora | Cuándo se guardó este entrenamiento | "2024-03-15 20:30:00" |

**Ejemplo de datos:**
```
id | usuario_id | fecha      | tipo    | duracion_minutos | notas                    | fecha_creacion
---|------------|------------|---------|------------------|--------------------------|------------------
1  | 1          | 2024-03-15 | Espalda | 90               | "Muy buena sesión"       | 2024-03-15 20:30
2  | 1          | 2024-03-17 | Piernas | 75               | NULL                     | 2024-03-17 19:15
3  | 2          | 2024-03-15 | Pecho   | 60               | "Primera vez con 80kg"   | 2024-03-15 18:00
```

**¿Por qué esta tabla?**  
Cada fila es un entrenamiento completo. Aquí guardamos todo lo que es común a todo el entrenamiento (fecha, tipo, duración).

**Relación:**  
- `usuario_id` conecta con la tabla **USUARIOS** (cada entrenamiento pertenece a un usuario)

---

## 3️⃣ Tabla: EJERCICIOS

**¿Qué guarda?**  
Los ejercicios individuales que se hicieron en cada entrenamiento.

**Campos (Columnas):**

| Campo | Tipo | ¿Para qué sirve? | Ejemplo |
|-------|------|------------------|---------|
| **id** | Número único | Identificador único de cada ejercicio | 1, 2, 3... |
| **entrenamiento_id** | Número | Conecta este ejercicio con un entrenamiento específico. Es como una referencia a la tabla Entrenamientos. | 1 (se refiere al entrenamiento con id=1) |
| **nombre** | Texto | Nombre del ejercicio | "Press de banca" |
| **orden** | Número | En qué orden se hizo este ejercicio dentro del entrenamiento (1 = primero, 2 = segundo, etc.) | 1, 2, 3... |
| **notas** | Texto largo | Notas específicas de este ejercicio (opcional) | "Última serie muy pesada" |

**Ejemplo de datos:**
```
id | entrenamiento_id | nombre          | orden | notas
---|------------------|-----------------|-------|------------------
1  | 1                | Dominadas       | 1     | NULL
2  | 1                | Remo con barra  | 2     | "Muy buena forma"
3  | 1                | Jalones         | 3     | NULL
4  | 2                | Sentadillas     | 1     | NULL
5  | 2                | Peso muerto     | 2     | NULL
```

**¿Por qué esta tabla?**  
Un entrenamiento puede tener varios ejercicios. Esta tabla guarda cada ejercicio por separado.

**Relación:**  
- `entrenamiento_id` conecta con la tabla **ENTRENAMIENTOS** (cada ejercicio pertenece a un entrenamiento)

---

## 4️⃣ Tabla: SERIES

**¿Qué guarda?**  
Cada serie individual de cada ejercicio. Esta es la tabla más detallada.

**Campos (Columnas):**

| Campo | Tipo | ¿Para qué sirve? | Ejemplo |
|-------|------|------------------|---------|
| **id** | Número único | Identificador único de cada serie | 1, 2, 3... |
| **ejercicio_id** | Número | Conecta esta serie con un ejercicio específico. Es como una referencia a la tabla Ejercicios. | 1 (se refiere al ejercicio con id=1) |
| **numero_serie** | Número | Qué número de serie es esta (1 = primera serie, 2 = segunda serie, etc.) | 1, 2, 3, 4... |
| **peso_kg** | Número decimal | Cuántos kilogramos se levantaron en esta serie | 80.5 |
| **repeticiones** | Número | Cuántas repeticiones se hicieron en esta serie | 10 |
| **notas** | Texto | Notas específicas de esta serie (opcional) | "Última rep muy difícil" |

**Ejemplo de datos:**
```
id | ejercicio_id | numero_serie | peso_kg | repeticiones | notas
---|--------------|--------------|---------|--------------|------------------
1  | 1            | 1            | 0       | 12           | NULL
2  | 1            | 2            | 0       | 10           | NULL
3  | 1            | 3            | 0       | 8            | "Fallé en la última"
4  | 2            | 1            | 60      | 10           | NULL
5  | 2            | 2            | 65      | 8            | NULL
6  | 2            | 3            | 70      | 6            | "Muy pesado"
7  | 4            | 1            | 100     | 5            | NULL
8  | 4            | 2            | 100     | 5            | NULL
```

**¿Por qué esta tabla?**  
Cada ejercicio puede tener varias series, y cada serie puede tener diferente peso y repeticiones. Esta tabla permite registrar cada serie por separado.

**Relación:**  
- `ejercicio_id` conecta con la tabla **EJERCICIOS** (cada serie pertenece a un ejercicio)

---

## 🔗 Cómo se Relacionan las Tablas

Piensa en estas tablas como hojas de Excel que están "conectadas" entre sí:

```
USUARIOS (Hoja 1)
    ↓ (usuario_id)
ENTRENAMIENTOS (Hoja 2)
    ↓ (entrenamiento_id)
EJERCICIOS (Hoja 3)
    ↓ (ejercicio_id)
SERIES (Hoja 4)
```

**Ejemplo completo de un entrenamiento:**

1. **Usuario:** Juan Pérez (id=1)
2. **Entrenamiento:** 
   - id=1, fecha=2024-03-15, tipo="Espalda", duración=90 minutos
3. **Ejercicios del entrenamiento:**
   - Ejercicio 1: "Dominadas" (id=1, orden=1)
   - Ejercicio 2: "Remo con barra" (id=2, orden=2)
4. **Series de cada ejercicio:**
   - Dominadas: 3 series (12, 10, 8 repeticiones, sin peso)
   - Remo con barra: 3 series (60kg×10, 65kg×8, 70kg×6)

**Para encontrar todas las series de un entrenamiento:**
1. Busco el entrenamiento por fecha/usuario
2. Busco todos los ejercicios de ese entrenamiento
3. Busco todas las series de cada ejercicio

---

## 📝 Ejemplo Real Completo

**Situación:** Juan hace un entrenamiento de Espalda el 15 de marzo de 2024.

### Paso 1: Se crea el entrenamiento
**Tabla ENTRENAMIENTOS:**
```
id=1, usuario_id=1, fecha="2024-03-15", tipo="Espalda", duracion_minutos=90
```

### Paso 2: Se agregan los ejercicios
**Tabla EJERCICIOS:**
```
id=1, entrenamiento_id=1, nombre="Dominadas", orden=1
id=2, entrenamiento_id=1, nombre="Remo con barra", orden=2
id=3, entrenamiento_id=1, nombre="Jalones", orden=3
```

### Paso 3: Se agregan las series de cada ejercicio

**Dominadas (ejercicio_id=1):**
**Tabla SERIES:**
```
id=1, ejercicio_id=1, numero_serie=1, peso_kg=0, repeticiones=12
id=2, ejercicio_id=1, numero_serie=2, peso_kg=0, repeticiones=10
id=3, ejercicio_id=1, numero_serie=3, peso_kg=0, repeticiones=8
```

**Remo con barra (ejercicio_id=2):**
**Tabla SERIES:**
```
id=4, ejercicio_id=2, numero_serie=1, peso_kg=60, repeticiones=10
id=5, ejercicio_id=2, numero_serie=2, peso_kg=65, repeticiones=8
id=6, ejercicio_id=2, numero_serie=3, peso_kg=70, repeticiones=6
```

**Jalones (ejercicio_id=3):**
**Tabla SERIES:**
```
id=7, ejercicio_id=3, numero_serie=1, peso_kg=50, repeticiones=12
id=8, ejercicio_id=3, numero_serie=2, peso_kg=55, repeticiones=10
id=9, ejercicio_id=3, numero_serie=3, peso_kg=60, repeticiones=8
```

---

## 🎯 Ventajas de Este Diseño

### ✅ Flexibilidad
- Puedes tener diferentes pesos y repeticiones en cada serie
- Ejemplo: Primera serie 60kg×10, segunda serie 65kg×8, tercera serie 70kg×6

### ✅ Detalle
- Puedes agregar notas a nivel de entrenamiento, ejercicio o serie
- Ejemplo: Nota en la serie 3: "Fallé en la última repetición"

### ✅ Escalabilidad
- Fácil agregar más usuarios en el futuro
- Fácil agregar más campos si los necesitas

### ✅ Organización
- Cada tipo de información está en su lugar
- Fácil de buscar y filtrar

---

## 🔄 Alternativa Simplificada (Versión Actual)

Si prefieres una versión más simple (como está ahora en tu código), podrías combinar las tablas EJERCICIOS y SERIES en una sola:

### Tabla: EJERCICIOS (Versión Simplificada)

| Campo | Tipo | ¿Para qué sirve? | Ejemplo |
|-------|------|------------------|---------|
| **id** | Número único | Identificador único | 1, 2, 3... |
| **entrenamiento_id** | Número | Conecta con el entrenamiento | 1 |
| **nombre** | Texto | Nombre del ejercicio | "Press de banca" |
| **orden** | Número | Orden en el entrenamiento | 1, 2, 3... |
| **peso_kg** | Número decimal | Peso usado (igual para todas las series) | 80.5 |
| **repeticiones** | Número | Repeticiones por serie (igual para todas) | 10 |
| **series** | Número | Cantidad de series | 4 |
| **notas** | Texto | Notas del ejercicio | "Muy pesado" |

**Ventaja:** Más simple, menos tablas  
**Desventaja:** No puedes tener diferentes pesos/repeticiones por serie

---

## 🤔 ¿Cuál Elegir?

**Versión Completa (4 tablas):**
- ✅ Si quieres registrar cada serie con su propio peso y repeticiones
- ✅ Si quieres más detalle y flexibilidad
- ✅ Si planeas agregar funcionalidades avanzadas

**Versión Simplificada (3 tablas):**
- ✅ Si todas las series del mismo ejercicio tienen el mismo peso y repeticiones
- ✅ Si quieres algo más simple y rápido
- ✅ Si es suficiente para tus necesidades actuales

---

## 📊 Resumen Visual

```
┌─────────────┐
│  USUARIOS   │
│  (id, nombre)│
└──────┬──────┘
       │ usuario_id
       ↓
┌─────────────┐
│ENTRENAMIENTOS│
│(id, fecha,  │
│ tipo, etc.) │
└──────┬──────┘
       │ entrenamiento_id
       ↓
┌─────────────┐
│  EJERCICIOS │
│(id, nombre, │
│ orden, etc.)│
└──────┬──────┘
       │ ejercicio_id
       ↓
┌─────────────┐
│   SERIES    │
│(id, peso,   │
│ reps, etc.) │
└─────────────┘
```

---

## 💡 Preguntas Frecuentes

**P: ¿Por qué separar en tantas tablas?**  
R: Para evitar repetir información. Si guardas todo en una sola tabla, tendrías que repetir "2024-03-15, Espalda, 90min" para cada ejercicio y cada serie.

**P: ¿Qué pasa si un ejercicio no tiene peso (como dominadas)?**  
R: Simplemente pones `peso_kg = 0` o `NULL` en la tabla SERIES.

**P: ¿Puedo tener notas en diferentes niveles?**  
R: Sí, puedes tener notas en:
- Entrenamiento (notas generales)
- Ejercicio (notas del ejercicio)
- Serie (notas de una serie específica)

**P: ¿Cómo busco todos los entrenamientos de un usuario?**  
R: Buscas en la tabla ENTRENAMIENTOS donde `usuario_id = 1` (por ejemplo).

**P: ¿Cómo busco todas las series de un ejercicio?**  
R: Buscas en la tabla SERIES donde `ejercicio_id = 2` (por ejemplo).

---

¿Te gustaría que explique alguna parte con más detalle o que ajuste el diseño según tus necesidades específicas?





