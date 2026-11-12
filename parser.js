/* Mon TGV Max : lecture des captures par règles (expressions régulières), sans IA.
   Aussi : offres tarifaires, fenêtre de confirmation, rappels, comparaison Carte Avantage, rentabilité. */
(function (root) {
  'use strict';

  // ---------- Outils ----------
  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDate(dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); }
  function localStamp(dt) { return isoDate(dt) + 'T' + pad(dt.getHours()) + ':' + pad(dt.getMinutes()) + ':00'; }
  function parseISO(s) { var p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(dt, n) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n, dt.getHours(), dt.getMinutes()); }
  function hm(s, dflt) { var p = String(s || dflt || '00:00').split(':').map(Number); return [p[0] || 0, p[1] || 0]; }
  function num(s) { return Number(String(s).replace(',', '.')); }
  function norm(s) {
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[   ]/g, ' ')
      .replace(/[’`´]/g, "'")
      .toLowerCase();
  }
  function words(s) { return ' ' + norm(s).replace(/[^a-z0-9]+/g, ' ').trim() + ' '; }

  // ---------- Gares : [nom affiché, ville, clés reconnues...] ----------
  var STATIONS = [
    ['Paris Gare de Lyon', 'paris', 'paris gare de lyon', 'gare de lyon', 'paris gare lyon', 'paris g de lyon'],
    ['Paris Montparnasse', 'paris', 'paris montparnasse', 'montparnasse'],
    ['Paris Nord', 'paris', 'paris nord', 'gare du nord', 'paris gare du nord'],
    ['Paris Est', 'paris', 'paris est', 'gare de l est', 'paris gare de l est'],
    ['Paris Bercy', 'paris', 'paris bercy', 'bercy'],
    ['Paris Austerlitz', 'paris', 'paris austerlitz', 'austerlitz'],
    ['Paris Saint-Lazare', 'paris', 'paris saint lazare', 'saint lazare', 'st lazare'],
    ['Aéroport CDG 2 TGV', 'cdg', 'aeroport charles de gaulle', 'charles de gaulle', 'cdg 2', 'roissy'],
    ['Marne-la-Vallée Chessy', 'chessy', 'marne la vallee', 'chessy'],
    ['Massy TGV', 'massy', 'massy tgv', 'massy'],
    ['Lyon Part-Dieu', 'lyon', 'lyon part dieu', 'part dieu'],
    ['Lyon Perrache', 'lyon', 'lyon perrache', 'perrache'],
    ['Lyon Saint-Exupéry TGV', 'lyon', 'saint exupery', 'st exupery'],
    ['Marseille Saint-Charles', 'marseille', 'marseille saint charles', 'marseille st charles', 'marseille'],
    ['Lille Europe', 'lille', 'lille europe'],
    ['Lille Flandres', 'lille', 'lille flandres'],
    ['Bordeaux Saint-Jean', 'bordeaux', 'bordeaux saint jean', 'bordeaux st jean', 'bordeaux'],
    ['Nantes', 'nantes', 'nantes'],
    ['Rennes', 'rennes', 'rennes'],
    ['Strasbourg', 'strasbourg', 'strasbourg'],
    ['Toulouse Matabiau', 'toulouse', 'toulouse matabiau', 'toulouse'],
    ['Montpellier Sud de France', 'montpellier', 'montpellier sud de france', 'sud de france'],
    ['Montpellier Saint-Roch', 'montpellier', 'montpellier saint roch', 'montpellier st roch'],
    ['Nice Ville', 'nice', 'nice ville', 'nice'],
    ['Avignon TGV', 'avignon', 'avignon tgv'],
    ['Avignon Centre', 'avignon', 'avignon centre'],
    ['Aix-en-Provence TGV', 'aix', 'aix en provence tgv', 'aix en provence'],
    ['Valence TGV', 'valence', 'valence tgv'],
    ['Valence Ville', 'valence', 'valence ville'],
    ['Grenoble', 'grenoble', 'grenoble'],
    ['Dijon', 'dijon', 'dijon ville', 'dijon'],
    ['Besançon Franche-Comté TGV', 'besancon', 'besancon franche comte', 'besancon'],
    ['Mulhouse', 'mulhouse', 'mulhouse'],
    ['Metz', 'metz', 'metz ville', 'metz'],
    ['Nancy', 'nancy', 'nancy ville', 'nancy'],
    ['Reims', 'reims', 'reims'],
    ['Champagne-Ardenne TGV', 'champagne', 'champagne ardenne'],
    ['Lorraine TGV', 'lorraine', 'lorraine tgv'],
    ['Le Mans', 'le mans', 'le mans'],
    ['Angers Saint-Laud', 'angers', 'angers saint laud', 'angers'],
    ['Tours', 'tours', 'tours'],
    ['Saint-Pierre-des-Corps', 'st pierre', 'saint pierre des corps', 'st pierre des corps'],
    ['Poitiers', 'poitiers', 'poitiers'],
    ['La Rochelle', 'la rochelle', 'la rochelle'],
    ['Angoulême', 'angouleme', 'angouleme'],
    ['Niort', 'niort', 'niort'],
    ['Brest', 'brest', 'brest'],
    ['Quimper', 'quimper', 'quimper'],
    ['Lorient', 'lorient', 'lorient'],
    ['Vannes', 'vannes', 'vannes'],
    ['Saint-Malo', 'st malo', 'saint malo', 'st malo'],
    ['Laval', 'laval', 'laval'],
    ['Le Havre', 'le havre', 'le havre'],
    ['Rouen', 'rouen', 'rouen rive droite', 'rouen'],
    ['Caen', 'caen', 'caen'],
    ['Annecy', 'annecy', 'annecy'],
    ['Chambéry', 'chambery', 'chambery'],
    ['Aix-les-Bains', 'aix les bains', 'aix les bains'],
    ['Saint-Étienne', 'st etienne', 'saint etienne chateaucreux', 'saint etienne', 'st etienne'],
    ['Mâcon Loché TGV', 'macon', 'macon loche', 'macon'],
    ['Nîmes', 'nimes', 'nimes pont du gard', 'nimes'],
    ['Perpignan', 'perpignan', 'perpignan'],
    ['Narbonne', 'narbonne', 'narbonne'],
    ['Béziers', 'beziers', 'beziers'],
    ['Sète', 'sete', 'sete'],
    ['Toulon', 'toulon', 'toulon'],
    ['Cannes', 'cannes', 'cannes'],
    ['Antibes', 'antibes', 'antibes'],
    ['Hendaye', 'hendaye', 'hendaye'],
    ['Biarritz', 'biarritz', 'biarritz'],
    ['Bayonne', 'bayonne', 'bayonne'],
    ['Pau', 'pau', 'pau'],
    ['Tarbes', 'tarbes', 'tarbes'],
    ['Agen', 'agen', 'agen'],
    ['Arras', 'arras', 'arras'],
    ['Calais', 'calais', 'calais frethun', 'calais'],
    ['Dunkerque', 'dunkerque', 'dunkerque'],
    ['Douai', 'douai', 'douai'],
    ['Valenciennes', 'valenciennes', 'valenciennes'],
    ['Luxembourg', 'luxembourg', 'luxembourg'],
    ['Fribourg-en-Brisgau', 'fribourg', 'fribourg', 'freiburg'],
    // Villes seules : servent quand la gare exacte n'apparaît pas
    ['Paris', 'paris', 'paris'],
    ['Lyon', 'lyon', 'lyon'],
    ['Lille', 'lille', 'lille'],
    ['Montpellier', 'montpellier', 'montpellier'],
    ['Avignon', 'avignon', 'avignon'],
    ['Valence', 'valence', 'valence']
  ];
  var KEYS = [];
  STATIONS.forEach(function (s) {
    for (var k = 2; k < s.length; k++) KEYS.push({ key: words(s[k]).trim(), name: s[0], city: s[1], generic: s[0].toLowerCase() === s[1] });
  });
  KEYS.sort(function (a, b) { return b.key.length - a.key.length; });

  function findStations(text) {
    var w = words(text);
    var taken = new Array(w.length).fill(false);
    var hits = [];
    KEYS.forEach(function (k) {
      var needle = ' ' + k.key + ' ';
      var from = 0, idx;
      while ((idx = w.indexOf(needle, from)) !== -1) {
        var s = idx + 1, e = idx + needle.length - 1, free = true;
        for (var i = s; i < e; i++) if (taken[i]) { free = false; break; }
        if (free) {
          for (var j = s; j < e; j++) taken[j] = true;
          hits.push({ pos: s, name: k.name, city: k.city, generic: k.generic });
        }
        from = idx + 1;
      }
    });
    hits.sort(function (a, b) { return a.pos - b.pos; });
    var cities = [];
    hits.forEach(function (h) { if (cities.indexOf(h.city) === -1) cities.push(h.city); });
    function best(city) {
      if (!city) return '';
      var specific = hits.filter(function (h) { return h.city === city && !h.generic; });
      return (specific[0] || hits.filter(function (h) { return h.city === city; })[0]).name;
    }
    return { from: best(cities[0]), to: best(cities[1]), all: cities };
  }

  // Lignes « 07:42 Lille Flandres » : l'heure suivie d'une gare
  function stationTimes(text) {
    var out = [];
    String(text || '').split(/\r?\n/).forEach(function (line) {
      var m = line.match(/(?:^|[^\d])([01]?\d|2[0-3])\s?[:h]\s?([0-5]\d)(?!\d)\s+(.+)$/);
      if (!m) return;
      var st = findStations(m[3]);
      if (st.from) out.push({ time: pad(m[1]) + ':' + m[2], station: st.from });
    });
    return out;
  }

  // ---------- Dates ----------
  var MONTHS = { janv: 1, jan: 1, janvier: 1, fevr: 2, fev: 2, fevrier: 2, mars: 3, avr: 4, avril: 4, mai: 5, juin: 6,
    juil: 7, juillet: 7, aout: 8, sept: 9, sep: 9, septembre: 9, oct: 10, octobre: 10, nov: 11, novembre: 11, dec: 12, decembre: 12 };
  var MONTH_RE = '(janvier|janv|jan|fevrier|fevr|fev|mars|avril|avr|mai|juin|juillet|juil|aout|septembre|sept|sep|octobre|oct|novembre|nov|decembre|dec)';
  var RE_TEXT_DATE = new RegExp('(?:^|[^a-z0-9])(?:(?:lun|mar|mer|jeu|ven|sam|dim)[a-z]*\\.?,?\\s*)?(\\d{1,2})(?:er)?\\s*' + MONTH_RE + '\\.?(?:\\s*(\\d{4}))?(?![a-z])', 'g');
  var RE_NUM_DATE = /(?:^|[^\d])(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?![\d])/g;

  function closestYear(d, m, now) {
    var best = null, bestGap = Infinity;
    [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].forEach(function (y) {
      var dt = new Date(y, m - 1, d), gap = Math.abs(dt - now);
      if (gap < bestGap) { bestGap = gap; best = dt; }
    });
    return best;
  }
  function validDay(d, m) { return d >= 1 && d <= 31 && m >= 1 && m <= 12; }

  function findDate(text, now) {
    var nt = norm(text), m, found = [];
    RE_TEXT_DATE.lastIndex = 0;
    while ((m = RE_TEXT_DATE.exec(nt))) {
      var d = Number(m[1]), mo = MONTHS[m[2]];
      if (!validDay(d, mo)) continue;
      var dt = m[3] ? new Date(Number(m[3]), mo - 1, d) : closestYear(d, mo, now);
      found.push({ pos: m.index, date: dt });
    }
    RE_NUM_DATE.lastIndex = 0;
    while ((m = RE_NUM_DATE.exec(nt))) {
      var d2 = Number(m[1]), mo2 = Number(m[2]);
      if (!validDay(d2, mo2)) continue;
      var y = m[3] ? Number(m[3].length === 2 ? '20' + m[3] : m[3]) : null;
      found.push({ pos: m.index, date: y ? new Date(y, mo2 - 1, d2) : closestYear(d2, mo2, now) });
    }
    if (found.length) { found.sort(function (a, b) { return a.pos - b.pos; }); return isoDate(found[0].date); }
    if (/aujourd'?\s?hui/.test(nt)) return isoDate(now);
    if (/\bdemain\b/.test(nt)) return isoDate(addDays(now, 1));
    return '';
  }

  // ---------- Heures et durée ----------
  function findTimes(text) {
    var lines = String(text || '').split(/\r?\n/).filter(function (l) { return l.trim(); }), colon = [], hfmt = [];
    lines.forEach(function (line, li) {
      if (li === 0 && !findStations(line).from) return; // barre d'état de l'iPhone (ex. « 22:45 »)
      var m, reC = /(^|[^\d])([01]?\d|2[0-3])\s?:\s?([0-5]\d)(?!\d)/g;
      while ((m = reC.exec(line))) colon.push(pad(m[2]) + ':' + m[3]);
      var reH = /(^|[^\d])([01]?\d|2[0-3])\s?h\s?([0-5]\d)(?!\d)(?!\s?min)/gi;
      while ((m = reH.exec(line))) {
        var after = norm(line.slice(m.index + m[0].length, m.index + m[0].length + 16));
        var before = norm(line.slice(Math.max(0, m.index - 10), m.index));
        if (/duree|trajet de/.test(before) || /^\s*(direct|\d\s*corresp)/.test(after)) continue;
        hfmt.push(pad(m[2]) + ':' + m[3]);
      }
    });
    return colon.length ? colon : hfmt;
  }
  function findDuration(text) {
    var nt = norm(text), m;
    if ((m = nt.match(/(?:^|[^\d:])(\d{1,2})\s?h\s?(\d{2})\s+(?:direct|\d+\s*corresp)/))) return Number(m[1]) * 60 + Number(m[2]);
    if ((m = nt.match(/(?:^|[^\d])(\d{1,3})\s?min\s+(?:direct|\d+\s*corresp)/))) return Number(m[1]);
    if ((m = nt.match(/duree\s*:?\s*(\d{1,2})\s?h\s?(\d{2})/))) return Number(m[1]) * 60 + Number(m[2]);
    return null;
  }
  function minutesBetween(dep, arr) {
    if (!dep || !arr) return null;
    var a = hm(dep), b = hm(arr), d = (b[0] * 60 + b[1]) - (a[0] * 60 + a[1]);
    if (d < 0) d += 1440;
    return d || null;
  }

  // ---------- Prix ----------
  function findPrices(text) {
    var t = String(text || '').replace(/[   ]/g, ' '), out = [], m;
    var re = /(^|[^\d,.])(\d{1,3})(?:[,.](\d{1,2}))?\s?(€|eur(?:os?)?(?![a-z]))/gi;
    while ((m = re.exec(t))) {
      var v = Number(m[2]) + (m[3] ? Number(m[3].padEnd(2, '0')) / 100 : 0);
      out.push({ value: Math.round(v * 100) / 100, pos: m.index + m[1].length });
    }
    var reZero = /(^|[^\w])[oO](?:[,.]00)?\s?€/g; // « O € » : zéro mal lu
    while ((m = reZero.exec(t))) out.push({ value: 0, pos: m.index + m[1].length });
    return out.sort(function (a, b) { return a.pos - b.pos; });
  }

  // Écran « Choisissez un tarif » de SNCF Connect : une offre par bouton « Choisir cet aller à X € ».
  // Le prix barré est mal lu par l'OCR, mais « X € économisés grâce à… » donne plein tarif = payé + économie.
  var RE_CHOOSE = /choisir\s+cet\s+(?:aller|retour|trajet)\s+a\s+([0-9oO]{1,3}(?:[,.]\d{1,2})?)\s?(?:€|eur|e\b)/;
  var RE_SAVED = /(\d{1,3}(?:[,.]\d{1,2})?)\s?€?\s*economise?s?\s+grace\s+a\s+votre\s+(tarif|billet)\s+([a-z ]+)/;
  var RE_CLASS2 = /(?:^|[^a-z0-9])(2\s?de|2\s?nde|2e|seconde)\s+classe/;
  var RE_CLASS1 = /(?:^|[^a-z0-9])(1\s?re|ire|lre|1\s?ere|premiere)\s+classe/;
  function parseOffers(text) {
    var lines = norm(text).split(/\r?\n/), offers = [];
    var cur = { classe: null, saved: null, tarif: null, prices: [] };
    lines.forEach(function (line) {
      var m;
      if (RE_CLASS2.test(line)) cur.classe = '2de';
      else if (RE_CLASS1.test(line)) cur.classe = '1re';
      else if (/ouigo\s+plus/.test(line)) cur.classe = 'OUIGO PLUS';
      if ((m = line.match(RE_SAVED))) { cur.saved = num(m[1]); cur.tarif = (m[2] + ' ' + m[3]).trim(); return; }
      if (/disponible\s+grace\s+a\s+votre\s+billet\s+max/.test(line)) { cur.tarif = 'billet max'; return; }
      if ((m = line.match(RE_CHOOSE))) {
        var paid = num(m[1].replace(/[oO]/g, '0'));
        var plein = cur.saved != null ? Math.round((paid + cur.saved) * 100) / 100 : null;
        if (plein == null) {
          var higher = cur.prices.filter(function (p) { return p > paid; });
          if (higher.length) plein = Math.max.apply(null, higher);
        }
        offers.push({ classe: cur.classe || (paid === 0 ? '2de' : null), paid: paid, plein: plein, tarif: cur.tarif });
        cur = { classe: null, saved: null, tarif: null, prices: [] };
        return;
      }
      findPrices(line).forEach(function (p) { cur.prices.push(p.value); });
    });
    return offers;
  }
  function pickOffer(offers) {
    return offers.filter(function (o) { return o.paid === 0; })[0] ||
      offers.filter(function (o) { return o.classe === '2de'; })[0] ||
      offers.slice().sort(function (a, b) { return a.paid - b.paid; })[0] || null;
  }
  // Sans écran de tarifs : prix barré + 0 €, ou deux prix (payé, plein)
  function genericPrices(text, isMax) {
    var prices = findPrices(text), zeros = prices.filter(function (p) { return p.value === 0; });
    var nz = prices.filter(function (p) { return p.value >= 3 && p.value <= 400; }).map(function (p) { return p.value; });
    if (!nz.length) return { plein: null, paid: 0 };
    if (zeros.length || isMax) return { plein: Math.max.apply(null, nz), paid: 0 };
    if (nz.length >= 2) return { plein: Math.max.apply(null, nz), paid: Math.min.apply(null, nz) };
    return { plein: nz[0], paid: 0 };
  }

  // ---------- Train ----------
  function findFamily(text) {
    var nt = norm(text);
    if (/ouigo|grande vitesse|billet max jeune|embarquement/.test(nt)) return 'OUIGO';
    if (/intercites/.test(nt)) return 'INTERCITES';
    return 'INOUI';
  }
  function findTrainNumber(text) {
    var m = norm(text).match(/(?:tgv inoui|inoui|ouigo|intercites|tgv|train)\s*(?:n\s?[°o]\.?\s*)?(\d{4,5})(?!\d)/);
    return m ? m[1] : '';
  }

  function parseText(text, now) {
    now = now || new Date();
    var st = findStations(text), stt = stationTimes(text), times = findTimes(text), nt = norm(text);
    var family = findFamily(text);
    var draft = {
      from: st.from, to: st.to, date: findDate(text, now),
      dep: times[0] || '', arr: times[1] || '',
      family: family, classe: '2de', trainNo: findTrainNumber(text),
      originalPrice: null, paidPrice: 0, priceEstimated: false, estimateNote: '', offers: []
    };
    if (stt.length >= 2) { draft.from = stt[0].station; draft.to = stt[1].station; draft.dep = stt[0].time; draft.arr = stt[1].time; }
    draft.durationMin = findDuration(text) || minutesBetween(draft.dep, draft.arr);

    var offers = parseOffers(text);
    draft.offers = offers;
    var o = pickOffer(offers);
    if (o) {
      draft.paidPrice = o.paid; draft.originalPrice = o.plein; draft.classe = o.classe === '1re' ? '1re' : '2de';
      if (o.plein == null) {
        var others = offers.filter(function (x) { return x !== o && x.paid > 0; }).sort(function (a, b) { return a.paid - b.paid; });
        if (others.length) {
          draft.originalPrice = others[0].paid; draft.priceEstimated = true;
          draft.estimateNote = family === 'OUIGO'
            ? 'OUIGO n’affiche pas de prix de référence : ' + others[0].paid + ' € (tarif ' + (others[0].classe || 'OUIGO PLUS') + ' affiché) sert d’estimation haute.'
            : 'Prix de référence non affiché : ' + others[0].paid + ' € (autre tarif de l’écran) sert d’estimation.';
        }
      }
    } else {
      var g = genericPrices(text, /\b(max jeune|max senior|tgv ?max)\b/.test(nt));
      draft.originalPrice = g.plein; draft.paidPrice = g.paid;
    }
    draft.found = ['from', 'to', 'date', 'dep', 'originalPrice'].filter(function (k) { return draft[k] !== '' && draft[k] != null; }).length;
    return draft;
  }

  // ---------- Confirmation et rappels ----------
  // Règle SNCF : confirmer à partir de J-2, au plus tard la veille à 17 h (sinon annulation automatique).
  function isMaxTrip(t) { return !(Number(t.paidPrice) > 0); }
  function confirmWindow(trip, deadline) {
    var d = parseISO(trip.date), t = hm(trip.dep), dl = hm(deadline, '17:00');
    return {
      dep: new Date(d.getFullYear(), d.getMonth(), d.getDate(), t[0], t[1]),
      opens: new Date(d.getFullYear(), d.getMonth(), d.getDate() - 2),
      deadline: new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, dl[0], dl[1])
    };
  }
  function tripStatus(trip, now, deadline) {
    var w = confirmWindow(trip, deadline);
    if (now >= w.dep) return 'past';
    if (!isMaxTrip(trip)) return 'ticket';
    if (trip.confirmed) return 'confirmed';
    if (now < w.opens) return 'planned';
    if (now < w.deadline) return 'open';
    return 'late';
  }
  // Deux événements de 15 min la veille (matin, puis 3 h avant la limite). Si les deux heures sont passées
  // mais pas la limite : un seul rappel dans les 5 minutes.
  function reminderSlots(trip, now, s) {
    s = s || {};
    if (!isMaxTrip(trip) || trip.confirmed || !trip.date) return [];
    var w = confirmWindow(trip, s.deadline);
    if (now >= w.deadline) return [];
    var y = w.deadline.getFullYear(), mo = w.deadline.getMonth(), d = w.deadline.getDate();
    var slots = [s.remind1 || '09:00', s.remind2 || '14:00'].map(function (v, i) {
      var p = hm(v); return { kind: i ? 'last' : 'first', start: new Date(y, mo, d, p[0], p[1]) };
    }).filter(function (x) { return x.start > now && x.start < w.deadline; });
    if (!slots.length) {
      var soon = new Date(Math.ceil((now.getTime() + 60000) / 300000) * 300000);
      if (soon < w.deadline) slots.push({ kind: 'last', start: soon });
    }
    return slots.map(function (x) { return { kind: x.kind, start: x.start, end: new Date(x.start.getTime() + 15 * 60000), deadline: w.deadline, dep: w.dep }; });
  }

  // ---------- Comparaison ----------
  // Carte Avantage Jeune : -30 % sur TGV INOUI et INTERCITÉS (hors OUIGO), prix plafonnés en 2de selon la durée.
  var CAPS = [{ upTo: 89, cap: 49 }, { upTo: 180, cap: 69 }, { upTo: Infinity, cap: 89 }];
  function durationOf(t) { return Number(t.durationMin) || minutesBetween(t.dep, t.arr); }
  function capFor(minutes) {
    if (!minutes) return null;
    for (var i = 0; i < CAPS.length; i++) if (minutes <= CAPS[i].upTo) return CAPS[i].cap;
    return null;
  }
  function avantagePrice(t) {
    if (t.originalPrice == null || t.originalPrice === '' || !isFinite(Number(t.originalPrice))) return null;
    var plein = Number(t.originalPrice);
    if (t.family === 'OUIGO') return plein;
    var p = Math.floor(plein * 0.7 + 1e-9);
    if (t.classe !== '1re') { var c = capFor(durationOf(t)); if (c != null) p = Math.min(p, c); }
    return p;
  }
  function saving(t, ref) {
    var paid = Number(t.paidPrice) || 0;
    if (ref === 'avantage') { var a = avantagePrice(t); return a == null ? 0 : Math.round((a - paid) * 100) / 100; }
    return Math.max(0, Math.round(((Number(t.originalPrice) || 0) - paid) * 100) / 100);
  }
  function monthlyCost(settings, ref) {
    var price = Number(settings.monthlyPrice) || 0;
    return ref === 'avantage' ? Math.max(0, price - (Number(settings.cardPrice) || 0) / 12) : price;
  }

  // ---------- Rentabilité ----------
  function nextMonth(k) { var y = Number(k.slice(0, 4)), m = Number(k.slice(5, 7)); m++; if (m > 12) { m = 1; y++; } return y + '-' + pad(m); }
  function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  function computeStats(trips, settings, now, ref) {
    ref = ref || settings.compare || 'avantage';
    var cost = monthlyCost(settings, ref), cur = isoDate(now).slice(0, 7);
    var valid = trips.filter(function (t) { return t.date && t.originalPrice != null && t.originalPrice !== ''; });
    var keys = valid.map(function (t) { return t.date.slice(0, 7); }).sort();
    var start = settings.startMonth || keys[0] || cur;
    if (start > cur) start = cur;
    var last = keys.length && keys[keys.length - 1] > cur ? keys[keys.length - 1] : cur;
    var months = [];
    for (var k = start, guard = 0; k <= last && guard < 120; k = nextMonth(k), guard++) {
      var key = k, ts = valid.filter(function (t) { return t.date.slice(0, 7) === key; });
      var saved = sum(ts.map(function (t) { return saving(t, ref); })), future = key > cur;
      months.push({ key: key, count: ts.length, saved: saved, paid: future ? 0 : cost, net: saved - (future ? 0 : cost), future: future, ratio: cost ? saved / cost : null,
        tickets: sum(ts.map(function (t) { return Number(t.paidPrice) || 0; })) });
    }
    var done = months.filter(function (m) { return !m.future; });
    var amounts = valid.map(function (t) { return saving(t, ref); }).filter(function (v) { return v > 0; });
    var avg = amounts.length ? sum(amounts) / amounts.length : null;
    var savedTotal = sum(done.map(function (m) { return m.saved; })), paidTotal = sum(done.map(function (m) { return m.paid; }));
    return {
      ref: ref, cost: cost, months: months,
      current: months.filter(function (m) { return m.key === cur; })[0] || { key: cur, count: 0, saved: 0, paid: cost, net: -cost, ratio: 0 },
      savedTotal: savedTotal, paidTotal: paidTotal, netTotal: savedTotal - paidTotal,
      futureSaved: sum(months.filter(function (m) { return m.future; }).map(function (m) { return m.saved; })),
      avg: avg, tripsToBreakEven: avg ? Math.ceil(cost / avg) : null, startMonth: start
    };
  }

  var api = {
    parseText: parseText, parseOffers: parseOffers, findStations: findStations, findDate: findDate, findTimes: findTimes,
    findDuration: findDuration, findPrices: findPrices, minutesBetween: minutesBetween,
    confirmWindow: confirmWindow, tripStatus: tripStatus, reminderSlots: reminderSlots, isMaxTrip: isMaxTrip,
    avantagePrice: avantagePrice, capFor: capFor, durationOf: durationOf, saving: saving, monthlyCost: monthlyCost,
    computeStats: computeStats, isoDate: isoDate, localStamp: localStamp, parseISO: parseISO, addDays: addDays,
    stationNames: STATIONS.map(function (s) { return s[0]; })
  };
  root.TGVMax = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : this);
