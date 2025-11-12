# --- Stage 1: add Composer binary ---
FROM docker.io/library/composer:2 AS composerbin

# --- Stage 2: runtime PHP (OpenShift UBI) ---
FROM registry.access.redhat.com/ubi9/php-82

WORKDIR /opt/app-root/src

# Copy composer ke image runtime
COPY --from=composerbin /usr/bin/composer /usr/bin/composer

# Copy source Laravel
COPY . .

# Install dependencies tanpa dev & skip artisan hooks
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --no-scripts

# Set permission agar bisa ditulis oleh user 1001 (tanpa chown)
RUN chmod -R g+w storage bootstrap/cache || true

EXPOSE 8000
ENV PORT=8000

# Jalankan Laravel di runtime container
CMD ["bash","-lc","php artisan config:cache || true; php artisan route:cache || true; php artisan migrate --force || true; php artisan serve --host=0.0.0.0 --port=${PORT}"]
