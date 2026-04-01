# chrome-dark-tools

A Chrome DevTools console script that emulates the **Dark Reader** browser extension — turning any webpage into dark mode without needing to install an extension.

Useful for accessibility / photosensitivity in environments where Chrome extensions are not permitted.

---

## Usage

1. Open Chrome DevTools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`).
2. Click the **Console** tab.
3. Copy the entire contents of [`dark-mode.js`](./dark-mode.js).
4. Paste it into the console prompt and press **Enter**.

Dark mode is now active. A small floating panel appears in the bottom-right corner of the page with **Brightness** and **Contrast** sliders so you can tune the appearance to your liking.

### Toggling off

Run the script a second time **or** click the **✕** button on the floating panel.

You can also call `_darkModeRemove()` directly in the console at any time.

---

## How it works

| Technique | Purpose |
|-----------|---------|
| `filter: invert(100%) hue-rotate(180deg)` applied to `<html>` | Converts light backgrounds to dark and dark text to light while keeping hues natural. |
| Counter-inversion on `img`, `video`, `canvas`, `iframe`, `svg`, … | Restores media and embedded content to their original colors so photos and videos look correct. |
| `MutationObserver` on `document.documentElement` | Re-injects the stylesheet if a JavaScript framework removes `<head>` or `<body>` (e.g. single-page apps navigating between routes). |
| Floating control panel | Lets you adjust brightness (50 – 120 %) and contrast (50 – 120 %) live. |

---

## Parameters

| Slider | Default | Range | Effect |
|--------|---------|-------|--------|
| Brightness | 90 % | 50 – 120 % | Dims or brightens the overall page. |
| Contrast | 90 % | 50 – 120 % | Increases or decreases color contrast. |

---

## Limitations

* Some sites use `will-change`, hardware-accelerated layers, or strict Content-Security-Policy headers that may prevent CSS filters from applying to every element. The script handles the common cases but cannot guarantee perfect results on every site.
* The script operates on the top-level browsing context. Content inside cross-origin `<iframe>` elements cannot be styled due to browser security restrictions.
