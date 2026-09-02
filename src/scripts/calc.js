/* ==========================================================================
   Shared calculator engine.

   Every calculator on the site supplies a `solve(values)` function that either
   returns a worked solution or throws a CalcError explaining what's missing.
   Rendering, live updates, presets and error handling live here so the
   individual tools only contain their actual pharmacy math.

   Solvers hand back plain data, never DOM nodes: a step describes its chain as
   `{ start, factors }` and a result describes its table as `{ headers, rows }`.
   This file is the only place that turns either of those into elements, which
   is what keeps the solvers importable outside a browser.
   ========================================================================== */

import { CalcError } from './core.js';

export { CalcError, fmt, fmtFixed, need, needPositive } from './core.js';

function buildStep(step) {
  const li = document.createElement('li');

  if (step.title) {
    const title = document.createElement('p');
    title.className = 'step__title';
    title.textContent = step.title;
    li.append(title);
  }

  if (step.math) {
    const math = document.createElement('p');
    math.className = 'step__math';
    math.textContent = step.math;
    li.append(math);
  }

  if (step.chain) {
    li.append(buildChain(step.chain.start, step.chain.factors));
  }

  if (step.note) {
    const note = document.createElement('p');
    note.className = 'step__note';
    note.textContent = step.note;
    li.append(note);
  }

  return li;
}

/** Readable name for a field, for use inside error messages. */
function fieldLabel(el, form) {
  const tied = el.id ? form.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
  const text = tied?.textContent || el.getAttribute('aria-label') || el.name;
  // Drop a trailing unit hint so "Mass (g)" reads as "Mass" mid-sentence.
  return text.trim().replace(/\s*\([^)]*\)\s*$/, '');
}

function readValues(form) {
  const values = {};

  for (const el of form.elements) {
    if (!el.name || el.disabled) continue;

    if (el.type === 'checkbox') {
      values[el.name] = el.checked;
      continue;
    }

    if (el.type === 'radio') {
      if (el.checked) values[el.name] = el.value;
      continue;
    }

    const raw = typeof el.value === 'string' ? el.value.trim() : '';

    if (el.type === 'number') {
      if (raw === '') {
        values[el.name] = null;
        continue;
      }

      const parsed = Number(raw);
      // A number input still accepts things like 1e999, which parse to
      // Infinity and would otherwise poison every calculation downstream.
      if (!Number.isFinite(parsed)) {
        throw new CalcError(
          `"${raw}" is too large or not a number this can work with — check the ${fieldLabel(el, form)} box.`
        );
      }

      values[el.name] = parsed;
    } else {
      values[el.name] = raw;
    }
  }

  return values;
}

/**
 * Last line of defence: a solver should never hand back a blank answer or one
 * carrying NaN/Infinity. If it does, say so rather than rendering it.
 */
function assertUsable(result) {
  const answer =
    result && typeof result.answer === 'string' ? result.answer.trim() : '';

  if (!answer || /NaN|Infinity|undefined|—/.test(answer)) {
    throw new CalcError(
      'Those numbers did not produce a usable answer. Check that each box holds a sensible value.'
    );
  }
}

