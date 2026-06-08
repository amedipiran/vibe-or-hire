(function () {
  "use strict";

  var GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/NqFyczCDOfGfkFkZBRb3/webhook-trigger/0c9fb463-e456-42be-94e1-395e5c6ad386';

  var paths = [
    { key: 'self',  lbl: 'Vibe-coda' },
    { key: 'proto', lbl: 'Delvis vibe' },
    { key: 'qala',  lbl: 'Anlita proffs' }
  ];

  var pathNames = {
    self:  'Vibe-coda det själv',
    proto: 'Börja själv, anlita sedan proffs',
    qala:  'Det bör byggas med Qala'
  };

  var questions = [
    { q: 'Vad är det för projekt?', opts: [
      { ol: 'Ett experiment eller en intern grej', od: 'Mest för mig eller teamet', w: { self: 3 } },
      { ol: 'En idé jag vill testa på riktiga användare', od: 'Validera innan jag satsar', w: { proto: 3, self: 1 } },
      { ol: 'Något som ska bli en del av verksamheten', od: 'Ska användas på riktigt', w: { qala: 3, proto: 1 } },
      { ol: 'En kundvänd sajt eller webbshop som ska leva', od: '', w: { qala: 4 } }
    ] },
    { q: 'Hur länge ska det leva?', opts: [
      { ol: 'Dagar eller veckor, sen slänger jag det', od: '', w: { self: 3 } },
      { ol: 'Några månader', od: '', w: { self: 2, proto: 2 } },
      { ol: 'Ett par år', od: '', w: { proto: 2, qala: 1 } },
      { ol: 'Långsiktigt, det ska bara funka', od: '', w: { qala: 3 } },
      { ol: 'Det ska bli en central del av företaget', od: '', w: { qala: 4 } }
    ] },
    { q: 'Vem ska underhålla det sen?', opts: [
      { ol: 'Ingen, det är en engångsgrej', od: '', w: { self: 3 } },
      { ol: 'Jag själv, så länge det behövs', od: '', w: { self: 2, proto: 1 } },
      { ol: 'Vi internt, men ingen är utvecklare', od: '', w: { proto: 1, qala: 2 } },
      { ol: 'Det måste kunna tas över och vidareutvecklas', od: '', w: { qala: 4 } }
    ] },
    { q: 'Hur många ska använda det?', opts: [
      { ol: 'Bara jag eller några få', od: '', w: { self: 3 } },
      { ol: 'Ett internt team', od: '', w: { self: 1, proto: 2 } },
      { ol: 'Betalande kunder', od: '', w: { proto: 1, qala: 2 } },
      { ol: 'Många, och det ska kunna växa', od: '', w: { qala: 4 } }
    ] },
    { q: 'Hanterar det känslig data eller betalningar?', opts: [
      { ol: 'Nej', od: '', w: { self: 3, proto: 1 } },
      { ol: 'Lite intern data', od: '', w: { self: 1, proto: 1, qala: 1 } },
      { ol: 'Kundkonton och inloggningar', od: '', w: { qala: 3 } },
      { ol: 'Betalningar eller känsliga uppgifter', od: '', w: { qala: 4 } }
    ] },
    { q: 'Har du redan vibe-codat något?', opts: [
      { ol: 'Nej, inte än', od: 'Lovable, Bolt, Cursor, v0, Replit …', w: { qala: 1, proto: 1 } },
      { ol: 'Pillat lite', od: '', w: { self: 2, proto: 1 } },
      { ol: 'Byggt en prototyp', od: '', w: { proto: 3, self: 1 } },
      { ol: 'Byggt något men vill ta det vidare', od: '', w: { proto: 2, qala: 2 } }
    ] },
    { q: 'Vad är viktigast just nu?', opts: [
      { ol: 'Komma igång snabbt och billigt', od: '', w: { self: 3 } },
      { ol: 'Testa om idén håller', od: '', w: { proto: 3 } },
      { ol: 'Att det håller över tid', od: '', w: { qala: 3 } },
      { ol: 'Att det är tryggt och kan skalas', od: '', w: { qala: 3 } }
    ] }
  ];

  var landing = {
    values: [
      { h: 'Lär dig när vibe-coding räcker', p: 'Ibland räcker det att vibe-coda. Ibland håller det inte. Vi hjälper dig se skillnaden.' },
      { h: 'Ett rakt svar', p: 'Inget säljsnack. Du får veta vad som passar ditt projekt.' },
      { h: 'Tar två minuter', p: 'Sju snabba frågor, sen får du svaret i mejlen.' }
    ],
    forYou: [
      'Har vibe-codat något och undrar om det håller',
      'Vill komma igång snabbt utan att fastna på tekniska detaljer',
      'Har en idé du vill testa innan du satsar',
      'Vill veta när du bör bygga något som håller'
    ],
    ways: [
      { h: 'Vibe-coda det själv',
        sub: 'Bygg det själv med AI. Snabbt och billigt.',
        best: ['Experiment och interna grejer', 'Testa en idé innan du satsar'],
        trade: ['Inte byggt för att hålla länge', 'Svårt att skala och underhålla'] },
      { h: 'Börja själv, anlita sedan proffs',
        sub: 'Kom igång och testa idén själv, ta sedan in proffs som bygger det ordentligt.',
        best: ['Idéer som ska testas först', 'Komma igång nu utan att fastna'],
        trade: ['Prototypen byggs oftast om', 'Funkar bäst om du lämnar över i rätt läge'] },
      { h: 'Anlita proffs',
        sub: 'Bygg det ordentligt från start, på en grund som håller och går att underhålla.',
        best: ['Ska leva, växa och underhållas', 'Kräver säkerhet eller driftsäkerhet'],
        trade: ['Större insats från start', 'Bör planeras ordentligt först'] }
    ],
    factors: ['Livslängd', 'Underhåll', 'Säkerhet', 'Skala', 'Budget', 'Hur kritiskt det är']
  };

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
  var ADVANCE = 360;

  var STORE = 'ac_quiz_v5';
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
    scores: saved ? saved.scores : { self: 0, proto: 0, qala: 0 },
    answers: saved ? saved.answers : []
  };
  var lock = false;
  var root = document.getElementById('ac-root');

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

  function renderLanding() {
    var L = landing;

    var hero = el('section', { class: 'ac-hero' }, [
      el('h1', { class: 'ac-h1', html: 'Ska du <span class="hl">vibe-coda</span> ditt projekt eller anlita proffs?' }),
      el('p', { class: 'ac-hero-sub' }, 'Du kan vibe-coda nästan vad som helst idag. Frågan är om det håller över tid. Svara på sju snabba frågor så får du svaret.'),
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
      el('h2', { class: 'ac-h2' }, 'Tre sätt att bygga det'),
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
      el('p', null, 'Sju frågor. Inget säljsamtal. Vi mejlar svaret.'),
      el('button', { class: 'ac-cta', onClick: start }, 'Kom igång')
    ]);

    return el('div', { class: 'ac-landing' }, [hero, values, forYou, ways, factors, closing]);
  }

  var barFills = {}, barSegs = {}, barPcts = {};

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

  var cardHolder;

  function renderCard() {
    var item = questions[S.idx];
    var prevSel = (S.answers[S.idx] && S.answers[S.idx].i != null) ? S.answers[S.idx].i : -1;
    var picked = prevSel;

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

  function buildHandoff(lead, answers, name, details, email) {
    var params = [
      'path=' + encodeURIComponent(lead),
      'path_name=' + encodeURIComponent(pathNames[lead])
    ];
    answers.forEach(function (a, n) { if (a) params.push('q' + (n + 1) + '=' + encodeURIComponent(a.label)); });
    if (name) {
      params.push('name=' + encodeURIComponent(name));
      var np = name.trim().split(/\s+/);
      params.push('first_name=' + encodeURIComponent(np.shift() || ''));
      params.push('last_name=' + encodeURIComponent(np.join(' ')));
    }
    if (details) params.push('details=' + encodeURIComponent(details));
    if (email) params.push('email=' + encodeURIComponent(email));
    return params.join('&');
  }

  function submitToCRM(handoff) {
    if (!GHL_WEBHOOK_URL) return Promise.resolve();
    return fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: handoff
    }).catch(function () {  });
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

    function refresh() {
      var e = errs();
      ['name', 'email', 'details', 'consent'].forEach(function (f) {
        var show = (state.touched[f] || state.attempted) ? e[f] : null;
        var r = refs[f];
        r.wrap.classList.toggle('has-error', !!show);
        r.err.textContent = show || '';
        r.err.style.display = show ? '' : 'none';
      });
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
      submitBtn, backBtn
    ]);

    return el('div', { class: 'ac-quiz' }, el('div', { class: 'ac-card' }, form));
  }

  var partialRec = {
    self:  'att du kan vibe-coda det här själv',
    proto: 'att börja själv och ta in hjälp när det ska göras ordentligt',
    qala:  'att ta in proffs som bygger det ordentligt'
  };

  function showDone(email) {
    var lead = leadKey(S.scores);
    var done = el('div', { class: 'ac-gate ac-gate-done' }, [
      el('div', { class: 'ac-done-check', 'aria-hidden': 'true' }, '✓'),
      el('h2', null, 'Tack!'),
      el('p', { class: 'sub', html: 'Utifrån dina svar lutar det mot <b>' + partialRec[lead] + '</b>.' }),
      el('p', { class: 'sub last', html: 'Vi mejlar en mer utförlig rekommendation till <b>' + (email || '') + '</b>.' }),
      el('button', { class: 'ac-restart', type: 'button', onClick: restart }, 'Börja om')
    ]);
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'ac-quiz' }, el('div', { class: 'ac-card' }, done)));
    window.scrollTo(0, 0);
  }

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
    S.scores = { self: 0, proto: 0, qala: 0 };
    S.idx = 0; S.answers = [];
    setScreen('quiz');
  }

  function restart() {
    S.scores = { self: 0, proto: 0, qala: 0 };
    S.idx = 0; S.answers = [];
    try { localStorage.removeItem(STORE); } catch (e) {}
    setScreen('landing');
  }

  document.getElementById('ac-logo').addEventListener('click', function () {
    setScreen('landing');
  });

  setScreen(S.screen);
})();