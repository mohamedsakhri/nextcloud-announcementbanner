# Vendored icons

All files in this directory except `megaphone.svg`-equivalent (this app's own icon,
kept separately as the `megaphone` entry in `../../js/banner-icons.js`) are sourced,
unmodified apart from removing the `id="mdi-*"` attribute and adding
`fill="currentColor"`, from:

[Material Design Icons](https://github.com/Templarian/MaterialDesign-SVG) by the
[Pictogrammers](https://pictogrammers.com/) icon group, licensed under the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

These files are kept here as the readable/auditable source. The app does not load
them directly at runtime; `js/banner-icons.js` embeds the same markup inline (with
`fill="currentColor"`) so icons can adopt the banner's text color. If you add,
remove, or update an icon here, regenerate/update `js/banner-icons.js` to match, and
add the new id to `ConfigService::$allowedIcons`.

`none.svg` is the one exception to filenames matching upstream: it's MDI's
`block-helper.svg`, renamed to match the `none` icon id ("no icon shown at the
start of the message"). It's only ever used to render the "No icon" option in the
picker itself — banners with icon `none` render without an icon element at all.
