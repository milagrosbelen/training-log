-- Script SQL para crear la base de datos MiLogit y la tabla Workouts en PostgreSQL
-- Ejecuta este script en psql o pgAdmin

-- Crear la base de datos MiLogit
-- Si ya existe, no hará nada
CREATE DATABASE milogit;

-- Conectarse a la base de datos (ejecutar esto en una nueva conexión)
-- \c milogit

-- Crear la tabla Workouts
-- Si ya existe, la elimina y la vuelve a crear
DROP TABLE IF EXISTS Workouts;

-- Crear la tabla Workouts con sus columnas
CREATE TABLE Workouts (
    -- id: identificador único, se incrementa automáticamente
    id SERIAL PRIMARY KEY,
    
    -- fecha: fecha del entrenamiento
    fecha DATE NOT NULL,
    
    -- tipoEntrenamiento: tipo de entrenamiento (ej: "Fuerza", "Cardio", etc.)
    tipoEntrenamiento VARCHAR(100) NOT NULL,
    
    -- duracionMinutos: duración en minutos
    duracionMinutos INTEGER NOT NULL,
    
    -- notas: notas adicionales sobre el entrenamiento (puede estar vacío)
    notas VARCHAR(500)
);

-- Mensaje de confirmación
-- En PostgreSQL, puedes usar DO para mostrar mensajes
DO $$
BEGIN
    RAISE NOTICE 'Tabla Workouts creada exitosamente.';
    RAISE NOTICE 'Columnas: id, fecha, tipoEntrenamiento, duracionMinutos, notas';
END $$;
