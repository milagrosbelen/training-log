# =============================================================================
# Dockerfile para Laravel - MiLogit
# Soporta producción y desarrollo mediante ARG APP_ENV
#
# Uso:
#   Desarrollo (con dependencias dev):
#     docker build --build-arg APP_ENV=development -t milogit-backend .
#   Producción (sin dev deps):
#     docker build -t milogit-backend .
#
# Ejecutar (requiere .env o variables DB_* configuradas):
#   docker run -p 8000:8000 --env-file .env milogit-backend
#   O con variables sueltas: docker run -p 8000:8000 -e DB_HOST=host.docker.internal ...
# =============================================================================

# -----------------------------------------------------------------------------
# Etapa 1: Dependencias de Composer
# -----------------------------------------------------------------------------
FROM composer:2.7 AS composer

WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar caché de Docker
COPY composer.json composer.lock* ./

# ARG para elegir modo: production (default) o development
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
FROM php:8.2-cli-bookworm AS base

# Argumentos de build
ARG APP_ENV=production

# Dependencias del sistema necesarias para extensiones PHP
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    libxml2-dev \
    libicu-dev \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Extensiones PHP requeridas por Laravel 10 + PostgreSQL
RUN docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_pgsql \
    pgsql \
    bcmath \
    ctype \
    fileinfo \
    json \
    mbstring \
    opcache \
    pcntl \
    tokenizer \
    xml \
    zip \
    intl

# Limpieza para imagen más ligera en producción
RUN if [ "$APP_ENV" = "production" ]; then \
    apt-get purge -y --auto-remove git; \
    fi

# Directorio de trabajo
WORKDIR /var/www/html

# Copiar dependencias de Composer desde etapa anterior
COPY --from=composer /app/vendor ./vendor

# Copiar código de la aplicación
COPY . .

# Crear directorios de storage y cache con permisos correctos
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/app/public \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copiar .env.example como base (el .env real se monta o inyecta en runtime)
RUN if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || true; fi

# Puerto por defecto (php artisan serve)
EXPOSE 8000

# Usuario no root para mayor seguridad
USER www-data

# Comando por defecto - puede sobrescribirse en docker run o docker-compose
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
