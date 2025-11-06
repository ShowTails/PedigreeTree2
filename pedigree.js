// ShowTails Pedigree Builder JS
// Supports: data-field, data-chain (space separated), <img> + SVG <image>

window.addEventListener('DOMContentLoaded', () => {
  // --- Safe parameter fetch that handles & and HTML escaping ---
  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(name) || '';
    return decodeURIComponent(value)
      .replaceAll('+', ' ')
      .replace(/%26/g, '&')
      .replace(/%27/g, "'")
      .replace(/%20/g, ' ')
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // --- Handle single fields ---
  document.querySelectorAll('[data-field]').forEach(el => {
    const key = el.getAttribute('data-field');
    const value = getParam(key);
    if (!value) return;

    // --- Handle image fields ---
    if (el.tagName === 'IMG' || el.tagName === 'IMAGE') {
      el.setAttribute('href', value); // SVG <image>
      el.src = value;                 // Standard <img>
      console.log(`Loaded image for ${key}: ${value}`);
    }

    // --- Handle HTML snippet fields (if Glide sends <img> tags) ---
    else if (key.toLowerCase().includes('html')) {
      el.innerHTML = value;
    }

    // --- Handle normal text fields ---
    else {
      el.textContent = value;
    }
  });

  // --- Handle chained fields (e.g. data-chain="name,breed,color") ---
  document.querySelectorAll('[data-chain]').forEach(el => {
    const keys = el.getAttribute('data-chain').split(',').map(k => k.trim());
    const parts = [];

    keys.forEach(key => {
      const val = getParam(key);
      if (val) parts.push(val);
    });

    if (parts.length > 0) {
      const joined = parts.join(' '); // space-separated
      el.textContent = joined;
    }
  });
});
