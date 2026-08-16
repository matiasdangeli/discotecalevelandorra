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
  whatsapp: "PENDIENTE",
  phoneDisplay: "PENDIENTE",
  emailEvents: "PENDIENTE",
  emailBooking: "PENDIENTE",

  /* --- Mensajes prerellenados de WhatsApp -------------------------------- */
  waMessages: {
    es: "Hola Level! Quería información para reservar una mesa VIP.",
    ca: "Hola Level! Volia informació per reservar una taula VIP.",
    en: "Hi Level! I'd like information about booking a VIP table.",
    fr: "Bonjour Level ! Je souhaite des informations pour réserver une table VIP."
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
