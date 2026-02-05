# Paso 3: Endpoints CRUD Completos - MiLogit

## 📋 Introducción

En este paso completamos la conexión real a SQL Server creando todos los endpoints CRUD (Create, Read, Update, Delete) necesarios para gestionar entrenamientos.

**¿Qué es CRUD?**
- **C**reate (Crear) → POST
- **R**ead (Leer) → GET
- **U**pdate (Actualizar) → PUT
- **D**elete (Eliminar) → DELETE

---

## 🗄️ Estructura de la Base de Datos

### ¿Qué es una Base de Datos?

Imagina una base de datos como un **archivo Excel gigante** pero mucho más poderoso:
- Puedes guardar millones de filas de información
- Puedes buscar información muy rápido
- Puedes relacionar diferentes tablas entre sí
- Muchas personas pueden usarla al mismo tiempo sin problemas

**SQL Server** es el programa que gestiona tu base de datos. Es como el "administrador" de todos tus datos.

### La Base de Datos MiLogit

Actualmente, la base de datos **MiLogit** tiene **una sola tabla** llamada **Workouts**.

**¿Por qué solo una tabla?**
Porque estamos empezando simple. Más adelante podremos agregar más tablas (como Ejercicios, Series, Usuarios, etc.) según necesitemos.

### La Tabla Workouts

La tabla `Workouts` guarda información sobre cada sesión de entrenamiento que realizas.

**Piensa en ella como una hoja de Excel con estas columnas:**

| Columna | Tipo de Dato | ¿Qué guarda? | ¿Es obligatorio? | Ejemplo |
|---------|--------------|--------------|------------------|---------|
| **id** | INT | Identificador único (número) | ✅ Sí (automático) | 1, 2, 3, 4... |
| **fecha** | DATE | Fecha del entrenamiento | ✅ Sí | "2024-01-15" |
| **tipoEntrenamiento** | NVARCHAR(100) | Tipo de entrenamiento (texto) | ✅ Sí | "Fuerza", "Cardio", "Yoga" |
| **duracionMinutos** | INT | Duración en minutos (número) | ✅ Sí | 60, 30, 45 |
| **notas** | NVARCHAR(500) | Notas adicionales (texto) | ❌ No (opcional) | "Muy pesado hoy" |

### Explicación de los Tipos de Datos

- **INT**: Números enteros (1, 2, 100, 500, etc.)
- **DATE**: Fechas en formato YYYY-MM-DD (2024-01-15)
- **NVARCHAR(100)**: Texto de hasta 100 caracteres
- **NVARCHAR(500)**: Texto de hasta 500 caracteres
- **IDENTITY(1,1)**: Se incrementa automáticamente (1, 2, 3, 4...)
- **PRIMARY KEY**: Identificador único, no se puede repetir
- **NOT NULL**: Campo obligatorio, debe tener un valor
- **NULL**: Campo opcional, puede estar vacío

### Ejemplo Visual de la Tabla

```
Tabla: Workouts
┌────┬────────────┬───────────────────┬─────────────────┬────────────────────────────┐
│ id │   fecha    │ tipoEntrenamiento │ duracionMinutos │           notas             │
├────┼────────────┼───────────────────┼─────────────────┼────────────────────────────┤
│  1 │ 2024-01-15 │ Fuerza            │              60 │ Entrenamiento de pecho      │
│  2 │ 2024-01-16 │ Cardio            │              30 │ NULL                        │
│  3 │ 2024-01-17 │ Yoga              │              45 │ Sesión de estiramiento      │
└────┴────────────┴───────────────────┴─────────────────┴────────────────────────────┘
```

### ¿Qué Relación Tiene Esta Tabla con la App?

La tabla `Workouts` es el **corazón** de la aplicación MiLogit. Cada vez que:

- **Guardas un entrenamiento** → Se crea una nueva fila en esta tabla
- **Ves tus entrenamientos** → Se leen las filas de esta tabla
- **Editas un entrenamiento** → Se actualiza una fila de esta tabla
- **Eliminas un entrenamiento** → Se borra una fila de esta tabla

**En el futuro**, cuando agreguemos más funcionalidades, podremos crear más tablas que se relacionen con `Workouts`:
- Tabla `Ejercicios` → Cada ejercicio pertenece a un entrenamiento
- Tabla `Series` → Cada serie pertenece a un ejercicio
- Tabla `Usuarios` → Cada entrenamiento pertenece a un usuario

