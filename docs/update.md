# Update Strategy

## Pre-Update Checklist
* Ensure you’re on the latest `main` branch
* Pull updates: `git pull origin main`
* Run local tests
* Ensure no breaking changes

## CI/CD Steps
* Push to main
* GitHub Actions triggers eas update
* App is updated OTA (Over The Air)
* Use Expo Go or test build via install link

# Rollback Plan
* Revert to previous commit
* Re-publish with:
    ```bash
    eas update --branch main --message "Rollback"
    ```