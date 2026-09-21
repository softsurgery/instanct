(function applyDocumentTheme() {
  try {
    var storageKey = "vite-ui-theme";
    var stored = localStorage.getItem(storageKey);
    var theme =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    var resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    var root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  } catch (e) {}
})();
