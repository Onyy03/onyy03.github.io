const CLIENT_ID = '00315ad01bc34724861b3ba15cde8014';
const REDIRECT_URI = window.location.origin + '/index.html';
const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-top-read user-read-recently-played user-follow-read';

const CODE_VERIFIER_KEY = 'spotify_code_verifier';

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(length = 128) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
        result += charset[values[i] % charset.length];
    }
    return result;
}

function loginSpotify() {
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

    // 🔁 Zapamiętaj obecną stronę, żeby wrócić po logowaniu
    localStorage.setItem("after_login_redirect", window.location.pathname);

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
        const authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${CLIENT_ID}` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&scope=${encodeURIComponent(SCOPES)}` +
            `&code_challenge_method=S256` +
            `&code_challenge=${codeChallenge}` +
            `&show_dialog=true`;

        window.location.href = authUrl;
    });
}


async function exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);

    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Błąd tokenu: ${err.error || response.statusText}`);
    }

    const data = await response.json();
    localStorage.setItem('spotify_token', data.access_token);
    console.log("Token uzyskany:", data.access_token);

    return data.access_token;
}

async function getUserData(token) {
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log("Używam tokenu do /me:", token);

    if (!response.ok) throw new Error("Nie udało się pobrać danych użytkownika.");
    return await response.json();
}

async function handleRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            const token = await exchangeCodeForToken(code);
            const profile = await getUserData(token);
            localStorage.setItem('spotify_user', JSON.stringify(profile));
            console.log("✅ Zalogowano jako:", profile.display_name);
            const redirectPath = localStorage.getItem("after_login_redirect") || 'index.html';
            localStorage.removeItem("after_login_redirect");
            window.location.href = redirectPath;

        } catch (error) {
            console.error("❌ Błąd logowania:", error);
            alert("Błąd logowania: " + error.message);
        }
    }
}

function clearSpotifyTokenAndReload() {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_user');
    localStorage.removeItem(CODE_VERIFIER_KEY);
    sessionStorage.clear();
    window.location.href = "index.html";
}




document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        handleRedirect();
    } else {
        const token = localStorage.getItem("spotify_token");
        if (token) {
            // Opcjonalnie: sprawdzenie czy token nadal działa
            testToken(token).catch(() => {
                showSessionExpiredAndLogout();
            });
        }
    }
});

async function testToken(token) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) throw new Error("Token wygasł");
}

function showSessionExpiredAndLogout() {
    
    clearSpotifyTokenAndReload();
}


function loadLoginPopupComponent() {
    fetch("login_popup.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
            checkTokenOrPopup();
        })
        .catch(err => console.error("Błąd ładowania login_popup:", err));
}

function checkTokenOrPopup() {
    const token = localStorage.getItem("spotify_token");
    if (!token) {
        showLoginPopup();
        return;
    }

    testToken(token).catch(() => {
        showLoginPopup();
    });
}

function showLoginPopup() {
    const popup = document.getElementById("login-popup");
    if (popup) {
        popup.style.display = "flex";
        document.body.style.overflow = "hidden"; // 🔒 Zablokuj scroll
    }

    const loginBtn = document.getElementById("login-popup-btn");
    if (loginBtn) {
        loginBtn.onclick = loginSpotify;
    }

    const closeBtn = document.getElementById("login-popup-close");
    if (closeBtn) {
        closeBtn.onclick = () => {
            popup.style.display = "none";
            document.body.style.overflow = ""; // 🔓 Odblokuj scroll
            window.location.href = "index.html";
        };
    }
}





