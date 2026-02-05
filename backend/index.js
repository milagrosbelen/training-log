// Importar Express
// Express es una librería que nos ayuda a crear servidores web de forma fácil
import express from 'express';

// Importar cors para permitir requests desde el frontend (móvil o navegador)
import cors from 'cors';

// Importar pg (PostgreSQL) para conectar con PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;

// Crear una aplicación Express
// Esto es como "encender" nuestro servidor
const app = express();

// Configurar CORS para permitir requests desde cualquier origen
// Esto permite que el frontend (móvil o navegador) pueda hacer peticiones al backend
app.use(cors());

// Configurar Express para entender JSON
// Esto permite que el servidor reciba datos en formato JSON en las peticiones
app.use(express.json());

// Definir el puerto donde escuchará nuestro servidor
// El puerto es como el "número de puerta" por donde entra el tráfico
const PORT = 3000;

// Pool de conexiones a PostgreSQL
// Configuración usando variables de entorno PG_*
// Este pool se inicializa una sola vez y se reutiliza en todo el proyecto
const pgPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'belen2026',
  database: process.env.PG_DATABASE || 'milogit',
  max: 10, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000
});

// Crear un endpoint GET /health
// Un endpoint es una "dirección" en nuestro servidor que responde a peticiones
// GET significa que es una petición de solo lectura (como visitar una página web)
app.get('/health', (req, res) => {
  // req = request (la petición que llega)
  // res = response (la respuesta que enviamos)
  
  // Enviar una respuesta en formato JSON
  res.json({ status: 'ok' });
});

// ============================================
// ENDPOINTS PARA TRAININGS (PostgreSQL)
// ============================================

// Endpoint POST /trainings
// Este endpoint crea un nuevo entrenamiento en PostgreSQL
app.post('/trainings', async (req, res) => {
  console.log('\n📥 [POST /trainings] Petición recibida');
  console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));
  
  try {
    // Obtener los datos del cuerpo de la petición
    const { user_id, fecha, duracion_minutos, notas } = req.body;

    // ============================================
    // VALIDACIONES DE DATOS OBLIGATORIOS
    // ============================================
    
    // Validar que user_id esté presente
    if (user_id === undefined || user_id === null || user_id === '') {
      return res.status(400).json({ 
        error: 'El campo user_id es obligatorio',
        campo: 'user_id',
        recibido: user_id
      });
    }

    // Validar que fecha esté presente
    if (!fecha || fecha === '' || typeof fecha !== 'string') {
      return res.status(400).json({ 
        error: 'El campo fecha es obligatorio y debe ser una cadena de texto',
        campo: 'fecha',
        recibido: fecha
      });
    }

    // Validar que duracion_minutos esté presente
    if (duracion_minutos === undefined || duracion_minutos === null) {
      return res.status(400).json({ 
        error: 'El campo duracion_minutos es obligatorio',
        campo: 'duracion_minutos',
        recibido: duracion_minutos
      });
    }

    // ============================================
    // VALIDACIONES DE TIPO Y FORMATO
    // ============================================

    // Validar que user_id sea un número válido
    const userId = parseInt(user_id);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        error: 'user_id debe ser un número entero mayor a 0',
        campo: 'user_id',
        recibido: user_id,
        tipo_recibido: typeof user_id
      });
    }

    // Validar que duracion_minutos sea un número válido
    const duracionMinutos = parseInt(duracion_minutos);
    if (isNaN(duracionMinutos) || duracionMinutos < 0) {
      return res.status(400).json({ 
        error: 'duracion_minutos debe ser un número entero mayor o igual a 0',
        campo: 'duracion_minutos',
        recibido: duracion_minutos,
        tipo_recibido: typeof duracion_minutos
      });
    }

    // Validar formato de fecha (debe ser YYYY-MM-DD)
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
      return res.status(400).json({ 
        error: 'fecha debe tener el formato YYYY-MM-DD (ejemplo: 2024-12-15)',
        campo: 'fecha',
        recibido: fecha,
        formato_esperado: 'YYYY-MM-DD'
      });
    }

    // Verificar que la fecha es válida (no es una fecha inválida como 2024-13-45)
    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({ 
        error: 'fecha no es una fecha válida',
        campo: 'fecha',
        recibido: fecha
      });
    }

    // Verificar que la fecha no sea futura (opcional, pero útil)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaDate > hoy) {
      return res.status(400).json({ 
        error: 'La fecha no puede ser futura',
        campo: 'fecha',
        recibido: fecha
      });
    }

    // ============================================
    // VALIDACIONES DE EXISTENCIA EN BASE DE DATOS
    // ============================================

    // Verificar que el user_id existe en la base de datos
    const checkUserQuery = 'SELECT id FROM users WHERE id = $1';
    const userCheckResult = await pgPool.query(checkUserQuery, [userId]);
    
    if (userCheckResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'user_id no existe en la base de datos',
        campo: 'user_id',
        recibido: userId
      });
    }

    // Crear la query SQL con parámetros $1, $2, $3, $4
    // RETURNING * devuelve el registro completo insertado
    const insertQuery = `
      INSERT INTO trainings (user_id, fecha, duracion_minutos, notas)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    // Ejecutar la query con los parámetros
    const result = await pgPool.query(insertQuery, [
      userId,
      fecha,
      duracionMinutos,
      notas || null
    ]);

    // Responder con el entrenamiento creado
    res.status(201).json(result.rows[0]);

  } catch (error) {
    // Si hay un error, responder con un mensaje de error
    console.error('Error al crear entrenamiento:', error);
    res.status(500).json({ 
      error: 'Error al crear el entrenamiento',
      detalle: error.message 
    });
  }
});

// Endpoint GET /trainings
// Este endpoint devuelve todos los entrenamientos ordenados por fecha descendente
app.get('/trainings', async (req, res) => {
  console.log('\n📥 [GET /trainings] Petición recibida');
  
  try {
    // Crear la query SQL para obtener todos los entrenamientos
    // ORDER BY fecha DESC ordena de más reciente a más antiguo
    const selectQuery = `
      SELECT * 
      FROM trainings 
      ORDER BY fecha DESC
    `;

    // Ejecutar la query
    const result = await pgPool.query(selectQuery);

    // Responder con todos los entrenamientos
    res.status(200).json(result.rows);

  } catch (error) {
    // Si hay un error, responder con un mensaje de error
    console.error('Error al obtener entrenamientos:', error);
    res.status(500).json({ 
      error: 'Error al obtener los entrenamientos',
      detalle: error.message 
    });
  }
});

// Iniciar el servidor
// El pool de PostgreSQL se inicializa automáticamente al crear la instancia
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor funcionando en http://localhost:${PORT}`);
  console.log(`\n📋 Endpoints disponibles:`);
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log(`   GET    http://localhost:${PORT}/trainings`);
  console.log(`   POST   http://localhost:${PORT}/trainings\n`);
});

