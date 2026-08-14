# DJ Live Specification

## Purpose

Visual indicator when a live DJ is connected, auto-detected from AzuraCast's now-playing API `is_live` flag. DJs connect via standard AzuraCast stream keys — no custom web console in MVP.

## Requirements

### Requirement: Live DJ Detection

The system SHALL detect a live DJ connection by reading the `is_live` flag from the AzuraCast now-playing API response.

#### Scenario: DJ connects via broadcast software

- GIVEN a DJ starts streaming via BUTT/Mixxx/OBS using their AzuraCast stream key
- WHEN the AzuraCast now-playing API reports `is_live: true`
- THEN the UI SHALL show "DJ en vivo" with the DJ's display name within 10 seconds

#### Scenario: AutoDJ is active

- GIVEN no DJ is connected (`is_live: false`)
- WHEN the UI renders the DJ status
- THEN "AutoDJ" SHALL be displayed instead of a DJ name

### Requirement: DJ Name Display

The system SHALL display the DJ's name from the AzuraCast account when a live DJ is detected.

#### Scenario: DJ name appears

- GIVEN a DJ named "Carlos" is live
- WHEN the DJ status updates
- THEN the UI SHALL display "Carlos en vivo"

### Requirement: DJ Account Management (AzuraCast Panel)

DJ accounts SHALL be created and managed exclusively through the AzuraCast admin panel. The LMENT platform SHALL NOT provide a custom DJ account management interface.

#### Scenario: Owner creates DJ account

- GIVEN the station owner accesses the AzuraCast admin panel
- WHEN they create a new DJ account with a stream key
- THEN the DJ SHALL be able to connect using that key via broadcast software
- AND the LMENT platform SHALL reflect the DJ's status automatically

### Requirement: Stream Key Security

Stream keys SHALL NOT be exposed to the client. All AzuraCast API calls SHALL go through the BFF proxy.

#### Scenario: No key in client

- GIVEN the BFF proxies AzuraCast requests
- WHEN a developer inspects client-side code
- THEN no stream key or API key SHALL appear in client bundles or network responses
