# Paso 2: Conectar Backend con SQL Server - MiLogit

## ¿Qué es una Base de Datos?

Imagina una base de datos como un **archivo Excel gigante** pero mucho más poderoso:
- Puedes guardar millones de filas de información
- Puedes buscar información muy rápido
- Puedes relacionar diferentes tablas entre sí
- Muchas personas pueden usarla al mismo tiempo sin problemas

**SQL Server** es un programa que gestiona bases de datos. Es como el "administrador" de todos tus datos.

## ¿Qué es una Conexión a la Base de Datos?

Una **conexión** es como un "cable" que conecta tu aplicación Node.js con SQL Server.

```
Node.js (tu backend) ←→ [Conexión] ←→ SQL Server (base de datos)
```

Cuando tu backend quiere:
- **Guardar datos** → Envía un mensaje por la conexión a SQL Server
- **Leer datos** → Pide información a SQL Server por la conexión
- **Modificar datos** → Envía instrucciones a SQL Server por la conexión

## ¿Qué es una Query?

Una **query** (consulta) es una "pregunta" que le haces a la base de datos en lenguaje SQL.

Ejemplos:
- `SELECT * FROM Workouts` = "Muéstrame todos los entrenamientos"
- `INSERT INTO Workouts ...` = "Guarda este nuevo entrenamiento"
- `UPDATE Workouts SET ...` = "Modifica este entrenamiento"

SQL es un lenguaje especial para hablar con bases de datos. Es como el "idioma" que entiende SQL Server.

## Flujo de Información

### Cuando guardas un entrenamiento (POST /workouts):

```
1. Frontend envía datos → 
2. Backend recibe datos (Express) → 
3. Backend crea una query SQL → 
4. Backend envía query por conexión → 
5. SQL Server ejecuta query → 
6. SQL Server guarda datos → 
7. SQL Server responde "OK" → 
8. Backend recibe respuesta → 
9. Backend responde al Frontend
```

### Cuando obtienes entrenamientos (GET /workouts):

```
1. Frontend pide datos → 
2. Backend crea query SQL → 
3. Backend envía query por conexión → 
4. SQL Server busca datos → 
5. SQL Server devuelve datos → 
6. Backend recibe datos → 
7. Backend envía datos al Frontend
```

## Paso 1: Crear la Base de Datos y Tabla

### 1.1. Abrir SQL Server Management Studio (SSMS)

1. Abre SQL Server Management Studio
2. Conéctate a tu servidor: `DESKTOP-661FQLM\SQL`
3. Asegúrate de estar conectado correctamente

### 1.2. Ejecutar el Script SQL

1. En SSMS, haz clic en "New Query" (Nueva Consulta)
2. Abre el archivo `database.sql` que creamos
3. Copia todo el contenido del archivo
4. Pégalo en la ventana de consulta de SSMS
5. Haz clic en "Execute" (Ejecutar) o presiona `F5`

### 1.3. Verificar que se Creó Correctamente

Deberías ver mensajes como:
```
Base de datos MiLogit creada exitosamente.
Tabla Workouts creada exitosamente.
```

Para verificar:
1. En el panel izquierdo de SSMS, expande "Databases"
2. Deberías ver "MiLogit"
3. Expande "MiLogit" → "Tables"
4. Deberías ver "dbo.Workouts"
5. Haz clic derecho en "Workouts" → "Select Top 1000 Rows" para ver la estructura

## Paso 2: Entender la Estructura de la Tabla

La tabla `Workouts` tiene estas columnas:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT | Identificador único (se genera automáticamente) |
| `fecha` | DATE | Fecha del entrenamiento (ej: 2024-01-15) |
| `tipoEntrenamiento` | NVARCHAR(100) | Tipo de entrenamiento (ej: "Fuerza", "Cardio") |
| `duracionMinutos` | INT | Duración en minutos (ej: 60) |
| `notas` | NVARCHAR(500) | Notas adicionales (opcional, puede estar vacío) |

### Explicación de los Tipos de Datos:

- **INT**: Números enteros (1, 2, 100, etc.)
- **DATE**: Fechas (2024-01-15)
- **NVARCHAR(100)**: Texto de hasta 100 caracteres
- **IDENTITY(1,1)**: Se incrementa automáticamente (1, 2, 3, 4...)
- **PRIMARY KEY**: Identificador único, no se puede repetir
- **NOT NULL**: Campo obligatorio, debe tener un valor
- **NULL**: Campo opcional, puede estar vacío

## Paso 3: Entender el Código del Backend

### 3.1. Importar la Librería mssql

```javascript
import sql from 'mssql';
```

**¿Qué hace?**: Importa la librería que nos permite hablar con SQL Server desde Node.js.

**Analogía**: Es como instalar un "traductor" que entiende tanto JavaScript (Node.js) como SQL (SQL Server).

### 3.2. Configuración de la Conexión con Windows Authentication

```javascript
const dbConfig = {
  server: 'DESKTOP-661FQLM\\SQL',
  database: 'MiLogit',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  authentication: {
    type: 'default'
  }
};
```

**¿Qué hace?**: Define los "datos de acceso" para conectarse a SQL Server usando **Windows Authentication**.

**Desglose**:
- `server`: La dirección de tu servidor SQL Server
- `database`: El nombre de la base de datos que queremos usar
- `encrypt: false`: No usar encriptación (para desarrollo local)
- `trustServerCertificate: true`: Confiar en el certificado del servidor
- `enableArithAbort: true`: Mejora la compatibilidad con SQL Server
- `authentication.type: 'default'`: Usa Windows Authentication (tu cuenta de Windows)

**⚠️ IMPORTANTE**: No incluimos `user` ni `password` porque usamos Windows Authentication.

**Analogía**: Es como tener la dirección de una casa y usar tu huella digital para entrar (no necesitas llave).

#### ¿Qué es Windows Authentication?

**Windows Authentication** (también llamada "Autenticación Integrada" o "Trusted Connection") es un método de autenticación que usa tu cuenta de Windows actual para conectarte a SQL Server.

**¿Cómo funciona?**
1. Cuando inicias sesión en Windows, tu computadora ya sabe quién eres
2. SQL Server confía en Windows para verificar tu identidad
3. No necesitas escribir usuario ni contraseña porque SQL Server usa tu cuenta de Windows automáticamente

**Analogía**: Es como entrar a tu casa usando tu huella digital. No necesitas una llave porque la puerta ya sabe quién eres.

#### ¿Por qué NO se usan usuario y contraseña?

Con Windows Authentication:
- ✅ **Más seguro**: No hay contraseñas que puedan ser robadas o filtradas
- ✅ **Más simple**: No necesitas recordar otra contraseña
- ✅ **Más rápido**: No tienes que escribir credenciales cada vez
- ✅ **Recomendado para desarrollo local**: Es la forma más común de conectarse a SQL Server en tu propia computadora

**Cuando SÍ necesitarías usuario y contraseña:**
- Si te conectas a un servidor SQL Server remoto (en otra computadora)
- Si SQL Server está configurado solo para usar "SQL Server Authentication"
- Si no tienes permisos con tu cuenta de Windows

#### ¿Qué significa cada propiedad del dbConfig?

| Propiedad | Valor | ¿Qué significa? |
|-----------|-------|------------------|
| `server` | `'DESKTOP-661FQLM\\SQL'` | El nombre de tu servidor SQL Server. El `\\` es necesario porque es una instancia con nombre (`SQL`) |
| `database` | `'MiLogit'` | El nombre de la base de datos a la que te quieres conectar |
| `encrypt` | `false` | No usar encriptación. En producción debería ser `true`, pero para desarrollo local `false` es más simple |
| `trustServerCertificate` | `true` | Confiar en el certificado del servidor sin verificar. Útil para desarrollo local |
| `enableArithAbort` | `true` | Mejora la compatibilidad con versiones modernas de SQL Server |
| `authentication.type` | `'default'` | Usa la autenticación por defecto del sistema (Windows Authentication) |