export function setupCalculator(config) {
  const form = document.querySelector(config.form);
  if (!form) return;

  const root = form.closest('[data-calc]') || document;
  const solutionEl = root.querySelector('[data-solution]');
  const errorEl = root.querySelector('[data-error]');
  const answerLabelEl = root.querySelector('[data-answer-label]');
  const answerValueEl = root.querySelector('[data-answer-value]');
  const answerNoteEl = root.querySelector('[data-answer-note]');
  const stepsEl = root.querySelector('[data-steps]');
  const extraEl = root.querySelector('[data-extra]');

  let hasSolved = false;

  function clear() {
    if (solutionEl) solutionEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
  }

  function showError(message) {
    if (solutionEl) solutionEl.hidden = true;
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function render(result) {
    if (errorEl) errorEl.hidden = true;

    if (answerLabelEl) {
      answerLabelEl.textContent = result.answerLabel || 'Answer';
    }
    if (answerValueEl) {
      answerValueEl.textContent = result.answer ?? '—';
    }
    if (answerNoteEl) {
      answerNoteEl.textContent = result.answerNote || '';
      answerNoteEl.hidden = !result.answerNote;
    }

    if (stepsEl) {
      stepsEl.replaceChildren(...(result.steps || []).map(buildStep));
    }

    if (extraEl) {
      extraEl.replaceChildren();
      if (result.table) {
        extraEl.append(buildTable(result.table.headers, result.table.rows));
      }
    }

    if (solutionEl) solutionEl.hidden = false;
  }

  function run({ loud }) {
    let result;
    try {
      result = config.solve(readValues(form), form);
      assertUsable(result);
    } catch (error) {
      if (error instanceof CalcError) {
        // While typing, stay quiet about incomplete input.
        if (loud) showError(error.message);
        else clear();
        return;
      }
      throw error;
    }

    render(result);
    hasSolved = true;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run({ loud: true });
  });

  form.addEventListener('input', () => {
    if (hasSolved) run({ loud: false });
  });

  form.addEventListener('change', () => {
    if (hasSolved) run({ loud: false });
  });

  form.addEventListener('reset', () => {
    hasSolved = false;
    // Reset repopulates fields after this event, so read on the next tick.
    window.setTimeout(clear, 0);
  });

  // Preset example problems: <button data-example='{"field":"value"}'>
  for (const button of root.querySelectorAll('[data-example]')) {
    button.addEventListener('click', () => {
      let preset;
      try {
        preset = JSON.parse(button.dataset.example);
      } catch {
        return;
      }

      for (const [name, value] of Object.entries(preset)) {
        const field = form.elements.namedItem(name);
        if (!field) continue;
        if (field.type === 'checkbox') field.checked = Boolean(value);
        else field.value = String(value);
      }

      if (typeof config.onPreset === 'function') config.onPreset(preset, form);
      run({ loud: true });
      solutionEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  if (config.solveOnLoad) run({ loud: false });

  return { run: () => run({ loud: true }), clear };
}

/**
 * Pill-style mode switcher. Buttons carry `data-mode="x"`, panels carry
 * `data-mode-panel="x"`. The active mode lives in the DOM; the returned
 * `activate(mode)` lets a caller switch modes programmatically.
 */
export function setupModes(onChange) {
  const buttons = Array.from(document.querySelectorAll('[data-mode]'));
  const panels = Array.from(document.querySelectorAll('[data-mode-panel]'));
  if (!buttons.length) return;

  function activate(mode) {
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    }
    for (const panel of panels) {
      panel.hidden = panel.dataset.modePanel !== mode;
    }
    if (typeof onChange === 'function') onChange(mode);
  }

  for (const button of buttons) {
    button.addEventListener('click', () => activate(button.dataset.mode));
  }

  const initial =
    buttons.find((b) => b.getAttribute('aria-pressed') === 'true') || buttons[0];
  activate(initial.dataset.mode);

  return activate;
}

/**
 * Draw a dimensional-analysis chain: a leading quantity followed by conversion
 * factors rendered as fractions. Units flagged `canceled` are struck through
 * so the reader can see what disappears.
 *
 *   start   { value, unit, canceled? }
 *   factors [{ num: { value, unit, canceled? }, den: { ... } }]
 */
export function buildChain(start, factors = []) {
  const chain = document.createElement('div');
  chain.className = 'chain';

  const term = (part) => {
    const frag = document.createDocumentFragment();

    // Trimmed because the flex gap provides the spacing.
    const value = part.value === undefined || part.value === null ? '' : String(part.value).trim();
    if (value !== '') {
      frag.append(document.createTextNode(value));
    }

    if (part.unit) {
      const span = document.createElement('span');
      span.textContent = part.unit;
      if (part.canceled) span.className = 'canceled';
      frag.append(span);
    }

    return frag;
  };

  const first = document.createElement('div');
  first.className = 'chain__single';
  first.append(term(start));
  chain.append(first);

  for (const factor of factors) {
    const op = document.createElement('div');
    op.className = 'chain__op';
    op.textContent = '×';
    chain.append(op);

    const frac = document.createElement('div');
    frac.className = 'chain__frac';

    const num = document.createElement('div');
    num.className = 'chain__num';
    num.append(term(factor.num));

    const bar = document.createElement('div');
    bar.className = 'chain__bar';

    const den = document.createElement('div');
    den.className = 'chain__den';
    den.append(term(factor.den));

    frac.append(num, bar, den);
    chain.append(frac);
  }

  return chain;
}

/** Build a simple results table as a DOM node (no innerHTML). */
export function buildTable(headers, rows) {
  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');

  headers.forEach((header, index) => {
    const th = document.createElement('th');
    th.textContent = typeof header === 'string' ? header : header.label;
    if (typeof header !== 'string' && header.numeric) th.className = 'num';
    else if (index > 0) th.className = 'num';
    headRow.append(th);
  });

  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement('tbody');
  for (const row of rows) {
    const tr = document.createElement('tr');
    row.forEach((cell, index) => {
      const td = document.createElement('td');
      td.textContent = cell;
      if (index > 0) td.className = 'num';
      tr.append(td);
    });
    tbody.append(tr);
  }

  table.append(tbody);
  wrap.append(table);
  return wrap;
}
