// Importar Express
// Express es una librería que nos ayuda a crear servidores web de forma fácil
import express from 'express';

// Importar sql (mssql) para conectar con SQL Server
// Esta librería nos permite comunicarnos con la base de datos
import sql from 'mssql';

// Crear una aplicación Express
// Esto es como "encender" nuestro servidor
const app = express();

// Configurar Express para entender JSON
// Esto permite que el servidor reciba datos en formato JSON en las peticiones
app.use(express.json());

// Definir el puerto donde escuchará nuestro servidor
// El puerto es como el "número de puerta" por donde entra el tráfico
const PORT = 3000;

// Configuración de conexión a SQL Server
// Estos son los "datos de acceso" para conectarse a la base de datos
// IMPORTANTE: Esta configuración usa Windows Authentication (NTLM)
// No necesitas usuario ni contraseña porque usa tu cuenta de Windows actual
const dbConfig = {
  server: 'DESKTOP-661FQLM\\SQL',  // Nombre del servidor SQL Server (instancia SQL)
  database: 'MiLogit',              // Nombre de la base de datos
  // NO incluimos 'user' ni 'password' porque usamos Windows Authentication
  options: {
    encrypt: false,                 // No usar encriptación (para desarrollo local)
    trustServerCertificate: true,   // Confiar en el certificado del servidor
    enableArithAbort: true,         // Mejora la compatibilidad con SQL Server
    instanceName: 'SQL'              // Nombre de la instancia SQL Server
  },
  // Configuración de autenticación de Windows usando NTLM
  // 'ntlm' es el protocolo específico para Windows Authentication
  authentication: {
    type: 'ntlm',                    // Usa NTLM para Windows Authentication
    options: {
      domain: '',                     // Dominio (vacío para cuentas locales)
      userName: '',                   // Vacío = usa la cuenta de Windows actual
      password: ''                    // Vacío = usa la cuenta de Windows actual
    }
  },
  // Configuración del pool de conexiones
  pool: {
    max: 10,                         // Máximo de conexiones en el pool
    min: 0,                          // Mínimo de conexiones en el pool
    idleTimeoutMillis: 30000          // Tiempo de espera antes de cerrar conexiones inactivas
  }
};

// Variable GLOBAL para guardar el pool de conexiones a la base de datos
// Esta variable es compartida por TODOS los endpoints
// IMPORTANTE: Esta variable debe mantenerse viva durante toda la ejecución del servidor
let pool = null;

// Variable para rastrear el estado de la conexión
let poolConectado = false;

// Función helper para verificar si el pool está conectado y disponible
// Esta función verifica DOS cosas:
// 1. Que la variable pool exista (no sea null)
// 2. Que el pool esté realmente conectado (pool.connected === true)
function poolEstaConectado() {
  if (!pool) {
    console.log('🔍 [DEBUG] Pool es null - no existe');
    return false;
  }
  
  // Verificar el estado interno del pool
  // El pool tiene una propiedad 'connected' que indica si está conectado
  const conectado = pool.connected !== false;
  
  if (!conectado) {
    console.log('🔍 [DEBUG] Pool existe pero no está conectado');
  }
  
  return conectado;
}

