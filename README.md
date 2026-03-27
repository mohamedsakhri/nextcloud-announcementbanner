<p align="center">
  <img src="img/app.svg" alt="Announcement Banner icon" width="160">
</p>

# Announcement Banner App

The Announcement Banner App adds customizable notification bars at the top of your Nextcloud pages. Create multiple banners with their own message, color scheme, schedule window, audience, page targeting, optional “read more” link, and dismiss behavior. You can also add translations so users see the banner in their language. A live preview and an overview of all banners are available in the admin settings.

## Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Screenshots](#️-screenshots)
- [Multiple Banners](#-multiple-banners)
- [Audience](#-audience)
- [Page Targeting](#-page-targeting)
- [Schedule](#-schedule)
- [Theme](#-theme)
- [Translations](#-translations)
- [Requirements](#-requirements)
- [How you can support this project](#-how-you-can-support-this-project)

## ✨ Features

- Multiple banners with per-banner settings and lifecycle status.
- Overview list with status (active, scheduled, expired, disabled), preview, audience, app scope, schedule columns, and inline actions.
- Manual banner ordering with up/down controls in the admin overview to define the display order when multiple banners are active.
- Optional schedule: set a start time, an end time, or both to control when a banner is shown.
- Audience targeting: show each banner to everyone, admins only, or specific groups.
- Page targeting: limit a banner to specific Nextcloud apps and settings pages such as `files`, `deck`, `settings` (personal settings), or `admin_settings` (administration settings).
- Theme variants: info, success, warning, danger, custom.
- Optional dismiss button for users.
- Optional “read more” link with customizable label and URL.
- Text alignment control (left, center, right) for banner content.
- Translations for banner message and read-more label (fallback to default).
- Live preview in the admin settings; changes take effect for users after saving.
- Multi-language support (English, German, French, Spanish, …).

## 🚀 Installation

Install from the Nextcloud App Store: [Announcement Banner](https://apps.nextcloud.com/apps/announcementbanner).

## ⚙️ Configuration

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
- **Apps**: Optional selection of target pages. Leave empty to show the banner everywhere, or target entries like Files, Deck, Personal settings (`settings`), or Administration settings (`admin_settings`).
- **Translations**: Optional per-language overrides for message and read-more label; default text is the fallback.
- Live preview updates immediately; saving publishes to all users.

## 🖼️ Screenshots

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

## 📚 Multiple Banners

Create and manage several banners at once. Each banner can be enabled or disabled independently and has its own message, theme, audience, app scope, schedule, and link settings. When multiple banners are active at the same time, you can change their order from the overview.

## 👥 Audience

Choose who should see each banner. You can publish a banner to everyone, restrict it to admins only, or target specific groups.

## 🎯 Page Targeting

Choose where each banner should appear. You can leave the page selection empty to show a banner everywhere, or restrict it to selected apps and settings areas such as Files, Deck, Personal settings, or Administration settings.

## 🕒 Schedule

Scheduling is optional. Set only a start date, only an end date, or both to control the time window in which a banner is visible.

## 🎨 Theme

Choose between info, success, warning, and danger presets, or switch to the custom theme to define your own background and text colors.

## 🌍 Translations

Add per-language overrides for the banner message and the read-more label. Users will see the translation matching their Nextcloud language, and the default text is used if no translation is provided.

## 📋 Requirements

- Nextcloud >= 30

## 🤝 How you can support this project

- 🌟 Star the [repository](https://github.com/mohamedsakhri/nextcloud-announcementbanner): it is the simplest way to support the project.
- ⭐ Rate and comment on Announcement Banner in the [Nextcloud App Store](https://apps.nextcloud.com/apps/announcementbanner).
- 🪲 Report bugs on the [issue tracker](https://github.com/mohamedsakhri/nextcloud-announcementbanner/issues).
- 📖 Help improve translations:
  - Improve language files if they need correction.
  - Add files for your language if it is not supported yet.
