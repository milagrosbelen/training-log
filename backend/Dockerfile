FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_pgsql

COPY . /var/www/html

RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 775 /var/www/html/storage

EXPOSE 80