Pero por ahora, con esta tabla simple, ya podemos hacer todo lo básico.

---

## 🔌 Endpoints CRUD Completos

### ¿Qué es un Endpoint?

Un **endpoint** es como una "dirección" en tu servidor. Es una URL específica que hace algo cuando la visitas o envías datos.

**Analogía**: Piensa en tu servidor como un edificio con muchas puertas:
- Cada puerta es un endpoint
- Cada puerta tiene un número (la URL)
- Cuando tocas una puerta (haces una petición), el servidor te responde

### Métodos HTTP

Los endpoints usan diferentes **métodos HTTP** para indicar qué acción quieres hacer:

- **GET**: Leer/Obtener datos (como visitar una página web)
- **POST**: Crear algo nuevo (como enviar un formulario)
- **PUT**: Actualizar algo existente (como editar un documento)
- **DELETE**: Eliminar algo (como borrar un archivo)

---

## 1️⃣ POST /workouts - Crear un Entrenamiento

### ¿Qué hace?

Recibe los datos de un entrenamiento y los guarda en la base de datos SQL Server.

### ¿Cómo funciona?

1. El frontend (o Postman) envía datos en formato JSON
2. El backend valida que los datos estén completos
3. El backend crea una query SQL para insertar los datos
4. SQL Server guarda el entrenamiento
5. El backend responde con el ID del nuevo entrenamiento

### Código SQL que se ejecuta:

```sql
INSERT INTO Workouts (fecha, tipoEntrenamiento, duracionMinutos, notas)
VALUES (@fecha, @tipoEntrenamiento, @duracionMinutos, @notas);
SELECT SCOPE_IDENTITY() AS id;
```

**¿Qué significa?**
- `INSERT INTO Workouts`: Inserta datos en la tabla Workouts
- `VALUES (...)`: Los valores que se van a guardar
- `SELECT SCOPE_IDENTITY() AS id`: Obtiene el ID del registro recién creado

### Cómo Probar con Postman

#### Paso 1: Configurar la Petición

1. Abre Postman
2. Crea una nueva petición
3. Configura:
   - **Método**: `POST`
   - **URL**: `http://localhost:3000/workouts`
   - **Headers**: 
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body**: Selecciona "raw" y "JSON"

#### Paso 2: Enviar el Body JSON

Pega este JSON en el body:

```json
{
  "fecha": "2024-01-20",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 60,
  "notas": "Entrenamiento de piernas. 4 series de sentadillas."
}
```

#### Paso 3: Enviar la Petición

Haz clic en "Send" (Enviar)

#### Respuesta Exitosa (201 Created)

```json
{
  "mensaje": "Entrenamiento guardado exitosamente",
  "id": 1,
  "datos": {
    "id": 1,
    "fecha": "2024-01-20",
    "tipoEntrenamiento": "Fuerza",
    "duracionMinutos": 60,
    "notas": "Entrenamiento de piernas. 4 series de sentadillas."
  }
}
```

**¿Qué significa cada campo?**
- `mensaje`: Confirmación de que se guardó
- `id`: El ID único asignado por la base de datos
- `datos`: Los datos del entrenamiento guardado

#### Respuesta de Error (400 Bad Request)

Si faltan datos requeridos:

```json
{
  "error": "Faltan datos requeridos: fecha, tipoEntrenamiento, duracionMinutos"
}
```

#### Más Ejemplos de Body JSON

**Ejemplo 1: Sin notas (opcional)**
```json
{
  "fecha": "2024-01-21",
  "tipoEntrenamiento": "Cardio",
  "duracionMinutos": 30
}
```

**Ejemplo 2: Con notas**
```json
{
  "fecha": "2024-01-22",
  "tipoEntrenamiento": "Yoga",
  "duracionMinutos": 45,
  "notas": "Sesión de estiramiento y relajación. Muy buena sesión."
}
```

**Ejemplo 3: Otro tipo de entrenamiento**
```json
{
  "fecha": "2024-01-23",
  "tipoEntrenamiento": "Nadando",
  "duracionMinutos": 40,
  "notas": "20 vueltas en la piscina"
}
```

