FROM php:8.2-apache

LABEL maintainer="AltaySec Akademi"
LABEL purpose="CTF Lab - Blind/Error-Based XXE (Orta Seviye)"

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        libxml2-dev \
        curl \
        ca-certificates \
 && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install dom

RUN a2enmod rewrite headers

WORKDIR /var/www/html

COPY index.html      /var/www/html/index.html
COPY process.php     /var/www/html/process.php
COPY logs.php        /var/www/html/logs.php
COPY info.php        /var/www/html/info.php
COPY _log.php        /var/www/html/_log.php

COPY flag.txt        /flag.txt

RUN { \
        echo "display_errors = On"; \
        echo "display_startup_errors = On"; \
        echo "error_reporting = E_ALL"; \
        echo "log_errors = On"; \
        echo "html_errors = Off"; \
        echo "expose_php = Off"; \
        echo "upload_max_filesize = 4M"; \
        echo "post_max_size = 8M"; \
        echo "max_execution_time = 30"; \
    } > /usr/local/etc/php/conf.d/altaysec.ini

RUN chown root:www-data /flag.txt \
 && chmod 0640         /flag.txt \
 && chown -R www-data:www-data /var/www/html

RUN echo "altaysec-data-sync" > /etc/hostname

EXPOSE 80

CMD ["apache2-foreground"]
