# --- Stage 1: Composer binary ---
FROM docker.io/library/composer:2 AS composerbin

# --- Stage 2: PHP runtime (OpenShift UBI) ---
FROM registry.access.redhat.com/ubi9/php-82

WORKDIR /opt/app-root/src

# Copy composer binary dari stage 1
COPY --from=composerbin /usr/bin/composer /usr/bin/composer

# Copy seluruh source Laravel
COPY . .

# Install dependencies (tanpa dev packages & tanpa script artisan)
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --no-scripts

# ✅ Fix permission agar bisa ditulis oleh user non-root (OpenShift 1001)
RUN /usr/libexec/s2i/fix-permissions /opt/app-root/src

# Port untuk Laravel
EXPOSE 8000
ENV PORT=8000

# Jalankan Laravel dengan perintah startup yang lengkap
CMD ["bash", "-lc", "php artisan config:cache || true && \
php artisan route:cache || true && \
php artisan migrate --force || true && \
php artisan serve --host=0.0.0.0 --port=${PORT}"]
