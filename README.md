# BLSSNVJ21 Secure Password Generator

A responsive, installable password generator with a restrained retro grey-and-white interface. Built with static HTML, CSS and vanilla JavaScript for GitHub Pages.

## Features
- Cryptographically secure randomness with the browser Web Crypto API and unbiased rejection sampling.
- Password lengths from 8 to 128 characters.
- Uppercase, lowercase, numbers and symbols.
- Exclude ambiguous or custom characters; optional adjacent-repeat restriction.
- Entropy estimate and strength indicator.
- Bulk password generation and clipboard copy.
- Monochrome light/dark themes.
- Installable PWA with an offline application shell.
- No login, backend, database, analytics, external API, or password transmission.
- Only the visual theme preference is stored locally; generated passwords are not saved.

## Run locally
Open `index.html` in a modern browser. For service-worker/PWA testing, serve the folder from localhost or publish it on GitHub Pages.

## Security notes
Passwords are generated with `crypto.getRandomValues()`. The app does not send or persist generated passwords. The entropy value is an estimate based on password length and the configured character alphabet. Use a trusted password manager to store credentials.

## Files
`index.html` · `style.css` · `script.js` · `manifest.webmanifest` · `sw.js` · `icon.svg`
