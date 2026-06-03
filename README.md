# Angry Creative – Vibe eller proffs?

Ett inbäddningsbart lead-gen-quiz för webbyrån Angry Creative. Besökaren svarar
på tio frågor och får en rekommendation om hur projektet bäst bör byggas
(göra själv, prototypa, ta in Angry, eller fixa/migrera). Resultatet visas inte
på skärmen – det mejlas via CRM.

Flöde: **landningssida → 10 frågor → formulär**, med en live-resultatbar i fyra
segment som fylls i realtid medan man svarar.

## Teknik

Statisk sajt – ren HTML, CSS och vanilla JavaScript. Inget byggsteg, inga
beroenden (React/Babel laddas inte). Lato hämtas från Google Fonts; loggan ligger
inbäddad som data-URI.

## Struktur

```
index.html            Entry point
favicon.png           Favicon (Angry Creatives site icon)
assets/
  css/styles.css      All styling
  js/quiz.js          All logik (state, scoring, validering, persistence)
```

## Köra lokalt

Servera mappen statiskt, t.ex.:

```bash
python3 -m http.server 5500
# eller VS Code "Live Server"
```

Öppna sedan `http://localhost:5500/`.

## Deploy (GitHub Pages)

Serveras direkt från `main` / rot. Alla sökvägar är relativa, så det fungerar
även under en projektsökväg (`https://<user>.github.io/<repo>/`).

## Koppla in CRM

Formuläret bygger redan en GHL-handoff-sträng. Byt ut `submitToCRM()` i
`assets/js/quiz.js` mot en riktig POST till er CRM-endpoint.
