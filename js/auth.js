document.addEventListener("DOMContentLoaded", () => {
    fetch("login_popup.html")
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML("beforeend", html);
        checkTokenOrPopup();
      })
      .catch(err => console.error("Błąd ładowania login_popup:", err));
  });
  