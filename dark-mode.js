/**
 * dark-mode.js
 *
 * Paste this entire script into the Chrome DevTools console (F12 → Console tab)
 * to toggle a Dark Reader-style dark mode on any webpage.
 *
 * Features:
 *  - Inverts page colors and rotates hue so dark backgrounds stay dark-looking
 *  - Re-inverts images, videos, iframes, canvas elements and inline SVGs so
 *    they are not color-distorted
 *  - Watches for dynamically injected content via MutationObserver
 *  - Adds a floating control panel with brightness and contrast sliders
 *  - Calling the script a second time (or clicking the ✕ button) removes all
 *    changes and restores the original page appearance
 */
(function () {
  const STYLE_ID = '__dark_mode_style__';
  const PANEL_ID = '__dark_mode_panel__';
  const OBSERVER_KEY = '__dark_mode_observer__';

  // ── Toggle off if already active ──────────────────────────────────────────
  if (document.getElementById(STYLE_ID)) {
    _darkModeRemove();
    return;
  }

  // ── Default filter values ─────────────────────────────────────────────────
  let brightness = 90;   // % – slightly dimmed for comfort
  let contrast   = 90;   // %

  // Elements that should NOT be color-inverted (media / embedded content)
  const EXCLUDE_SELECTORS = [
    'img',
    'picture',
    'video',
    'canvas',
    'iframe',
    'embed',
    'object',
    'svg',
    '[style*="background-image"]',
  ].join(', ');

  // ── Inject stylesheet ─────────────────────────────────────────────────────
  function buildCSS(br, ct) {
    return `
      html {
        filter: invert(100%) hue-rotate(180deg) brightness(${br}%) contrast(${ct}%) !important;
        background-color: #111 !important;
      }
      img, picture, video, canvas, iframe, embed, object, svg,
      [style*="background-image"] {
        filter: invert(100%) hue-rotate(180deg) !important;
      }
    `.trim();
  }

  function injectStyle(br, ct) {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = buildCSS(br, ct);
  }

  injectStyle(brightness, contrast);

  // ── MutationObserver – keep dynamic content covered ───────────────────────
  // (The CSS selectors above already handle new elements via the cascade,
  //  so the observer is only needed if inline styles on new nodes override
  //  the filter.  We walk newly-added subtrees and re-apply if needed.)
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return; // element nodes only
        // Force re-evaluation of our CSS rule by touching the element.
        // In practice the cascade handles this automatically, but some
        // frameworks replace the entire <head>/<body>, removing our <style>.
        if (!document.getElementById(STYLE_ID)) {
          injectStyle(brightness, contrast);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Store reference so we can disconnect it on teardown
  window[OBSERVER_KEY] = observer;

  // ── Floating control panel ────────────────────────────────────────────────
  function createPanel() {
    const panel = document.createElement('div');
    panel.id = PANEL_ID;

    Object.assign(panel.style, {
      position:        'fixed',
      bottom:          '20px',
      right:           '20px',
      zIndex:          '2147483647',
      background:      '#1e1e1e',
      color:           '#e0e0e0',
      border:          '1px solid #444',
      borderRadius:    '8px',
      padding:         '12px 16px',
      fontFamily:      'system-ui, sans-serif',
      fontSize:        '13px',
      boxShadow:       '0 4px 20px rgba(0,0,0,0.6)',
      minWidth:        '220px',
      // Panel must NOT be color-inverted (it lives in the already-inverted page)
      filter:          'invert(100%) hue-rotate(180deg)',
      userSelect:      'none',
    });

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <strong>🌙 Dark Mode</strong>
        <button id="__dm_close__" title="Disable dark mode"
          style="background:none;border:none;color:#e0e0e0;font-size:16px;cursor:pointer;padding:0 2px;line-height:1;">✕</button>
      </div>
      <label style="display:block;margin-bottom:6px;">
        Brightness&nbsp;<span id="__dm_br_val__">${brightness}</span>%
        <input type="range" id="__dm_br__" min="50" max="120" value="${brightness}"
          style="width:100%;margin-top:3px;">
      </label>
      <label style="display:block;">
        Contrast&nbsp;<span id="__dm_ct_val__">${contrast}</span>%
        <input type="range" id="__dm_ct__" min="50" max="120" value="${contrast}"
          style="width:100%;margin-top:3px;">
      </label>
    `.trim();

    document.body.appendChild(panel);

    document.getElementById('__dm_close__').addEventListener('click', function () {
      _darkModeRemove();
    });

    document.getElementById('__dm_br__').addEventListener('input', function () {
      brightness = parseInt(this.value, 10);
      document.getElementById('__dm_br_val__').textContent = brightness;
      injectStyle(brightness, contrast);
    });

    document.getElementById('__dm_ct__').addEventListener('input', function () {
      contrast = parseInt(this.value, 10);
      document.getElementById('__dm_ct_val__').textContent = contrast;
      injectStyle(brightness, contrast);
    });
  }

  createPanel();

  // ── Teardown helper ───────────────────────────────────────────────────────
  function _darkModeRemove() {
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();

    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();

    const obs = window[OBSERVER_KEY];
    if (obs) {
      obs.disconnect();
      delete window[OBSERVER_KEY];
    }

    console.info('[dark-mode] Dark mode disabled.');
  }

  // Expose globally so advanced users can call _darkModeRemove() from the console
  window._darkModeRemove = _darkModeRemove;

  console.info('[dark-mode] Dark mode enabled. Paste the script again (or click ✕) to disable.');
}());
