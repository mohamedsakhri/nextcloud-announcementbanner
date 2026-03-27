# Announcement Banner App

The Announcement Banner App adds customizable notification bars at the top of every Nextcloud page. Create multiple banners with their own message, color scheme, schedule window, audience, app scope, optional “read more” link, and dismiss behavior. You can also add translations so users see the banner in their language. A live preview and an overview of all banners are available in the admin settings.

## Screenshots

**Admin Overview**

![Admin Overview](screenshots/banner-admin-overview.png)

**Banner Settings**

![Admin Settings](screenshots/banner-admin-settings.png)

**Admin Preview**

![Admin Preview](screenshots/banner-admin-preview.png)

**Success (Light)**

![Success Banner](screenshots/banner-success.png)

**Success (Dark)**

![Success Banner Dark](screenshots/banner-success-dark.png)

**Warning**

![Warning Banner](screenshots/banner-warning.png)

**Danger**

![Danger Banner](screenshots/banner-danger.png)

**Custom Colors**

![Admin Custom Colors](screenshots/banner-admin-custom.png)

## Features

- Multiple banners with per-banner settings and lifecycle status.
- Overview list with status (active, scheduled, expired, disabled), preview, audience, app scope, schedule columns, and inline actions.
- Manual banner ordering with up/down controls in the admin overview to define the display order when multiple banners are active.
- Optional schedule: set a start time, an end time, or both to control when a banner is shown.
- Audience targeting: show each banner to everyone, admins only, or specific groups.
- App targeting: limit a banner to specific Nextcloud app IDs such as `files`, `deck`, or `mail`.
- Theme variants: info, success, warning, danger, custom.
- Optional dismiss button for users.
- Optional “read more” link with customizable label and URL.
- Text alignment control (left, center, right) for banner content.
- Translations for banner message and read-more label (fallback to default).
- Live preview in the admin settings; changes take effect for users after saving.
- Multi-language support (English, German, French, Spanish, …).

## Multiple Banners

Create and manage several banners at once. Each banner can be enabled or disabled independently and has its own message, theme, audience, app scope, schedule, and link settings. When multiple banners are active at the same time, you can change their order from the overview.

## Audience

Choose who should see each banner. You can publish a banner to everyone, restrict it to admins only, or target specific groups.

## Translations

Add per-language overrides for the banner message and the read-more label. Users will see the translation matching their Nextcloud language, and the default text is used if no translation is provided.

## Schedule

Scheduling is optional. Set only a start date, only an end date, or both to control the time window in which a banner is visible.

## Theme

Choose between info, success, warning, and danger presets, or switch to the custom theme to define your own background and text colors.

## Requirements

- Nextcloud >= 30

## Installation

Install from the Nextcloud App Store: [Announcement Banner](https://apps.nextcloud.com/apps/announcementbanner).

## Configuration

- **Add new banner** to create a new message; manage all banners from the overview.
- **Overview order controls**: Use the arrow buttons in the actions column to change the order in which active banners are shown.
- **Banner message**: Text to display.
- **Color scheme**: Info, Success, Warning, Danger, Custom (custom background/text colors).
- **Text alignment**: Left, Center, Right.
- **Enable banner** toggle.
- **Dismiss icon** toggle (allow users to hide the banner).
- **Read more**: Optional label + URL (shown inline with an arrow icon).
- **Schedule**: Optional start date, end date, or both. Make sure to enable the banner if you want to schedule it.
- **Audience**: Everyone, Admins only, or Specific groups.
- **App IDs**: Optional list of Nextcloud app IDs. Leave empty to show the banner everywhere, or target apps like `files`, `deck`, or `mail`.
- **Translations**: Optional per-language overrides for message and read-more label; default text is the fallback.
- Live preview updates immediately; saving publishes to all users.