**Nota sobre el `server`**: 
- Si tu SQL Server es la instancia por defecto, podrías usar `'localhost'` o `'.'`
- Si es una instancia con nombre (como `SQL`), debes usar `'NOMBRE-PC\\NOMBRE-INSTANCIA'`
- El `\\` (doble backslash) es necesario en JavaScript para escapar el backslash

### 3.3. Crear la Conexión (Pool)

```javascript
pool = await sql.connect(dbConfig);
```

**¿Qué es un Pool?**: Un "pool" (piscina) es un conjunto de conexiones listas para usar.

**¿Por qué usar un Pool?**: 
- Es más eficiente que crear una conexión nueva cada vez
- Permite manejar múltiples peticiones al mismo tiempo
- Reutiliza conexiones existentes

**Analogía**: Es como tener varios teléfonos listos para hacer llamadas, en lugar de comprar un teléfono nuevo cada vez que quieres llamar.

#### Verificar que la Conexión Funciona

Cuando te conectas, el código hace una verificación automática:

```javascript
// Verificar que la conexión realmente funciona haciendo una query simple
const testRequest = pool.request();
const testResult = await testRequest.query('SELECT @@VERSION AS version');
```

Esto ejecuta una query simple para asegurarse de que la conexión realmente funciona, no solo que se estableció.

### 3.4. Express.json() - Entender JSON

```javascript
app.use(express.json());
```

**¿Qué hace?**: Le dice a Express que puede recibir datos en formato JSON.

**¿Qué es JSON?**: JSON es un formato para enviar datos. Se ve así:
```json
{
  "fecha": "2024-01-15",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 60,
  "notas": "Entrenamiento de pecho y tríceps"
}
```

**Analogía**: Es como decirle al servidor "puedo entender este idioma (JSON)".

## Paso 4: Endpoint POST /workouts (Guardar Entrenamiento)

### 4.1. ¿Qué hace este Endpoint?

Recibe datos de un entrenamiento y los guarda en la base de datos.

### 4.2. Desglose del Código

```javascript
app.post('/workouts', async (req, res) => {
```

- `app.post()`: Crea un endpoint que recibe peticiones POST (para crear algo nuevo)
- `'/workouts'`: La dirección del endpoint
- `async`: Permite usar `await` (para esperar respuestas de la base de datos)

```javascript
const { fecha, tipoEntrenamiento, duracionMinutos, notas } = req.body;
```

**¿Qué hace?**: Extrae los datos del cuerpo de la petición.

**Analogía**: Es como abrir un sobre y sacar el contenido.

```javascript
if (!fecha || !tipoEntrenamiento || !duracionMinutos) {
  return res.status(400).json({ error: 'Faltan datos requeridos' });
}
```

**¿Qué hace?**: Valida que los datos obligatorios estén presentes.

**Analogía**: Es como verificar que el sobre tenga todo lo necesario antes de procesarlo.

```javascript
const query = `
  INSERT INTO Workouts (fecha, tipoEntrenamiento, duracionMinutos, notas)
  VALUES (@fecha, @tipoEntrenamiento, @duracionMinutos, @notas);
  SELECT SCOPE_IDENTITY() AS id;
`;
```

**¿Qué hace?**: Crea la query SQL para insertar datos.

**Desglose**:
- `INSERT INTO Workouts`: Inserta en la tabla Workouts
- `(fecha, tipoEntrenamiento, ...)`: Las columnas donde se guardarán los datos
- `VALUES (@fecha, @tipoEntrenamiento, ...)`: Los valores que se guardarán
- `@fecha`: Es un "parámetro" (variable) que se llenará después
- `SELECT SCOPE_IDENTITY() AS id`: Obtiene el ID del registro recién creado

**Analogía**: Es como escribir una carta con espacios en blanco que llenarás después.

```javascript
const request = pool.request();
request.input('fecha', sql.Date, fecha);
request.input('tipoEntrenamiento', sql.NVarChar, tipoEntrenamiento);
// ...
```

