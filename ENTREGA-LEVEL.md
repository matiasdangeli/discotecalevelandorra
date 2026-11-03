# Level Andorra — guía de entrega

Ver la propuesta: https://matiasdangeli.github.io/discotecalevelandorra/
Código: https://github.com/matiasdangeli/discotecalevelandorra

La web muestra programación semanal fija y no requiere publicar eventos ni flyers.
WhatsApp de reservas: +34 651 99 60 88. Instagram: @levelandorra_oficial.

## Para el dueño
Para revisar la web, basta con abrir el enlace. El ZIP contiene una copia completa del código y los recursos. Puede entregarse a quien gestione la web; no necesita saber programar para ver la propuesta.

## Para quien gestione la web
Es una web estática: HTML, CSS y JavaScript, sin proceso de compilación. Publicar index.html y la carpeta assets, junto con las páginas auxiliares. Mantener las rutas relativas.
GitHub Pages publica main mediante .github/workflows/deploy.yml, después de ejecutar python3 scripts/check.py.
Para probar localmente: python3 -m http.server 8000 y abrir http://localhost:8000.

- Contactos y horarios: assets/js/config.js.
- Programación, residentes y enlaces: index.html.
- Textos en español, catalán, inglés y francés: assets/js/i18n.js; mantener sincronizados los cuatro idiomas y el texto base del HTML.
- Diseño: assets/css/style.css.
- Fondo fijo a pantalla completa: assets/video/hero.mp4 y assets/img/poster-hero.jpg, recuperados de la web anterior de Level. El video se carga tras la página; con ahorro de datos, conexión lenta o movimiento reducido queda la imagen.
- events.json se conserva como archivo histórico pero ya no se descarga ni se muestra en la portada.
- El panel PHP anterior no controla la programación fija y no funciona en GitHub Pages. No es necesario para esta propuesta.

El enlace del dominio oficial no se migra automáticamente: su titular deberá configurar hosting y dominio si decide reemplazar la web actual. La entrega del ZIP no transfiere la propiedad del repositorio ni del dominio.
