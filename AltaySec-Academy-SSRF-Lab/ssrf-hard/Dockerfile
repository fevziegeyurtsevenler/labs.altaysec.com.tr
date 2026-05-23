FROM php:8.2-apache

WORKDIR /var/www/html

COPY . /var/www/html

# Enable mod_rewrite for .htaccess support
RUN a2enmod rewrite && \
    sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf && \
    chown -R www-data:www-data /var/www/html

EXPOSE 80