**¿Qué hace?**: Llena los parámetros de la query con los valores reales.

**Analogía**: Es como llenar los espacios en blanco de la carta con la información real.

```javascript
const result = await request.query(query);
```

**¿Qué hace?**: Ejecuta la query en la base de datos y espera la respuesta.

**Analogía**: Es como enviar la carta y esperar una respuesta.

### 4.3. Cómo Probar el Endpoint POST /workouts

#### Opción 1: Usando Postman (Recomendado)

1. Abre Postman (o descárgalo si no lo tienes)
2. Crea una nueva petición
3. Configura:
   - **Método**: POST
   - **URL**: `http://localhost:3000/workouts`
   - **Headers**: 
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body**: Selecciona "raw" y "JSON", luego pega esto:

```json
{
  "fecha": "2024-01-15",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 60,
  "notas": "Entrenamiento de pecho y tríceps"
}
```

4. Haz clic en "Send"
5. Deberías ver una respuesta como:

```json
{
  "mensaje": "Entrenamiento guardado exitosamente",
  "id": 1,
  "datos": {
    "id": 1,
    "fecha": "2024-01-15",
    "tipoEntrenamiento": "Fuerza",
    "duracionMinutos": 60,
    "notas": "Entrenamiento de pecho y tríceps"
  }
}
```

#### Opción 2: Usando curl (Terminal)

```bash
curl -X POST http://localhost:3000/workouts \
  -H "Content-Type: application/json" \
  -d "{\"fecha\":\"2024-01-15\",\"tipoEntrenamiento\":\"Fuerza\",\"duracionMinutos\":60,\"notas\":\"Entrenamiento de pecho\"}"
```

#### Opción 3: Desde el Navegador (Solo para GET)

El navegador solo puede hacer peticiones GET fácilmente. Para POST necesitas herramientas como Postman o código JavaScript.

### 4.4. Ejemplos de JSON para Probar

**Ejemplo 1: Entrenamiento completo**
```json
{
  "fecha": "2024-01-15",
  "tipoEntrenamiento": "Fuerza",
  "duracionMinutos": 60,
  "notas": "Entrenamiento de pecho y tríceps. 4 series de press banca."
}
```

**Ejemplo 2: Sin notas (opcional)**
```json
{
  "fecha": "2024-01-16",
  "tipoEntrenamiento": "Cardio",
  "duracionMinutos": 30
}
```

**Ejemplo 3: Otro tipo de entrenamiento**
```json
{
  "fecha": "2024-01-17",
  "tipoEntrenamiento": "Yoga",
  "duracionMinutos": 45,
  "notas": "Sesión de estiramiento y relajación"
}
```

## Paso 5: Endpoint GET /workouts (Obtener Entrenamientos)

### 5.1. ¿Qué hace este Endpoint?

Devuelve todos los entrenamientos guardados en la base de datos.

### 5.2. Desglose del Código

```javascript
const query = `
  SELECT id, fecha, tipoEntrenamiento, duracionMinutos, notas
  FROM Workouts
  ORDER BY fecha DESC, id DESC
`;
```

**¿Qué hace?**: Crea una query SQL para obtener todos los entrenamientos.

**Desglose**:
- `SELECT`: Selecciona datos
- `id, fecha, tipoEntrenamiento, ...`: Las columnas que queremos obtener
- `FROM Workouts`: De la tabla Workouts
- `ORDER BY fecha DESC`: Ordenados por fecha, más recientes primero
- `id DESC`: Si hay misma fecha, ordenar por ID descendente

**Analogía**: Es como decir "dame todos los entrenamientos, ordenados del más reciente al más antiguo".

```javascript
const result = await request.query(query);
```

**¿Qué hace?**: Ejecuta la query y obtiene los resultados.

```javascript
res.json({
  total: result.recordset.length,
  workouts: result.recordset
});
```

**¿Qué hace?**: Envía la respuesta en formato JSON.

