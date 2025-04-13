# Backup Strategy & Restore Strategy

Since the project **does not use a backend or database**, only configuration and code backups are necessary.

## Strategy

- Focus: configuration, app settings, local storage (no backend data)
- Backup daily (if app evolves quickly), weekly otherwise

## Backup Types

* Full: Weekly export of source code (via Git, once per week)
* Incremental: Git commits (daily)

## What to Backup

- `eas.json`
- custom config files
- `.expo/` folder
- `assets/` folder
- Custom fonts/icons

## Backup Procedure

* Push regularly to GitHub
* Export project zip periodically
* Or using automation script (backup.sh)

## Storage

- Store in version-controlled `backup/` folder or encrypted external drive
- Keep 3 full backups and 7 incremental

## Restore Procedure

* Clone from GitHub
* Run npm install
* Start development or run production update

## Restore Process (example)
```bash
cp backup/eas_*.json eas.json
cp -r backup/expo_*/.expo .expo
cp -r backup/assets_*/ assets/
```