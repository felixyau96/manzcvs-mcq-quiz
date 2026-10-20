/* MANZCVS MCQ Quiz — client-side only (GitHub Pages) */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'manzcvs-quiz-attempts';
  const WEEKS = ['W01', 'W02', 'W03'];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function fisherYates(seq) {
    const a = seq.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /** Shuffle options; return { display, mapping: displayLetter -> originalLetter } */
  function shuffleOptions(options) {
    const letters = 'ABCDE'.split('').filter((L) => L in options);
    const items = fisherYates(letters.map((L) => ({ orig: L, text: options[L] })));
    const display = {};
    const mapping = {};
    items.forEach((item, i) => {
      const d = 'ABCDE'[i];
      display[d] = item.text;
      mapping[d] = item.orig;
    });
    return { display, mapping };
  }

  function nowHktIso() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Hong_Kong',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')} HKT`;
  }

  function loadAttempts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveAttempts(attempts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  }

  function appendAttempt(record) {
    const attempts = loadAttempts();
    attempts.push(record);
    saveAttempts(attempts);
  }

  let _bank = null;

  async function loadBank() {
    if (_bank) return _bank;
    const res = await fetch('data/questions.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load questions.json (' + res.status + ')');
    _bank = await res.json();
    return _bank;
  }

  function weekCounts(bank) {
    return WEEKS.map((id) => ({
      id,
      count: Array.isArray(bank[id]) ? bank[id].length : 0,
    }));
  }

  function createAttempt(bank, week) {
    week = String(week || '').toUpperCase();
    const list = bank[week];
    if (!list || !list.length) throw new Error('Unknown week: ' + week);
    const byId = {};
    list.forEach((q) => {
      byId[q.id] = q;
    });
    const order = fisherYates(list.map((q) => q.id));
    const displayOpts = {};
    const optMaps = {};
    order.forEach((qid) => {
      const { display, mapping } = shuffleOptions(byId[qid].options);
      displayOpts[qid] = display;
      optMaps[qid] = mapping;
    });
    return {
      attemptId: Math.random().toString(16).slice(2, 14),
      week,
      order,
      byId,
      displayOpts,
      optMaps,
      index: 0,
      answers: {},
      startedAtHKT: nowHktIso(),
      finished: false,
    };
  }

  function publicQuestion(st) {
    const qid = st.order[st.index];
    const q = st.byId[qid];
    return {
      id: qid,
      index: st.index,
      total: st.order.length,
      stem: q.stem,
      options: st.displayOpts[qid],
    };
  }

  function gradeAnswer(st, choice) {
    choice = String(choice || '').toUpperCase().trim();
    const qid = st.order[st.index];
    if (qid in st.answers) throw new Error('already answered');
    if (!(choice in st.displayOpts[qid])) throw new Error('invalid choice');
    const orig = st.optMaps[qid][choice];
    const correctLetter = st.byId[qid].answer;
    const isCorrect = orig === correctLetter;
    const rev = {};
    Object.keys(st.optMaps[qid]).forEach((d) => {
      rev[st.optMaps[qid][d]] = d;
    });
    const correctDisplay = rev[correctLetter];
    st.answers[qid] = {
      displayChoice: choice,
      origChoice: orig,
      correct: isCorrect,
    };
    return {
      questionId: qid,
      correct: isCorrect,
      yourChoice: choice,
      correctChoice: correctDisplay,
      explanation: st.byId[qid].explanation,
      index: st.index,
      total: st.order.length,
    };
  }

  function finishAttempt(st) {
    if (st.finished) return null;
    if (Object.keys(st.answers).length < st.order.length) {
      throw new Error('not all questions answered');
    }
    const wrongIds = st.order.filter((qid) => !st.answers[qid].correct);
    const score = st.order.length - wrongIds.length;
    const finishedAtHKT = nowHktIso();
    const record = {
      attemptId: st.attemptId,
      week: st.week,
      score,
      total: st.order.length,
      wrongIds,
      startedAtHKT: st.startedAtHKT,
      finishedAtHKT,
    };
    st.finished = true;
    appendAttempt(record);
    return record;
  }

  global.ManzQuiz = {
    STORAGE_KEY,
    WEEKS,
    escapeHtml,
    fisherYates,
    shuffleOptions,
    nowHktIso,
    loadAttempts,
    saveAttempts,
    appendAttempt,
    loadBank,
    weekCounts,
    createAttempt,
    publicQuestion,
    gradeAnswer,
    finishAttempt,
  };
})(typeof window !== 'undefined' ? window : globalThis);
