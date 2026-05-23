FROM php:8.2-apache

LABEL maintainer="AltaySec Akademi"
LABEL description="CTF Lab - Intentionally vulnerable XXE web application"

RUN apt-get update \
    && apt-get install -y --no-install-recommends libxml2-dev \
    && docker-php-ext-install xml \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN sed -i 's/Listen 80/Listen 80/' /etc/apache2/ports.conf \
    && a2enmod rewrite

COPY src/ /var/www/html/

COPY flag.txt /flag.txt

RUN chmod 644 /flag.txt \
    && chown root:root /flag.txt

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
