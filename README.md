# Solar Analysis Cloudflare Worker

This repo contains a Cloudflare Worker that handles energy usage uploads and solar data backfill.

## Endpoints
- `POST /upload/pge_usage` – upload PG&E usage CSV or JSON.
- `POST /upload/solar_test` – upload solar panel test data.
- `POST /backfill/pvwatts?start=YYYY-MM-DD&end=YYYY-MM-DD` – fetch PVWatts data for missing days.
- `POST /backfill/sunrise_sunset?start=YYYY-MM-DD&end=YYYY-MM-DD` – fetch sunrise/sunset info.

Run tests with `npm test` inside `solar-analyzer-worker`.
