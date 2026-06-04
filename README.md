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

## Koppla in GHL

Kopplingen är redan inbyggd. Öppna `assets/js/quiz.js` och klistra in er
GHL Inbound Webhook-URL högst upp:

```js
var GHL_WEBHOOK_URL = ''; // <-- klistra in webhook-URL:en här
```

När fältet är ifyllt POSTar formuläret (vid "Maila rekommendation") en
`application/x-www-form-urlencoded`-payload till webhooken. Är fältet tomt
körs demo-läget (inget skickas, men "Tack"-skärmen visas ändå).

Fält som skickas in:

```
email, first_name, last_name, name,
path        (self | proto | qala)
path_name   (läsbar väg, t.ex. "Bygg det på Qala")
q1 … q10    (besökarens valda svar)
details     (fritext om projektet)
```

I GHL: skapa en workflow med triggern **Inbound Webhook**, gör ett testsvar
så fälten fångas, och bygg sedan stegen (Create/Update Contact → tagga på
`path` → Send Email per väg).