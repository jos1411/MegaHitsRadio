# PWA Shell Specification

## Purpose

Web-first progressive web app: installable, offline shell (cached UI, not audio), service worker for app shell caching, and Media Session API integration for OS-level controls.

## Requirements

### Requirement: Install Prompt

The system SHALL display an install prompt when the PWA criteria are met (manifest, service worker, HTTPS).

#### Scenario: User sees install prompt

- GIVEN the app meets PWA install criteria
- WHEN the user visits the page on a supported browser
- THEN an install prompt or browser native install hint SHALL appear

#### Scenario: User dismisses prompt

- GIVEN the install prompt is shown
- WHEN the user dismisses it
- THEN the prompt SHALL NOT reappear for at least 7 days

### Requirement: Service Worker App Shell Cache

The system SHALL register a service worker that caches the app shell (HTML, CSS, JS, icons) but SHALL NOT cache audio stream URLs.

#### Scenario: App shell loads offline

- GIVEN the service worker has cached the app shell
- WHEN the user has no network connectivity
- THEN the app SHALL load the cached shell
- AND display an offline fallback message
- AND the audio player SHALL NOT attempt to play

#### Scenario: Audio stream is never cached

- GIVEN the service worker intercepts fetch requests
- WHEN a request targets the Icecast stream URL
- THEN the service worker SHALL NOT cache the response
- AND the request SHALL bypass the cache

### Requirement: Media Session API

The system SHALL integrate the Media Session API to provide OS-level media controls (play, pause, next) on supported devices.

#### Scenario: Lock screen controls on Android

- GIVEN audio is playing on Android Chrome
- WHEN the user locks the screen
- THEN lock screen media controls SHALL show play/pause and track info

#### Scenario: macOS Touch Bar / media keys

- GIVEN audio is playing on macOS
- WHEN the user presses media keys
- THEN the audio SHALL respond to play/pause commands

### Requirement: Manifest Configuration

The system SHALL include a `manifest.json` with name, icons, theme color, background color, display standalone, and start URL.

#### Scenario: PWA metadata present

- GIVEN the user inspects the HTML head
- WHEN the page loads
- THEN a `<link rel="manifest">` SHALL point to a valid manifest.json
- AND the manifest SHALL include all required PWA fields

### Requirement: Offline Fallback

The system SHALL display a dedicated offline page when the user navigates to the app without network and the shell is not cached.

#### Scenario: First visit offline

- GIVEN the user has never visited the app
- WHEN they navigate to the URL offline
- THEN a branded offline message SHALL be displayed
- AND the user SHALL be prompted to try again when online
