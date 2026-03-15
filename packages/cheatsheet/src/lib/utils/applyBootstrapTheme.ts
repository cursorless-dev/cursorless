export function applyBootstrapTheme() {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme() {
    document.documentElement.setAttribute(
      "data-bs-theme",
      media.matches ? "dark" : "light",
    );
  }

  applyTheme();

  media.addEventListener("change", applyTheme);

  return () => {
    media.removeEventListener("change", applyTheme);
  };
}
