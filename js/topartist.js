// Helper function do formatowania liczb
function numberFormat(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

let allArtists = []; 
let displayedArtists = 0;
const artistsPerPage = 10;
let lastViewMode = window.innerWidth <= 767 ? "mobile" : "desktop"; // Tryb początkowy
let currentSort = "listeners"; 

async function loadTopArtists() {
    try {
        const response = await fetch('https://mytopspotify.io/spotify-top-artists.json');
        if (!response.ok) throw new Error(`Błąd pobierania danych: ${response.statusText}`);

        const data = await response.json();
        allArtists = data.data;

        const fullDate = data.date ? new Date(data.date).toISOString().split("T")[0] : "Brak danych";
        document.getElementById("update-date").textContent = fullDate;

        allArtists.forEach(artist => {
            artist.id = artist.spotifyUrl.split('/')[4]; 
            artist.imageUrl = artist.image || "images/placeholder.png"; 
        });

        sortArtists(currentSort);
        displayTop3Artists();

    } catch (error) {
        console.error('Błąd pobierania danych:', error);
        document.getElementById("update-date").textContent = "Błąd ładowania";
    }
}

function sortArtists(criteria) {
    currentSort = criteria;
    allArtists.sort((a, b) => {
        if (criteria === "listeners") {
            return parseInt(b.listeners.replace(/,/g, '')) - parseInt(a.listeners.replace(/,/g, ''));
        } else if (criteria === "trend") {
            return parseFloat(b.dailyTrend.replace(/,/g, '')) - parseFloat(a.dailyTrend.replace(/,/g, ''));
        }
    });

    displayedArtists = 0;
    document.querySelector("#artists-table tbody").innerHTML = "";
    displayNextArtists();
}

// **Funkcja do sprawdzania widoku (mobilny ↔ desktop)**
function getViewMode() {
    return window.innerWidth <= 767 ? "mobile" : "desktop";
}

// **Główna funkcja do wyświetlania artystów**
function displayNextArtists(reset = false) {
    const isMobile = getViewMode() === "mobile";
    const tableBody = document.querySelector('#artists-table tbody');
    const gridContainer = document.querySelector('#artist-grid');
    const loadMoreBtn = document.getElementById("load-more");

    if (!tableBody || !gridContainer || !loadMoreBtn) return;

    // Jeśli reset = true, czyścimy całą listę i zaczynamy od zera
    if (reset) {
        displayedArtists = 0;
        tableBody.innerHTML = "";
        gridContainer.innerHTML = "";
    }

    
    const nextArtists = allArtists.slice(displayedArtists, displayedArtists + artistsPerPage);

    nextArtists.forEach((artist, index) => {
        const trendValue = parseFloat(artist.dailyTrend.replace(/,/g, ''));
        const trendClass = trendValue >= 0 ? "trend-positive" : "trend-negative";
        const formattedTrend = trendValue >= 0 ? `+${numberFormat(artist.dailyTrend)}` : numberFormat(artist.dailyTrend);

        if (isMobile) {
            // Tworzymy kafelek
            const card = document.createElement('div');
            card.classList.add("artist-card");
            card.innerHTML = `
                <img src="${artist.imageUrl}" alt="${artist.name}">
                <h3>${artist.name}</h3>
                <p class="listeners">${numberFormat(artist.listeners)}(<span class="trend ${trendClass}">${formattedTrend}</span>)</p>
                
            `;
            gridContainer.appendChild(card);
        } else {
            // Tworzymy wiersz tabeli
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="position">${displayedArtists + index + 1}</td>
                <td class="artist-cell">
                    <img src="${artist.imageUrl}" alt="${artist.name}">
                    <span class="artist-name">${artist.name}</span>
                </td>
                <td class="listeners">${numberFormat(artist.listeners)}</td>
                <td class="trend ${trendClass}">${formattedTrend}</td>
            `;
            tableBody.appendChild(row);
        }
    });

    // **zwiększamy licznik wyświetlonych artystów**
    displayedArtists += artistsPerPage;

    // Jeśli nie ma już więcej artystów, ukrywamy przycisk
    if (displayedArtists >= allArtists.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

function initTopArtists() {
    loadTopArtists().then(() => {
        document.getElementById("sort-listeners").addEventListener("click", () => {
            sortArtists("listeners");
            displayNextArtists(true);
        });

        document.getElementById("sort-trend").addEventListener("click", () => {
            sortArtists("trend");
            displayNextArtists(true);
        });

        const loadMoreBtn = document.getElementById("load-more");
        if (loadMoreBtn) {
            // Usuwamy poprzedni event listener przed dodaniem nowego
            loadMoreBtn.removeEventListener("click", loadMoreHandler);
            loadMoreBtn.addEventListener("click", loadMoreHandler);
        }

        displayNextArtists(true);
    });
}

// Definiujemy funkcję obsługującą kliknięcie "load-more"
function loadMoreHandler() {
    displayNextArtists(false);
}


// **Obsługa zmiany rozmiaru ekranu**
window.addEventListener("resize", () => {
    const currentViewMode = getViewMode();
    if (currentViewMode !== lastViewMode) {
        lastViewMode = currentViewMode;
        displayNextArtists(true); // Przeładowujemy listę artystów
    }
});

// **Uruchamiamy kod po załadowaniu strony**
document.addEventListener("DOMContentLoaded", () => {
    initTopArtists();
});



async function displayTop3Artists() {
    const token = localStorage.getItem('spotify_token');
    if (!token) {
        console.warn("Brak tokenu. Zaloguj się do Spotify.");
        return;
    }

    const top3Artists = allArtists.slice(0, 3).sort((a, b) => b.listeners - a.listeners);
    const artistContainers = [
        document.getElementById("top-artist-1"), // ŚRODEK (TOP 1 - najwięcej słuchaczy)
        document.getElementById("top-artist-2"), // LEWA (TOP 2 - drugi w kolejności)
        document.getElementById("top-artist-3")  // PRAWA (TOP 3 - trzeci w kolejności, najniżej)
    ];

    const artistResponses = await Promise.all(
        top3Artists.map(artist => fetch(`https://api.spotify.com/v1/artists/${artist.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()))
    );

    const albumsResponses = await Promise.all(
        top3Artists.map(artist => fetch(`https://api.spotify.com/v1/artists/${artist.id}/albums?limit=1&market=PL`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()))
    );

    const topTracksResponses = await Promise.all(
        top3Artists.map(artist => fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=PL`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()))
    );

    artistResponses.forEach((artistData, i) => {
        const artist = top3Artists[i];
        const latestAlbum = albumsResponses[i]?.items[0] || null;
        const topTrack = topTracksResponses[i]?.tracks[0] || null;

        let spotifyPlayer = topTrack?.id
            ? `<iframe class="spotify-player"
                src="https://open.spotify.com/embed/track/${topTrack.id}"
                width="100%" height="80px" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
            : "<p>Brak odtwarzacza</p>";

        artistContainers[i].innerHTML = `
            <div class="monthly-listeners-container">
                <p>Słuchaczy w miesiącu:</p>
                <p class="monthly-listeners">${numberFormat(artist.listeners)}</p>
            </div>
            <img class="artist-image" src="${artistData.images[0]?.url || 'images/placeholder.png'}" alt="${artist.name}">
            <h3>${artist.name}</h3>
            <div class="artist-info">
                <div class="followers-section">
                <p class="bold-artist-desc">Liczba obserwujących:</p>
                <p class="artist-desc">${numberFormat(artistData.followers.total)}</p>
                </div>
                <div class="followers-section">
                <p class="bold-artist-desc">Ostatni album:</p>
                <p class="artist-desc">${latestAlbum?.name || "Brak danych"}</p>
                </div>
                <div class="followers-section">
                <p class="bold-artist-desc">Najpopularniejszy utwór:</p>
                <p class="artist-desc">${topTrack?.name || "Brak danych"}</p>
                </div>
                
                
            </div>
            ${spotifyPlayer}
        `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTopArtists();
});

function updateSortButtons() {
    document.getElementById("sort-listeners").classList.toggle("active", currentSort === "listeners");
    document.getElementById("sort-trend").classList.toggle("active", currentSort === "trend");
}

function sortArtists(criteria) {
    currentSort = criteria;
    allArtists.sort((a, b) => {
        if (criteria === "listeners") {
            return parseInt(b.listeners.replace(/,/g, '')) - parseInt(a.listeners.replace(/,/g, ''));
        } else if (criteria === "trend") {
            return parseFloat(b.dailyTrend.replace(/,/g, '')) - parseFloat(a.dailyTrend.replace(/,/g, ''));
        }
    });

    // Zaktualizowanie aktywnego przycisku
    updateSortButtons();

    displayedArtists = 0;
    document.querySelector("#artists-table tbody").innerHTML = "";
    displayNextArtists();
}

document.getElementById("sort-listeners").addEventListener("click", () => sortArtists("listeners"));
document.getElementById("sort-trend").addEventListener("click", () => sortArtists("trend"));

