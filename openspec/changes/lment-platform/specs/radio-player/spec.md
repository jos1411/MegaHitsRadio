# Radio Player Specification

## Purpose

Public page with persistent HTML5 audio player streaming from AzuraCast Icecast mount (MP3). Anonymous listeners only — no auth in MVP.

## Requirements

### Requirement: Stream Playback

The system SHALL stream audio from the AzuraCast Icecast mount using an HTML5 `<audio>` element with MP3 format.

#### Scenario: Listener starts playback

- GIVEN a user loads the player page
- WHEN the page finishes loading
- THEN the audio element SHALL auto-play from the configured Icecast mount URL
- AND the play/pause button SHALL toggle playback state

#### Scenario: Listener pauses and resumes

- GIVEN audio is playing
- WHEN the user taps pause
- THEN audio SHALL stop and the button SHALL show play icon
- AND WHEN the user taps play again
- THEN audio SHALL resume from the stream

#### Scenario: Stream URL is unreachable

- GIVEN the Icecast server is down
- WHEN the audio element attempts to load the stream
- THEN the UI SHALL display a "Stream unavailable" message
- AND the play button SHALL remain disabled until the stream recovers

### Requirement: Volume Control

The system SHALL provide a volume slider that controls the audio element's volume property.

#### Scenario: Listener adjusts volume

- GIVEN audio is playing at default volume
- WHEN the user drags the volume slider to 50%
- THEN audio volume SHALL be set to 0.5
- AND the volume level SHALL persist across page refreshes via localStorage

### Requirement: Live Indicator

The system SHALL display a visual "EN VIVO" badge when a live DJ is broadcasting.

#### Scenario: DJ goes live

- GIVEN AutoDJ is playing
- WHEN a live DJ connects to AzuraCast
- THEN the UI SHALL display the live indicator within 10 seconds

#### Scenario: DJ goes offline

- GIVEN a live DJ is broadcasting
- WHEN the DJ disconnects
- THEN the live indicator SHALL disappear within 10 seconds

### Requirement: Listener Count

The system SHALL display the current listener count sourced from the AzuraCast API via the BFF proxy.

#### Scenario: Listener count updates

- GIVEN a user is on the player page
- WHEN new listeners connect or disconnect
- THEN the displayed count SHALL update within 30 seconds
