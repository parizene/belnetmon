FROM php:5.4-apache

RUN echo "deb http://archive.debian.org/debian/ jessie main" > /etc/apt/sources.list && \
    echo "deb-src http://archive.debian.org/debian/ jessie main" >> /etc/apt/sources.list && \
    echo "Acquire::Check-Valid-Until false;" > /etc/apt/apt.conf.d/10no--check-valid-until

RUN apt-get update
RUN apt-get install -y --force-yes libzip-dev zip
RUN docker-php-ext-configure zip --with-libzip
RUN docker-php-ext-install zip
RUN docker-php-ext-install mbstring

COPY . /var/www/html
EXPOSE 80
