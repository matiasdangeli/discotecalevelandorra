# Level Andorra — sitio web

Web oficial de **Discoteca Level Andorra** (Andorra la Vella). Sitio estático, sin
frameworks ni build: se abre `index.html` y funciona.

**Idiomas:** español (base), català, english, français.

---

## ⚠️ Antes de publicar: datos que hay que confirmar

Parte del contenido se ha redactado a partir de fuentes públicas y de material de la
web anterior. **Todo esto hay que revisarlo** antes de poner el sitio en producción.

### Pendiente en `assets/js/config.js`

| Campo | Estado |
|---|---|
| `whatsapp` / `phoneDisplay` | ✅ `+34 651 99 60 88` |
| `emailEvents` | ⬜ `PENDIENTE` |
| `emailBooking` | ⬜ `PENDIENTE` |

> Mientras un campo siga en `PENDIENTE`, su botón cae automáticamente a WhatsApp
> (o a Instagram si tampoco hubiera WhatsApp) y no se duplica con el botón que ya
> hubiera al lado. La web nunca muestra un enlace roto.

Cada botón de WhatsApp abre el chat con el mensaje ya escrito según el motivo
—reserva VIP, evento privado o booking/prensa— y en el idioma que esté viendo la
persona. Los textos están en `config.js` → `waMessages`.

### Confirmar (redactado como suposición razonable)

- **Programación semanal.** Jueves «Cachengue» con 2x1 en copas sale de un flyer
  vuestro de marzo de 2026. Los textos de viernes, sábado y domingo son genéricos.
  → `assets/js/i18n.js`, claves `program.*` (en los 4 idiomas).
- **Horarios.** Jue 00–04, Vie 00–05, Sáb 00–05, Dom 00–03, tomados de la web
  anterior. Otras fuentes decían «viernes a domingo». → `config.js` → `hours`
  y el JSON-LD de `index.html`.
- **Dirección.** `Ctra. de l'Obac, 18 · Edifici Enland · AD500 Andorra la Vella`.
  Las coordenadas sí son las del pin real de Google Maps. Confirmar el número.
- **Normas de acceso** (edad, código de vestimenta, guardarropa, pagos) y **FAQ**.
  → claves `info.rules.*` y `faq.*`.
- **Entradas.** Apunta a `site.fourvenues.com/es/level-andorra`. Si usáis otra
  plataforma, cambiar `ticketsUrl`.
- **Datos legales.** `legal.html` tiene marcadores `[COMPLETAR]`: denominación
  social, NRT, email y teléfono. Conviene que lo revise un asesor en Andorra.

---

## Cómo se edita el día a día

### Añadir una fiesta a la agenda

Editar `assets/data/events.json`. Cada evento es un bloque:

```json
{
  "date": "2026-12-31",
  "name": "Nochevieja en Level",
  "room": "Sala Honey",
  "lineup": ["Luca Maier", "Matías D'Angeli"],
  "doors": "00:00",
  "ticketsUrl": "",
  "soldOut": false,
  "tags": ["Especial"]
}
```

- `date` y `name` son obligatorios; el resto es opcional.
- Las fechas **pasadas se ocultan solas**, no hay que borrarlas.
- Los eventos se ordenan solos por fecha.
- `ticketsUrl` vacío → usa la URL general de `config.js`.
- `soldOut: true` → muestra «Agotado» en lugar del botón.
- `"_activo": false` → guarda el evento sin publicarlo.
- Si el archivo queda como `[]`, la agenda muestra un aviso con enlace a Instagram.

Cada evento genera además su ficha `schema.org/Event`, que es lo que permite que
Google muestre las fechas en los resultados de búsqueda.

### Cambiar horarios, contacto o enlaces

Todo está en **`assets/js/config.js`**. Es el único archivo que hay que tocar
para el mantenimiento normal.

### Cambiar textos

`assets/js/i18n.js`. Cada texto existe en `es`, `ca`, `en` y `fr`. Si se cambia
uno, cambiarlo en los cuatro (si falta, el sitio cae al español).

El HTML se sirve en español, así que los textos también están en `index.html`.
Si cambias uno importante (por SEO), cámbialo también allí.

---

## Estructura

```
index.html              Página principal
legal.html              Aviso legal, privacidad y cookies
404.html                Página de error
assets/
  css/style.css         Sistema de diseño completo
  js/config.js          ← datos del club (el archivo a editar)
  js/i18n.js            ← textos en 4 idiomas
  js/main.js            Comportamiento
  data/events.json      ← agenda
  fonts/                Archivo + Inter, auto-alojadas (OFL)
  img/                  Logo, iconos, posters, imagen para compartir
  video/                hero.mp4 + 2 reels
.github/workflows/      Despliegue automático a GitHub Pages
```

---

## Qué lleva por dentro

**Contenido**
- Programación semanal, agenda de fechas especiales, salas (Sala Honey, pista, VIP),
  reservados, galería en vídeo, info práctica con mapa, FAQ y contacto.
- Selector de idioma con detección automática del navegador y memoria de la elección.

**SEO**
- `schema.org/NightClub` con dirección, coordenadas y horarios, más `Event` por fecha.
- Open Graph y Twitter Card con imagen 1200×630 generada a partir del logo.
- `sitemap.xml`, `robots.txt`, canonical y metadatos traducidos.

**Rendimiento**
- Sin frameworks ni dependencias externas: 0 peticiones a terceros al cargar.
- Tipografías auto-alojadas (316 KB) en lugar de Google Fonts.
- El hero muestra un poster de 19 KB al instante; el vídeo (2 MB) se carga después
  y solo si la conexión lo permite — se salta con datos ahorrados, red 2G o
  `prefers-reduced-motion`.
- Los reels solo se cargan cuando entran en pantalla.

**Privacidad**
- El mapa de Google **no se carga** hasta que la persona lo acepta.
- Solo se guardan dos claves en el navegador: idioma y decisión sobre cookies.

**Accesibilidad**
- Navegación por teclado, `Escape` cierra el menú, foco visible, `aria` en menús,
  acordeón y controles de vídeo, y respeto por `prefers-reduced-motion`.

---

## Desarrollo

```bash
python3 -m http.server 8000
```

Y abrir `http://localhost:8000`. No hace falta nada más.

Para forzar un idioma al probar: `?lang=ca`, `?lang=en`, `?lang=fr`.

## Publicación

El workflow `.github/workflows/deploy.yml` publica en GitHub Pages con cada push
a `main`. Hay que activarlo una vez en **Settings → Pages → Source: GitHub Actions**.

Para servirlo en `discotecalevelandorra.com` hay que apuntar el DNS a GitHub Pages
y añadir el dominio en Settings → Pages. El dominio está ahora en Hostinger con
WordPress, así que ese cambio tumba la web anterior: conviene hacerlo cuando el
contenido de arriba esté confirmado.

---

## Créditos de assets

- Logo y vídeos: material propio de Level Andorra, recuperado de la web anterior.
- Tipografías Archivo e Inter: SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
- Iconos: SVG propios, dibujados a mano en el HTML.
