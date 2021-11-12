const mix = require('laravel-mix');

mix.options({
    proccessCssUrls: false,
});
mix.js('./dev/index.js','./')
.postCss('./dev/style.css', './', [
    require('autoprefixer'),
    require('cssnano')({
        preset: 'default',
    }),
    ]);
      //require('tailwindcss'),
mix.disableSuccessNotifications();