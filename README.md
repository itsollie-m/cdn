# Ollie M CDN

A simple static asset host powered by GitHub Pages.

**Production domain:** https://cdn.olliem.dev

## Repository structure

```
.
├── assets/
│   ├── images/
│   ├── icons/
│   └── logos/
├── fonts/
├── libraries/
│   ├── css/
│   └── javascript/
├── roblox/
├── CNAME
├── index.html
└── README.md
```

## Using the CDN

Add files to the relevant directory and commit them to the `main` branch.

For example, a file stored at `assets/logos/example.png` will be available at:

```
https://cdn.olliem.dev/assets/logos/example.png
```

## GitHub Pages setup

In **Settings → Pages**:

1. Set the source to **Deploy from a branch**.
2. Select `main` and the `/ (root)` folder.
3. Set the custom domain to `cdn.olliem.dev`.
4. Once GitHub has issued the TLS certificate, enable **Enforce HTTPS**.

The `CNAME` file is included so GitHub Pages retains the custom domain.

## Important

This is static hosting, not an unrestricted CDN service. GitHub Pages has usage limits and is intended for public static websites. Do not use it for private files, secrets, user uploads, executable application backends, or high-volume production delivery.
