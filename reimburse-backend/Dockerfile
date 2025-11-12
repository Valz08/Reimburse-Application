# Gunakan base image PHP Laravel
FROM registry.access.redhat.com/ubi9/php-82

# Set working directory
WORKDIR /opt/app-root/src

# Copy source Laravel
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Build cache dan route Laravel
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
