# PROJECT PLAN: HardbanRecords Lab

Ten dokument opisuje plan rozwoju aplikacji HardbanRecords Lab, ewoluując od obecnego stanu (działający backend, brak frontendu) do w pełni funkcjonalnej aplikacji full-stack.

## Faza 1: Fundamenty Frontendowe i Połączenie z API

**Cel:** Stworzenie podstawowej struktury aplikacji React, wdrożenie zarządzania stanem i pobranie początkowych danych z backendu.

1.  **Setup Projektu Frontendowego:**
    *   [ ] Zainstaluj kluczowe zależności: `zustand`, `react-router-dom`, `axios` (lub `fetch`).
    *   [ ] Zaimplementuj podstawowy routing dla głównych widoków: `/`, `/music`, `/publishing`.
    *   [ ] Stwórz layout aplikacji (nawigacja boczna/górna, obszar na treść).

2.  **Zarządzanie Stanem (Zustand):**
    *   [ ] Stwórz główny "store" Zustand.
    *   [ ] Zdefiniuj w nim struktury danych dla `music` (releases, tasks) i `publishing` (books, tasks).
    *   [ ] Utwórz akcję `fetchInitialData`, która wywoła endpoint `GET /api/data` i wypełni store danymi.

3.  **Połączenie z API:**
    *   [ ] Wywołaj `fetchInitialData` przy starcie aplikacji w głównym komponencie (`App.tsx`).
    *   [ ] Upewnij się, że dane z backendu poprawnie trafiają do stanu Zustand.

## Faza 2: Implementacja Modułu "Music Publishing"

**Cel:** Zbudowanie w pełni funkcjonalnego interfejsu do zarządzania wydawnictwami muzycznymi.

1.  **Widok "Releases":**
    *   [ ] Stwórz komponent wyświetlający listę wydawnictw (`music.releases` ze stanu).
    *   [ ] Zaimplementuj formularz dodawania nowego wydawnictwa (wywołujący `POST /api/music/releases`).
    *   [ ] Dodaj system powiadomień (Toast) informujący o sukcesie/błędzie.

2.  **Widok "Splits":**
    *   [ ] Stwórz interfejs do edycji podziałów (`splits`) dla wybranego wydawnictwa.
    *   [ ] Zaimplementuj logikę walidacji sumy udziałów (musi wynosić 100%).
    *   [ ] Podłącz logikę zapisu (wywołującą `PATCH /api/music/releases/:id/splits`).

3.  **Integracja AI (Music):**
    *   [ ] **AI Cover Art Generator:** W formularzu wydawnictwa dodaj przycisk "Generuj Okładkę".
        *   [ ] Po kliknięciu, wywołaj `POST /api/ai/generate-images` z odpowiednim promptem.
        *   [ ] Wyświetl wygenerowany obraz i pozwól na jego zapisanie.
    *   [ ] **AI Metadata Assistant:** Dodaj przycisk do automatycznego generowania tagów/nastroju.
        *   [ ] Wywołaj `POST /api/ai/generate-content`.
    *   [ ] Zaimplementuj pozostałe funkcje AI (`Release Date Suggester`, `Revenue Forecast` etc.) jako kolejne, niezależne komponenty wywołujące API AI.

4.  **Zadania (Tasks):**
    *   [ ] Stwórz interfejs do wyświetlania, dodawania i oznaczania zadań jako wykonane (`/api/music/tasks`).

## Faza 3: Implementacja Modułu "Digital Publishing"

**Cel:** Zbudowanie interfejsu do pisania i zarządzania książkami.

1.  **Widok "Biblioteka":**
    *   [ ] Stwórz komponent wyświetlający listę książek (`publishing.books` ze stanu).
    *   [ ] Zaimplementuj formularz tworzenia nowej książki (`POST /api/publishing/books`).

2.  **Edytor Manuskryptu:**
    *   [ ] Stwórz główny widok edytora z listą rozdziałów.
    *   [ ] Zaimplementuj możliwość edycji treści rozdziału i zapisywania zmian (`PATCH /api/publishing/books/:id`).
    *   [ ] Dodaj funkcję importu z pliku `.txt`.

3.  **Integracja AI (Publishing):**
    *   [ ] **AI Writing Assistant:**
        *   [ ] Dodaj przyciski "Korekta", "Analiza Fabuły", "Wzbogać Prozę".
        *   [ ] Każdy przycisk powinien wysyłać zaznaczony tekst do `POST /api/ai/generate-content` z odpowiednim poleceniem systemowym.
        *   [ ] Zaimplementuj funkcję "Cofnij", która przywraca tekst sprzed modyfikacji AI.
    *   [ ] **AI Illustration Assistant:**
        *   [ ] Dodaj interfejs do generowania ilustracji na podstawie opisu.
        *   [ ] Wywołaj `POST /api/ai/generate-images`.
        *   [ ] Zapisz URL obrazu w danych książki.
    *   [ ] Zaimplementuj pozostałe funkcje AI (`Book Cover Generator`, `Blurb Generator` etc.).

## Faza 4: Finalizacja i Komercjalizacja

**Cel:** Przygotowanie aplikacji do wdrożenia produkcyjnego.

1.  **Autentykacja:**
    *   [ ] Zaimplementuj system logowania i rejestracji (np. z użyciem JWT).
    *   [ ] Zabezpiecz endpointy API, aby wymagały zalogowanego użytkownika.

2.  **Przechowywanie Plików:**
    *   [ ] Zintegruj backend z AWS S3 do przechowywania okładek i ilustracji (endpoint `/s3-presigned-url` jest już gotowy).
    *   [ ] Zmodyfikuj frontend, aby przesyłał pliki na wygenerowany URL S3.

3.  **Deployment (CI/CD):**
    *   [ ] Skonfiguruj GitHub Actions do automatycznego testowania i wdrażania.
    *   [ ] Wdróż frontend (np. na Vercel/Netlify) i backend (np. na Render/Heroku).

4.  **Monetyzacja:**
    *   [ ] Zintegruj system płatności (np. Stripe) do obsługi subskrypcji.
    *   [ ] Zaimplementuj logikę ograniczającą dostęp do funkcji AI w zależności od planu subskrypcyjnego.
