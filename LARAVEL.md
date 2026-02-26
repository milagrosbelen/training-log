# Documentación Backend MiLogit - Laravel + PostgreSQL

## Índice

1. [Creación del proyecto](#1-creación-del-proyecto)
2. [Configuración de PostgreSQL](#2-configuración-de-postgresql)
3. [Tablas definidas](#3-tablas-definidas)
4. [Diagrama conceptual](#4-diagrama-conceptual)
5. [Relaciones entre tablas](#5-relaciones-entre-tablas)
6. [Flujo general del backend](#6-flujo-general-del-backend)
7. [Pasos para ejecutar el proyecto](#7-pasos-para-ejecutar-el-proyecto)
8. [Buenas prácticas utilizadas](#8-buenas-prácticas-utilizadas)

---

## 1. Creación del proyecto

El proyecto Laravel se creó con Composer en la carpeta `backend/` dentro del monorepo:

```bash
composer create-project laravel/laravel backend --prefer-dist
```

**Versiones utilizadas:**
- **Laravel:** 10.x (compatible con PHP 8.1 que incluye XAMPP)
- **PHP:** 8.1 o superior
- **PostgreSQL:** Cualquier versión compatible con Laravel

> **Nota:** Laravel 11+ requiere PHP 8.2. Si tu XAMPP usa PHP 8.1, se instaló Laravel 10 automáticamente (versión estable LTS).

---

## 2. Configuración de PostgreSQL

### 2.1 Archivo `.env`

Se ajustó el archivo `.env` con los siguientes valores:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=milogit
DB_USERNAME=postgres
DB_PASSWORD=
```

- **DB_PASSWORD** vacío si el usuario `postgres` no tiene contraseña (instalación por defecto en XAMPP/PostgreSQL local).
- Si usás contraseña, configurala aquí.

### 2.2 Extensión PHP requerida

Para que Laravel se conecte a PostgreSQL, debés habilitar la extensión `pdo_pgsql` en `php.ini`:

1. Abrí `php.ini` (en XAMPP suele estar en `C:\xampp\php\php.ini`).
2. Buscá la línea: `;extension=pdo_pgsql`
3. Quitá el punto y coma al inicio: `extension=pdo_pgsql`
4. Reiniciá Apache (o el servidor que uses).

### 2.3 Crear la base de datos

En pgAdmin o psql, ejecutá:

```sql
CREATE DATABASE milogit;
```

---

## 3. Tablas definidas

### 3.1 `users` (Laravel por defecto)

| Columna           | Tipo          | Descripción                          |
|-------------------|---------------|--------------------------------------|
| id                | bigint (PK)   | Identificador único                  |
| name              | string        | Nombre del usuario                   |
| email             | string        | Email único                          |
| email_verified_at | timestamp     | Verificación de email (nullable)     |
| password          | string        | Contraseña hasheada                  |
| remember_token    | string        | Token de sesión (nullable)           |
| created_at        | timestamp     | Fecha de creación                    |
| updated_at        | timestamp     | Fecha de actualización               |

**Justificación:** Necesaria para Login y Register del frontend. Soporta autenticación con Laravel Sanctum.

---

### 3.2 `workouts`

| Columna    | Tipo          | Descripción                                    |
|------------|---------------|------------------------------------------------|
| id         | bigint (PK)   | Identificador único                            |
| user_id    | bigint (FK)   | Referencia al usuario propietario              |
| date       | date          | Fecha del entrenamiento (formato YYYY-MM-DD)   |
| type       | string        | Título del entrenamiento (ej: "Piernas")       |
| duration   | integer       | Duración en minutos                            |
| created_at | timestamp     | Fecha de creación                              |
| updated_at | timestamp     | Fecha de actualización                         |

**Constraints:**
- `UNIQUE(user_id, date)`: Un usuario solo puede tener un entrenamiento por fecha.
- `ON DELETE CASCADE`: Si se elimina un usuario, se eliminan sus entrenamientos.

**Justificación:** El frontend gestiona entrenamientos por fecha (calendario). Cada entrenamiento tiene título, duración y lista de ejercicios.

---

### 3.3 `exercises`

| Columna    | Tipo          | Descripción                                    |
|------------|---------------|------------------------------------------------|
| id         | bigint (PK)   | Identificador único                            |
| workout_id | bigint (FK)   | Referencia al entrenamiento                    |
| name       | string        | Nombre del ejercicio (ej: "Sentadilla")        |
| weight     | decimal(8,2)  | Peso en kg (nullable)                          |
| reps       | integer       | Repeticiones (nullable)                        |
| sets       | integer       | Series (default: 1)                            |
| order      | integer       | Orden dentro del entrenamiento                 |
| created_at | timestamp     | Fecha de creación                              |
| updated_at | timestamp     | Fecha de actualización                         |

**Constraints:**
- `ON DELETE CASCADE`: Si se elimina un entrenamiento, se eliminan sus ejercicios.

**Justificación:** Cada entrenamiento contiene múltiples ejercicios con peso, reps y sets. El campo `order` preserva el orden de los ejercicios tal como los agrega el usuario.

---

## 4. Diagrama conceptual

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   users     │         │  workouts   │         │  exercises  │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │───┐     │ id (PK)     │───┐     │ id (PK)     │
│ name        │   │     │ user_id(FK) │<──┘     │ workout_id  │<──┘
│ email       │   └────>│ date        │   │     │ name        │
│ password    │         │ type        │   └────>│ weight      │
│ ...         │         │ duration    │         │ reps        │
└─────────────┘         └─────────────┘         │ sets        │
                                                │ order       │
    1 usuario                   1 workout       └─────────────┘
       │                            │
       │   tiene muchos             │   tiene muchos
       └──────────────────────────>│   ejercicios
                workouts            └──────────────────────────>
```

**Resumen en texto:**
- **User** tiene muchos **Workout** (relación 1:N).
- **Workout** pertenece a un **User** y tiene muchos **Exercise** (relación 1:N).
- **Exercise** pertenece a un **Workout**.

---

## 5. Relaciones entre tablas

### User ↔ Workout (1:N)

- **User** `hasMany` **Workout**
- **Workout** `belongsTo` **User**

Un usuario puede tener muchos entrenamientos. Cada entrenamiento pertenece a un solo usuario.

### Workout ↔ Exercise (1:N)

- **Workout** `hasMany` **Exercise** (ordenados por `order`)
- **Exercise** `belongsTo` **Workout**

Un entrenamiento contiene varios ejercicios. Cada ejercicio pertenece a un solo entrenamiento.

### Rutinas predefinidas (sin tabla)

El frontend usa `src/data/routines.js` con grupos musculares y ejercicios sugeridos. Es data estática y no se persiste en la base de datos.

---

## 6. Flujo general del backend

1. **Autenticación**
   - Login/Register vía rutas y controladores que consumirán el frontend.
   - Laravel Sanctum para API tokens (recomendado al conectar el frontend).

2. **Entrenamientos**
   - El frontend envía `date`, `type`, `duration` y array de `exercises`.
   - El backend:
     - Asocia el workout al usuario autenticado.
     - Crea/actualiza el workout según la fecha (unique por usuario).
     - Crea/actualiza los ejercicios con su orden.

3. **Consultas**
   - Listar entrenamientos del usuario (para calendario).
   - Obtener un entrenamiento por fecha con sus ejercicios (eager loading).
   - Datos para gráficos: agrupaciones por mes, historial de pesos, etc. (lógica similar a `chartData.js`).

4. **Eliminación**
   - Al eliminar un workout, los exercises se eliminan en cascada.

---

## 7. Pasos para ejecutar el proyecto

### 7.1 Requisitos previos

- PHP 8.1+ (XAMPP)
- Composer
- PostgreSQL (XAMPP o instalación separada)
- Extensión `pdo_pgsql` habilitada en `php.ini`

### 7.2 Crear la base de datos

```sql
CREATE DATABASE milogit;
```

### 7.3 Instalar dependencias

```bash
cd backend
composer install
```

### 7.4 Configurar variables de entorno

```bash
cp .env.example .env
php artisan key:generate
```

Revisá y ajustá `DB_*` en `.env` si tu PostgreSQL usa otras credenciales.

### 7.5 Ejecutar migraciones

```bash
php artisan migrate
```

Esto crea las tablas `users`, `workouts`, `exercises` y las de Laravel (sessions, tokens, etc.).

### 7.6 Levantar el servidor

```bash
php artisan serve
```

El backend estará disponible en `http://127.0.0.1:8000`.

---

## 8. Buenas prácticas utilizadas

- **MVC:** Modelos, migraciones y estructura de Laravel separada del frontend.
- **Migraciones:** Esquema versionado y reproducible.
- **Foreign keys y cascadas:** Integridad referencial y eliminación coherente.
- **Constraints:** `UNIQUE(user_id, date)` para evitar entrenamientos duplicados por fecha.
- **Modelos con relaciones:** `hasMany`, `belongsTo` para consultas y eager loading.
- **Fillable y casts:** Control de asignación masiva y tipos de datos.
- **Convenciones Laravel:** Nombres de tablas en plural, timestamps, claves foráneas estándar.
- **`.env.example`:** Plantilla clara para configuración sin exponer secretos.
- **Sin MySQL:** Solo PostgreSQL como motor de base de datos.
