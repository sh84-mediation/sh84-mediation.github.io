(() => {
  "use strict";

  const KEY = "sh84-a11y";
  const defaults = { font: 0, scheme: "normal", images: "on", spacing: "off" };
  const panel = document.getElementById("a11y-panel");
  const toggle = document.querySelector(".a11y-toggle");
  if (!panel || !toggle) return;

  const root = document.documentElement;
  const options = Array.from(panel.querySelectorAll("[data-a11y-setting]"));
  const closeButton = panel.querySelector(".a11y-panel__close");
  const resetButton = panel.querySelector("[data-a11y-reset]");

  const read = () => {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
    } catch (error) {
      return { ...defaults };
    }
  };
  let state = read();

  const apply = () => {
    if (state.font === 1 || state.font === 2) root.dataset.a11yFont = String(state.font);
    else delete root.dataset.a11yFont;

    if (["contrast", "dark", "yellow"].includes(state.scheme)) root.dataset.a11yScheme = state.scheme;
    else delete root.dataset.a11yScheme;

    if (state.images === "off" || state.images === "gray") root.dataset.a11yImages = state.images;
    else delete root.dataset.a11yImages;

    if (state.spacing === "on") root.dataset.a11ySpacing = "on";
    else delete root.dataset.a11ySpacing;

    options.forEach((option) => {
      const value = option.dataset.a11yValue;
      const expected = /^[0-2]$/.test(value) ? Number(value) : value;
      option.setAttribute("aria-pressed", String(state[option.dataset.a11ySetting] === expected));
    });
  };

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {}
  };

  const setPanel = (open, restoreFocus = false) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      panel.scrollTop = 0;
      panel.focus({ preventScroll: true });
    } else if (restoreFocus) {
      toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener("click", () => setPanel(panel.hidden));

  closeButton?.addEventListener("click", () => setPanel(false, true));

  panel.addEventListener("click", (event) => {
    if (event.target.closest("[data-a11y-reset]")) {
      state = { ...defaults };
      apply();
      save();
      setPanel(false, true);
      return;
    }

    const option = event.target.closest("[data-a11y-setting]");
    if (!option) return;
    const key = option.dataset.a11ySetting;
    const value = option.dataset.a11yValue;
    state[key] = /^[0-2]$/.test(value) ? Number(value) : value;
    apply();
    save();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || panel.hidden) return;
    event.preventDefault();
    setPanel(false, true);
  });

  apply();
})();
