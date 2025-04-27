
// Pomocnicza funkcja do opóźnienia zapytań (rate limiting)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Pobiera playlisty użytkownika
async function fetchUserPlaylists(token) {
    const playlists = [];
    let url = `https://api.spotify.com/v1/me/playlists?limit=50`;

    while (url) {
        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Błąd: ${error.error.message}`);
        }

        const data = await response.json();
        playlists.push(...data.items);
        url = data.next;

        await delay(500); // Opóźnienie
    }

    if (!playlists || playlists.length === 0) {
        alert("Nie masz żadnych playlist!");
        window.location.href = "index.html";
      }

    return playlists;
}

// Pobiera utwory z playlisty
async function fetchPlaylistTracks(token, playlistId) {
    const tracks = [];
    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

    while (url) {
        const response = await fetch(url, {
            headers: {'Authorization': 'Bearer ' + token}
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Błąd: ${error.error.message}`);
        }

        const data = await response.json();
        tracks.push(...data.items);
        url = data.next;

        await delay(500);
    }

    return tracks;
}


async function loadUserPlaylists() {
    const token = localStorage.getItem('spotify_token');
    

    const playlists = await fetchUserPlaylists(token);
    const selector = document.getElementById('playlist-selector');
    const selectorText = document.getElementById('playlist-selector-text');
    const optionsContainer = document.getElementById('playlist-options');
    selectorText.textContent = 'Wybierz playlistę';

    optionsContainer.innerHTML = ''; 

    playlists.forEach(playlist => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'playlist-option';
        optionDiv.textContent = playlist.name;
        optionDiv.dataset.id = playlist.id;

        optionDiv.onclick = () => {
            selectorText.textContent = playlist.name;
            selector.dataset.id = playlist.id;
            optionsContainer.style.display = 'none';
        };

        optionsContainer.appendChild(optionDiv);
    });

    selector.onclick = () => {
        optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
    };

    document.addEventListener('click', (e) => {
        if (!selector.contains(e.target) && !optionsContainer.contains(e.target)) {
            optionsContainer.style.display = 'none';
        }
    });

    document.getElementById('analyze-playlist-btn').onclick = () => {
        analyzePlaylist(token, selector.dataset.id);
    };

    document.addEventListener('click', (e) => {
        if (!selector.contains(e.target) && !optionsContainer.contains(e.target)) {
            optionsContainer.style.display = 'none';
        }
    });
}



// Analiza wybranej playlisty
let isLoading = false; // Flaga kontrolująca wielokrotne kliknięcia

