# --- Stage 1: Composer binary ---
FROM docker.io/library/composer:2 AS composerbin

# --- Stage 2: PHP runtime (UBI 9) ---
FROM registry.access.redhat.com/ubi9/php-82

WORKDIR /opt/app-root/src

# Copy composer binary dari stage 1
COPY --from=composerbin /usr/bin/composer /usr/bin/composer

# Copy seluruh source Laravel
COPY . .

# ✅ Pakai root sementara buat atur izin
USER root
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --no-scripts && \
    mkdir -p storage bootstrap/cache && \
    chmod -R 777 storage bootstrap/cache

# 🔁 Balik lagi ke user non-root untuk runtime (aman buat OpenShift)
USER 1001

EXPOSE 8000
ENV PORT=8000

# Jalankan Laravel di runtime container
CMD ["bash", "-lc", "php artisan config:cache || true && \
php artisan route:cache || true && \
php artisan migrate --force || true && \
php artisan serve --host=0.0.0.0 --port=${PORT}"]
