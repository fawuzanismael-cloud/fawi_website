 # FAWI Exit Exam Platform

 A secure exam-preparation platform built with Next.js, Prisma, PostgreSQL, and TypeScript. It includes student authentication, department-scoped exam access, timed practice exams, admin exam uploads, subscriptions, and payment webhook verification.

 ## Local setup

 1. Install dependencies.
 2. Copy `.env.example` to `.env.local`.
 3. Fill in a PostgreSQL connection string and strong random secrets.
 4. Generate Prisma Client and push the schema:

 ```text
 npx prisma generate
 npx prisma db push
 ```

 5. Start the development server and open `http://localhost:3000`.

 Required environment variables:

 - `DATABASE_URL`: PostgreSQL connection string.
 - `JWT_SECRET`: long random signing secret.
 - `PAYMENT_WEBHOOK_SECRET`: secret configured with the payment provider.
 - `NEXT_PUBLIC_APP_URL`: public application URL.
 - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: first administrator credentials.
 - `ADMIN_BOOTSTRAP_SECRET`: one-time bootstrap request secret.

The JWT and bootstrap secrets must be long random values. The sample `.env.local` is only a placeholder and must be replaced before running the app with real users.

 ## First administrator and catalog

 With the database available, create the first admin by sending a `POST` request to `/api/admin/seed-admin` with the `x-admin-bootstrap-secret` header set to `ADMIN_BOOTSTRAP_SECRET`. The endpoint can only bootstrap when no admin exists; after that, it requires an authenticated admin session.

 Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, open `/admin`, and seed the departments and Ethiopian exam-year catalog. Then upload a JSON or CSV exam file. `sample-exam.json` demonstrates the expected JSON shape.

 ## Verification

 Run the production checks before deployment:

 ```text
 npm run lint
 npm run build
 ```

 ## Deployment checklist

 - Use a managed PostgreSQL database and set all variables in the hosting provider's encrypted environment settings.
 - Run `npx prisma db push` against the intended database during initial provisioning.
 - Configure the payment provider webhook URL as `https://your-domain.example/api/payments/webhook`.
 - Use HTTPS, rotate bootstrap/admin secrets after initial setup, and never commit `.env.local`.
 - Configure rate limiting and monitoring at the hosting or edge layer before accepting public traffic.
