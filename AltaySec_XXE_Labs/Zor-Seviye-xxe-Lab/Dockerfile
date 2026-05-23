FROM php:7.4-fpm-alpine

# Install required packages
RUN apk add --no-cache \
    nginx \
    supervisor \
    libxml2-dev \
    && docker-php-ext-install dom

# Ensure libxml entity loading is possible at OS level
RUN sed -i 's/#user/user/' /etc/nginx/nginx.conf 2>/dev/null || true

# PHP configuration - disable safe mode, enable dangerous features for lab
RUN echo "expose_php = Off" >> /usr/local/etc/php/php.ini && \
    echo "display_errors = Off" >> /usr/local/etc/php/php.ini && \
    echo "log_errors = Off" >> /usr/local/etc/php/php.ini && \
    echo "allow_url_fopen = On" >> /usr/local/etc/php/php.ini && \
    echo "allow_url_include = On" >> /usr/local/etc/php/php.ini

# Place the flag at filesystem root
COPY flag.txt /flag.txt
RUN chmod 644 /flag.txt

# Copy web source
COPY src/ /var/www/html/
RUN chmod -R 755 /var/www/html/

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/http.d/default.conf

# Supervisor config to run nginx + php-fpm simultaneously
COPY supervisor/supervisord.conf /etc/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
