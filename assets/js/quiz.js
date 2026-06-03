(function () {
  "use strict";

  /* =====================================================================
     Data + scoring model — "Vibe eller proffs?".
     Four paths; every answer carries hidden weights toward them. The live
     results bar shows the distribution; the form gate computes the lead.
     ===================================================================== */
  var paths = [
    { key: 'self',   lbl: 'GÖR SJÄLV' },
    { key: 'proto',  lbl: 'PROTOTYP' },
    { key: 'agency', lbl: 'TA IN ANGRY' },
    { key: 'fix',    lbl: 'FIXA' }
  ];

  var pathNames = {
    self:   'Vibe-coda själv',
    proto:  'Vibe-coda först → ta sedan in Angry',
    agency: 'Ta in Angry direkt',
    fix:    'Fixa / migrera det du har'
  };

  var questions = [
    { q: 'Vad vill du bygga eller göra?', opts: [
      { ol: 'Ett litet internt verktyg eller experiment', od: 'För egna teamet, inget stort', w: { self: 3, proto: 1 } },
      { ol: 'En MVP för att testa en idé', od: 'Vill validera innan jag satsar', w: { proto: 3, self: 1 } },
      { ol: 'En kundvänd sajt eller webbshop som ska leva', od: 'Riktiga användare, långsiktigt', w: { agency: 3, proto: 1 } },
      { ol: 'En komplex plattform', od: 'B2B, integrationer, skala', w: { agency: 4 } },
      { ol: 'Jag har redan en sajt som krånglar eller ska flyttas', od: 'Vill fixa eller migrera det som finns', w: { fix: 4 } }
    ] },
    { q: 'Hur många kommer att använda den?', opts: [
      { ol: 'Bara jag', od: 'Solo', w: { self: 3 } },
      { ol: 'Litet internt team (2–10)', od: '', w: { self: 2, proto: 1 } },
      { ol: 'En hel avdelning (10–50)', od: '', w: { proto: 1, agency: 1 } },
      { ol: 'Betalande kunder', od: '', w: { proto: 2, agency: 2 } },
      { ol: 'Hundratals', od: '', w: { agency: 3 } },
      { ol: 'Tusentals eller fler', od: '', w: { agency: 4 } }
    ] },
    { q: 'Hur viktig är driftsäkerhet?', opts: [
      { ol: 'Får gärna krångla ibland', od: '', w: { self: 3 } },
      { ol: 'Mindre problem är okej', od: '', w: { self: 2, proto: 1 } },
      { ol: 'Måste funka pålitligt', od: '', w: { proto: 1, agency: 2 } },
      { ol: 'Nere skulle skada verksamheten', od: '', w: { agency: 3 } },
      { ol: 'Fel = allvarlig affärsrisk', od: '', w: { agency: 4 } }
    ] },
    { q: 'Hanterar den känslig data?', opts: [
      { ol: 'Ingen känslig data', od: '', w: { self: 3, proto: 1 } },
      { ol: 'Intern affärsdata (ingen kund-PII)', od: '', w: { self: 1, proto: 1, agency: 1 } },
      { ol: 'Kundkonton (inloggningar, profiler)', od: '', w: { agency: 2, proto: 1 } },
      { ol: 'Betal- eller faktureringsuppgifter', od: '', w: { agency: 3 } },
      { ol: 'Vård / juridik / regelkänsligt', od: '', w: { agency: 4 } }
    ] },
    { q: 'Hur länge ska lösningen leva?', opts: [
      { ol: 'Dagar eller veckor (engångsgrej)', od: '', w: { self: 3 } },
      { ol: 'Några månader (kortsiktigt)', od: '', w: { self: 2, proto: 2 } },
      { ol: '1–2 år (medellångt)', od: '', w: { proto: 2, agency: 1 } },
      { ol: 'Långsiktigt affärssystem', od: '', w: { agency: 3 } },
      { ol: 'Kärnan i företaget (ryggraden)', od: '', w: { agency: 4 } }
    ] },
    { q: 'Hur komplexa är arbetsflödena?', opts: [
      { ol: 'Mycket enkla', od: '', w: { self: 3 } },
      { ol: 'Mestadels rakt på sak', od: '', w: { self: 2, proto: 1 } },
      { ol: 'Flera rörliga delar', od: '', w: { proto: 2, agency: 1 } },
      { ol: 'Många flöden och specialfall', od: '', w: { agency: 3 } },
      { ol: 'Komplex affärslogik (svår att ens beskriva)', od: '', w: { agency: 4 } }
    ] },
    { q: 'Hur uppkopplad behöver den vara?', opts: [
      { ol: 'Fristående (inga integrationer)', od: '', w: { self: 3 } },
      { ol: 'En till två integrationer (inlogg, mail, betalning)', od: '', w: { proto: 2, self: 1 } },
      { ol: 'Flera system (CRM, fakturering, analys)', od: '', w: { agency: 3 } },
      { ol: 'Många flöden mellan verktyg', od: '', w: { agency: 3 } },
      { ol: 'Det finns redan ett virrvarr av verktyg', od: '', w: { fix: 2, agency: 2 } }
    ] },
    { q: 'Vad är viktigast just nu?', opts: [
      { ol: 'Lansera så fort som möjligt', od: '', w: { self: 2, proto: 2 } },
      { ol: 'Hålla kostnaden låg', od: '', w: { self: 3 } },
      { ol: 'Validera idén snabbt', od: '', w: { proto: 3 } },
      { ol: 'Stabilitet och underhållbarhet', od: '', w: { agency: 3 } },
      { ol: 'Långsiktig skalbarhet', od: '', w: { agency: 3 } }
    ] },
    { q: 'Har du redan testat AI- eller no-code-verktyg?', opts: [
      { ol: 'Nej', od: 'Lovable, Bolt, Cursor, v0, Replit …', w: { agency: 1, proto: 1 } },
      { ol: 'Pillat lite', od: '', w: { self: 2, proto: 1 } },
      { ol: 'Byggt en delvis prototyp', od: '', w: { proto: 3, self: 1 } },
      { ol: 'Byggt något men kört fast', od: '', w: { proto: 2, agency: 2 } },
      { ol: 'Validerar redan med användare', od: '', w: { proto: 2, agency: 2 } }
    ] },
    { q: 'Vad är din största oro?', opts: [
      { ol: 'Att bygga fel sak', od: '', w: { proto: 2, self: 1 } },
      { ol: 'Säkerhet och integritet', od: '', w: { agency: 3 } },
      { ol: 'Att slänga pengar på utveckling', od: '', w: { proto: 2, self: 1 } },
      { ol: 'Att AI/no-code-bygget pajar sen', od: '', w: { proto: 2, agency: 1 } },
      { ol: 'Att det går för långsamt', od: '', w: { self: 1, proto: 1 } },
      { ol: 'Teknisk skuld', od: '', w: { agency: 2, proto: 1 } },
      { ol: 'Min nuvarande sajt eller byrå funkar inte', od: '', w: { fix: 4 } }
    ] }
  ];

  var landing = {
    values: [
      { h: 'Byggd för riktiga projekt', p: 'Vi frågar om säkerhet, skala och drift. Sånt som faktiskt avgör hur du bör bygga.' },
      { h: 'Ett rakt svar', p: 'Du får en ärlig rekommendation — även när det betyder att du inte bör bygga själv ännu.' },
      { h: 'Vet vad du gör sen', p: 'Du får ett tydligt nästa steg att gå vidare med.' }
    ],
    forYou: [
      'Har testat Lovable, Base44 eller Bolt och kört fast',
      'Har en MVP som ska lanseras snabbt utan teknisk skuld',
      'Får motstridiga råd om hur du borde bygga',
      'Har en sajt som krånglar, är långsam eller svår att underhålla',
      'Vill veta om du ska bygga själv eller ta in hjälp'
    ],
    ways: [
      { h: 'Vibe-coda själv',
        sub: 'Du bygger det själv med AI- och no-code-verktyg, utan hjälp.',
        best: ['Enkla projekt med tydlig avgränsning', 'Tester och experiment innan du satsar'],
        trade: ['Svårt att hantera många användare', 'Risk för säkerhetshål med känslig data'] },
      { h: 'Vibe-coda först → ta in Angry',
        sub: 'Du gör en snabb prototyp själv, sedan bygger vi den färdig och driftsäker.',
        best: ['Dig som vill komma igång snabbt och billigt', 'Idéer som behöver testas innan de byggs på riktigt'],
        trade: ['Prototypen byggs oftast om från grunden', 'Funkar bäst om du lämnar över i rätt läge'] },
      { h: 'Ta in Angry direkt',
        sub: 'Vi tar hand om hela bygget från start.',
        best: ['Komplexa projekt med mycket okänt', 'När krav på skala, säkerhet eller regler finns från dag ett'],
        trade: ['Större investering från början', 'Vi behöver tid att kartlägga och planera först'] },
      { h: 'Fixa / migrera det du har',
        sub: 'Vi förbättrar, snabbar upp eller flyttar din befintliga sajt.',
        best: ['En sajt som krånglar eller är långsam', 'Flytt till WordPress eller WooCommerce'],
        trade: ['Vi behöver gå igenom det som finns först', 'Ibland är det billigare att bygga nytt'] }
    ],
    factors: ['Säkerhetskrav', 'Förväntad skala', 'Integrationskomplexitet', 'Livslängd', 'Hastighet', 'Budget', 'Intern teknisk kapacitet', 'Driftsrisk']
  };

  /* ---------------------------------------------------------------------
     Tiny DOM helpers — no framework, content is static & trusted.
     --------------------------------------------------------------------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  var EMAIL_RE = /^\S+@\S+\.\S+$/;
  var ADVANCE = 360; // 'standard' motion timing (locked default)

  /* ---------------------------------------------------------------------
     State + persistence (restores where the visitor left off).
     --------------------------------------------------------------------- */
  var STORE = 'ac_quiz_v2';
  function loadState() {
    try { var s = JSON.parse(localStorage.getItem(STORE)); if (s && s.scores) return s; } catch (e) {}
    return null;
  }
  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify({ screen: S.screen, idx: S.idx, scores: S.scores, answers: S.answers })); } catch (e) {}
  }

  var saved = loadState();
  var S = {
    screen: saved ? saved.screen : 'landing',
    idx: saved ? saved.idx : 0,
    scores: saved ? saved.scores : { self: 0, proto: 0, agency: 0, fix: 0 },
    answers: saved ? saved.answers : []
  };
  var lock = false;
  var root = document.getElementById('ac-root');

  /* ---------------------------------------------------------------------
     Scoring helpers.
     --------------------------------------------------------------------- */
  function leadKey(scores) {
    var lead = paths[0].key, v = -1;
    paths.forEach(function (p) { if (scores[p.key] > v) { v = scores[p.key]; lead = p.key; } });
    return lead;
  }
  function pcts(scores) {
    var total = paths.reduce(function (s, p) { return s + scores[p.key]; }, 0);
    var out = {};
    paths.forEach(function (p) { out[p.key] = total > 0 ? Math.round(scores[p.key] / total * 100) : 0; });
    return out;
  }

  /* =====================================================================
     LANDING
     ===================================================================== */
  function renderLanding() {
    var L = landing;

    var hero = el('section', { class: 'ac-hero' }, [
      el('h1', { class: 'ac-h1', html: 'Ska du <span class="hl">vibe-coda</span> det själv – eller ta in ett proffsteam?' }),
      el('p', { class: 'ac-hero-sub' }, 'Svara på tio frågor så säger vi hur du bäst bygger ditt projekt. Det tar ett par minuter.'),
      el('div', null, el('button', { class: 'ac-cta', onClick: start }, 'Kom igång'))
    ]);

    var values = el('section', { class: 'ac-section' },
      el('div', { class: 'ac-values' }, L.values.map(function (v) {
        return el('div', { class: 'ac-value' }, [el('h3', null, v.h), el('p', null, v.p)]);
      })));

    var forYou = el('section', { class: 'ac-section' }, [
      el('h2', { class: 'ac-h2' }, 'Det här är för dig som…'),
      el('ul', { class: 'ac-check' }, L.forYou.map(function (li) { return el('li', null, li); }))
    ]);

    var ways = el('section', { class: 'ac-section' }, [
      el('h2', { class: 'ac-h2' }, 'Fyra sätt att bygga det'),
      el('div', { class: 'ac-ways' }, L.ways.map(function (w, i) {
        return el('div', { class: 'ac-way' }, [
          el('div', { class: 'ac-way-no' }, '0' + (i + 1)),
          el('h3', null, w.h),
          el('p', { class: 'ac-way-sub' }, w.sub),
          el('div', { class: 'ac-way-k' }, 'BÄST FÖR'),
          el('ul', null, w.best.map(function (b) { return el('li', null, b); })),
          el('div', { class: 'ac-way-k' }, 'TÄNK PÅ'),
          el('ul', null, w.trade.map(function (b) { return el('li', null, b); }))
        ]);
      }))
    ]);

    var factors = el('section', { class: 'ac-section' }, [
      el('h2', { class: 'ac-h2' }, 'Vad bedömningen tittar på'),
      el('div', { class: 'ac-tags' }, L.factors.map(function (f) { return el('span', null, f); }))
    ]);

    var closing = el('section', { class: 'ac-section ac-closing' }, [
      el('h2', { class: 'ac-h2' }, 'Redo att komma igång?'),
      el('p', null, 'Ett par minuter. Inget säljsamtal. Du får svaret direkt.'),
      el('button', { class: 'ac-cta', onClick: start }, 'Kom igång')
    ]);

    return el('div', { class: 'ac-landing' }, [hero, values, forYou, ways, factors, closing]);
  }

  /* =====================================================================
     QUIZ — live results bar + question card
     ===================================================================== */
  var barFills = {}, barSegs = {}, barPcts = {}; // refs so the bar animates in place

  function buildBar() {
    barFills = {}; barSegs = {}; barPcts = {};
    var segs = paths.map(function (p) {
      var fill = el('div', { class: 'fill' });
      var pct = el('div', { class: 'pct' }, '0%');
      var seg = el('div', { class: 'ac-seg' }, [
        el('div', { class: 'track' }, fill),
        el('div', { class: 'lbl' }, p.lbl),
        pct
      ]);
      barFills[p.key] = fill; barSegs[p.key] = seg; barPcts[p.key] = pct;
      return seg;
    });
    return el('div', { class: 'ac-bar-wrap' },
      el('div', { class: 'ac-bar', role: 'img', 'aria-label': 'Fördelning mellan vägarna' }, segs));
  }

  function updateBar() {
    var p = pcts(S.scores);
    var lead = leadKey(S.scores);
    var hasData = paths.some(function (x) { return S.scores[x.key] > 0; });
    paths.forEach(function (path) {
      var isLead = hasData && path.key === lead;
      barFills[path.key].style.width = p[path.key] + '%';
      barPcts[path.key].textContent = p[path.key] + '%';
      barSegs[path.key].className = 'ac-seg' + (isLead ? ' is-lead' : '');
    });
  }

  var cardHolder; // persistent container; the card element inside is swapped to retrigger the transition

  function renderCard() {
    var item = questions[S.idx];
    var prevSel = (S.answers[S.idx] && S.answers[S.idx].i != null) ? S.answers[S.idx].i : -1;
    var picked = prevSel; // local guard against double-pick during the advance delay

    var opts = el('div', { class: 'ac-opts card-outline' }, item.opts.map(function (o, i) {
      var btn = el('button', {
        class: 'ac-opt' + (prevSel === i ? ' is-selected' : ''),
        type: 'button',
        onClick: function () {
          if (picked !== -1) return;
          picked = i;
          btn.classList.add('is-selected');
          onAnswer(i);
        }
      }, [
        el('span', { class: 'ac-opt-body' }, [
          el('span', { class: 'ol' }, o.ol),
          o.od ? el('span', { class: 'od' }, o.od) : null
        ]),
        el('span', { class: 'ac-opt-arrow', 'aria-hidden': 'true' }, '→')
      ]);
      return btn;
    }));

    var card = el('div', { class: 'ac-qcard' }, [
      el('div', { class: 'ac-qnum' }, [
        el('span', { class: 'n' }, 'Fråga ' + (S.idx + 1)),
        el('span', { class: 'of' }, ' av ' + questions.length),
        el('span', { class: 'ac-qbar' }, el('span', { style: 'width:' + (S.idx / questions.length * 100) + '%' }))
      ]),
      el('h2', { class: 'ac-q' }, item.q),
      opts,
      el('button', { class: 'ac-back', type: 'button', onClick: onBack }, S.idx > 0 ? '← Tillbaka' : '← Till startsidan')
    ]);

    cardHolder.innerHTML = '';
    cardHolder.appendChild(card);
  }

  function renderQuiz() {
    cardHolder = el('div', { class: 'ac-card' });
    var wrap = el('div', { class: 'ac-quiz' }, [buildBar(), cardHolder]);
    return wrap;
  }

  function onAnswer(i) {
    if (lock) return;
    lock = true;
    var o = questions[S.idx].opts[i];
    for (var k in o.w) S.scores[k] += o.w[k];
    S.answers[S.idx] = { i: i, w: o.w, label: o.ol };
    updateBar();
    persist();
    setTimeout(function () {
      if (S.idx + 1 < questions.length) { S.idx++; renderCard(); persist(); }
      else { setScreen('gate'); }
      lock = false;
    }, ADVANCE);
  }

  function onBack() {
    if (S.screen === 'gate') {
      var last = questions.length - 1;
      var prevG = S.answers[last];
      if (prevG) {
        for (var k in prevG.w) S.scores[k] -= prevG.w[k];
        S.answers[last] = null;
      }
      S.idx = last;
      setScreen('quiz');
      return;
    }
    if (S.idx === 0) { setScreen('landing'); return; }
    var prev = S.answers[S.idx - 1];
    if (prev) {
      for (var j in prev.w) S.scores[j] -= prev.w[j];
      S.answers[S.idx - 1] = null;
    }
    S.idx--;
    renderCard();
    updateBar();
    persist();
    window.scrollTo(0, 0);
  }

  /* =====================================================================
     FORM GATE — all fields required, inline validation, no on-screen result
     ===================================================================== */
  function buildHandoff(lead, answers, name, details, email) {
    var params = [
      'path=' + encodeURIComponent(lead),
      'path_name=' + encodeURIComponent(pathNames[lead])
    ];
    answers.forEach(function (a, n) { if (a) params.push('q' + (n + 1) + '=' + encodeURIComponent(a.label)); });
    if (name) params.push('name=' + encodeURIComponent(name));
    if (details) params.push('details=' + encodeURIComponent(details));
    if (email) params.push('email=' + encodeURIComponent(email));
    return params.join('&');
  }

  // INTEGRATION POINT — in production this is where the answers get POSTed to
  // Angry Creative's CRM (GHL), tagged with the computed path, which triggers
  // the recommendation email. The visitor never sees the recommendation here.
  function submitToCRM(handoff) {
    // Example:
    // return fetch('https://your-crm-endpoint.example/intake?' + handoff, { method: 'POST' });
    return Promise.resolve();
  }

  function renderGate() {
    var lead = leadKey(S.scores);
    var state = { name: '', email: '', details: '', consent: false, touched: {}, attempted: false };

    function errs() {
      var e = {};
      if (!state.name.trim()) e.name = 'Fyll i ditt namn.';
      if (!state.email.trim()) e.email = 'Fyll i din e-post.';
      else if (!EMAIL_RE.test(state.email.trim())) e.email = 'Ange en giltig e-postadress.';
      if (!state.details.trim()) e.details = 'Beskriv projektet kort.';
      if (!state.consent) e.consent = 'Du behöver godkänna för att vi ska kunna mejla dig.';
      return e;
    }

    // refs we update imperatively (so typing never loses focus)
    var refs = {};

    function field(id, labelText, kind) {
      var input = kind === 'textarea'
        ? el('textarea', { id: 'ac-' + id, maxlength: 2000, placeholder: id === 'details' ? 'Berätta kort om projektet…' : '' })
        : el('input', { id: 'ac-' + id, type: id === 'email' ? 'email' : 'text',
            placeholder: id === 'name' ? 'För- och efternamn' : (id === 'email' ? 'namn@företag.se' : '') });
      var err = el('div', { class: 'ac-err' });
      err.style.display = 'none';
      var wrap = el('div', { class: 'ac-field' }, [
        el('label', { for: 'ac-' + id, html: labelText + ' <span class="req">*</span>' }),
        input, err
      ]);
      input.addEventListener('input', function () { state[id] = input.value; refresh(); });
      input.addEventListener('blur', function () { state.touched[id] = true; refresh(); });
      refs[id] = { wrap: wrap, err: err };
      return wrap;
    }

    var nameF = field('name', 'Namn', 'input');
    var emailF = field('email', 'E-post', 'input');
    var detailsF = field('details', 'Om projektet', 'textarea');

    var consentInput = el('input', { type: 'checkbox' });
    var consentErr = el('div', { class: 'ac-err ac-err-consent' });
    consentErr.style.display = 'none';
    var consentLabel = el('label', { class: 'ac-consent' }, [
      consentInput,
      el('span', { html: 'Jag godkänner att Angry Creative får kontakta mig om mitt resultat och relevanta tjänster. <span class="req">*</span>' })
    ]);
    consentInput.addEventListener('change', function () {
      state.consent = consentInput.checked; state.touched.consent = true; refresh();
    });
    refs.consent = { wrap: consentLabel, err: consentErr };

    var submitBtn = el('button', { class: 'ac-submit', type: 'button' }, 'Maila rekommendation');
    var backBtn = el('button', { class: 'ac-back', type: 'button', onClick: onBack }, '← Tillbaka till frågorna');

    // dev preview of the CRM handoff string (hidden from the visitor)
    var devBody = el('div', { class: 'ac-dev-body' });
    devBody.hidden = true;
    var devOpen = false;
    var devToggle = el('button', { class: 'ac-dev-toggle', type: 'button', html: '▸ Dev-preview <span>(visas ej för besökaren)</span>' });
    function renderDev() {
      devBody.innerHTML = '';
      devBody.appendChild(el('div', { class: 'path', html: 'Beräknad väg: <b>' + pathNames[lead] + '</b>' }));
      devBody.appendChild(el('div', { class: 'k' }, 'Skickas till GHL som:'));
      devBody.appendChild(el('code', null, '?' + buildHandoff(lead, S.answers, state.name, state.details, state.email)));
    }
    devToggle.addEventListener('click', function () {
      devOpen = !devOpen;
      devToggle.innerHTML = (devOpen ? '▾' : '▸') + ' Dev-preview <span>(visas ej för besökaren)</span>';
      devBody.hidden = !devOpen;
      if (devOpen) renderDev();
    });
    var dev = el('div', { class: 'ac-dev' }, [devToggle, devBody]);

    function refresh() {
      var e = errs();
      ['name', 'email', 'details', 'consent'].forEach(function (f) {
        var show = (state.touched[f] || state.attempted) ? e[f] : null;
        var r = refs[f];
        r.wrap.classList.toggle('has-error', !!show);
        r.err.textContent = show || '';
        r.err.style.display = show ? '' : 'none';
      });
      if (devOpen) renderDev();
    }

    submitBtn.addEventListener('click', function () {
      state.attempted = true;
      refresh();
      if (Object.keys(errs()).length === 0) {
        var handoff = buildHandoff(lead, S.answers, state.name, state.details, state.email);
        submitToCRM(handoff);
        showDone(state.email);
      }
    });

    var form = el('div', { class: 'ac-gate' }, [
      el('h2', null, 'Nästan klar'),
      el('p', { class: 'sub' }, 'Berätta kort om projektet så blir rekommendationen mer träffsäker. Vi mejlar resultatet till dig.'),
      nameF, emailF, detailsF,
      consentLabel, consentErr,
      submitBtn, backBtn, dev
    ]);

    return el('div', { class: 'ac-quiz' }, el('div', { class: 'ac-card' }, form));
  }

  function showDone(email) {
    var done = el('div', { class: 'ac-gate ac-gate-done' }, [
      el('div', { class: 'ac-done-check', 'aria-hidden': 'true' }, '✓'),
      el('h2', null, 'Tack — det är inskickat'),
      el('p', { class: 'sub', html: 'Vi mejlar din rekommendation till <b>' + (email || '') +
        '</b>. I skarpt läge postas svaren till Angry Creatives CRM, taggas med rätt väg och triggar utskicket — inget visas här.' }),
      el('button', { class: 'ac-restart', type: 'button', onClick: restart }, 'Börja om')
    ]);
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'ac-quiz' }, el('div', { class: 'ac-card' }, done)));
    window.scrollTo(0, 0);
  }

  /* =====================================================================
     Navigation
     ===================================================================== */
  function setScreen(name) {
    S.screen = name;
    persist();
    root.innerHTML = '';
    if (name === 'landing') root.appendChild(renderLanding());
    else if (name === 'quiz') { root.appendChild(renderQuiz()); renderCard(); updateBar(); }
    else if (name === 'gate') root.appendChild(renderGate());
    window.scrollTo(0, 0);
  }

  function start() {
    S.scores = { self: 0, proto: 0, agency: 0, fix: 0 };
    S.idx = 0; S.answers = [];
    setScreen('quiz');
  }

  function restart() {
    S.scores = { self: 0, proto: 0, agency: 0, fix: 0 };
    S.idx = 0; S.answers = [];
    try { localStorage.removeItem(STORE); } catch (e) {}
    setScreen('landing');
  }

  // Logo always returns to the landing page (progress is kept in storage).
  document.getElementById('ac-logo').addEventListener('click', function () {
    setScreen('landing');
  });

  // Initial mount — restore where the visitor left off.
  setScreen(S.screen);
})();
