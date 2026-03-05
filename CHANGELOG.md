# Changelog

All notable changes to this project will be documented in this file.

## 2.1.0

- Add text alignment option for banner content (left, center, right).
- Apply alignment consistently to icon + message in both admin preview and public banner.
- Improve RTL handling so alignment behaves correctly in Arabic and other RTL layouts.

## 2.0.1

- Add support for Nextcloud 33 / Winter 26

## 2.0.0

- Introduce multi-banner management with an overview list, status labels, and edit/delete actions.
- Add per-banner scheduling with optional start/end times.
- Add a custom theme option with configurable background and text colors.
- Refresh admin UI with live previews and improved overview layout.
- Expand translation coverage across all bundled languages.

## 1.1.1

- Add support for swedish language

## 1.1.0

- Add translation overrides for banner message and read-more label (with default fallback)

## 1.0.4

- Fix body height when banner is enabled in NC 32

## 1.0.3

- Fix body height when banner is enabled

## 1.0.2

- Fix colors for NC 32
- Fix icon for NC 32

## 1.0.1

- Make banner/admin preview icons use the bundled app SVG for consistency.
- Add theme-aware colors for variants based on nextcloud colors for more readability.
- Improve dismiss cache key so changes to links/flags resurface for users.
- Accept JSON bodies when saving settings to avoid silent failures.

## 1.0.0

- First public release of Announcement Banner.
- Live preview in admin settings; save to publish to all users.
- Color schemes (info, success, warning, danger).
- Optional dismiss button and optional read-more link.
- Supported locales (EN, DE, FR, ES, AR).
