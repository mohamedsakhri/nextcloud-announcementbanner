# Changelog

All notable changes to this project will be documented in this file.

## 2.7.0

- Add a per-banner icon picker: choose from 42 icons (the app's original megaphone, a "No icon" option, plus a curated set from Material Design Icons, Apache-2.0) shown at the start of the banner message. Available in the admin settings form, live preview, and the `--icon` option on the `announcementbanner:create`/`announcementbanner:update` occ commands.
- Polish the admin settings page: softer shadows and rounded corners on the overview and editor cards, refined spacing and input styling, and a hover highlight on overview rows, while keeping the familiar table and field layout.
- Make all remaining admin UI text translatable: the icon picker's option labels, a couple of JS fallback strings, and backend validation/error messages that previously surfaced in English regardless of the admin's language.

## 2.6.0

- Add occ commands to manage banners from the CLI: `announcementbanner:create`, `announcementbanner:update`, `announcementbanner:delete`, and `announcementbanner:list`, covering message text, colour/variant, schedule window, read-more link, and the dismiss icon, so banners can be scripted (e.g. switching a banner through warning, danger, and success states around a maintenance window).

## 2.5.0

- Add settings delegation support: admins can grant specific groups access to manage banners without full server admin rights, scoped to this app's settings only.
- Fix scheduled banners: banners past their end time or not yet started are now correctly hidden from the public banner, matching the status already shown in the admin overview.

## 2.4.3

- Add support for PHP 8.5

## 2.4.2

- Fix the audience groups picker in admin settings so the group list stays collapsed until opened.
- Notify apps after banner height changes so embedded UIs can recalculate their layout.

## 2.4.1

- Add page visibility modes for banners: show everywhere, show only on selected pages, or show everywhere except selected pages.
- Refine the admin UI wording and overview display for page visibility targeting.
- Extend translations for the new page visibility settings across bundled languages.

## 2.4.0

- Add page targeting for banners so they can be shown only on selected apps.
- Add app and settings page selection in the admin form, including personal settings and administration settings.
- Show the selected app/page targets in the admin overview for easier management.
- Update public banner rendering to detect settings pages and apply page-targeted banners there.

## 2.3.1

- Update screenshots with new features

## 2.3.0

- Add audience targeting for banners: everyone, admins only, or specific groups.
- Show the selected audience in the admin overview for easier management.
- Add validation for group-targeted banners so at least one group must be selected.

## 2.2.1

- Fix link to screenshot

## 2.2.0

- Add manual banner ordering in the admin overview with up/down controls.
- Persist banner order so multiple active banners are shown in the configured sequence.
- Integrate ordering controls into the actions column for a cleaner overview layout.
- Add localized ordering help text and reorder button tooltips for bundled languages.
- Improve compatibility for existing installations by persisting generated banner ids before reordering legacy entries.
- More spacing between banner text and read-more label
- Horizontal space as content

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