**Desglose**:
- `result.recordset`: Los datos obtenidos de la base de datos
- `result.recordset.length`: La cantidad de registros
- `workouts`: Array con todos los entrenamientos

### 5.3. Cómo Probar el Endpoint GET /workouts

#### Opción 1: Desde el Navegador (Más Fácil)

1. Asegúrate de que el servidor esté corriendo
2. Abre tu navegador
3. Ve a: `http://localhost:3000/workouts`
4. Deberías ver algo como:

```json
{
  "total": 2,
  "workouts": [
    {
      "id": 2,
      "fecha": "2024-01-16",
      "tipoEntrenamiento": "Cardio",
      "duracionMinutos": 30,
      "notas": null
    },
    {
      "id": 1,
      "fecha": "2024-01-15",
      "tipoEntrenamiento": "Fuerza",
      "duracionMinutos": 60,
      "notas": "Entrenamiento de pecho y tríceps"
    }
  ]
}
```

#### Opción 2: Usando curl (Terminal)

```bash
curl http://localhost:3000/workouts
```

#### Opción 3: Usando Postman

1. Crea una nueva petición
2. Método: GET
3. URL: `http://localhost:3000/workouts`
4. Haz clic en "Send"

## Paso 6: Probar la Conexión con Windows Authentication

### 6.1. Endpoint de Prueba: GET /test-db

Hemos agregado un endpoint especial para probar la conexión a la base de datos. Este endpoint te muestra información sobre la conexión y verifica que Windows Authentication funciona correctamente.

#### Cómo Probar

**Opción 1: Desde el Navegador (Más Fácil)**

1. Asegúrate de que el servidor esté corriendo (`npm run server`)
2. Abre tu navegador
3. Ve a: `http://localhost:3000/test-db`
4. Deberías ver algo como:

```json
{
  "conectado": true,
  "mensaje": "Conexión a SQL Server exitosa",
  "informacion": {
    "baseDatos": "MiLogit",
    "usuario": "DESKTOP-661FQLM\\TuUsuario",
    "tipoAutenticacion": "Windows Authentication",
    "servidor": "DESKTOP-661FQLM\\SQL",
    "horaServidor": "2024-01-20T10:30:00.000Z"
  }
}
```

**¿Qué significa cada campo?**
- `conectado: true`: La conexión funciona correctamente
- `baseDatos`: El nombre de la base de datos a la que estás conectado
- `usuario`: Tu cuenta de Windows (esto confirma que Windows Authentication funciona)
- `tipoAutenticacion`: Confirma que estás usando Windows Authentication
- `servidor`: El servidor SQL Server al que estás conectado
- `horaServidor`: La hora actual del servidor SQL Server

**Si hay un error**, verás algo como:

```json
{
  "conectado": false,
  "error": "Error al probar la conexión a la base de datos",
  "detalle": "Mensaje de error específico",
  "codigo": "CÓDIGO_DE_ERROR"
}
```

**Opción 2: Usando Postman**

1. Abre Postman
2. Crea una nueva petición
3. Método: `GET`
4. URL: `http://localhost:3000/test-db`
5. Haz clic en "Send"

### 6.2. Verificar los Logs del Servidor

Cuando inicias el servidor (`npm run server`), deberías ver mensajes como:

```
🔄 Intentando conectar a SQL Server...
   Servidor: DESKTOP-661FQLM\SQL
   Base de datos: MiLogit
   Autenticación: Windows Authentication (tu cuenta de Windows)
✅ Conectado a SQL Server exitosamente
📊 Base de datos: MiLogit
🔐 Autenticación: Windows Authentication
💻 Usuario de Windows: TuUsuario
```

Si ves estos mensajes, significa que Windows Authentication funcionó correctamente.

## Paso 7: Flujo Completo de Prueba

### 7.1. Preparación

1. ✅ Asegúrate de que SQL Server esté corriendo
2. ✅ Ejecuta el script `database.sql` en SSMS
3. ✅ Inicia el servidor backend: `npm run server`
4. ✅ Verifica que veas: "✅ Conectado a SQL Server exitosamente"
5. ✅ Prueba el endpoint `/test-db` para verificar la conexión

