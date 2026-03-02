# Configuración de Autenticación - MiLogit

## Flujo de autenticación

- **Registro**: Cualquier usuario puede registrarse con nombre, email y contraseña.
- **Login**: Validación contra la base de datos (no hay usuarios hardcodeados).
- **Token**: Laravel Sanctum emite tokens Bearer para API.

## Si tenés el usuario de prueba anterior

Si ejecutaste `php artisan db:seed` antes y tenés el usuario test@test.com, podés:

**Opción A - Limpiar la base de datos (perderás todos los datos):**
```bash
cd backend
php artisan migrate:fresh
```

**Opción B - Mantener datos y borrar solo el usuario de prueba:**
Ejecutá en tu cliente de base de datos o con tinker:
```bash
php artisan tinker
>>> App\Models\User::where('email', 'test@test.com')->delete();
>>> exit
```

## Requisitos de base de datos

1. Configurá `.env` en `backend/` con tu conexión:
   - **SQLite**: `DB_CONNECTION=sqlite` y `DB_DATABASE` apuntando al archivo (ej: `database/database.sqlite`)
   - **MySQL**: `DB_CONNECTION=mysql`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

2. Ejecutá las migraciones:
```bash
cd backend
php artisan migrate
```

## Validaciones

- **Email**: Obligatorio, formato válido, único en la tabla users
- **Password**: Mínimo 8 caracteres, debe coincidir con password_confirmation
- **Name**: Obligatorio, máximo 255 caracteres
