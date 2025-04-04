// analiza.js (pełna analiza playlist, artystów, najczęstszy utwór)

const token = localStorage.getItem("spotify_token");


async function fetchSpotify(endpoint) {
    const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Błąd Spotify API: ${res.status}`);
    return res.json();
}

async function verifyMinimumArtistsRequired() {
    try {
      const data = await fetchSpotify("me/top/artists?limit=12&time_range=short_term");
      
      if (!data.items || data.items.length < 12) {
        alert("Za mało artystów do analizy.");
        window.location.href = "index.html";
      }
    } catch {
      console.error("Błąd podczas sprawdzania liczby artystów:", err);
    }
  }
  

async function showUserProfile() {
    const user = await fetchSpotify("me");
    console.log("👤 Użytkownik:");
    console.log("Nazwa:", user.display_name);
    console.log("Email:", user.email);
    console.log("Kraj:", user.country);
    console.log("ID konta:", user.id);
    console.log("Obrazek:", user.images?.[0]?.url || "brak");
}

async function showRecentlyPlayed() {
    const data = await fetchSpotify("me/player/recently-played?limit=50");
    console.log("\n🎶 Ostatnio słuchane utwory:");

    let totalMs = 0;
    const trackCount = {};

    data.items.forEach(item => {
        const track = item.track;
        const artistNames = track.artists.map(a => a.name).join(", ");
        const date = new Date(item.played_at);
        const formatted = `${date.toLocaleDateString('pl-PL')}, ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
        console.log(`• ${track.name} – ${artistNames} (${formatted})`);

        totalMs += track.duration_ms;

        const key = `${track.name} – ${artistNames}`;
        trackCount[key] = (trackCount[key] || 0) + 1;
    });

    const totalMin = Math.round(totalMs / 60000);
    console.log(`🕒 Łączny czas trwania tych utworów: ${totalMin} minut`);

    const mostPlayed = Object.entries(trackCount).sort((a, b) => b[1] - a[1])[0];
    if (mostPlayed) {
        console.log(`🔥 Najczęściej odtwarzany utwór: ${mostPlayed[0]} (${mostPlayed[1]} razy)`);
    }
}

async function showTopArtists() {
    const data = await fetchSpotify("me/top/artists?limit=12&time_range=short_term");
    console.log("\n🏆 Top artyści (ostatni tydzień):");

    const genreMap = {};

    data.items.forEach((artist, index) => {
        console.log(`${index + 1}. ${artist.name}`);
        artist.genres.forEach(genre => {
            genreMap[genre] = (genreMap[genre] || 0) + 1;
        });
    });

    const sortedGenres = Object.entries(genreMap).sort((a, b) => b[1] - a[1]);
    console.log("\n🎼 Dominujące gatunki (top artyści):");
    sortedGenres.slice(0, 5).forEach(([genre, count], i) => {
        console.log(`${i + 1}. ${genre} (${count} artystów)`);
    });
}

async function showTopTracks() {
    const data = await fetchSpotify("me/top/tracks?limit=10&time_range=short_term");
    console.log("\n🎵 Top utwory (ostatni tydzień):");

    data.items.forEach((track, index) => {
        const artists = track.artists.map(a => a.name).join(", ");
        console.log(`${index + 1}. ${track.name} – ${artists}`);
    });
}



async function showFollowedArtists() {
    console.log("▶️ start showFollowedArtists()");

    const data = await fetchSpotify("me/following?type=artist&limit=1");
    const count = data.artists.total;
    console.log("\n👥 Obserwowani artyści:");
    console.log(`• Obserwujesz ${count} artystów na Spotify`);
}