### 7.2. Probar Guardar un Entrenamiento

1. Usa Postman o curl para hacer POST a `/workouts`
2. Envía un JSON con los datos del entrenamiento
3. Deberías recibir una respuesta con el ID del nuevo entrenamiento

### 7.3. Probar Obtener Entrenamientos

1. Visita `http://localhost:3000/workouts` en el navegador
2. Deberías ver todos los entrenamientos que guardaste
3. Verifica que el entrenamiento que guardaste aparezca en la lista

### 7.4. Verificar en SQL Server

1. Abre SSMS
2. Ve a: Databases → MiLogit → Tables → dbo.Workouts
3. Clic derecho → "Select Top 1000 Rows"
4. Deberías ver los datos que guardaste desde el backend

## Errores Comunes y Soluciones

### Error: "No hay conexión a la base de datos"

**Causa**: El servidor SQL Server no está corriendo o la conexión falló.

**Solución**:
1. Verifica que SQL Server esté corriendo
2. Verifica que el nombre del servidor sea correcto: `DESKTOP-661FQLM\SQL`
3. Verifica que la base de datos `MiLogit` exista
4. Reinicia el servidor backend: `npm run server`
5. Prueba el endpoint `/test-db` para ver el error específico

### Error: "Login failed for user" o "ELOGIN"

**Causa**: Tu cuenta de Windows no tiene permisos en SQL Server o Windows Authentication no está habilitada.

**Solución**:
1. Abre SQL Server Management Studio (SSMS)
2. Conéctate al servidor usando Windows Authentication
3. Si puedes conectarte desde SSMS, el problema puede ser el nombre del servidor en el código
4. Si NO puedes conectarte desde SSMS, necesitas permisos:
   - Ve a: Security → Logins en SSMS
   - Verifica que tu cuenta de Windows esté en la lista
   - Si no está, haz clic derecho en "Logins" → "New Login"
   - Busca tu cuenta de Windows y agrégala
   - Dale permisos en la base de datos MiLogit

### Error: "Cannot find server" o "ETIMEOUT"

**Causa**: El nombre del servidor es incorrecto o SQL Server no está accesible.

**Solución**:
1. Verifica el nombre exacto del servidor:
   - Abre SSMS y mira el nombre que aparece en la conexión
   - Debe ser exactamente igual (incluyendo mayúsculas/minúsculas)
2. Si es la instancia por defecto, intenta usar `'localhost'` o `'.'` en lugar de `'DESKTOP-661FQLM\\SQL'`
3. Verifica que SQL Server esté corriendo:
   - Abre "Services" (Servicios) en Windows
   - Busca "SQL Server (SQL)" o "SQL Server (MSSQLSERVER)"
   - Debe estar en estado "Running" (En ejecución)

### Error: "Invalid object name 'Workouts'"

**Causa**: La tabla Workouts no existe o estás conectado a la base de datos incorrecta.

**Solución**:
1. Ejecuta el script `database.sql` en SSMS
2. Verifica que estés usando la base de datos correcta en `dbConfig`

### Error: "Cannot read property 'request' of null"

**Causa**: La conexión a la base de datos no se estableció correctamente.

**Solución**:
1. Verifica los logs del servidor al iniciar
2. Deberías ver "✅ Conectado a SQL Server exitosamente"
3. Si no aparece, revisa la configuración de `dbConfig`

### Error: "Request timeout"

**Causa**: SQL Server no responde o hay un problema de red.

**Solución**:
1. Verifica que SQL Server esté corriendo
2. Verifica que puedas conectarte desde SSMS
3. Aumenta el timeout en la configuración si es necesario

## Resumen de lo que Hicimos

