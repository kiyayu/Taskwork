// frontend/public/theme-init.js
try {
  var s = JSON.parse(localStorage.getItem("preferences") || "{}").state || {};
  var dark = s.theme === "dark" ||
    ((!s.theme || s.theme === "system") && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
} catch (e) {}