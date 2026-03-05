// ShowTails Pedigree Builder JS
// Supports: data-field, data-chain (comma separated), <img> + SVG <image>
// Adds: SVG multiline support for values containing \n (e.g., from %0A in URL)

window.addEventListener('DOMContentLoaded', () => {
  // Decode URL param and clean HTML entities
  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(name) || '';
    const urlDecoded = decodeURIComponent(raw.replace(/\+/g, ' '));

    // Decode any HTML entities (like &amp; → &)
    const ta = document.createElement('textarea');
    ta.innerHTML = urlDecoded;
    return ta.value;
  }

  function isInSVG(el) {
    return el.closest('svg') !== null;
  }

  // ✅ Render multiline SVG text using <tspan> (SVG <text> ignores \n)
  function setSvgMultilineText(textEl, raw) {
    if (!textEl) return;

    // URLSearchParams already decoded %0A into "\n"
    // This also supports literal "\n" sequences if they ever appear
    const lines = String(raw || '').replace(/\\n/g, '\n').split('\n');

    // Clear existing content
    while (textEl.firstChild) textEl.removeChild(textEl.firstChild);

    // Keep the same x, and stack tspans down
    const x = textEl.getAttribute('x') || '0';
    const lineHeight = 14; // adjust if you want tighter/looser line spacing

    lines.forEach((line, i) => {
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.setAttribute('x', x);
      tspan.setAttribute('dy', i === 0 ? '0' : String(lineHeight));
      tspan.textContent = line;
      textEl.appendChild(tspan);
    });
  }

  // --- Handle single fields ---
  document.querySelectorAll('[data-field]').forEach(el => {
    const key = el.getAttribute('data-field');
    const value = getParam(key);
    if (!value) return;

    // Images
    if (el.tagName === 'IMG') {
      el.src = value;
      return;
    }
    if (el.tagName === 'IMAGE') {
      el.setAttribute('href', value);
      el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', value);
      return;
    }

    // Text
    if (isInSVG(el)) {
      // ✅ If the value includes a newline, render as tspans so it shows as multiple lines
      if (value.includes('\n')) {
        setSvgMultilineText(el, value);
      } else {
        el.textContent = value;
      }
    } else {
      el.textContent = value;
    }
  });

  // --- Handle chained fields (e.g. data-chain="city,state,zip") ---
  document.querySelectorAll('[data-chain]').forEach(el => {
    const keys = el.getAttribute('data-chain').split(',').map(s => s.trim()).filter(Boolean);
    const parts = keys.map(k => getParam(k)).filter(v => v && v.length);
    if (!parts.length) return;

    const joined = parts.join(' ');

    if (isInSVG(el)) {
      // ✅ If joined contains line breaks, render multiline SVG
      if (joined.includes('\n')) {
        setSvgMultilineText(el, joined);
      } else {
        // Safer to use textContent (no HTML injection concerns)
        el.textContent = joined;
      }
    } else {
      el.textContent = joined;
    }
  });
});
