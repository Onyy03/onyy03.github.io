# Dokumentacja Projektu CSTS (Co Się Teraz Słucha)

## 1. Wstęp

Projekt CSTS to aplikacja webowa pozwalająca użytkownikom analizować trendy muzyczne, przeglądać topowych artystów i utwory oraz śledzić własne statystyki Spotify. Projekt został stworzony jako część zaliczenia przedmiotu **Projektowanie Interfejsów Użytkownika**.

## 2. Opis struktury serwisu

Aplikacja składa się z pięciu głównych podstron:

| Podstrona                  | Opis                                                                 |
|-----------------------------|----------------------------------------------------------------------|
| `index.html`                | Strona główna z opisem aplikacji i skrótami do funkcjonalności.     |
| `co_sie_teraz_slucha.html`  | Lista danych – pokazuje top utwory. Używa API, różne widoki (iframe / karty / tabela). |
| `top_artysci.html`          | Widok 3-kolumnowy z trzema najpopularniejszymi artystami(szczegóły, dane), Lista danych – pokazuje artystów. Obsługuje sortowanie i paginację. Widok desktop: tabela, mobile: karty. |
| `analiza_playlist.html`     | Widok z analizą playlisty (lista utworów, szczegóły, wykresy). |
| `twoje_statystyki.html`     | Dodatkowa podstrona – prezentuje dane użytkownika (top artyści, utwory, gatunki, eksport CSV). |

Każda podstrona zawiera:
- menu (desktop i mobile),
- treść główną,
- stopkę,
- dynamiczne pobieranie danych z API,
- pełną responsywność.

## 3. Opis technologii zastosowanych przy tworzeniu serwisu

**Frontend:**
- HTML5 – struktura aplikacji.
- CSS3 – stylowanie oparte na metodologii BEM.
- JavaScript (ES6+) – dynamiczna obsługa treści, połączenia z API.

**Zewnętrzne biblioteki i API:**
- Spotify Web API – dane muzyczne użytkownika (artystów, utworów, playlist).
- Chart.js – generowanie wykresów.
- Font Awesome – ikony.
- API mytopspotify.io - top utwory, top artyści w ciągu ostatnich 24h. Uzyskano zgodę autora na wykorzystanie jego API w ramach projektu zaliczeniowego. 

**Dodatkowo:**
- Git + GitHub – wersjonowanie kodu źródłowego.
- GitHub Pages – hosting projektu.
- ChatGPT + Canva + Gimp + Figma + Brime - wykonanie grafik na stronę. 

## 4. Testy

Aplikacja została przetestowana na następujących przeglądarkach i urządzeniach:

| Przeglądarka        | Desktop | Tablet | Mobile |
|---------------------|---------|--------|--------|
| Google Chrome       | ✅      | ✅     | ✅     |
| Mozilla Firefox     | ✅      | ✅     | ✅     |
| Microsoft Edge      | ✅      | ✅     | ✅     |
| Safari (Mac / iOS)  | ✅      | ✅     | ✅     |
| Opera               | ✅      | ✅     | ✅     |

**Rozdzielczości testowe:**
- Desktop: 1440px
- Tablet: 992px
- Mobile: 375px

**Testowane funkcjonalności:**
- logowanie do Spotify,
- wyświetlanie top utworów,
- ładowanie top artystów z paginacją,
- analiza playlisty użytkownika,
- prezentacja statystyk i eksport danych do CSV,
- responsywność na różnych urządzeniach,
- dynamiczne iframe od Spotify,
- działanie interaktywnych wykresów.

## 5. Podsumowanie

Projekt CSTS spełnia wszystkie założone wymagania funkcjonalne i wizualne. Interfejs jest przejrzysty, dynamiczny i dostosowany do różnych rozdzielczości ekranów.  
Wszystkie podstrony łączą się w spójny, responsywny serwis umożliwiający użytkownikowi analizę danych muzycznych oraz śledzenie trendów z serwisu Spotify.

---

**Repozytorium:** [https://github.com/Onyy03/onyy03.github.io]  
**Demo online:** [https://onyy03.github.io/]
