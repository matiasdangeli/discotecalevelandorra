/* ==========================================================================
   LEVEL ANDORRA — Configuración del sitio
   --------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA CAMBIAR DATOS DE CONTACTO.
   Los valores marcados como PENDIENTE se detectan automáticamente: mientras
   sigan así, el sitio oculta ese botón o lo sustituye por Instagram, para no
   publicar nunca un enlace roto.
   ========================================================================== */

window.LEVEL_CONFIG = {
  /* --- Venta de entradas -------------------------------------------------
     Level usa Fourvenues. Si cambia la plataforma, cambia solo esta URL.   */
  ticketsUrl: "https://site.fourvenues.com/es/level-andorra",

  /* --- Redes ------------------------------------------------------------ */
  instagram: "https://www.instagram.com/levelandorra_oficial/",
  tiktok: "",       // opcional: pegar URL completa
  facebook: "",     // opcional: pegar URL completa

  /* --- Contacto ----------------------------------------------------------
     whatsapp: solo dígitos, con prefijo de país y SIN "+" ni espacios.
                Andorra = 376. Ejemplo válido: "376333444"                  */
  whatsapp: "34651996088",
  phoneDisplay: "+34 651 99 60 88",
  emailEvents: "PENDIENTE",
  emailBooking: "PENDIENTE",

  /* --- Mensajes prerellenados de WhatsApp --------------------------------
     Cada botón abre el chat con el texto ya escrito según el motivo, así se
     sabe de entrada qué quiere la persona. "vip" es el que se usa por defecto. */
  waMessages: {
    vip: {
      es: "Hola Level! Quería información para reservar una mesa VIP.",
      ca: "Hola Level! Volia informació per reservar una taula VIP.",
      en: "Hi Level! I'd like information about booking a VIP table.",
      fr: "Bonjour Level ! Je souhaite des informations pour réserver une table VIP."
    },
    events: {
      es: "Hola Level! Quería organizar un evento privado y me gustaría información.",
      ca: "Hola Level! Volia organitzar un esdeveniment privat i m'agradaria informació.",
      en: "Hi Level! I'd like to organise a private event and would like some information.",
      fr: "Bonjour Level ! Je souhaite organiser un événement privé et j'aimerais des informations."
    },
    booking: {
      es: "Hola Level! Os escribo por booking / prensa.",
      ca: "Hola Level! Us escric per booking / premsa.",
      en: "Hi Level! I'm getting in touch about booking / press.",
      fr: "Bonjour Level ! Je vous contacte pour booking / presse."
    }
  },

  /* --- Ubicación --------------------------------------------------------- */
  address: {
    street: "Ctra. de l'Obac, 18",
    building: "Edifici Enland",
    postalCode: "AD500",
    city: "Andorra la Vella",
    country: "Principat d'Andorra",
    countryCode: "AD"
  },
  geo: { lat: 42.5066451, lng: 1.5340016 },
  mapsUrl:
    "https://www.google.com/maps/place/DISCOTECA+LEVEL+ANDORRA/@42.5066451,1.5340016,17z/data=!4m6!3m5!1s0x12a58b00008c03b7:0x97377cd5b09f1c00!8m2!3d42.5066451!4d1.5340016",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=42.5066451%2C1.5340016",

  /* --- Horario de puertas ------------------------------------------------
     null = cerrado. Formato 24h. El día en curso se resalta solo.          */
  hours: {
    1: null,                     // lunes
    2: null,                     // martes
    3: null,                     // miércoles
    4: ["00:00", "04:00"],       // jueves
    5: ["00:00", "05:00"],       // viernes
    6: ["00:00", "05:00"],       // sábado
    0: ["00:00", "03:00"]        // domingo
  },

  /* --- Sitio ------------------------------------------------------------- */
  siteUrl: "https://discotecalevelandorra.com",
  defaultLang: "es",
  languages: ["es", "ca", "en", "fr"]
};
