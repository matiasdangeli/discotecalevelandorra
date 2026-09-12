/* ==========================================================================
   LEVEL ANDORRA — Configuración del sitio
   --------------------------------------------------------------------------
   Los datos operativos editables se centralizan aquí y en events.json.
   El panel de administración futuro usará estos mismos campos.
   ========================================================================== */

window.LEVEL_CONFIG = {
  ticketsUrl: "https://site.fourvenues.com/es/level-andorra",
  instagram: "https://www.instagram.com/levelandorra_oficial/",
  tiktok: "",
  facebook: "",

  whatsapp: "34651996088",
  phoneDisplay: "+34 651 99 60 88",
  emailEvents: "PENDIENTE",
  emailBooking: "PENDIENTE",

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

  address: {
    street: "Ctra. de l'Obac, 18",
    building: "Edifici Enland",
    postalCode: "AD500",
    city: "Andorra la Vella",
    country: "Principat d'Andorra",
    countryCode: "AD"
  },
  geo: { lat: 42.5066451, lng: 1.5340016 },
  mapsUrl: "https://www.google.com/maps/place/DISCOTECA+LEVEL+ANDORRA/@42.5066451,1.5340016,17z/data=!4m6!3m5!1s0x12a58b00008c03b7:0x97377cd5b09f1c00!8m2!3d42.5066451!4d1.5340016",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=42.5066451%2C1.5340016",

  /* Los jueves son eventuales. Si no hay evento, quedan ocultos. */
  hours: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: ["00:00", "05:00"],
    6: ["00:00", "05:00"],
    0: ["00:00", "03:00"]
  },

  siteUrl: "https://discotecalevelandorra.com",
  defaultLang: "es",
  languages: ["es", "ca", "en", "fr"],
  timezone: "Europe/Andorra"
};