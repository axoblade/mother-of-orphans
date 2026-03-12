FROM php:8.2-apache

# Keep Apache document root on /var/www/html (default).
WORKDIR /var/www/html

# Copy site files into the container.
COPY . /var/www/html/

# Set sane read permissions for web assets.
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && find /var/www/html -type f -exec chmod 644 {} \;

EXPOSE 80
