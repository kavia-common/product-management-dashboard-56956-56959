# product-management-dashboard-56956-56959

## inventory_tracker_frontend

React (Vite) frontend for the Inventory Tracker.

### Run locally

1. Create an env file (see `.env.example`):
   - `inventory_tracker_frontend/.env` (do not commit)
2. Install dependencies:
   - `npm install`
3. Start dev server:
   - `npm run dev`

The UI expects the backend to expose:
- `GET /products`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- Live updates (best-effort): `GET /events` (Server-Sent Events)
