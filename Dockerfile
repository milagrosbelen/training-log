# =============================================================================
# Dockerfile para Laravel MiLogit - Render / Producción
# Ubicado en raíz para que Render encuentre el Dockerfile automáticamente
# =============================================================================

# -----------------------------------------------------------------------------
# Etapa 1: Dependencias de Composer
# -----------------------------------------------------------------------------
FROM composer:2.7 AS composer

WORKDIR /app

COPY backend/composer.json backend/composer.lock* ./

ARG APP_ENV=production

RUN if [ "$APP_ENV" = "production" ]; then \
    composer install \
        --no-dev \
        --no-interaction \
        --no-scripts \
        --prefer-dist \
        --optimize-autoloader; \
    else \
    composer install \
        --no-interaction \
        --no-scripts \
        --prefer-dist; \
    fi

# -----------------------------------------------------------------------------
# Etapa 2: Aplicación PHP
# -----------------------------------------------------------------------------
FROM php:8.2-cli-bookworm

ARG APP_ENV=production

# Dependencias del sistema para extensiones PHP
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Solo extensiones que no vienen en la imagen base (pdo, ctype, json, mbstring, xml, zip ya están)
RUN docker-php-ext-configure intl \
    && docker-php-ext-install pdo_pgsql bcmath intl

RUN if [ "$APP_ENV" = "production" ]; then \
    apt-get purge -y --auto-remove git 2>/dev/null || true; \
    fi

WORKDIR /var/www/html

# Copiar vendor de Composer
COPY --from=composer /app/vendor ./vendor

# Copiar código del backend
COPY backend/ .

# Crear directorios y permisos
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/app/public \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || true; fi

EXPOSE 8000

USER www-data

# Migraciones + servidor (Render usa PORT, otros usan 8000)
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