// Función para conectar a la base de datos
// Esta función "abre la puerta" para comunicarse con SQL Server
// Crea un POOL GLOBAL que será reutilizado por TODOS los endpoints
async function conectarBaseDatos() {
  try {
    console.log('\n🔄 [INICIO] Intentando conectar a SQL Server...');
    console.log(`   Servidor: ${dbConfig.server}`);
    console.log(`   Instancia: ${dbConfig.options.instanceName}`);
    console.log(`   Base de datos: ${dbConfig.database}`);
    console.log(`   Autenticación: Windows Authentication (NTLM)`);
    console.log(`   Usuario Windows: ${process.env.USERNAME || process.env.USER || 'N/A'}`);
    
    // Crear una "piscina" de conexiones (pool)
    // Un pool es como tener varios "cables" listos para usar
    // IMPORTANTE: sql.connect() crea un pool GLOBAL que se mantiene vivo
    console.log('   📦 Creando pool de conexiones...');
    pool = await sql.connect(dbConfig);
    
    console.log('   ✅ Pool creado exitosamente');
    console.log(`   🔗 Estado del pool: ${pool.connected ? 'CONECTADO' : 'DESCONECTADO'}`);
    
    // Verificar que la conexión realmente funciona haciendo una query simple
    console.log('   🧪 Probando conexión con query de prueba...');
    const testRequest = pool.request();
    const testResult = await testRequest.query(`
      SELECT 
        @@SERVERNAME AS serverName,
        DB_NAME() AS databaseName,
        SYSTEM_USER AS currentUser,
        @@VERSION AS version
    `);
    
    console.log('\n✅ CONEXIÓN EXITOSA A SQL SERVER');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   Servidor: ${testResult.recordset[0].serverName}`);
    console.log(`   Base de datos: ${testResult.recordset[0].databaseName}`);
    console.log(`   Usuario: ${testResult.recordset[0].currentUser}`);
    console.log(`   Autenticación: Windows Authentication (NTLM)`);
    console.log(`   Pool conectado: ${pool.connected ? 'SÍ' : 'NO'}`);
    console.log('═══════════════════════════════════════════════════');
    
    // Marcar que el pool está conectado
    poolConectado = true;
    console.log('   ✅ Pool marcado como CONECTADO y listo para usar\n');
    
    return true;
  } catch (error) {
    console.error('\n❌ ERROR AL CONECTAR CON SQL SERVER');
    console.error('═══════════════════════════════════════════════════');
    console.error(`   Código: ${error.code || 'N/A'}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Servidor intentado: ${dbConfig.server}`);
    console.error('═══════════════════════════════════════════════════');
    
    // Mensajes de error más específicos y útiles
    if (error.code === 'ELOGIN' || error.message.includes('Login failed')) {
      console.error('\n💡 ERROR DE AUTENTICACIÓN:');
      console.error('   1. Verifica que SQL Server esté corriendo');
      console.error('   2. Verifica que tu cuenta de Windows tenga permisos en SQL Server');
      console.error('   3. Abre SQL Server Management Studio y prueba conectarte con Windows Authentication');
      console.error('   4. Si no puedes conectarte desde SSMS, agrega tu cuenta en Security → Logins');
    } else if (error.code === 'ETIMEOUT' || error.message.includes('timeout')) {
      console.error('\n💡 ERROR DE TIMEOUT:');
      console.error('   1. Verifica que SQL Server esté corriendo');
      console.error('   2. Verifica que el nombre del servidor sea correcto');
      console.error('   3. Verifica que no haya un firewall bloqueando la conexión');
      console.error('   4. Verifica que SQL Server Browser esté corriendo (para instancias con nombre)');
    } else if (error.message.includes('Port for') || error.message.includes('not found')) {
      console.error('\n💡 ERROR: NO SE ENCONTRÓ LA INSTANCIA:');
      console.error('   1. Verifica que el nombre del servidor sea correcto: DESKTOP-661FQLM\\SQL');
      console.error('   2. Verifica que SQL Server esté corriendo');
      console.error('   3. Verifica que SQL Server Browser esté corriendo (necesario para instancias con nombre)');
      console.error('   4. Abre SQL Server Configuration Manager y verifica el nombre de la instancia');
      console.error('   5. Intenta conectarte desde SSMS para confirmar el nombre exacto del servidor');
    } else if (error.message.includes('Cannot find server')) {
      console.error('\n💡 ERROR: SERVIDOR NO ENCONTRADO:');
      console.error('   1. Verifica que el nombre del servidor sea correcto: DESKTOP-661FQLM\\SQL');
      console.error('   2. Verifica que SQL Server esté corriendo');
      console.error('   3. Verifica que SQL Server Browser esté corriendo');
    } else if (error.message.includes('Cannot open database')) {
      console.error('\n💡 ERROR: BASE DE DATOS NO ENCONTRADA:');
      console.error('   1. Verifica que la base de datos "MiLogit" exista');
      console.error('   2. Ejecuta el script database.sql en SQL Server Management Studio');
      console.error('   3. Verifica que tu cuenta de Windows tenga permisos en la base de datos');
    } else {
      console.error('\n💡 SOLUCIONES GENERALES:');
      console.error('   1. Verifica que SQL Server esté corriendo');
      console.error('   2. Verifica que SQL Server Browser esté corriendo');
      console.error('   3. Abre SQL Server Management Studio y prueba conectarte');
      console.error('   4. Verifica el nombre exacto del servidor en SSMS');
    }
    
    console.error('\n⚠️  El servidor continuará ejecutándose, pero no podrá usar la base de datos.\n');
    pool = null;
    poolConectado = false;
    return false;
  }
}

// Crear un endpoint GET /health
// Un endpoint es una "dirección" en nuestro servidor que responde a peticiones
// GET significa que es una petición de solo lectura (como visitar una página web)
app.get('/health', (req, res) => {
  // req = request (la petición que llega)
  // res = response (la respuesta que enviamos)
  
  // Enviar una respuesta en formato JSON
  res.json({ status: 'ok' });
});

// Endpoint GET /test-db
// Este endpoint prueba la conexión a la base de datos
// Útil para verificar que Windows Authentication funciona correctamente
app.get('/test-db', async (req, res) => {
  try {
    // Verificar que hay conexión a la base de datos
    if (!pool) {
      return res.status(503).json({ 
        error: 'No hay conexión a la base de datos',
        conectado: false,
        mensaje: 'El servidor no pudo conectarse a SQL Server. Revisa los logs del servidor.'
      });
    }

    // Hacer una query simple para verificar que la conexión funciona
    const request = pool.request();
    const result = await request.query(`
      SELECT 
        DB_NAME() AS databaseName,
        SYSTEM_USER AS currentUser,
        @@VERSION AS sqlServerVersion,
        GETDATE() AS serverTime
    `);

    // Responder con información de la conexión
    res.json({
      conectado: true,
      mensaje: 'Conexión a SQL Server exitosa',
      informacion: {
        baseDatos: result.recordset[0].databaseName,
        usuario: result.recordset[0].currentUser,
        tipoAutenticacion: 'Windows Authentication',
        servidor: dbConfig.server,
        horaServidor: result.recordset[0].serverTime
      }
    });

  } catch (error) {
    // Si hay un error, responder con información detallada
    console.error('Error al probar conexión:', error);
    res.status(500).json({ 
      conectado: false,
      error: 'Error al probar la conexión a la base de datos',
      detalle: error.message,
      codigo: error.code || 'DESCONOCIDO'
    });
  }
});

// ============================================
// ENDPOINTS PARA WORKOUTS (ENTRENAMIENTOS)
// ============================================

// Endpoint POST /workouts
// POST significa "crear algo nuevo"
// Este endpoint recibe datos de un entrenamiento y los guarda en la base de datos
app.post('/workouts', async (req, res) => {
  console.log('\n📥 [POST /workouts] Petición recibida');
  
  try {
    // Verificar que el pool esté conectado y disponible
    // Usamos la función helper que verifica tanto existencia como estado
    console.log('   🔍 Verificando estado del pool...');
    if (!poolEstaConectado()) {
      console.log('   ❌ Pool no disponible - retornando error');
      return res.status(500).json({ 
        error: 'No hay conexión a la base de datos',
        detalle: 'El pool de conexiones no está disponible. Verifica los logs del servidor.'
      });
    }
    console.log('   ✅ Pool verificado - está conectado y disponible');

    // Obtener los datos del cuerpo de la petición (req.body)
    // Estos datos vienen en formato JSON desde el frontend
    const { fecha, tipoEntrenamiento, duracionMinutos, notas } = req.body;

    // Validar que los datos requeridos estén presentes
    if (!fecha || !tipoEntrenamiento || !duracionMinutos) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos: fecha, tipoEntrenamiento, duracionMinutos' 
      });
    }

    // Crear una "query" (consulta) SQL para insertar datos
    // Una query es como una "pregunta" que le hacemos a la base de datos
    const query = `
      INSERT INTO Workouts (fecha, tipoEntrenamiento, duracionMinutos, notas)
      VALUES (@fecha, @tipoEntrenamiento, @duracionMinutos, @notas);
      SELECT SCOPE_IDENTITY() AS id;
    `;

    // Crear una "request" (petición) a la base de datos
    // IMPORTANTE: pool.request() crea una nueva request usando el pool GLOBAL
    console.log('   📦 Creando request desde el pool...');
    const request = pool.request();
    console.log('   ✅ Request creada exitosamente');

    // Agregar los parámetros a la query
    // Esto es como "llenar los espacios en blanco" de la query
    console.log('   📝 Agregando parámetros a la query...');
    request.input('fecha', sql.Date, fecha);
    request.input('tipoEntrenamiento', sql.NVarChar, tipoEntrenamiento);
    request.input('duracionMinutos', sql.Int, duracionMinutos);
    request.input('notas', sql.NVarChar, notas || null); // Si no hay notas, usar null

    // Ejecutar la query y obtener el resultado
    console.log('   🚀 Ejecutando query en SQL Server...');
    const result = await request.query(query);
    console.log('   ✅ Query ejecutada exitosamente');

    // Obtener el ID del entrenamiento recién creado
    const nuevoId = result.recordset[0].id;

    // Responder con éxito y el ID del nuevo entrenamiento
    res.status(201).json({
      mensaje: 'Entrenamiento guardado exitosamente',
      id: nuevoId,
      datos: {
        id: nuevoId,
        fecha,
        tipoEntrenamiento,
        duracionMinutos,
        notas: notas || null
      }
    });

  } catch (error) {
    // Si hay un error, responder con un mensaje de error
    console.error('Error al guardar entrenamiento:', error);
    res.status(500).json({ 
      error: 'Error al guardar el entrenamiento',
      detalle: error.message 
    });
  }
});

// Endpoint GET /workouts
// GET significa "obtener/leer datos"
// Este endpoint devuelve todos los entrenamientos guardados
app.get('/workouts', async (req, res) => {
  console.log('\n📥 [GET /workouts] Petición recibida');
  
  try {
    // Verificar que el pool esté conectado y disponible
    console.log('   🔍 Verificando estado del pool...');
    if (!poolEstaConectado()) {
      console.log('   ❌ Pool no disponible - retornando error');
      return res.status(500).json({ 
        error: 'No hay conexión a la base de datos',
        detalle: 'El pool de conexiones no está disponible. Verifica los logs del servidor.'
      });
    }
    console.log('   ✅ Pool verificado - está conectado y disponible');

    // Crear una query SQL para obtener todos los entrenamientos
    // SELECT * significa "selecciona todas las columnas"
    // FROM Workouts significa "de la tabla Workouts"
    // ORDER BY fecha DESC significa "ordenados por fecha, más recientes primero"
    const query = `
      SELECT id, fecha, tipoEntrenamiento, duracionMinutos, notas
      FROM Workouts
      ORDER BY fecha DESC, id DESC
    `;

    // Crear una request y ejecutar la query
    // IMPORTANTE: pool.request() usa el pool GLOBAL compartido
    console.log('   📦 Creando request desde el pool...');
    const request = pool.request();
    console.log('   ✅ Request creada exitosamente');
    
    console.log('   🚀 Ejecutando query en SQL Server...');
    const result = await request.query(query);
    console.log(`   ✅ Query ejecutada exitosamente - ${result.recordset.length} registros encontrados`);

    // Responder con todos los entrenamientos encontrados
    res.json({
      total: result.recordset.length,
      workouts: result.recordset
    });

  } catch (error) {
    // Si hay un error, responder con un mensaje de error
    console.error('Error al obtener entrenamientos:', error);
    res.status(500).json({ 
      error: 'Error al obtener los entrenamientos',
      detalle: error.message 
    });
  }
});

// Endpoint GET /workouts/:id
// GET significa "obtener/leer datos"
// Este endpoint devuelve un entrenamiento específico por su ID
// :id es un parámetro que viene en la URL (ej: /workouts/5)
app.get('/workouts/:id', async (req, res) => {
  console.log(`\n📥 [GET /workouts/:id] Petición recibida - ID: ${req.params.id}`);
  
  try {
    // Verificar que el pool esté conectado y disponible
    if (!poolEstaConectado()) {
      return res.status(500).json({ 
        error: 'No hay conexión a la base de datos',
        detalle: 'El pool de conexiones no está disponible. Verifica los logs del servidor.'
      });
    }

    // Obtener el ID de los parámetros de la URL
    // req.params.id contiene el valor del :id en la URL
    const id = parseInt(req.params.id);

    // Validar que el ID sea un número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ 
        error: 'ID inválido. Debe ser un número mayor a 0' 
      });
    }

    // Crear una query SQL para obtener un entrenamiento por ID
    // WHERE id = @id significa "donde el id sea igual al parámetro"
    const query = `
      SELECT id, fecha, tipoEntrenamiento, duracionMinutos, notas
      FROM Workouts
      WHERE id = @id
    `;

    // Crear una request y agregar el parámetro ID
    const request = pool.request();
    request.input('id', sql.Int, id);

    // Ejecutar la query
    const result = await request.query(query);

    // Verificar si se encontró el entrenamiento
    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        error: 'Entrenamiento no encontrado',
        id: id
      });
    }

    // Responder con el entrenamiento encontrado
    res.json(result.recordset[0]);

  } catch (error) {
    // Si hay un error, responder con un mensaje de error
    console.error('Error al obtener entrenamiento:', error);
    res.status(500).json({ 
      error: 'Error al obtener el entrenamiento',
      detalle: error.message 
    });
  }
});

// Endpoint PUT /workouts/:id
// PUT significa "actualizar/modificar datos existentes"
// Este endpoint actualiza un entrenamiento existente por su ID
app.put('/workouts/:id', async (req, res) => {
  console.log(`\n📥 [PUT /workouts/:id] Petición recibida - ID: ${req.params.id}`);
  
  try {
    // Verificar que el pool esté conectado y disponible
    if (!poolEstaConectado()) {
      return res.status(500).json({ 
        error: 'No hay conexión a la base de datos',
        detalle: 'El pool de conexiones no está disponible. Verifica los logs del servidor.'
      });
    }

    // Obtener el ID de los parámetros de la URL
    const id = parseInt(req.params.id);

    // Validar que el ID sea un número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ 
        error: 'ID inválido. Debe ser un número mayor a 0' 
      });
    }

    // Obtener los datos del cuerpo de la petición
    const { fecha, tipoEntrenamiento, duracionMinutos, notas } = req.body;

    // Validar que los datos requeridos estén presentes
    if (!fecha || !tipoEntrenamiento || !duracionMinutos) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos: fecha, tipoEntrenamiento, duracionMinutos' 
      });
    }

    // Primero verificar que el entrenamiento existe
    const checkQuery = `SELECT id FROM Workouts WHERE id = @id`;
    const checkRequest = pool.request();
    checkRequest.input('id', sql.Int, id);
    const checkResult = await checkRequest.query(checkQuery);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ 
        error: 'Entrenamiento no encontrado',
        id: id
      });
    }

    // Crear una query SQL para actualizar el entrenamiento
    // UPDATE significa "actualizar"
    // SET significa "establecer estos valores"
    // WHERE id = @id significa "donde el id sea igual al parámetro"
    const query = `
      UPDATE Workouts
      SET fecha = @fecha,
          tipoEntrenamiento = @tipoEntrenamiento,
          duracionMinutos = @duracionMinutos,
          notas = @notas
      WHERE id = @id
    `;

    // Crear una request y agregar los parámetros
    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('fecha', sql.Date, fecha);
    request.input('tipoEntrenamiento', sql.NVarChar, tipoEntrenamiento);
    request.input('duracionMinutos', sql.Int, duracionMinutos);
    request.input('notas', sql.NVarChar, notas || null);

    // Ejecutar la query
    await request.query(query);

    // Responder con éxito y los datos actualizados
    res.json({
      mensaje: 'Entrenamiento actualizado exitosamente',
      id: id,
      datos: {
        id: id,
        fecha,
        tipoEntrenamiento,
        duracionMinutos,
        notas: notas || null
      }
    });

  } catch (error) {
    // Si hay un error, responder con un mensaje de error
    console.error('Error al actualizar entrenamiento:', error);
    res.status(500).json({ 
      error: 'Error al actualizar el entrenamiento',
      detalle: error.message 
    });
  }
});

// Endpoint DELETE /workouts/:id
// DELETE significa "eliminar datos"
// Este endpoint elimina un entrenamiento por su ID
app.delete('/workouts/:id', async (req, res) => {
  console.log(`\n📥 [DELETE /workouts/:id] Petición recibida - ID: ${req.params.id}`);
  
  try {
    // Verificar que el pool esté conectado y disponible
    if (!poolEstaConectado()) {
      return res.status(500).json({ 
        error: 'No hay conexión a la base de datos',
        detalle: 'El pool de conexiones no está disponible. Verifica los logs del servidor.'
      });
    }

    // Obtener el ID de los parámetros de la URL
    const id = parseInt(req.params.id);

    // Validar que el ID sea un número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ 
        error: 'ID inválido. Debe ser un número mayor a 0' 
      });
    }

    // Primero verificar que el entrenamiento existe
    const checkQuery = `SELECT id FROM Workouts WHERE id = @id`;
    const checkRequest = pool.request();
    checkRequest.input('id', sql.Int, id);
    const checkResult = await checkRequest.query(checkQuery);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ 
        error: 'Entrenamiento no encontrado',
        id: id
      });
    }

    // Crear una query SQL para eliminar el entrenamiento
    // DELETE FROM significa "eliminar de"
    // WHERE id = @id significa "donde el id sea igual al parámetro"
    const query = `
      DELETE FROM Workouts
      WHERE id = @id
    `;

    // Crear una request y agregar el parámetro ID
    const request = pool.request();
    request.input('id', sql.Int, id);

    // Ejecutar la query
    await request.query(query);

    // Responder con éxito
    res.json({
      mensaje: 'Entrenamiento eliminado exitosamente',
      id: id
    });

  } catch (error) {
    // Si hay un error, responder con un mensaje de error
    console.error('Error al eliminar entrenamiento:', error);
    res.status(500).json({ 
      error: 'Error al eliminar el entrenamiento',
      detalle: error.message 
    });
  }
});

// Función para iniciar el servidor
// Esta función conecta a la base de datos y luego inicia el servidor
async function iniciarServidor() {
  // Primero, conectar a la base de datos
  await conectarBaseDatos();

  // Luego, hacer que el servidor escuche en el puerto 3000
  // Esto es como "abrir la puerta" para que el servidor empiece a funcionar
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor funcionando en http://localhost:${PORT}`);
    console.log(`\n📋 Endpoints disponibles:`);
    console.log(`   GET    http://localhost:${PORT}/health`);
    console.log(`   GET    http://localhost:${PORT}/test-db     ← Prueba la conexión a SQL Server`);
    console.log(`   GET    http://localhost:${PORT}/workouts`);
    console.log(`   GET    http://localhost:${PORT}/workouts/:id`);
    console.log(`   POST   http://localhost:${PORT}/workouts`);
    console.log(`   PUT    http://localhost:${PORT}/workouts/:id`);
    console.log(`   DELETE http://localhost:${PORT}/workouts/:id\n`);
  });
}

// Iniciar el servidor
iniciarServidor();