---

## 2️⃣ GET /workouts - Obtener Todos los Entrenamientos

### ¿Qué hace?

Devuelve todos los entrenamientos guardados en la base de datos, ordenados del más reciente al más antiguo.

### ¿Cómo funciona?

1. El frontend (o Postman) hace una petición GET
2. El backend crea una query SQL para obtener todos los entrenamientos
3. SQL Server busca y devuelve todos los registros
4. El backend responde con la lista completa

### Código SQL que se ejecuta:

```sql
SELECT id, fecha, tipoEntrenamiento, duracionMinutos, notas
FROM Workouts
ORDER BY fecha DESC, id DESC
```

**¿Qué significa?**
- `SELECT`: Selecciona datos
- `FROM Workouts`: De la tabla Workouts
- `ORDER BY fecha DESC`: Ordenados por fecha, más recientes primero
- `id DESC`: Si hay misma fecha, ordenar por ID descendente

### Cómo Probar con Postman

#### Paso 1: Configurar la Petición

1. Abre Postman
2. Crea una nueva petición
3. Configura:
   - **Método**: `GET`
   - **URL**: `http://localhost:3000/workouts`
   - No necesitas Body ni Headers especiales

#### Paso 2: Enviar la Petición

Haz clic en "Send" (Enviar)

#### Respuesta Exitosa (200 OK)

```json
{
  "total": 3,
  "workouts": [
    {
      "id": 3,
      "fecha": "2024-01-23",
      "tipoEntrenamiento": "Nadando",
      "duracionMinutos": 40,
      "notas": "20 vueltas en la piscina"
    },
    {
      "id": 2,
      "fecha": "2024-01-22",
      "tipoEntrenamiento": "Yoga",
      "duracionMinutos": 45,
      "notas": "Sesión de estiramiento y relajación. Muy buena sesión."
    },
    {
      "id": 1,
      "fecha": "2024-01-20",
      "tipoEntrenamiento": "Fuerza",
      "duracionMinutos": 60,
      "notas": "Entrenamiento de piernas. 4 series de sentadillas."
    }
  ]
}
```

**¿Qué significa cada campo?**
- `total`: Cantidad de entrenamientos encontrados
- `workouts`: Array con todos los entrenamientos

#### Si No Hay Entrenamientos

```json
{
  "total": 0,
  "workouts": []
}
```

#### También Puedes Probar desde el Navegador

Simplemente visita: `http://localhost:3000/workouts`

---

## 3️⃣ GET /workouts/:id - Obtener un Entrenamiento por ID

### ¿Qué hace?

Devuelve un entrenamiento específico usando su ID único.

### ¿Cómo funciona?

1. El frontend (o Postman) envía el ID en la URL (ej: `/workouts/5`)
2. El backend valida que el ID sea un número válido
3. El backend crea una query SQL para buscar por ID
4. SQL Server busca el entrenamiento
5. Si existe, el backend lo devuelve; si no, devuelve error 404

### Código SQL que se ejecuta:

```sql
SELECT id, fecha, tipoEntrenamiento, duracionMinutos, notas
FROM Workouts
WHERE id = @id
```

**¿Qué significa?**
- `WHERE id = @id`: Solo busca el registro con ese ID específico

### Cómo Probar con Postman

#### Paso 1: Configurar la Petición

1. Abre Postman
2. Crea una nueva petición
3. Configura:
   - **Método**: `GET`
   - **URL**: `http://localhost:3000/workouts/1`
     - (El `1` es el ID del entrenamiento que quieres obtener)
   - No necesitas Body ni Headers especiales

#### Paso 2: Enviar la Petición

Haz clic en "Send" (Enviar)

#### Respuesta Exitosa (200 OK)

```json
{
  "id": 1,
  "fecha": "2024-01-20",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 60,
  "notas": "Entrenamiento de piernas. 4 series de sentadillas."
}
```

#### Respuesta de Error (404 Not Found)

Si el ID no existe:

```json
{
  "error": "Entrenamiento no encontrado",
  "id": 999
}
```

#### Respuesta de Error (400 Bad Request)

Si el ID es inválido (no es un número):

```json
{
  "error": "ID inválido. Debe ser un número mayor a 0"
}
```

