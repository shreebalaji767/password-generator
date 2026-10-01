# BLSSNVJ21 Secure Password Generator

A modern, responsive, installable password generator that runs entirely in the browser.

## Features
- Cryptographically secure randomness with Web Crypto API and unbiased rejection sampling.
- 8–128 character passwords.
- Uppercase, lowercase, numbers and symbols.
- Exclude ambiguous characters or custom characters.
- Optional no-adjacent-repeat mode.
- Real-time entropy estimate and strength indicator.
- Bulk generation with one-click copy.
- Dark/light mode and responsive UI.
- Installable PWA with offline application shell.
- No login, database, analytics, password history, or password transmission.
- Only the theme preference is stored locally.

## Security
Generated passwords use `crypto.getRandomValues()`. The app does not send or persist generated passwords. Entropy is an estimate based on the configured alphabet and length.

## Live demo
https://password-generator-17j1.onrender.com/

## Files
`index.html` · `style.css` · `script.js` · `manifest.webmanifest` · `sw.js` · `icon.svg`
