# Schedule Specification

## Purpose

Simple upcoming tracks view and AutoDJ/Live DJ timeline. No programming grid — displays "Now Playing" plus next 2–3 tracks and a timeline showing AutoDJ vs. Live DJ status.

## Requirements

### Requirement: Upcoming Tracks List

The system SHALL display the next 2–3 upcoming tracks from the AzuraCast queue.

#### Scenario: Upcoming tracks load

- GIVEN a user scrolls to the schedule section
- WHEN the page loads
- THEN up to 3 upcoming tracks (title + artist) SHALL be visible below the current track

#### Scenario: Queue is empty

- GIVEN AutoDJ has no queued tracks
- WHEN the schedule section loads
- THEN a "Cola vacía" message SHALL be displayed

### Requirement: AutoDJ / Live DJ Timeline

The system SHALL display a horizontal timeline indicating whether the current source is AutoDJ or a live DJ.

#### Scenario: AutoDJ is active

- GIVEN no live DJ is connected
- WHEN the timeline renders
- THEN the active segment SHALL be labeled "AutoDJ" with a distinct color

#### Scenario: Live DJ connects

- GIVEN AutoDJ is playing
- WHEN a DJ goes live on AzuraCast
- THEN the timeline SHALL show a "DJ en vivo" segment with the DJ's name
- AND the segment SHALL start from the current time

#### Scenario: DJ disconnects, AutoDJ resumes

- GIVEN a live DJ was broadcasting
- WHEN the DJ disconnects
- THEN the timeline SHALL transition back to "AutoDJ"
- AND the transition SHALL reflect within 10 seconds

### Requirement: Single Station Scope

The system SHALL display schedule data for a single AzuraCast station only. No multi-station switching.

#### Scenario: Single station config

- GIVEN the system is configured for one AzuraCast station
- WHEN the schedule loads
- THEN only tracks and timeline for that station SHALL be displayed