#### Ejemplos de URLs

- `http://localhost:3000/workouts/1` → Obtiene el entrenamiento con ID 1
- `http://localhost:3000/workouts/2` → Obtiene el entrenamiento con ID 2
- `http://localhost:3000/workouts/abc` → Error 400 (ID inválido)
- `http://localhost:3000/workouts/999` → Error 404 (no existe)

---

## 4️⃣ PUT /workouts/:id - Actualizar un Entrenamiento

### ¿Qué hace?

Actualiza/modifica un entrenamiento existente usando su ID.

### ¿Cómo funciona?

1. El frontend (o Postman) envía el ID en la URL y los nuevos datos en el body
2. El backend valida que el ID sea válido y que exista el entrenamiento
3. El backend valida que los nuevos datos estén completos
4. El backend crea una query SQL para actualizar
5. SQL Server actualiza el registro
6. El backend responde con los datos actualizados

### Código SQL que se ejecuta:

```sql
UPDATE Workouts
SET fecha = @fecha,
    tipoEntrenamiento = @tipoEntrenamiento,
    duracionMinutos = @duracionMinutos,
    notas = @notas
WHERE id = @id
```

**¿Qué significa?**
- `UPDATE Workouts`: Actualiza la tabla Workouts
- `SET ...`: Establece estos nuevos valores
- `WHERE id = @id`: Solo actualiza el registro con ese ID

### Cómo Probar con Postman

#### Paso 1: Configurar la Petición

1. Abre Postman
2. Crea una nueva petición
3. Configura:
   - **Método**: `PUT`
   - **URL**: `http://localhost:3000/workouts/1`
     - (El `1` es el ID del entrenamiento que quieres actualizar)
   - **Headers**: 
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body**: Selecciona "raw" y "JSON"

#### Paso 2: Enviar el Body JSON

Pega este JSON en el body (con los datos que quieres actualizar):

```json
{
  "fecha": "2024-01-20",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 75,
  "notas": "Entrenamiento de piernas. 4 series de sentadillas. Agregué peso extra."
}
```

**Nota**: Debes enviar TODOS los campos requeridos, incluso si solo quieres cambiar uno.

#### Paso 3: Enviar la Petición

Haz clic en "Send" (Enviar)

#### Respuesta Exitosa (200 OK)

```json
{
  "mensaje": "Entrenamiento actualizado exitosamente",
  "id": 1,
  "datos": {
    "id": 1,
    "fecha": "2024-01-20",
    "tipoEntrenamiento": "Fuerza",
    "duracionMinutos": 75,
    "notas": "Entrenamiento de piernas. 4 series de sentadillas. Agregué peso extra."
  }
}
```

#### Respuesta de Error (404 Not Found)

Si el ID no existe:

```json
{
  "error": "Entrenamiento no encontrado",
  "id": 999
}
```

#### Respuesta de Error (400 Bad Request)

Si faltan datos requeridos:

```json
{
  "error": "Faltan datos requeridos: fecha, tipoEntrenamiento, duracionMinutos"
}
```

#### Más Ejemplos de Body JSON

**Ejemplo 1: Cambiar solo la duración**
```json
{
  "fecha": "2024-01-20",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 90,
  "notas": "Entrenamiento de piernas. 4 series de sentadillas."
}
```

**Ejemplo 2: Cambiar las notas**
```json
{
  "fecha": "2024-01-20",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 60,
  "notas": "Entrenamiento de piernas. 4 series de sentadillas. Me sentí muy fuerte hoy."
}
```

**Ejemplo 3: Cambiar el tipo de entrenamiento**
```json
{
  "fecha": "2024-01-20",
  "tipoEntrenamiento": "Cardio",
  "duracionMinutos": 30,
  "notas": "Cambié a cardio porque estaba cansado"
}
```

---

## 5️⃣ DELETE /workouts/:id - Eliminar un Entrenamiento

### ¿Qué hace?

Elimina un entrenamiento de la base de datos usando su ID.

### ¿Cómo funciona?

1. El frontend (o Postman) envía el ID en la URL
2. El backend valida que el ID sea válido y que exista el entrenamiento
3. El backend crea una query SQL para eliminar
4. SQL Server elimina el registro
5. El backend responde con confirmación

### Código SQL que se ejecuta:

