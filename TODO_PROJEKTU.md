# Zadania projektu HardbanRecords-Lab

## Ukończone

- Przeniesienie pełnej logiki Zustand store do `src/store/appStore.ts` (typy, akcje, mock dane, onboarding, taski, splits, chapters, toasts)
- Utworzenie i implementacja wszystkich wymaganych komponentów w `src/components/` (AIToolCard, TaskManager, Modal, ConfirmationModal, Tooltip, HelpView, constants.ts, DashboardCard, Header, ToastContainer, FullScreenLoader, OnboardingTour)
- Podział widoków na pliki w `src/pages/music`, `src/pages/publishing`
- Naprawa importów i typów, dopuszczenie `undefined` w typach, poprawa Task i AppState
- Analiza i uporządkowanie katalogów: główny, src, src/components, src/pages, backend, cypress, scripts, layouts, utils
- Identyfikacja i przygotowanie do usunięcia zbędnych plików .md
- Wdrożenie uploadu plików okładki i pliku muzycznego w module muzycznym (AddReleaseForm, integracja z S3, backend, client)
- Naprawa struktury JSX i typów w AddReleaseForm, przekazywanie tylko właściwych pól do backendu

### Backend

- Zainicjowanie projektu Node.js w folderze `backend`
- Instalacja frameworka Express.js
- Stworzenie podstawowego pliku `server.js`
- Uruchomienie serwera i stworzenie testowego endpointu `GET /api`
- Instalacja biblioteki `pg` do obsługi PostgreSQL
- Stworzenie modułu konfiguracji połączenia z bazą danych
- Implementacja bezpiecznego zarządzania danymi dostępowymi (DATABASE_URL) przy użyciu zmiennych środowiskowych (`.env`)
- Stworzenie endpointu testującego połączenie z bazą danych
- Stworzenie endpointu `GET /api/data` do pobierania całego stanu aplikacji (książki, wydania, zadania)
- Implementacja mechanizmu CORS, aby umożliwić komunikację między frontendem a backendem

## Do zrobienia

- Finalizacja porządkowania katalogu projektu
- Usunięcie zbędnych plików: BACKEND_README.md, POSTEP_I_TODO.md, PROJECT_PLAN.md, README.md (zastąpienie tym plikiem)
- Dalsze uzupełnianie i aktualizacja zadań w tym pliku
- Rozbudowa widoków i komponentów zgodnie z wymaganiami projektu
- Utrzymanie spójności i kompletności projektu

### Zadania backendowe

- Moduł Muzyczny:
	- [x] `POST /api/music/releases` - do dodawania nowego wydania (z uploadem okładki i pliku muzycznego)
	- [ ] `PATCH /api/music/releases/:id/splits` - do aktualizacji podziałów tantiem
	- [ ] `POST /api/music/tasks` - do dodawania nowego zadania
	- [ ] `PATCH /api/music/tasks/:id` - do zmiany statusu zadania
- Moduł Wydawniczy:
	- [ ] `POST /api/publishing/books` - do dodawania nowej książki
	- [ ] `PATCH /api/publishing/books/:id` - do aktualizacji danych książki
	- [ ] `PATCH /api/publishing/books/:id/chapters/:chapterIndex` - do aktualizacji treści rozdziału
	- [ ] `POST /api/publishing/tasks` - do dodawania nowego zadania
	- [ ] `PATCH /api/publishing/tasks/:id` - do zmiany statusu zadania
- Integracja z AWS S3 (Przesyłanie Plików):
	- [x] Instalacja `aws-sdk`
	- [x] Stworzenie endpointu `GET /api/s3-presigned-url`, który generuje bezpieczny, tymczasowy link do przesyłania plików
	- [x] Implementacja logiki po stronie frontendu do przesyłania plików bezpośrednio do S3 przy użyciu wygenerowanego linku
	- [ ] Wdrożenie uploadu ilustracji do książek oraz plików do rozdziałów (kolejny krok)
- Dodanie podstawowej walidacji przychodzących danych
- Zorganizowanie kodu w moduły (np. osobne pliki dla `routes`, `controllers`)
- Przygotowanie aplikacji do wdrożenia na darmowej platformie (np. Vercel, Render)
- Konfiguracja zmiennych środowiskowych na platformie docelowej
- Wdrożenie aplikacji i przeprowadzenie testów na środowisku produkcyjnym

---
Ten plik jest jedynym źródłem prawdy dla postępu i zadań w projekcie. Aktualizuj go na bieżąco.
