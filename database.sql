-- Script SQL para crear la base de datos MiLogit y la tabla Workouts
-- Ejecuta este script en SQL Server Management Studio (SSMS)

-- Crear la base de datos MiLogit
-- Si ya existe, no hará nada (IF NOT EXISTS)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MiLogit')
BEGIN
    CREATE DATABASE MiLogit;
    PRINT 'Base de datos MiLogit creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos MiLogit ya existe.';
END
GO

-- Usar la base de datos MiLogit
USE MiLogit;
GO

-- Crear la tabla Workouts
-- Si ya existe, la elimina y la vuelve a crear (DROP TABLE IF EXISTS)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Workouts]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Workouts];
    PRINT 'Tabla Workouts eliminada (se recreará).';
END
GO

-- Crear la tabla Workouts con sus columnas
CREATE TABLE Workouts (
    -- id: identificador único, se incrementa automáticamente
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- fecha: fecha del entrenamiento
    fecha DATE NOT NULL,
    
    -- tipoEntrenamiento: tipo de entrenamiento (ej: "Fuerza", "Cardio", etc.)
    tipoEntrenamiento NVARCHAR(100) NOT NULL,
    
    -- duracionMinutos: duración en minutos
    duracionMinutos INT NOT NULL,
    
    -- notas: notas adicionales sobre el entrenamiento (puede estar vacío)
    notas NVARCHAR(500) NULL
);
GO

-- Mensaje de confirmación
PRINT 'Tabla Workouts creada exitosamente.';
PRINT 'Columnas: id, fecha, tipoEntrenamiento, duracionMinutos, notas';
GO





