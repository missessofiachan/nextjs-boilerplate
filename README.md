# Hartwell Primary School — Sustainable Travel System Prototype (S1–S9)

Next.js 16 (App Router) multi-viewport prototype and live portal for the Hartwell Primary School Sustainable Travel System, covering **S1–S9** across a **2-Member Equal Split (4.5 Screens Each)**:
- **Sofia Mironenko (4.5 Screens)**: `S1`, `S2`, `S3`, `S4`, and `0.5 × S5 (CR-01)`
- **Kim Le (4.5 Screens)**: `0.5 × S5 (CR-01)`, `S6`, `S7`, `S8`, and `S9`

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Evaluation Demo Credentials

| Role | Name | Email | Password | Default Target |
| :--- | :--- | :--- | :--- | :--- |
| **Parent & Carer** | Sarah Mitchell | `parent@hartwellps.vic.edu.au` | `HartwellParent2026!` | `/s7` (Parent Geofence Portal) |
| **Teacher & Duty** | Ms. Lin | `teacher@hartwellps.vic.edu.au` | `HartwellTeacher2026!` | `/s8` (Classroom Smartboard) |
| **School Admin** | Kim Le | `admin@hartwellps.vic.edu.au` | `HartwellAdmin2026!` | `/s6` (Admin Hub Roll Call & KPIs) |

## Screen & Route Map (S1–S9)

| Screen | Use Case | Short Route | Semantic Route | Owner |
| :--- | :--- | :--- | :--- | :--- |
| **S1** | `UC-01` Unified Login & Dynamic OTP | `/s1` | `/auth/login` | Sofia Mironenko |
| **S2** | `UC-02` 500m Hub Check-In & Walk Tracker | `/s2` | `/duty/hub-checkin` | Sofia Mironenko |
| **S3** | `UC-03` 9:00 AM SOS Alert & Walk Summary | `/s3` | `/duty/sos-escalation` | Sofia Mironenko |
| **S4** | `UC-04` Live BOM Weather & Traffic Feed | `/s4` | `/hazard/bom-feed` | Sofia Mironenko |
| **S5** | `UC-05` Alternate Route Selector (CR-01) | `/s5` | `/hazard/cr01-override` | Sofia M. (0.5) & Kim Le (0.5) |
| **S6** | `UC-06` Hub Roll Call & Congestion KPIs | `/s6` | `/admin/rollcall-kpis` | Kim Le |
| **S7** | `UC-07` Parental Live Geofence Portal | `/s7` | `/parent/live-geofence` | Kim Le |
| **S8** | `UC-08` Classroom Smartboard Leaderboard | `/s8` | `/classroom/walking-wednesday-whiteboard` | Kim Le |
| **S9** | `UC-09` Council Export & Accessibility | `/s9` | `/admin/council-export` | Kim Le |

Dedicated authentication routes:
- `/parent-login` — Parent & Carer Login
- `/parent-signup` — Parent Account Registration
- `/admin-login` — Staff, Teacher & Admin Operations Login