1. ✅ Instalamos la librería `mssql` para conectar con SQL Server
2. ✅ Creamos un script SQL (`database.sql`) para crear la base de datos y tabla
3. ✅ Configuramos la conexión a SQL Server usando **Windows Authentication** en `index.js`
4. ✅ Agregamos un endpoint de prueba `/test-db` para verificar la conexión
5. ✅ Mejoramos el manejo de errores con mensajes más claros y útiles
6. ✅ Creamos el endpoint `POST /workouts` para guardar entrenamientos
7. ✅ Creamos el endpoint `GET /workouts` para obtener todos los entrenamientos
8. ✅ Agregamos validación de datos y manejo de errores
9. ✅ Probamos que todo funciona correctamente

## Archivos Creados/Modificados

- `database.sql` (nuevo) - Script para crear la base de datos y tabla
- `index.js` (modificado) - Agregada conexión a SQL Server con Windows Authentication y endpoints
- `package.json` (modificado) - Agregada dependencia `mssql`
- `PASO_2_SQL_SERVER.md` (actualizado) - Esta documentación con explicación de Windows Authentication

## Conceptos Clave Aprendidos

- **Base de Datos**: Lugar donde se guardan los datos de forma permanente
- **Conexión**: El "cable" que conecta Node.js con SQL Server
- **Windows Authentication**: Método de autenticación que usa tu cuenta de Windows (no requiere usuario/contraseña)
- **Query**: Una "pregunta" en lenguaje SQL para la base de datos
- **Pool**: Un conjunto de conexiones listas para usar
- **POST**: Método HTTP para crear/guardar datos
- **GET**: Método HTTP para leer/obtener datos
- **JSON**: Formato para enviar y recibir datos
- **Async/Await**: Forma de esperar respuestas de operaciones asíncronas

## Siguiente Paso

Una vez que hayas verificado que:
- ✅ Puedes guardar entrenamientos (POST /workouts)
- ✅ Puedes obtener entrenamientos (GET /workouts)
- ✅ Los datos aparecen en SQL Server Management Studio

Estarás listo para el siguiente paso (cuando lo necesites).

## Preguntas Frecuentes

**P: ¿Por qué uso `@fecha` en lugar de poner el valor directamente?**
R: Por seguridad. Usar parámetros previene "SQL Injection", un tipo de ataque donde alguien podría ejecutar código malicioso.

**P: ¿Qué es `async` y `await`?**
R: `async` marca una función como asíncrona (que puede tomar tiempo). `await` espera a que termine una operación antes de continuar.

**P: ¿Por qué uso un Pool en lugar de una conexión simple?**  
R: Un pool es más eficiente. Reutiliza conexiones existentes en lugar de crear nuevas cada vez.

**P: ¿Por qué no uso usuario y contraseña?**  
R: Porque estamos usando Windows Authentication. SQL Server usa tu cuenta de Windows automáticamente, así que no necesitas escribir credenciales. Es más seguro y más simple para desarrollo local.

**P: ¿Qué pasa si mi cuenta de Windows no tiene permisos en SQL Server?**  
R: Necesitarás agregar tu cuenta de Windows como un "Login" en SQL Server. Abre SSMS, ve a Security → Logins, y agrega tu cuenta de Windows. Luego dale permisos en la base de datos MiLogit.

**P: ¿Puedo usar SQL Server Authentication en lugar de Windows Authentication?**  
R: Sí, pero tendrías que cambiar la configuración. En lugar de `authentication: { type: 'default' }`, usarías `user` y `password` en el `dbConfig`. Sin embargo, Windows Authentication es más recomendado para desarrollo local.

**P: ¿Cómo sé si Windows Authentication está funcionando?**  
R: Prueba el endpoint `/test-db`. Si ves `"tipoAutenticacion": "Windows Authentication"` y tu usuario de Windows, significa que funciona correctamente.

**P: ¿Puedo cambiar el nombre de las columnas?**  
R: Sí, pero tendrías que actualizar tanto el script SQL como el código de los endpoints.

**P: ¿Qué pasa si envío datos incorrectos?**  
R: El servidor validará los datos y responderá con un error 400 si faltan datos requeridos.


