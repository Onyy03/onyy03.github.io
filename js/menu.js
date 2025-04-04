// menu.js
document.addEventListener("DOMContentLoaded", function () {
    let isMobileView = null;

    function loadMenu() {
        const isMobile = window.innerWidth <= 767;
        if (isMobileView !== isMobile) {
            isMobileView = isMobile;
            const menuFile = isMobile ? "menu_mobile.html" : "menu.html";

            fetch(menuFile)
                .then(response => response.text())
                .then(data => {
                    document.getElementById("menu-container").innerHTML = data;
                    // Sprawdź, czy `initMenu()` istnieje przed jej wywołaniem
                    if (typeof initMenu === "function") {
                        initMenu();
                    } else {
                        console.error("Błąd: initMenu() nie jest zdefiniowane.");
                    }
                })
                .catch(error => console.error('Błąd ładowania menu:', error));
        }
    }

    loadMenu();
    window.addEventListener('resize', loadMenu);
});
