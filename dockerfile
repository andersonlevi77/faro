FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    zip \
    nodejs \
    npm \
    nginx \
    supervisor

RUN docker-php-ext-install pdo pdo_mysql zip opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN npm install
RUN npm run build

RUN chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Nginx config
RUN printf 'server {\n\
    listen 10000;\n\
    root /app/public;\n\
    index index.php;\n\
    client_max_body_size 100M;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.php?$query_string;\n\
    }\n\
\n\
    location ~ \\.php$ {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        fastcgi_index index.php;\n\
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;\n\
        include fastcgi_params;\n\
    }\n\
\n\
    location ~ /\\.(?!well-known).* {\n\
        deny all;\n\
    }\n\
}\n' > /etc/nginx/sites-available/default

# Supervisor config to run nginx + php-fpm together
RUN printf '[supervisord]\n\
nodaemon=true\n\
user=root\n\
\n\
[program:php-fpm]\n\
command=/usr/local/sbin/php-fpm\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n' > /etc/supervisor/conf.d/supervisord.conf

EXPOSE 10000

CMD php artisan optimize:clear \
    && php artisan config:clear \
    && php artisan route:clear \
    && php artisan view:clear \
    && php artisan migrate --force \
    && php artisan db:seed --class=RenderSeeder --force \
    && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
