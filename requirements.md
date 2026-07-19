# Technical Specification & Requirements: Fade Finder

![Fade Finder Logo](file:///home/enirrisky/.gemini/antigravity-cli/brain/bf7c24e6-27d2-4dad-a156-f512ca5c5b08/logo.png)

> **Fade Finder** — *Local Barbers. On Demand.*

## 1. Executive Summary
**Fade Finder** is a web-first (PWA) marketplace connecting clients with barbers offering both mobile/house-call services and fixed-location (home studio / storefront) appointments.

---

## 2. Technical Architecture & Tech Stack

### 2.1 Stack Selection
- **Database**: PostgreSQL (with PostGIS support for geolocation & spatial querying)
- **ORM**: Prisma / Drizzle ORM
- **Backend API**: Node.js (Next.js API Routes / Express / Fastify)
- **Frontend**: Web PWA (Next.js / React with mobile-first responsive design)
- **Authentication & Roles**: Client, Barber, Admin

### 2.2 Database Management & Test Strategy
- **Scrub & Seed Script**: A dedicated CLI command (`npm run db:reset`) that completely drops, runs migrations, and populates the database with deterministic mock data.
- **Mock Seed Data**:
  - 5 Barbers with defined service radii, geolocation coordinates, working hours, and pricing (studio vs. house call rates).
  - 10 Clients with past & upcoming appointments.
  - Service menus (Fade, Beard Trim, Hot Towel Shave, etc.).
  - Bi-directional reviews & ratings.

---

## 3. Core Features & Business Logic

### 3.1 User Roles & Authentication
- **Client**:
  - Searches barbers by GPS location or Zip Code/Address.
  - Filters by service type: Mobile (House Call) vs. Barber Studio.
  - Books appointments, specifies location (if house call), views appointment status.
  - Rates & reviews barbers after completed service.
- **Barber**:
  - Profile setup: Bio, DOPL / Professional License verification, portfolio gallery images.
  - Service Menu: Configures custom durations & dual-tier pricing (In-Studio price vs. House-Call price with travel included).
  - Availability & Radius: Sets working hours, maximum travel radius (e.g. 15 miles), and booking approval preference (Auto-confirm vs. Manual approval).
  - Appointment Manager: Accepts/declines requests, views client details, updates status.
  - Rates & reviews clients.

### 3.2 Search & Geolocation Engine
- Dual search capability: Browser GPS (Lat/Lng) lookup and Zip Code / Address geocoding.
- Radius filter calculating distance between Client's coordinates and Barber's base studio/travel radius.
- Mobile service calculation includes estimated travel time/buffers between consecutive mobile appointments.

### 3.3 Payments & Business Model
- **MVP Phase**: Direct external payments (Cash, Venmo, Zelle, Cash App) handled directly between client and barber upon completion. App is strictly for discovery, scheduling, and management.
- **Future Phase (Uber Model)**: Integrated Stripe payments, platform commission percentage per booking, tipping system (100% tip to barber), and instant payouts.

### 3.4 Notifications & Communication
- **MVP Phase**: In-app status dashboard and toast updates. Exchange of direct contact info (phone/email) upon booking confirmation.
- **Future Phase**: Live GPS transit tracking ("En route" map view) and real-time in-app message center.

---

## 4. Database Schema Outline (Initial Entity Model)

### Entities:
1. `User`: `id`, `email`, `password_hash`, `role` (`CLIENT`, `BARBER`, `ADMIN`), `phone`, `first_name`, `last_name`, `avatar_url`
2. `BarberProfile`: `id`, `user_id`, `bio`, `license_number`, `is_verified`, `base_address`, `latitude`, `longitude`, `max_travel_radius_miles`, `auto_confirm_bookings`
3. `Service`: `id`, `barber_id`, `name`, `description`, `duration_minutes`, `studio_price`, `house_call_price`
4. `BarberPortfolioImage`: `id`, `barber_id`, `image_url`, `caption`
5. `BarberAvailability`: `id`, `barber_id`, `day_of_week`, `start_time`, `end_time`
6. `Appointment`: `id`, `client_id`, `barber_id`, `service_id`, `location_type` (`STUDIO`, `HOUSE_CALL`), `client_address`, `client_latitude`, `client_longitude`, `start_time`, `end_time`, `status` (`PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `total_price`
7. `Review`: `id`, `appointment_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`, `created_at`
