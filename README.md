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
- ~~**Horarios.**~~ ✅ Confirmados: Jue 00–04, Vie 00–05, Sáb 00–05, Dom 00–03.
  Si cambian, se editan en `config.js` → `hours` y en el JSON-LD de `index.html`.
- **Dirección.** `Ctra. de l'Obac, 18 · Edifici Enland · AD500 Andorra la Vella`.
  Las coordenadas sí son las del pin real de Google Maps. Confirmar el número.
- **Normas de acceso** (edad, código de vestimenta, guardarropa, pagos) y **FAQ**.
  → claves `info.rules.*` y `faq.*`.
- **Entradas.** Apunta a `site.fourvenues.com/es/level-andorra`. Si usáis otra
  plataforma, cambiar `ticketsUrl`.
- **Datos legales.** `legal.html` ya lleva la titularidad (ByAxel Group), el
  domicilio y el teléfono. Falta únicamente el **NRT**, que es obligatorio en el
  aviso legal: está en la escritura de constitución o en cualquier factura de la
  sociedad. Conviene además que un asesor en Andorra revise el texto completo.

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
a `main`.

La web está publicada en
**https://matiasdangeli.github.io/discotecalevelandorra/**

Dos cosas que hubo que resolver y conviene no olvidar:

1. **Pages se activa a mano una vez**, en
   [Settings → Pages](https://github.com/matiasdangeli/discotecalevelandorra/settings/pages)
   → *Source: GitHub Actions*. El token de Actions puede publicar en un sitio de
   Pages existente, pero no tiene permiso para crearlo la primera vez: falla con
   `Resource not accessible by integration`. Ya está hecho.

2. **El entorno `github-pages` solo admite despliegues desde una lista de ramas.**
   Al activar Pages, GitHub crea ese entorno y le fija **la rama que fuera la
   principal en ese momento**, con el nombre escrito literalmente. Cambiar después
   la rama principal del repositorio **no** actualiza esa lista.

   Los despliegues desde una rama que no esté en la lista se rechazan antes de
   ejecutar ningún paso: el job aparece en rojo a los 2 segundos, sin registros y
   sin ningún mensaje de error. Es un fallo muy difícil de diagnosticar, porque
   parece un problema del workflow y no lo es.

   > Ya resuelto: la lista se actualizó en
   > [Settings → Environments → github-pages](https://github.com/matiasdangeli/discotecalevelandorra/settings/environments),
   > apartado *Deployment branches and tags*, para admitir `main`. Si algún día
   > vuelven a rechazarse despliegues sin explicación, ahí es donde hay que mirar.

Con las tres cosas hechas —Pages activado, `main` como rama principal y el entorno
admitiéndola— **cada push a `main` publica solo**. También puede lanzarse a mano
desde la pestaña *Actions* → *Run workflow*.

**Cómo comprobar cuál es el problema:** si un despliegue falla en segundos y sin
registros, es la lista de ramas del entorno. Si falla dentro de un paso concreto y
con registros, es el sitio o el workflow.

## Pasar el sitio a discotecalevelandorra.com

El dominio está hoy en Hostinger sirviendo un WordPress. Al apuntarlo a GitHub
Pages, **esa web anterior deja de verse**: es un reemplazo, no conviven. Conviene
hacerlo con el contenido ya confirmado y a una hora de poco tráfico, porque entre
un sitio y otro hay un rato en que el dominio no resuelve.

El orden importa. Si se configura el dominio en GitHub antes de tocar el DNS, el
sitio deja de ser accesible también por la dirección de `github.io`, porque esta
pasa a redirigir al dominio propio.

**1. DNS en Hostinger.** En la zona DNS del dominio, borrar los registros `A` que
apunten al hosting actual y crear estos cuatro, todos para el host `@`:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Y un registro `CNAME` para el host `www` apuntando a `matiasdangeli.github.io`.

> Los registros `MX` no se tocan: si el dominio tiene correo, sigue funcionando.

**2. Esperar a que propague.** Suele tardar entre unos minutos y un par de horas.
Se comprueba con `dig discotecalevelandorra.com +short`, que tiene que devolver
las cuatro direcciones de arriba.

**3. Dominio en GitHub.** En
[Settings → Pages](https://github.com/matiasdangeli/discotecalevelandorra/settings/pages),
apartado *Custom domain*, escribir `discotecalevelandorra.com` y guardar. GitHub
verifica el DNS y crea un archivo `CNAME` en el repositorio.

> Si el archivo `CNAME` desaparece en algún despliegue, hay que añadirlo a mano
> en la raíz del repositorio con el dominio dentro: se publica el repositorio
> entero, así que basta con que el archivo exista.

**4. HTTPS.** Cuando GitHub termine de emitir el certificado —puede tardar hasta
una hora— marcar **Enforce HTTPS** en esa misma página.

**5. Después.** El plan de hosting de Hostinger se puede dar de baja: GitHub Pages
no cuesta nada. **El dominio hay que seguir renovándolo**, eso es aparte del
hosting.

Los metadatos del sitio (canonical, Open Graph, sitemap) ya apuntan a
`discotecalevelandorra.com`, así que no hay que cambiar nada del código.

---

## Créditos de assets

- Logo y vídeos: material propio de Level Andorra, recuperado de la web anterior.
- Tipografías Archivo e Inter: SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
- Iconos: SVG propios, dibujados a mano en el HTML.


## Panel visual para Hostinger

El directorio `panel/` incluye un administrador en PHP pensado para la community manager.
GitHub Pages muestra la web pública, pero no ejecuta PHP: el panel funciona cuando la carpeta
completa se sube al hosting de Hostinger.

### Primera instalación

1. Subir todos los archivos del repositorio a `public_html`.
2. Comprobar que PHP 8.1 o superior esté activo.
3. Dar permiso de escritura a `assets/data` y `assets/img/events` desde el administrador de archivos de Hostinger.
4. Abrir `https://discotecalevelandorra.com/panel/`.
5. Crear la contraseña en el primer acceso. El hash se guarda fuera del repositorio en `panel/.admin-password`.

Desde el panel se pueden crear, editar, ocultar y eliminar eventos; subir flyers; definir sala,
fecha, horario, artistas, estilo, edad, condiciones de entrada, enlace de tickets y WhatsApp.
Los eventos se agrupan automáticamente por fin de semana usando `Europe/Andorra`. Cuando termina
la última noche del grupo, ese fin de semana pasa a «Ediciones pasadas» y la web muestra el próximo.
