# MVP Questionnaire & Technical Alignment

Please answer the questions below by adding your notes or selections under each section. Once you save this file, we will finalize the architecture, database schema, and seed data scripts.

---

## 1. Database & Architecture (Foundation)

- **1.1 Database Engine Choice**
  - [x] PostgreSQL (Recommended for production & GIS/location support via PostGIS)
  - [ ] SQLite (Quick local setup, easy file-based reset, standard spatial extensions)
  - [ ] Other: **\_**

- **1.2 ORM / Database Toolkit**
  - [x] Prisma / Drizzle (TypeScript / Node.js backend)
  - [ ] SQLAlchemy / Peewee (Python backend)
  - [ ] Raw SQL / Custom migrations
  - [ ] Other: **\_**

- **1.3 Database Reset & Seeding Workflow**
  - Should the seed script generate deterministic dummy data (e.g., 5 test barbers with fixed geolocations, 10 test clients, preset appointments, service menus)?
    - Answer: \_yes
  - Do you want a CLI script (e.g., `npm run db:reset` or `python reset_db.py`) that drops, migrates, and seeds the DB in one command for local dev & E2E tests?
    - Answer: \_yes

---

## 2. Tech Stack & Frontend Strategy

- **2.1 Backend API Framework**
  - [x] Node.js (Express / Fastify / Next.js API Routes)
  - [ ] Python (FastAPI / Flask)
  - [ ] Other: **\_**

- **2.2 Frontend Framework**
  - [x] Web MVP (Next.js / Vite + React with Mobile-first responsive design)
  - [ ] Mobile Native App (React Native / Expo / Flutter)
  - [ ] Other: **\_**

---

## 3. Location & Geofencing Logic

- **3.1 How should search by location work in the MVP?**
  - [ ] Zip Code / Address radius search (e.g. Find barbers within X miles of an address)
  - [ ] Browser / Device GPS geolocation coordinates (Latitude/Longitude lookup)
  - [x] Both

- **3.2 Travel Radius for House-Call Barbers**
  - How should travel limits be enforced?
    - [x] Barber sets a fixed max travel radius (e.g. 15 miles) from their home base
    - [ ] Barber sets specific service zip codes / regions
    - [ ] Other: **\_**

---

## 4. Booking & Appointment Workflow

- **4.1 Booking Acceptance Mode**
  - [ ] Auto-confirm: Any open slot on the barber's calendar is instantly booked
  - [ ] Manual Approval: Barber receives a pending request and must accept/decline
  - [x] Configurable per barber

- **4.2 Service Types per Booking**
  - When booking, does the client explicitly choose the location type?
    - Options: "Barber's Studio / Home" vs "Client's Location (House Call)"
    - Answer: \_yes_barber provides options/availability

- **4.3 Service Duration & Buffers**
  - Does each service have a fixed time (e.g., Fade = 45 mins)?
  - Do we need automatic travel buffer time added between consecutive mobile appointments?
    - Answer: \_yes, estimated, account for travel time.

---

## 5. Payments, Fees & Deposits

- **5.1 Payment Flow for MVP**
  - [ ] Cash / Pay In-Person (Simplest for MVP)
  - [ ] Integrated Stripe / Online payments
  - [ ] Required upfront deposit to lock in appointment
        See requirements for MVP plan. Eventually we will follow uber like model.

- **5.2 House Call Travel Fees**
  - Should mobile barbers be able to charge a separate travel fee (e.g. flat rate or calculated distance fee)?
    - Answer: \_travel included in price for client site appointments. Barbers can configure different prices for client site appts vs in business appointments, etc

---

## 6. Notifications & Communications

- **6.1 MVP Notification Channels**
  - [x] In-app status dashboard / toast notifications
  - [ ] Email notifications (e.g. Resend / Nodemailer)
  - [ ] SMS reminders (e.g. Twilio)

---

## 7. Safety, Verification & Reviews

- **7.1 Reviews & Ratings**
  - Should reviews be bi-directional (clients rate barbers, barbers rate clients)?
    - Answer: _yes_

- **7.2 Barber Profile Setup**
  - What info is required before a barber can accept bookings?
    - (e.g. Name, Profile Photo, Portfolio Photos, Phone, Base Address, Services & Prices, Available Hours)
    - Answer: _yes_

---

## Notes & Additional Guidance

_(Feel free to write any extra requirements or ideas below)_
