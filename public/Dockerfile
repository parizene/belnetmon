FROM php:5.4-apache

RUN apt-get update
RUN apt-get install -y libzip-dev zip
RUN docker-php-ext-configure zip --with-libzip
RUN docker-php-ext-install zip

COPY . /var/www/html
EXPOSE 80