```sql
DELETE FROM Workouts
WHERE id = @id
```

**¿Qué significa?**
- `DELETE FROM Workouts`: Elimina de la tabla Workouts
- `WHERE id = @id`: Solo elimina el registro con ese ID

**⚠️ ADVERTENCIA**: Una vez eliminado, NO se puede recuperar. Asegúrate de que realmente quieres eliminar el entrenamiento.

### Cómo Probar con Postman

#### Paso 1: Configurar la Petición

1. Abre Postman
2. Crea una nueva petición
3. Configura:
   - **Método**: `DELETE`
   - **URL**: `http://localhost:3000/workouts/1`
     - (El `1` es el ID del entrenamiento que quieres eliminar)
   - No necesitas Body ni Headers especiales

#### Paso 2: Enviar la Petición

Haz clic en "Send" (Enviar)

#### Respuesta Exitosa (200 OK)

```json
{
  "mensaje": "Entrenamiento eliminado exitosamente",
  "id": 1
}
```

#### Respuesta de Error (404 Not Found)

Si el ID no existe:

```json
{
  "error": "Entrenamiento no encontrado",
  "id": 999
}
```

#### Respuesta de Error (400 Bad Request)

Si el ID es inválido:

```json
{
  "error": "ID inválido. Debe ser un número mayor a 0"
}
```

#### Verificar que se Eliminó

Después de eliminar, puedes verificar haciendo un GET a `/workouts` o `/workouts/:id`:
- El entrenamiento eliminado ya no aparecerá en la lista
- Si intentas obtenerlo por ID, recibirás un error 404

---

## 🔒 Seguridad: Queries Parametrizadas

### ¿Qué son las Queries Parametrizadas?

Las queries parametrizadas son una forma segura de enviar datos a la base de datos. En lugar de poner los valores directamente en la query, usamos "parámetros" (variables) que se llenan después.

### Ejemplo de Query NO Segura (NO hacer esto):

```javascript
// ❌ MAL - Vulnerable a SQL Injection
const query = `SELECT * FROM Workouts WHERE id = ${id}`;
```

**¿Por qué es peligroso?**
Si alguien envía `id = "1; DROP TABLE Workouts; --"`, podría eliminar toda la tabla.

### Ejemplo de Query Segura (Lo que hacemos):

```javascript
// ✅ BIEN - Seguro con parámetros
const query = `SELECT * FROM Workouts WHERE id = @id`;
request.input('id', sql.Int, id);
```

**¿Por qué es seguro?**
SQL Server trata `@id` como un valor literal, no como código SQL. Es imposible inyectar código malicioso.

### En Nuestro Código

Todos nuestros endpoints usan queries parametrizadas:

```javascript
// Ejemplo del endpoint GET /workouts/:id
const request = pool.request();
request.input('id', sql.Int, id);  // ← Parámetro seguro
const result = await request.query(query);
```

**Esto previene ataques de SQL Injection**, que es uno de los tipos de ataques más comunes en aplicaciones web.

---

## 📊 Resumen de Endpoints

| Método | Endpoint | ¿Qué hace? | Body Requerido | Respuesta Exitosa |
|--------|----------|------------|----------------|-------------------|
| **POST** | `/workouts` | Crea un entrenamiento | ✅ Sí (JSON) | 201 Created |
| **GET** | `/workouts` | Obtiene todos los entrenamientos | ❌ No | 200 OK |
| **GET** | `/workouts/:id` | Obtiene un entrenamiento por ID | ❌ No | 200 OK |
| **PUT** | `/workouts/:id` | Actualiza un entrenamiento | ✅ Sí (JSON) | 200 OK |
| **DELETE** | `/workouts/:id` | Elimina un entrenamiento | ❌ No | 200 OK |

---

## 🧪 Flujo Completo de Prueba

### Paso 1: Preparación

1. ✅ Asegúrate de que SQL Server esté corriendo
2. ✅ Asegúrate de que la base de datos `MiLogit` exista
3. ✅ Inicia el servidor backend: `npm run server`
4. ✅ Verifica que veas: "✅ Conectado a SQL Server exitosamente"

### Paso 2: Crear Entrenamientos (POST)