async function analyzePlaylist(token, playlistId) {
    if (isLoading) return;
    if (!playlistId) {
        alert("Najpierw wybierz playlistę!");
        return;
    }

    isLoading = true;

    const trackList = document.getElementById("track-list");
    const trackDetails = document.getElementById("track-details");
    const loader = document.getElementById("track-loader");

    trackList.innerHTML = '';
    trackList.appendChild(loader);
    loader.style.display = 'block';
    loader.classList.add('loader-active');

    trackDetails.innerHTML = '<span class="placeholder-text">Wybierz Utwór</span>';

    try {
        const tracks = await fetchPlaylistTracks(token, playlistId);

        // Wstawienie utworów do listy
        

        // Analiza artystów i gatunków z cache i opóźnieniem
        const artistCount = {};
        const genreCount = {};
        const genreCache = {};

        for (const item of tracks) {
            const track = item.track;
            if (!track) continue;

            // Zliczanie wszystkich artystów
            track.artists.forEach(artist => {
                const name = artist.name;
                artistCount[name] = (artistCount[name] || 0) + 1;
            });

            // Gatunki (tylko główny artysta, z cache)
            const mainArtistId = track.artists[0]?.id;
            if (mainArtistId) {
                if (!genreCache[mainArtistId]) {
                    await new Promise(resolve => setTimeout(resolve, 150));
                    try {
                        const genres = await fetchArtistGenres(token, mainArtistId);
                        genreCache[mainArtistId] = genres;
                    } catch (e) {
                        console.warn("Nie udało się pobrać gatunku.");
                        genreCache[mainArtistId] = [];
                    }
                }

                genreCache[mainArtistId].forEach(genre => {
                    genreCount[genre] = (genreCount[genre] || 0) + 1;
                });
            }
        }

        // Najczęstszy artysta
        let topArtist = null;
        let topCount = 0;
        for (const [artist, count] of Object.entries(artistCount)) {
            if (count > topCount) {
                topArtist = artist;
                topCount = count;
            }
        }

        //po analizie – pokazujemy utwory
        tracks.forEach((item) => {
            const track = item.track;
            const trackDiv = document.createElement("div");
            trackDiv.className = "track-item";
            trackDiv.textContent = track.name;

            trackDiv.onclick = () => displayTrackDetails(track);

            trackList.appendChild(trackDiv); 
        });


        // Wyniki w konsoli
        console.log("Najczęściej pojawiający się artysta:", topArtist, `(${topCount}x)`);
        console.log("Liczba wystąpień artystów:", artistCount);
        console.log("Gatunki na playliście:", genreCount);
        const artistEntry = tracks
            .map(item => item.track?.artists)
            .flat()
            .find(artist => artist.name === topArtist);

        if (artistEntry) {
            const artistId = artistEntry.id;
            try {
                const artistData = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => res.json());

                const imageUrl = artistData.images?.[0]?.url || "images/placeholder.png";

                const section = document.getElementById("playlist-top-artist");
                const container = document.getElementById("playlist-top-artist-card");

                container.innerHTML = `
                    <img src="${imageUrl}" alt="${topArtist}" />
                    <div class="playlist-artist-name">${topArtist}</div>
                    <div class="playlist-artist-count">${topCount} RAZY</div>
                    `;


                section.style.display = "flex";
            } catch (e) {
                console.warn("Nie udało się pobrać danych artysty:", e);
            }
        }

        // Top gatunki 
        const sortedGenres = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1]);

        const topGenres = sortedGenres.slice(0, 8);
        const others = sortedGenres.slice(8);
        const otherSum = others.reduce((sum, [, count]) => sum + count, 0);

        if (otherSum > 0) {
            topGenres.push(['Inne', otherSum]);
        }

        const genreLabels = topGenres.map(g => g[0]);
        const genreValues = topGenres.map(g => g[1]);
        const total = genreValues.reduce((sum, val) => sum + val, 0);

        // kolory – pierwszy zielony, reszta losowe
        const genreColors = genreLabels.map((_, i) => {
        if (i === 0) return '#1ED760'; // Spotify green
        const hue = (i * 37) % 360; // rozrzucone kolory HSL
        return `hsl(${hue}, 70%, 60%)`;
        });


        //Pokazujemy sekcję
        document.getElementById("playlist-genres-section").style.display = "flex";

        //Usuń poprzedni wykres jeśli istnieje
        if (window.genreChartInstance) {
        window.genreChartInstance.destroy();
        }

        const ctx = document.getElementById('genresChart').getContext('2d');
        window.genreChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: genreLabels,
            datasets: [{
            data: genreValues,
            backgroundColor: genreColors,
              
            borderColor: '#222',
            borderWidth: 1
            }]
        },
        options: {
            plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#ffffff',
                    font: {
                    size: 14,
                    weight: 'bold'
                    },
                    padding: 16,
                    boxWidth: 18,
                    boxHeight: 18
                }
            },
            datalabels: {
                color: '#fff',
                font: { weight: 'bold' },
                formatter: (value, context) => {
                const percentage = ((value / total) * 100).toFixed(1);
                return `${percentage}%`;
                }
            },
            tooltip: {
                callbacks: {
                label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percent = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} utw. (${percent}%)`;
                }
                }
            }
            }
        },
        plugins: [ChartDataLabels]
        });

    } catch (error) {
        console.error("Błąd podczas pobierania utworów:", error);
        alert("Nie udało się pobrać utworów. Spróbuj ponownie.");
    } finally {
        loader.style.display = 'none';
        loader.classList.remove('loader-active');
        isLoading = false; // ZAWSZE reset flagi
    }
}



// Funkcja pomocnicza do pobrania gatunków artysty
async function fetchArtistGenres(token, artistId) {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
        console.error("Nie udało się pobrać gatunku.");
        return ['Rap/Hip-hop']; // scalona, domyślna wartość
 // domyślne gatunki
    }

    const artist = await response.json();
    return artist.genres.length > 0 ? artist.genres : ['Rap/Hip-hop'];

}

// Zaktualizowana funkcja do wyświetlania szczegółów
async function displayTrackDetails(track) {
    const token = localStorage.getItem('spotify_token');
    const artistId = track.artists[0].id;
    const genres = await fetchArtistGenres(token, artistId);

    const detailsDiv = document.getElementById("track-details");
    const trackListDiv = document.getElementById("track-list");

    detailsDiv.innerHTML = `
        ${window.innerWidth <= 767 ? '<span class="back-to-list" onclick="showTrackList()">< Wróć do listy</span>' : ''}
        <img src="${track.album.images[0].url}" alt="Okładka albumu" width="200" />
        <h3 style="text-align:center;">${track.name}</h3>
        <div style="text-align:left; margin-top: 12px;">
            <p><strong>Artysta:</strong> ${track.artists.map(artist => artist.name).join(', ')}</p>
            <p><strong>Album:</strong> ${track.album.name}</p>
            <p><strong>Wydany:</strong> ${track.album.release_date}</p>
            <p><strong>Gatunek:</strong> ${genres.length ? genres.join(', ') : 'Rap, Hip-Hop, Trap'}</p>
        </div>
    `;

    // Na telefonach ukrywamy listę i pokazujemy szczegóły
    if (window.innerWidth <= 767) {
        trackListDiv.style.display = "none";
        detailsDiv.style.display = "block";
    }
}

// Funkcja do powrotu do listy utworów na telefonach
function showTrackList() {
    document.getElementById("track-list").style.display = "block";
    document.getElementById("track-details").style.display = "none";
}



document.addEventListener("DOMContentLoaded", () => {
    loadUserPlaylists();
});


window.addEventListener('resize', () => {
    if (window.innerWidth > 767) {
        document.getElementById("track-list").style.display = "block";
        document.getElementById("track-details").style.display = "block";
    }
});




