# Now Playing Specification

## Purpose

Real-time display of current song metadata: title, artist, artwork, elapsed/remaining time. Delivered via SSE connection proxied through Next.js BFF.

## Requirements

### Requirement: Current Track Metadata

The system SHALL display the current song's title, artist name, and album artwork sourced from AzuraCast's now-playing API.

#### Scenario: Track displays on load

- GIVEN a user opens the player page
- WHEN the page loads
- THEN the current track title, artist, and artwork SHALL be visible within 5 seconds

#### Scenario: Track changes

- GIVEN a track is playing
- WHEN AzuraCast advances to the next track
- THEN the UI SHALL update title, artist, and artwork within 10 seconds

### Requirement: Elapsed and Remaining Time

The system SHALL show elapsed time and total duration for the current track.

#### Scenario: Timer displays correctly

- GIVEN a track is playing
- WHEN 30 seconds have elapsed
- THEN the elapsed display SHALL show approximately 0:30
- AND the remaining display SHALL show total duration minus elapsed

### Requirement: SSE Connection via BFF

The system SHALL receive now-playing updates via a Server-Sent Events connection proxied through the Next.js BFF. The AzuraCast API key SHALL NOT be exposed to the client.

#### Scenario: SSE connection establishes

- GIVEN a user loads the player page
- WHEN the client opens an SSE connection to the BFF
- THEN the BFF SHALL proxy updates from AzuraCast without exposing the API key

#### Scenario: SSE connection drops

- GIVEN an active SSE connection
- WHEN the connection is interrupted
- THEN the client SHALL attempt to reconnect with exponential backoff
- AND the UI SHALL retain the last known track data until reconnection

#### Scenario: API key remains server-side

- GIVEN the BFF proxies AzuraCast requests
- WHEN a developer inspects the client bundle or network responses
- THEN no AzuraCast API key SHALL appear in client-side code or responses

### Requirement: Metadata Availability During Offline

The system SHALL retain the last known now-playing data in memory for display when the SSE connection is unavailable.

#### Scenario: Offline shows last known data

- GIVEN the SSE connection is lost
- WHEN the user views the now-playing section
- THEN the last received track metadata SHALL remain displayed
- AND a "Conexión perdida" indicator SHALL appear
