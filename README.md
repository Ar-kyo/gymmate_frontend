# GymMate frontend

The React/Vite app is deliberately kept separate from LavaLust. LavaLust stays in the project root and serves the backend API from `app/controllers/Api.php`; this folder contains only the browser app.

## Local development

1. Copy the project-root `.env.example` to `.env`, then set the MySQL connection values and `APP_KEY`. Generate a key with `php -r "echo bin2hex(random_bytes(32));"`. Do not commit `.env`.
2. Set `APP_URL` to LavaLust's public entry-point URL. For this Laragon subfolder setup, use `http://localhost/gynmate/public/`; keep the trailing slash.
3. This Aiven MySQL database requires TLS. The local CA certificate is stored in `runtime\certs\aiven-ca.pem`; if setting up on another computer, download the CA certificate from Aiven and update `DB_SSL_CA` to its local path. `DB_SSL_MODE=required` enforces TLS and certificate verification; the connection fails closed if the certificate is missing.
4. Copy this folder's `.env.example` to `.env`. For Laragon serving this project from a subfolder, use `http://localhost/gynmate/public/` for `LAVALUST_URL`; adjust it if your LavaLust public URL differs.
5. Start Apache in Laragon, then from this folder run `npm install` once and `npm run dev`.
6. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

Vite proxies `/api` requests to LavaLust. Form requests use LavaLust's CSRF cookie/token and session authentication.

The public API health check is available at `APP_URL` followed by `api/health` (by default, `http://localhost/gynmate/public/api/health`). It reports whether MySQL is reachable, whether required GymMate tables are installed, whether GCash checkout keys are configured, and whether SMTP settings are present; it never returns credentials.

## Sessions, check-in, and location

The additive migration `database/migrations/001_attendance_and_sessions.sql` creates the attendance log and trainer-session booking tables. It has already been applied to the configured `gymmate` database. On another database, apply this migration after the existing GymMate schema; it uses `CREATE TABLE IF NOT EXISTS` and does not replace existing tables.

Members with an active membership can open a signed, short-lived QR pass in their dashboard. Trainers and the administrator can scan it from their dashboard (camera access requires localhost or HTTPS); the backend verifies the signature and checks the membership again before recording attendance. A scanner can also submit a token read by another QR app. Passes expire after five minutes and refresh automatically while the dashboard is open.

Member and trainer dashboards include a sticky, horizontally scrollable section bar so users can jump straight to passes, sessions, membership, coaching, health, attendance, availability, check-ins, plans, and progress.

Trainers accept or decline their own incoming coaching requests from the trainer dashboard. The backend checks that each request belongs to the signed-in trainer. Admins can view request status but cannot respond on a trainer's behalf. Trainers can add non-overlapping weekly availability. Members can book an available one-hour slot only after their selected trainer accepts the request. The backend checks that the slot still belongs to the trainer's schedule and is not booked for either the trainer or member. Members can cancel future bookings; trainers can cancel bookings or mark sessions complete after the session starts.

## GCash payments

Membership checkout uses PayMongo's hosted checkout API with **GCash as the only offered payment method**. The app creates a pending membership and sends the member to PayMongo. It activates the membership only after a signed `checkout_session.payment.paid` webhook confirms a paid GCash transaction with the expected amount and currency. Returning from the checkout page by itself never activates a membership. Admins cannot manually mark PayMongo GCash transactions as paid.

1. Create a PayMongo merchant account and enable GCash for the account. In PayMongo Developers, obtain a **test secret key** and create a test webhook subscribed to `checkout_session.payment.paid`.
2. Set `PAYMONGO_SECRET_KEY` and the matching webhook signing secret as `PAYMONGO_WEBHOOK_SECRET` in the ignored root `.env`. Never paste secret keys into chat or commit them. Local development requires a `sk_test_...` key with `APP_ENV=development`; production requires a `sk_live_...` key with `APP_ENV=production`.
3. Configure the webhook URL as `https://<public-host>/gynmate/public/api/payments/paymongo-webhook`. PayMongo cannot call `localhost`; use a temporary HTTPS tunnel for local tests or deploy the backend to a public HTTPS host. Keep `APP_FRONTEND_URL` set to the frontend origin where the member should return.
4. Restart/reload the backend after changing `.env`, verify `api/health` reports `gcash_payment_configured: true`, and test with PayMongo's test credentials before switching to live keys.

If the payment keys or webhook secret are missing or the key mode does not match `APP_ENV`, the API refuses to start a checkout instead of recording a fake successful payment. The existing payment table's `reference_number` stores the generated order reference, so no additional database migration is required.

The Location section and contact page use the approximate area “Masipit, Calapan City”; the embedded map is a search area, not an exact gym pin. The contact form emails the single administrator account using the configured SMTP settings, includes the sender's email as the reply-to address, and limits repeat submissions in the same session.

## Administrator access and operations

Public registration always creates a member account. Admins can also create member or trainer accounts from the dashboard, setting a temporary password to share securely with the new user; trainer accounts require a specialization and session rate. Admins can continue to change member/trainer roles and review legacy/manual membership payments. PayMongo GCash checkouts are confirmed only by signed webhook. Admins can view trainer request status, but only the assigned trainer can accept or decline that request. Admin API endpoints check the role in the database on every request; admin promotion is intentionally not exposed in the public API.

```sql
SELECT user_id, email, role FROM users WHERE email = 'owner@example.com';

START TRANSACTION;
UPDATE users SET role = 'member' WHERE role = 'admin';
UPDATE users SET role = 'admin' WHERE email = 'owner@example.com';
COMMIT;
```

Confirm the query returns exactly one row with the intended email before running the transaction. The owner account must already exist. Keep administrator credentials private.

## Welcome email

The backend sends a welcome email after the member account and health profile are saved. It uses LavaLust's Composer autoloader with PHPMailer over authenticated SMTP. The example uses Gmail SMTP (`smtp.gmail.com`, port `587`, TLS). Turn on 2-Step Verification for the sending Google account, create a Google App Password, then set `SMTP_USER` and `MAIL_FROM_ADDRESS` to that Gmail address and `SMTP_PASSWORD` to the App Password in the project-root `.env`. Do not use your normal Gmail password. The API clearly reports `emailSent: false` if email configuration or delivery fails; account creation remains complete.

## Database

Select the `gymmate` database shown in your database console, then import the table definitions and seed data from `gymmate_schema.sql`. The script's `CREATE DATABASE gymmate; USE gymmate;` lines are only needed if `gymmate` does not already exist. Set `DB_NAME=gymmate`. The app uses the `users`, `member_health`, `membership_plans`, `memberships`, `membership_payments`, `trainers`, and `trainer_requests` tables.

Database credentials were exposed in a shared project configuration. Rotate the database password with your provider before connecting, then put the replacement only in the ignored root `.env` file. Do not copy passwords into `.env.example`. For this Aiven database, download the CA certificate from the Aiven console, save it locally, and set `DB_SSL_CA` to its path. Keep `DB_SSL_MODE=required` so the backend verifies the database certificate and does not fall back to an unencrypted connection.

## Production

Run `npm run build` to generate the static app in `frontend/dist`. Serve that directory with a static web server and route `/api` to the LavaLust backend. Prefer serving the frontend and API on the same site so the secure session and CSRF cookies work reliably. If they use different origins on the same site, set `APP_FRONTEND_URL` to the exact frontend origin in the backend environment and set `VITE_API_BASE_URL` to the API base URL before building. Use HTTPS for deployed sites.
