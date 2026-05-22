FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    zip \
    nginx \
    supervisor \
    nodejs \
    npm \
    libpng-dev \
    libonig-dev \
    libxml2-dev

RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    mbstring \
    exif \
    pcntl \
    bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-scripts

COPY package*.json ./
RUN npm install
COPY . .

RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php && \
    cp .env.example .env && \
    php artisan package:discover --ansi && \
    php artisan key:generate --force

RUN npm run build

RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

RUN printf 'server {\n\
    listen 10000;\n\
    root /app/public;\n\
    index index.php;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.php?$query_string;\n\
    }\n\
\n\
    location ~ \\.php$ {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        include fastcgi_params;\n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

RUN printf '[supervisord]\n\
nodaemon=true\n\
\n\
[program:php-fpm]\n\
command=php-fpm\n\
autostart=true\n\
autorestart=true\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n' > /etc/supervisor/conf.d/supervisord.conf

EXPOSE 10000

CMD php artisan optimize:clear && \
    php artisan migrate --force && \
    php artisan db:seed --class=RenderSeeder --force && \
    /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf