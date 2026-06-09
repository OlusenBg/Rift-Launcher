# Modrift Launcher

A desktop app for installing and managing Rift mods for Minecraft. Built with [Tauri v2](https://tauri.app) (Rust + React/TypeScript).

Part of the [Modrift](https://modrift.dev) ecosystem — created and maintained by **[Olusen](https://github.com/OlusenBg)**.

## Features

- Microsoft account sign-in via Modrift
- Browse and install modpacks from the Modrift catalogue
- Manage multiple Minecraft instances
- Automatic update notifications
- Linux Flatpak support
- Cross-platform: Windows, macOS, Linux

## Download

Head to **[rift.modrift.dev/launcher](https://rift.modrift.dev/launcher)** for the latest release.

Platform packages available:

| Platform | Format |
|---|---|
| Windows | `.msi` installer or portable `.exe` (NSIS) |
| Linux | `.AppImage` or `.deb` |
| Linux (Flatpak) | `.flatpak` bundle |
| macOS | `.dmg` |

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript, Vite |
| Backend | Rust, Tauri v2 |
| Auth | Clerk (via Modrift website) |
| HTTP | reqwest |
| Flatpak runtime | GNOME Platform 47 + `rust-stable` SDK extension |

## Development

### Prerequisites

- [Rust](https://rustup.rs) (stable)
- Node.js 20+
- Tauri system dependencies for your platform — see the [Tauri v2 prerequisites guide](https://v2.tauri.app/start/prerequisites/)

### Run in development

```bash
npm install
npm run tauri dev
```

### Build for production

```bash
npm run tauri build
```

### Flatpak (Linux)

Generate vendored Cargo sources, then build:

```bash
pip3 install tomlkit aiohttp
curl -sSL https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/master/cargo/flatpak-cargo-generator.py \
  -o flatpak-cargo-generator.py
python3 flatpak-cargo-generator.py src-tauri/Cargo.lock -o flatpak/cargo-sources.json

npm run build   # pre-build the frontend

flatpak-builder --user --install --force-clean build-dir dev.modrift.launcher.yml
```

## Releasing

Releases are triggered manually via the GitHub Actions **Release** workflow (`Actions → Release → Run workflow`). Enter a version like `v1.2.0` and the workflow will:

1. Bump `package.json` and `src-tauri/tauri.conf.json`, commit and push
2. Build all platform bundles in parallel (Linux, Windows MSI, Windows portable, macOS, Flatpak)
3. Create a GitHub Release with all artifacts attached

## Project structure

```
src/                  React + TypeScript frontend
src-tauri/
  src/
    auth.rs           Microsoft auth + Clerk session
    updater.rs        GitHub release update checker
    lib.rs            Tauri command registration
flatpak/              Flatpak desktop entry + metainfo
dev.modrift.launcher.yml  Flatpak manifest
.github/workflows/
  ci.yml              Build check on every push
  release.yml         Release workflow
```

## Contributing

This project is created and owned by **[Olusen](https://github.com/OlusenBg)**.

If you fork this repository, please credit the original author:

> Based on [Modrift Launcher](https://github.com/OlusenBg/Rift-Launcher) by [Olusen](https://github.com/OlusenBg).

Open an issue for large a desired change.

If you wish to contact me please add me on discord

## License

See [LICENSE](LICENSE) for details.
