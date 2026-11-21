(() => {
  try {
    const state = JSON.parse(localStorage.getItem("sh84-a11y") || "{}");
    const root = document.documentElement;
    if (state.font === 1 || state.font === 2) root.dataset.a11yFont = String(state.font);
    if (["contrast", "dark", "yellow"].includes(state.scheme)) root.dataset.a11yScheme = state.scheme;
    if (state.images === "off" || state.images === "gray") root.dataset.a11yImages = state.images;
    if (state.spacing === "on") root.dataset.a11ySpacing = "on";
  } catch (error) {}
})();
