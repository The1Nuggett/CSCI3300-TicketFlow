(function () {
    const STORAGE_KEY = "ticketflow_theme";
    const root = document.documentElement;

    function getSavedTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
        return "light";
    }

    function applyTheme(theme) {
        root.dataset.theme = theme;
        localStorage.setItem(STORAGE_KEY, theme);

        const toggleButton = document.querySelector("[data-theme-toggle]");
        if (toggleButton) {
            const isDark = theme === "dark";
            toggleButton.textContent = isDark ? "Light Mode" : "Dark Mode";
            toggleButton.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
        }
    }

    function createToggle() {
        const navGroup = document.createElement("nav");
        navGroup.className = "quick-nav";
        navGroup.setAttribute("aria-label", "Quick navigation");

        const homeLink = document.createElement("a");
        homeLink.className = "quick-nav-button";
        homeLink.href = "index.html";
        homeLink.textContent = "Home";
        homeLink.setAttribute("aria-label", "Return to login page");

        navGroup.append(homeLink);
        document.body.appendChild(navGroup);

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "theme-toggle";
        toggleButton.dataset.themeToggle = "";
        toggleButton.addEventListener("click", () => {
            applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
        });
        document.body.appendChild(toggleButton);
        applyTheme(root.dataset.theme || getSavedTheme());
    }

    applyTheme(getSavedTheme());

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createToggle);
    } else {
        createToggle();
    }
})();
