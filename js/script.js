
// Funkcja wywoływana za każdym razem, gdy menu zostanie wczytane
function initMenu() {
    //Obsługa desktopu (animacja scrolla)
    const menu = document.querySelector('.menu-fixed-container');
    const logo = document.querySelector('.logo-container');

    if (menu && logo) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                menu.style.top = "0px";
                logo.style.opacity = "0"; 
            } else {
                menu.style.top = "96px";
                logo.style.opacity = "1";
            }
        });
    }

    // Obsługa mobilnego off-screen menu

    const hamMenu = document.querySelector('.ham-menu');
    const offScreenMenu = document.querySelector('.off-screen-menu');
    const body = document.body;

    if (hamMenu && offScreenMenu) {
        hamMenu.addEventListener('click', function() {
            // Animacja hamburgera (bars -> X)
            hamMenu.classList.toggle('active');
            // Wysuwanie / chowanie menu
            offScreenMenu.classList.toggle('active');
            body.classList.toggle('no-scroll');
        });
    }
}




document.addEventListener("DOMContentLoaded", function () {
    const allFeatures = document.querySelectorAll(".feature, .feature2");

    // Sprawdzamy szerokość ekranu
    if (window.innerWidth > 767) {
        // Jeśli mamy desktop/tablet – Intersection Observera
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                } else {
                    entry.target.classList.remove("visible");
                }
            });
        }, { threshold: 0.75 });

        allFeatures.forEach(feature => observer.observe(feature));

    } else {
        // Na mniejszych ekranach (poniżej 768px) pomijamy Observer
        // i od razu nadajemy klasę "visible"
        allFeatures.forEach(feature => {
            feature.classList.add("visible");
        });
    }
});


document.querySelectorAll(".service-button, .service-button2").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) {
        window.location.href = target;
      }
    });
  });
  

document.addEventListener("DOMContentLoaded", () => {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/webp";
    favicon.href = "images/cstsfavicon.webp"; 
    document.head.appendChild(favicon);
  });
  
