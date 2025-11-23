# Announcement Banner App

The Announcement Banner App adds a customizable notification bar at the top of every Nextcloud page. You can configure the message, color scheme, optional “read more” link, and whether users can dismiss the banner. A live preview of your banner is shown in the admin settings.

## Features

- Banner visible on all pages.
- Color schemes: info, success, warning, danger.
- Optional dismiss button.
- Optional “read more” link with customizable label and URL.
- Live preview in the admin settings; changes take effect for users after saving.
- Multi-language support (English, German, French, Spanish, …).

## Requirements

- Nextcloud >= 30

## Installation (manual)

1. Copy or extract this app to `nextcloud/apps/announcementbanner`.
2. Enable it: `occ app:enable announcementbanner`.
3. Configure in **Settings → Administration → Announcement banner**.

## Configuration

- **Banner message**: Text to display.
- **Color scheme**: Info, Success, Warning, Danger.
- **Enable banner** toggle.
- **Dismiss icon** toggle (allow users to hide the banner).
- **Read more**: Optional label + URL (shown inline with an arrow icon).
- Live preview updates immediately; saving publishes to all users.
