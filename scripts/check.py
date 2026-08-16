#!/usr/bin/env python3
"""
Comprobaciones del sitio de Level Andorra.

Se ejecuta en cada push (ver .github/workflows/deploy.yml) y también a mano:

    python3 scripts/check.py

Verifica que la agenda sea JSON valido, que los cuatro idiomas tengan las mismas
claves y que todos los textos usados en el HTML existan en el diccionario. El
objetivo es que nunca se publique una web con un texto sin traducir.
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []
notes = []


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


# --- 1. events.json ---------------------------------------------------------
try:
    events = json.loads(read("assets/data/events.json"))
    if not isinstance(events, list):
        errors.append("events.json debe ser una lista []")
    else:
        for i, ev in enumerate(events):
            if ev.get("_activo") is False:
                continue
            if not ev.get("date") or not ev.get("name"):
                errors.append(f"events.json[{i}]: faltan 'date' o 'name'")
            elif not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(ev["date"])):
                errors.append(f"events.json[{i}]: 'date' debe ser AAAA-MM-DD")
        notes.append(f"events.json: {len(events)} entrada(s), formato correcto")
except json.JSONDecodeError as exc:
    errors.append(f"events.json no es JSON valido: {exc}")


# --- 2. Paridad entre idiomas ----------------------------------------------
i18n = read("assets/js/i18n.js")
langs = re.findall(r"^  ([a-z]{2}): \{", i18n, re.M)
keys = {}
for lang in langs:
    block = re.search(r"^  " + lang + r": \{(.*?)^  \},?$", i18n, re.M | re.S)
    keys[lang] = set(re.findall(r'"([a-zA-Z0-9._]+)":', block.group(1)))

if "es" not in keys:
    errors.append("i18n.js: falta el idioma base 'es'")
else:
    base = keys["es"]
    for lang in langs:
        missing = sorted(base - keys[lang])
        if missing:
            errors.append(f"i18n.js [{lang}]: faltan {len(missing)} claves -> {missing[:6]}")
    notes.append(f"i18n.js: {len(langs)} idiomas ({', '.join(langs)}) x {len(base)} claves")


# --- 3. Claves usadas en el HTML -------------------------------------------
html = "".join(read(f) for f in ("index.html", "legal.html", "404.html"))
used = set(re.findall(r'data-i18n="([^"]+)"', html))
used |= set(re.findall(r'data-i18n-fallback="([^"]+)"', html))
for pair in re.findall(r'data-i18n-attr="([^"]+)"', html):
    for item in pair.split(","):
        parts = item.split(":")
        if len(parts) == 2:
            used.add(parts[1].strip())

unknown = sorted(k for k in used if k and k not in keys.get("es", set()))
if unknown:
    errors.append(f"HTML usa claves que no existen en i18n.js: {unknown}")
else:
    notes.append(f"HTML: {len(used)} claves usadas, todas traducidas")


# --- 4. Rutas de assets referenciadas ---------------------------------------
refs = set(re.findall(r'(?:src|href)="((?:assets|/assets)/[^"]+)"', html))
missing_files = sorted(r for r in refs if not os.path.exists(os.path.join(ROOT, r.lstrip("/"))))
if missing_files:
    errors.append(f"Assets referenciados que no existen: {missing_files}")
else:
    notes.append(f"Assets: {len(refs)} rutas comprobadas, todas existen")


# --- Resultado --------------------------------------------------------------
for note in notes:
    print("OK   " + note)
for err in errors:
    print("FALLO " + err)

print()
print("Sin errores." if not errors else f"{len(errors)} problema(s).")
sys.exit(1 if errors else 0)