async function showTopUserArtists() {
    const container = document.getElementById("top-user-artists");
    if (!container) return;

    try {
        const data = await fetchSpotify("me/top/artists?limit=12&time_range=short_term");
        container.innerHTML = ""; // Czyść przed dodaniem

        data.items.forEach(artist => {
            const card = document.createElement("div");
            card.className = "top-artist"; // styl taki jak na top_artysci.html

            card.innerHTML = `
                <img src="${artist.images[0]?.url || 'placeholder.jpg'}" alt="${artist.name}">
                <h3>${artist.name}</h3>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Błąd pobierania ulubionych artystów:", error);
    }
}


async function showTopUserTracks() {
    const container = document.getElementById("top-user-tracks");
    if (!container) return;

    try {
        const data = await fetchSpotify("me/top/tracks?limit=10&time_range=short_term");
        container.innerHTML = "";

        data.items.forEach(track => {
            const artists = track.artists.map(a => a.name).join(", ");
            const embedUrl = `https://open.spotify.com/embed/track/${track.id}`;

            const card = document.createElement("div");
            card.className = "track-card";

            card.innerHTML = `
                <img src="${track.album.images[0]?.url}" alt="${track.name}">
                <h3 class="track-title">${track.name}</h3>
                <p class="track-artist">${artists}</p>
                
                <iframe
                    src="${embedUrl}"
                    width="100%"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy">
                </iframe>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Błąd ładowania top utworów:", error);
    }
}

async function showSummaryAndGenres() {
    // Liczba obserwowanych artystów
    const followed = await fetchSpotify("me/following?type=artist&limit=1");
    document.getElementById("followed-artists-count").innerText = 
      `${followed.artists.total}`;

    // Ostatnio słuchane
    const recent = await fetchSpotify("me/player/recently-played?limit=50");
    const trackCount = {};
    let totalDuration = 0;

    recent.items.forEach(item => {
        const track = item.track;
        const artists = track.artists.map(a => a.name).join(", ");
        const key = `${track.name} – ${artists}`;
        totalDuration += track.duration_ms;
        trackCount[key] = (trackCount[key] || 0) + 1;
    });

    // Najczęściej słuchany
    const mostPlayed = Object.entries(trackCount).sort((a, b) => b[1] - a[1])[0];
    const fullTitle = mostPlayed[0];
    const titleOnly = fullTitle.split("–")[0].trim();

    document.getElementById("most-played-track").innerText =
    `${titleOnly} - ${mostPlayed[1]} razy`;


    // Łączny czas słuchania
    const minutes = Math.round(totalDuration / 60000);
    document.getElementById("listening-time").innerText = 
      `${minutes} minut`;

    // Gatunki – top artyści
    const topArtists = await fetchSpotify("me/top/artists?limit=20&time_range=short_term");
    const genreMap = {};

    topArtists.items.forEach(artist => {
        artist.genres.forEach(genre => {
            genreMap[genre] = (genreMap[genre] || 0) + 1;
        });
    });

    const sortedGenres = Object.entries(genreMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

    const ctx = document.getElementById("userGenresChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: sortedGenres.map(g => g[0]),
            datasets: [{
                label: "Liczba artystów",
                data: sortedGenres.map(g => g[1]),
                backgroundColor: "#1ED65F"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: "white" },
                    grid: { color: "#444" }
                },
                x: {
                    ticks: { color: "white" },
                    grid: { color: "#444" }
                }
            }
        }
    });

    // Przycisk eksportu
    document.getElementById("export-excel").addEventListener("click", () => {
        const rows = [["Nazwa utworu", "Wykonawca", "Data słuchania"]];
        recent.items.forEach(item => {
            const track = item.track;
            const name = track.name;
            const artists = track.artists.map(a => a.name).join(", ");
            const date = new Date(item.played_at).toLocaleString("pl-PL");
            rows.push([name, artists, date]);
        });

        const csvContent = rows.map(r => r.join(";")).join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "ostatnio_słuchane.csv";
        link.click();
    });
}




window.addEventListener("DOMContentLoaded", async () => {
    try {
        await verifyMinimumArtistsRequired();
        await showUserProfile();
        await showRecentlyPlayed();
        await showTopArtists();
        await showTopTracks();
        
        await showFollowedArtists();
        await showTopUserArtists();
        await showTopUserTracks();
        await showSummaryAndGenres();


    } catch (err) {
        console.error("❌ Błąd w analizie:", err);
    }
});
