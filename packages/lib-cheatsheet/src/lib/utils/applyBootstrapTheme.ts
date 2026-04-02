export function applyBootstrapTheme() {
  if (typeof window === "undefined" || window.matchMedia == null) {
    return () => {};
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme() {
    document.documentElement.dataset.bsTheme = media.matches ? "dark" : "light";
  }

  applyTheme();

  media.addEventListener("change", applyTheme);

  return () => {
    media.removeEventListener("change", applyTheme);
  };
}
