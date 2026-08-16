/* ==========================================================================
   LEVEL ANDORRA — Comportamiento del sitio
   Sin dependencias externas. Todo mejora progresiva: si falla el JS,
   la web sigue siendo legible y navegable en español.
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.LEVEL_CONFIG || {};
  var I18N = window.LEVEL_I18N || {};
  var STORE = { lang: "level.lang", consent: "level.consent" };
  var PENDING = /^PENDIENTE$/i;
  var state = { lang: CFG.defaultLang || "es" };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var isSet = function (v) { return typeof v === "string" && v.trim() !== "" && !PENDING.test(v.trim()); };

  /* ---------------------------------------------------------------- Idioma */

  function detectLang() {
    var langs = CFG.languages || ["es"];
    var fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl && langs.indexOf(fromUrl) > -1) return fromUrl;

    try {
      var saved = localStorage.getItem(STORE.lang);
      if (saved && langs.indexOf(saved) > -1) return saved;
    } catch (e) { /* almacenamiento bloqueado */ }

    var nav = (navigator.languages || [navigator.language || "es"]).map(function (l) {
      return String(l).slice(0, 2).toLowerCase();
    });
    for (var i = 0; i < nav.length; i++) {
      if (langs.indexOf(nav[i]) > -1) return nav[i];
    }
    return CFG.defaultLang || "es";
  }

  function t(key) {
    var dict = I18N[state.lang] || I18N.es || {};
    if (dict[key] != null) return dict[key];
    var base = I18N[CFG.defaultLang || "es"] || {};
    return base[key] != null ? base[key] : "";
  }

  function applyLang(lang, opts) {
    if (!I18N[lang]) lang = CFG.defaultLang || "es";
    state.lang = lang;

    var dict = I18N[lang];
    document.documentElement.lang = dict.htmlLang || lang;

    $$("[data-i18n]").forEach(function (el) {
      var val = dict[el.getAttribute("data-i18n")];
      if (val != null) el.textContent = val;
    });

    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        var attr = (parts[0] || "").trim();
        var val = dict[(parts[1] || "").trim()];
        if (attr && val != null) el.setAttribute(attr, val);
      });
    });

    if (dict["meta.title"]) document.title = dict["meta.title"];
    var desc = $('meta[name="description"]');
    if (desc && dict["meta.desc"]) desc.setAttribute("content", dict["meta.desc"]);
    var ogT = $('meta[property="og:title"]');
    if (ogT && dict["meta.title"]) ogT.setAttribute("content", dict["meta.title"]);
    var ogD = $('meta[property="og:description"]');
    if (ogD && dict["meta.desc"]) ogD.setAttribute("content", dict["meta.desc"]);

    // Estado del selector
    var current = $("[data-lang-current]");
    if (current) current.textContent = lang.toUpperCase();
    $$("[data-lang-option]").forEach(function (btn) {
      btn.setAttribute("aria-current", btn.getAttribute("data-lang-option") === lang ? "true" : "false");
    });

    if (!opts || opts.persist !== false) {
      try { localStorage.setItem(STORE.lang, lang); } catch (e) { /* noop */ }
    }

    // Redibujar lo generado por JS
    applyConfigLinks();
    renderHours();
    renderStatus();
    renderEvents();
  }

  function initLangSwitcher() {
    $$("[data-lang-toggle]").forEach(function (toggle) {
      var menu = toggle.parentElement.querySelector("[data-lang-menu]");
      if (!menu) return;

      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });

      document.addEventListener("click", function (e) {
        if (!menu.contains(e.target) && e.target !== toggle) {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    $$("[data-lang-option]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang-option"));
        $$("[data-lang-menu]").forEach(function (m) { m.classList.remove("is-open"); });
        $$("[data-lang-toggle]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      });
    });
  }

  /* ------------------------------------------------- Enlaces desde config */

  function waLink() {
    if (!isSet(CFG.whatsapp)) return null;
    var num = String(CFG.whatsapp).replace(/\D/g, "");
    var msg = (CFG.waMessages && (CFG.waMessages[state.lang] || CFG.waMessages.es)) || "";
    return "https://wa.me/" + num + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }

  /**
   * Rellena los href desde config.js. Si un dato sigue pendiente, el enlace
   * cae a Instagram (canal siempre disponible) en lugar de romperse.
   */
  function applyConfigLinks() {
    var fallback = isSet(CFG.instagram) ? CFG.instagram : null;

    var map = {
      tickets: isSet(CFG.ticketsUrl) ? CFG.ticketsUrl : null,
      instagram: fallback,
      tiktok: isSet(CFG.tiktok) ? CFG.tiktok : null,
      facebook: isSet(CFG.facebook) ? CFG.facebook : null,
      whatsapp: waLink(),
      "email-events": isSet(CFG.emailEvents) ? "mailto:" + CFG.emailEvents : null,
      "email-booking": isSet(CFG.emailBooking) ? "mailto:" + CFG.emailBooking : null,
      maps: isSet(CFG.mapsUrl) ? CFG.mapsUrl : null,
      directions: isSet(CFG.directionsUrl) ? CFG.directionsUrl : null
    };

    $$("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      var href = map[key];

      if (href) {
        el.href = href;
        el.removeAttribute("aria-disabled");
        el.classList.remove("is-hidden");
        // Restaurar etiqueta original si antes cayó al fallback
        var original = el.getAttribute("data-i18n-original");
        if (original) {
          el.setAttribute("data-i18n", original);
          el.removeAttribute("data-i18n-original");
          var v = t(original);
          if (v) el.textContent = v;
        }
        return;
      }

      // Sin dato: probamos con el canal alternativo declarado en el HTML
      var alt = el.getAttribute("data-link-fallback");
      if (alt === "instagram" && fallback) {
        el.href = fallback;
        el.target = "_blank";
        el.rel = "noopener";
        var altKey = el.getAttribute("data-i18n-fallback");
        if (altKey) {
          if (!el.getAttribute("data-i18n-original")) {
            el.setAttribute("data-i18n-original", el.getAttribute("data-i18n") || "");
          }
          el.setAttribute("data-i18n", altKey);
          var txt = t(altKey);
          if (txt) el.textContent = txt;
        }
      } else {
        el.classList.add("is-hidden");
      }
    });

    dedupeCtas();

    // Texto plano con datos de contacto
    $$("[data-cfg]").forEach(function (el) {
      var val = CFG[el.getAttribute("data-cfg")];
      if (isSet(val)) {
        el.textContent = val;
        el.classList.remove("is-hidden");
      } else {
        el.classList.add("is-hidden");
      }
    });
  }

  /**
   * Cuando un canal aún no está configurado, su botón cae a Instagram. Si en
   * el mismo grupo ya había un botón de Instagram, quedarían dos CTA idénticos:
   * aquí se oculta el duplicado para que nunca se vea repetido.
   */
  function dedupeCtas() {
    // Se recalcula desde cero para que un cambio de idioma no deje nada oculto.
    $$("[data-deduped]").forEach(function (el) {
      el.classList.remove("is-hidden");
      el.removeAttribute("data-deduped");
    });

    $$(".btn-group, .contact-card, .mobile-nav__foot").forEach(function (group) {
      var seen = {};
      $$("a[data-link]", group).forEach(function (el) {
        if (el.classList.contains("is-hidden")) return;
        var href = el.getAttribute("href");
        if (!href || href === "#") return;
        if (seen[href]) {
          el.classList.add("is-hidden");
          el.setAttribute("data-deduped", "");
        } else {
          seen[href] = true;
          if (el.hasAttribute("data-deduped")) el.removeAttribute("data-deduped");
        }
      });
    });
  }

  /* ------------------------------------------------- Horarios y estado */

  var DAY_KEYS = { 0: "info.sun", 1: "info.mon", 2: "info.tue", 3: "info.wed", 4: "info.thu", 5: "info.fri", 6: "info.sat" };
  var WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

  /** Hora actual en Andorra, independientemente de dónde esté el visitante. */
  function nowInAndorra() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Andorra",
        weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date());
      var out = {};
      parts.forEach(function (p) { out[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return {
        day: days[out.weekday],
        minutes: parseInt(out.hour, 10) * 60 + parseInt(out.minute, 10)
      };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function toMinutes(hhmm) {
    var p = String(hhmm).split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1] || "0", 10);
  }

  function renderHours() {
    var body = $("[data-hours-body]");
    if (!body || !CFG.hours) return;

    var today = nowInAndorra().day;
    body.innerHTML = "";

    WEEK_ORDER.forEach(function (d) {
      var range = CFG.hours[d];
      var tr = document.createElement("tr");
      if (d === today) tr.className = "is-today";
      else if (!range) tr.className = "is-closed";

      var th = document.createElement("th");
      th.scope = "row";
      th.textContent = t(DAY_KEYS[d]);

      var td = document.createElement("td");
      td.textContent = range ? range[0] + " — " + range[1] : t("info.closed");

      tr.appendChild(th);
      tr.appendChild(td);
      body.appendChild(tr);
    });
  }

  /** Badge "abierto ahora / próxima apertura" del hero. */
  function renderStatus() {
    var el = $("[data-status]");
    if (!el || !CFG.hours) return;

    var now = nowInAndorra();
    var open = null;

    // Sesión que empieza hoy
    var todayRange = CFG.hours[now.day];
    if (todayRange) {
      var start = toMinutes(todayRange[0]);
      var end = toMinutes(todayRange[1]);
      // Rango que cruza medianoche (p. ej. 23:00 → 05:00)
      if (end <= start) {
        if (now.minutes >= start || now.minutes < end) open = todayRange;
      } else if (now.minutes >= start && now.minutes < end) {
        open = todayRange;
      }
    }

    if (open) {
      el.innerHTML = '<span class="dot" aria-hidden="true"></span>' +
        '<span>' + t("status.openNow") + " · " + t("status.until") + " " + open[1] + "</span>";
      el.hidden = false;
      return;
    }

    // Buscar la próxima noche con apertura
    for (var i = 0; i < 8; i++) {
      var d = (now.day + i) % 7;
      var r = CFG.hours[d];
      if (!r) continue;
      if (i === 0 && now.minutes >= toMinutes(r[0])) continue;
      el.innerHTML = '<span class="dot" aria-hidden="true"></span>' +
        "<span>" + t("status.next") + " " + t(DAY_KEYS[d]) + " " + r[0] + "</span>";
      el.hidden = false;
      return;
    }
    el.hidden = true;
  }

  /* ------------------------------------------------------------- Agenda */

  var MONTHS = {
    es: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"],
    ca: ["GEN", "FEB", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DES"],
    en: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    fr: ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEP", "OCT", "NOV", "DÉC"]
  };

  var eventsCache = null;

  function icon(name) {
    var paths = {
      pin: '<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 1.9"/>',
      disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.4"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || "") + "</svg>";
  }

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function usableEvents(list) {
    if (!Array.isArray(list)) return [];
    var todayISO = new Date().toISOString().slice(0, 10);
    return list
      .filter(function (ev) {
        if (!ev || ev._activo === false) return false;
        if (!ev.date || !ev.name) return false;
        return ev.date >= todayISO;
      })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }

  function renderEvents() {
    var wrap = $("[data-agenda]");
    if (!wrap || eventsCache === null) return;

    var list = usableEvents(eventsCache);
    var empty = $("[data-agenda-empty]");

    if (!list.length) {
      wrap.innerHTML = "";
      wrap.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    wrap.hidden = false;

    var months = MONTHS[state.lang] || MONTHS.es;

    wrap.innerHTML = list.map(function (ev) {
      var parts = ev.date.split("-");
      var day = parts[2];
      var month = months[parseInt(parts[1], 10) - 1] || "";

      var meta = [];
      if (ev.room) {
        meta.push("<span>" + icon("pin") + esc(ev.room) + "</span>");
      }
      if (ev.doors) {
        meta.push("<span>" + icon("clock") + t("agenda.doors") + " " + esc(ev.doors) + "</span>");
      }
      if (Array.isArray(ev.tags)) {
        ev.tags.forEach(function (tag) {
          meta.push("<span>" + icon("disc") + esc(tag) + "</span>");
        });
      }

      var lineup = Array.isArray(ev.lineup) && ev.lineup.length
        ? '<p class="event__lineup"><strong>' + ev.lineup.map(esc).join("</strong> · <strong>") + "</strong></p>"
        : "";

      var href = isSet(ev.ticketsUrl) ? ev.ticketsUrl : (isSet(CFG.ticketsUrl) ? CFG.ticketsUrl : "");
      var cta = ev.soldOut
        ? '<span class="tag tag--hot">' + t("agenda.soldout") + "</span>"
        : (href
          ? '<a class="btn btn--primary btn--sm" href="' + esc(href) + '" target="_blank" rel="noopener">' +
            t("agenda.tickets") + "</a>"
          : "");

      return '<article class="event reveal">' +
        '<div class="event__date"><span class="event__day">' + esc(day) + "</span>" +
        '<span class="event__month">' + esc(month) + "</span></div>" +
        '<div class="event__body"><h3 class="event__name">' + esc(ev.name) + "</h3>" +
        (meta.length ? '<div class="event__meta">' + meta.join("") + "</div>" : "") +
        lineup + "</div>" +
        (cta ? '<div class="event__cta">' + cta + "</div>" : "") +
        "</article>";
    }).join("");

    observeReveals();
    injectEventSchema(list);
  }

  function injectEventSchema(list) {
    var old = $("#schema-events");
    if (old) old.remove();
    if (!list.length) return;

    var addr = CFG.address || {};
    var data = list.slice(0, 12).map(function (ev) {
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: ev.name,
        startDate: ev.date + "T" + (ev.doors || "00:00") + ":00+01:00",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "NightClub",
          name: "Level Andorra",
          address: {
            "@type": "PostalAddress",
            streetAddress: addr.street,
            addressLocality: addr.city,
            postalCode: addr.postalCode,
            addressCountry: addr.countryCode
          }
        },
        performer: (ev.lineup || []).map(function (n) { return { "@type": "PerformingGroup", name: n }; }),
        offers: isSet(ev.ticketsUrl) || isSet(CFG.ticketsUrl)
          ? {
            "@type": "Offer",
            url: isSet(ev.ticketsUrl) ? ev.ticketsUrl : CFG.ticketsUrl,
            availability: ev.soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
          }
          : undefined
      };
    });

    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = "schema-events";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  function loadEvents() {
    if (!$("[data-agenda]")) return;
    fetch("assets/data/events.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { eventsCache = data; renderEvents(); })
      .catch(function () { eventsCache = []; renderEvents(); });
  }

  /* -------------------------------------------------------------- Header */

  function initHeader() {
    var header = $("[data-header]");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    var burger = $("[data-burger]");
    var nav = $("[data-mobile-nav]");
    if (!burger || !nav) return;

    var links = $$(".mobile-nav__link", nav);

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? t("nav.close") : t("nav.menu"));
      document.body.classList.toggle("is-locked", open);
      links.forEach(function (link, i) {
        link.style.transitionDelay = open ? (0.06 + i * 0.045).toFixed(2) + "s" : "0s";
      });
      if (open) { nav.removeAttribute("inert"); } else { nav.setAttribute("inert", ""); }
    }

    setOpen(false);
    burger.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------------ Scrollspy nav */

  function initScrollSpy() {
    var links = $$("[data-spy]");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = links
      .map(function (l) { return document.getElementById(l.getAttribute("data-spy")); })
      .filter(Boolean);
    if (!sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle("is-active", l.getAttribute("data-spy") === entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------------------------------- Reveal */

  var revealObserver = null;

  function observeReveals() {
    var items = $$(".reveal:not(.is-visible)");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    }
    items.forEach(function (el) { revealObserver.observe(el); });
  }

  /* -------------------------------------------------------------- Vídeo */

  function initHeroVideo() {
    var video = $("[data-hero-video]");
    if (!video) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var conn = navigator.connection || {};
    var saveData = conn.saveData === true;
    var slow = /2g/.test(conn.effectiveType || "");

    if (reduce || saveData || slow) return;

    var src = video.getAttribute("data-src");
    if (!src) return;

    var media = $("[data-hero-media]");

    var start = function () {
      video.src = src;
      video.addEventListener("canplay", function () {
        video.classList.add("is-ready");
        if (media) media.classList.add("has-video");
      }, { once: true });
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay bloqueado: se queda el poster */ });
    };

    if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 2200 });
    else setTimeout(start, 600);
  }

  function initReels() {
    var reels = $$("[data-reel]");
    if (!reels.length) return;

    reels.forEach(function (reel) {
      var video = $("video", reel);
      var btn = $("[data-reel-sound]", reel);
      if (!video) return;

      var src = video.getAttribute("data-src");

      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (src && !video.src) video.src = src;
              var p = video.play();
              if (p && p.catch) p.catch(function () {});
            } else {
              video.pause();
            }
          });
        }, { threshold: 0.35 });
        io.observe(reel);
      } else if (src) {
        video.src = src;
      }

      if (btn) {
        btn.addEventListener("click", function () {
          // Solo un reel con sonido a la vez
          if (video.muted) {
            reels.forEach(function (other) {
              var v = $("video", other);
              if (v && v !== video) { v.muted = true; updateSoundIcon(other, true); }
            });
          }
          video.muted = !video.muted;
          if (!video.muted) video.play().catch(function () {});
          updateSoundIcon(reel, video.muted);
        });
      }
    });
  }

  function updateSoundIcon(reel, muted) {
    var btn = $("[data-reel-sound]", reel);
    if (!btn) return;
    btn.setAttribute("aria-pressed", muted ? "false" : "true");
    btn.innerHTML = muted
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m17 9 4 6M21 9l-4 6"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  }

  /* ---------------------------------------------------------------- FAQ */

  function initFaq() {
    $$("[data-faq-q]").forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.classList.toggle("is-open", !open);
      });
    });
  }

  /* --------------------------------------------- Cookies y mapa (RGPD) */

  function getConsent() {
    try { return localStorage.getItem(STORE.consent); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORE.consent, value); } catch (e) { /* noop */ }
  }

  function loadMap() {
    var frame = $("[data-map]");
    if (!frame) return;
    var consentBox = $("[data-map-consent]", frame);
    if ($("iframe", frame)) return;

    var geo = CFG.geo || { lat: 42.5066451, lng: 1.5340016 };
    var iframe = document.createElement("iframe");
    iframe.src = "https://maps.google.com/maps?q=" + geo.lat + "," + geo.lng + "&z=17&output=embed";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.title = "Level Andorra — " + (CFG.address ? CFG.address.street : "");
    frame.appendChild(iframe);
    if (consentBox) consentBox.remove();
  }

  function initConsent() {
    var banner = $("[data-cookie]");
    var consent = getConsent();

    if (consent === "all") loadMap();

    $$("[data-map-load]").forEach(function (btn) {
      btn.addEventListener("click", function () { loadMap(); });
    });

    if (!banner) return;

    if (!consent) {
      setTimeout(function () { banner.classList.add("is-visible"); }, 1400);
    }

    $$("[data-cookie-accept]", banner).forEach(function (btn) {
      btn.addEventListener("click", function () {
        setConsent("all");
        banner.classList.remove("is-visible");
        loadMap();
      });
    });

    $$("[data-cookie-reject]", banner).forEach(function (btn) {
      btn.addEventListener("click", function () {
        setConsent("necessary");
        banner.classList.remove("is-visible");
      });
    });
  }

  /* -------------------------------------------------------------- Ticker */

  function initTicker() {
    $$("[data-ticker]").forEach(function (track) {
      var group = $(".ticker__group", track);
      if (group && track.children.length === 1) {
        var clone = group.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
    });
  }

  /* ---------------------------------------------------------------- Misc */

  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ----------------------------------------------------------------- Init */

  function init() {
    initHeader();
    initMobileNav();
    initLangSwitcher();
    initTicker();
    initFaq();
    initScrollSpy();
    initYear();
    initHeroVideo();
    initReels();
    initConsent();

    applyLang(detectLang(), { persist: false });
    observeReveals();
    loadEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