1. Usa Postman para hacer POST a `/workouts`
2. Crea al menos 3 entrenamientos diferentes
3. Anota los IDs que recibes (ej: 1, 2, 3)

**Ejemplo de entrenamientos a crear:**

```json
// Entrenamiento 1
{
  "fecha": "2024-01-20",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 60,
  "notas": "Entrenamiento de pecho"
}

// Entrenamiento 2
{
  "fecha": "2024-01-21",
  "tipoEntrenamiento": "Cardio",
  "duracionMinutos": 30
}

// Entrenamiento 3
{
  "fecha": "2024-01-22",
  "tipoEntrenamiento": "Yoga",
  "duracionMinutos": 45,
  "notas": "Sesión de estiramiento"
}
```

### Paso 3: Obtener Todos los Entrenamientos (GET)

1. Usa Postman para hacer GET a `/workouts`
2. Verifica que aparezcan los 3 entrenamientos que creaste
3. Verifica que estén ordenados del más reciente al más antiguo

### Paso 4: Obtener un Entrenamiento Específico (GET por ID)

1. Usa Postman para hacer GET a `/workouts/1`
2. Verifica que devuelva el entrenamiento con ID 1
3. Prueba con un ID que no existe (ej: `/workouts/999`)
4. Verifica que devuelva error 404

### Paso 5: Actualizar un Entrenamiento (PUT)

1. Usa Postman para hacer PUT a `/workouts/1`
2. Cambia algunos datos (ej: duración, notas)
3. Verifica que la respuesta muestre los datos actualizados
4. Haz GET a `/workouts/1` para confirmar que se actualizó

### Paso 6: Eliminar un Entrenamiento (DELETE)

1. Usa Postman para hacer DELETE a `/workouts/3`
2. Verifica que devuelva mensaje de éxito
3. Haz GET a `/workouts` para confirmar que ya no aparece
4. Haz GET a `/workouts/3` para confirmar que devuelve error 404

### Paso 7: Verificar en SQL Server

1. Abre SQL Server Management Studio
2. Ve a: Databases → MiLogit → Tables → dbo.Workouts
3. Clic derecho → "Select Top 1000 Rows"
4. Verifica que los datos coincidan con lo que creaste/actualizaste

---

## ❌ Errores Comunes y Soluciones

### Error: "No hay conexión a la base de datos"

**Causa**: El servidor SQL Server no está corriendo o la conexión falló.

**Solución**:
1. Verifica que SQL Server esté corriendo
2. Verifica que el nombre del servidor sea correcto en `index.js`: `DESKTOP-661FQLM\SQL`
3. Verifica que la base de datos `MiLogit` exista
4. Reinicia el servidor backend: `npm run server`

### Error: "Invalid object name 'Workouts'"

**Causa**: La tabla Workouts no existe o estás conectado a la base de datos incorrecta.

**Solución**:
1. Ejecuta el script `database.sql` en SSMS
2. Verifica que estés usando la base de datos correcta en `dbConfig`

### Error: "Entrenamiento no encontrado" (404)

**Causa**: El ID que enviaste no existe en la base de datos.

**Solución**:
1. Primero haz GET a `/workouts` para ver qué IDs existen
2. Usa un ID que realmente exista

### Error: "Faltan datos requeridos" (400)

**Causa**: No enviaste todos los campos obligatorios en el body JSON.

**Solución**:
1. Asegúrate de enviar: `fecha`, `tipoEntrenamiento`, `duracionMinutos`
2. Verifica que el JSON esté bien formateado
3. Verifica que el header `Content-Type: application/json` esté configurado

### Error: "ID inválido. Debe ser un número mayor a 0" (400)

**Causa**: El ID en la URL no es un número válido.

**Solución**:
1. Asegúrate de usar un número en la URL (ej: `/workouts/1`, no `/workouts/abc`)
2. El ID debe ser mayor a 0

### Error: "Cannot read property 'request' of null"

**Causa**: La conexión a la base de datos no se estableció correctamente.

**Solución**:
1. Verifica los logs del servidor al iniciar
2. Deberías ver "✅ Conectado a SQL Server exitosamente"
3. Si no aparece, revisa la configuración de `dbConfig` en `index.js`

---

## 📝 Resumen de lo que Hicimos

