// topsongs.js

/**
 * Pobiera JSON z top piosenkami i wypełnia jeden kafelek #top-song-today.
 */
async function loadSingleTopSong() {
    try {
      // Fetch z Twojego API
      const response = await fetch('https://mytopspotify.io/spotify-top-songs.json');
      if (!response.ok) {
        throw new Error(`Błąd pobierania danych: ${response.statusText}`);
      }
  
      const data = await response.json();
      const allSongs = data.data || [];
  
      // Ustawienie daty w hero
      const updatedDate = data.date
        ? new Date(data.date).toISOString().split('T')[0]
        : 'Brak danych';
      document.getElementById('update-date').textContent = updatedDate;
  
      // Bierzemy pierwszy element jako "najpopularniejszy utwór"
      const topSong = allSongs[0];
      if (!topSong) {
        document.getElementById('top-song-today').innerHTML = `
          <p>Brak danych o utworze.</p>
        `;
        return;
      }
  
      // Lista artystów (feat)
      const allArtists = topSong.artists && topSong.artists.length > 0
        ? topSong.artists.map((a) => a.name).join(', ')
        : topSong.artist;
  
      // Data wydania
      const releaseDate = topSong.releaseDate
        ? new Date(topSong.releaseDate).toISOString().split('T')[0]
        : '—';
  
      // iFrame do Spotify
      const embedUrl = `https://open.spotify.com/embed/track/${topSong.spotifyId}`;
  
      // Składamy kafelek
      document.getElementById('top-song-today').innerHTML = `
        <div class="single-song-cover">
          <img src="${topSong.image}" alt="${topSong.name}" />
        </div>
        <h3 class="single-song-name">${topSong.name}</h3>
  
        <div class="single-song-meta">
          <p class="single-song-artists">Autorzy: <strong>${allArtists}</strong></p>
          <p class="single-song-album">Album: <strong>${topSong.album || '—'}</strong></p>
          <p class="single-song-release">Data wydania: <strong>${releaseDate}</strong></p>
        </div>
  
        <iframe
          class="single-song-player"
          src="${embedUrl}"
          frameborder="0"
          width="100%"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
        </iframe>
      `;
    } catch (error) {
      console.error('Błąd w loadSingleTopSong():', error);
      document.getElementById('top-song-today').innerHTML = `
        <p>Wystąpił błąd podczas pobierania danych.</p>
      `;
    }
  }
  
  // Po załadowaniu DOM
  document.addEventListener('DOMContentLoaded', () => {
    loadSingleTopSong();
  });
  