1. ✅ Documentamos la estructura de la base de datos (tabla Workouts)
2. ✅ Explicamos qué campos tiene cada tabla y para qué sirven
3. ✅ Creamos el endpoint `GET /workouts/:id` para obtener un entrenamiento por ID
4. ✅ Creamos el endpoint `PUT /workouts/:id` para actualizar un entrenamiento
5. ✅ Creamos el endpoint `DELETE /workouts/:id` para eliminar un entrenamiento
6. ✅ Agregamos validación de datos y manejo de errores en todos los endpoints
7. ✅ Usamos queries parametrizadas para prevenir SQL Injection
8. ✅ Probamos todos los endpoints con Postman
9. ✅ Documentamos todo con ejemplos reales

---

## 🎯 Conceptos Clave Aprendidos

### Base de Datos
- **Tabla**: Como una hoja de Excel que guarda información estructurada
- **Columna**: Cada campo de información (ej: fecha, tipoEntrenamiento)
- **Fila/Registro**: Cada entrada individual (ej: un entrenamiento)
- **ID**: Identificador único para cada registro

### Endpoints
- **GET**: Leer/Obtener datos
- **POST**: Crear algo nuevo
- **PUT**: Actualizar algo existente
- **DELETE**: Eliminar algo

### Seguridad
- **Queries Parametrizadas**: Forma segura de enviar datos a la base de datos
- **SQL Injection**: Tipo de ataque que previenen las queries parametrizadas
- **Validación**: Verificar que los datos sean correctos antes de procesarlos

### Códigos HTTP
- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos o faltantes
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

---

## 🚀 Siguiente Paso

Una vez que hayas verificado que:
- ✅ Puedes crear entrenamientos (POST /workouts)
- ✅ Puedes obtener todos los entrenamientos (GET /workouts)
- ✅ Puedes obtener un entrenamiento por ID (GET /workouts/:id)
- ✅ Puedes actualizar un entrenamiento (PUT /workouts/:id)
- ✅ Puedes eliminar un entrenamiento (DELETE /workouts/:id)
- ✅ Los datos aparecen correctamente en SQL Server Management Studio

Estarás listo para conectar el frontend con el backend y dejar de usar localStorage.

---

## 💡 Preguntas Frecuentes

**P: ¿Por qué uso `@id` en lugar de poner el valor directamente?**  
R: Por seguridad. Usar parámetros previene "SQL Injection", un tipo de ataque donde alguien podría ejecutar código malicioso.

**P: ¿Qué es `async` y `await`?**  
R: `async` marca una función como asíncrona (que puede tomar tiempo). `await` espera a que termine una operación antes de continuar. Las operaciones con bases de datos son asíncronas porque pueden tardar.

**P: ¿Por qué uso un Pool en lugar de una conexión simple?**  
R: Un pool es más eficiente. Reutiliza conexiones existentes en lugar de crear nuevas cada vez. Es como tener varios teléfonos listos para hacer llamadas.

**P: ¿Puedo cambiar el nombre de las columnas?**  
R: Sí, pero tendrías que actualizar tanto el script SQL (`database.sql`) como el código de los endpoints (`index.js`).

**P: ¿Qué pasa si envío datos incorrectos?**  
R: El servidor validará los datos y responderá con un error 400 si faltan datos requeridos o si los datos son inválidos.

**P: ¿Por qué debo enviar TODOS los campos en PUT, incluso si solo quiero cambiar uno?**  
R: Por simplicidad en esta versión inicial. En el futuro podríamos hacer que PUT solo actualice los campos que envías (PATCH), pero por ahora es más simple así.

**P: ¿Los datos se guardan permanentemente?**  
R: Sí, se guardan en SQL Server, que es una base de datos persistente. A diferencia de localStorage, los datos no se pierden al cerrar el navegador.

**P: ¿Puedo tener múltiples usuarios?**  
R: Por ahora no, pero la estructura está preparada para agregar una tabla de Usuarios en el futuro.

---

## 📚 Archivos Creados/Modificados

- `index.js` (modificado) - Agregados endpoints GET/:id, PUT/:id, DELETE/:id
- `PASO_3_BACKEND_SQL_SERVER.md` (nuevo) - Esta documentación

---

¡Felicidades! 🎉 Ya tienes un backend completo con todos los endpoints CRUD funcionando con SQL Server real.




