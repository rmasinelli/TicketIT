# Cinder by Ember

> IT Help Desk Training System — EvCC

Cinder is a simulated IT help desk ticketing platform built for classroom use at EvCC. Students learn real IT workflows across three courses by submitting, managing, and resolving tickets tied to hands-on lab work. All student data is FERPA-compliant — no personally identifiable information is stored.

**Live site:** [rmasinelli.github.io/Cinder](https://rmasinelli.github.io/Cinder/)

---

## Courses

| Course | Term | Track |
|---|---|---|
| 🌐 Networking Fundamentals | Fall | NET + HW |
| 🖥 Hardware Essentials | Fall | NET + HW |
| 🔒 Cybersecurity Fundamentals | Spring | Cyber |

Networking and Hardware are cohorted — students take both simultaneously in Fall. Cybersecurity follows in Spring, building on the foundation from both Fall courses.

---

## How It Works

**Before lab day:** Instructor logs into Cinder, goes to Lab Manager, selects the week's scenario, and clicks **Push to Students**. Tickets are instantly assigned to every enrolled student.

**Lab day:** Students log in and open **My Labs** to see their assigned ticket. The ticket contains the lab instructions. Students work through the lab on physical equipment, document every step in the built-in **Lab Documentation** editor, and update their ticket status as they progress.

---

## Features

- **Supabase Auth** — Students enroll with a class code and a self-chosen alias. No email, no real name, no student ID stored (FERPA-compliant).
- **Lab Manager** — Instructor pushes weekly lab scenarios to all students (or select individuals/pairs) with one click.
- **My Labs** — Students see their assigned tickets and write lab documentation that saves to the cloud, accessible from any device.
- **Lab Documentation** — Per-ticket notes editor for students to record troubleshooting steps, commands, observations, and resolutions.
- **Ticket System** — Submit, assign, and resolve tickets with SLA timers and priority levels.
- **Knowledge Base** — Students submit draft articles; admins publish them. Builds a living class reference over the quarter.
- **Incident Response** — Full PICERL lifecycle tracking for the Cybersecurity course.
- **Inbox** — Notifications for ticket assignments and status changes.
- **Role-based access** — Student and Admin roles with appropriate views and permissions.

---

## Roles

| Role | Can Do |
|---|---|
| **Student** | View My Labs, write lab documentation, submit tickets, view own tickets, read KB |
| **Admin / Instructor** | Everything above + Lab Manager (push assignments), view all students, manage classes |

---

## Auth Flow (FERPA-Safe)

No personally identifiable information is stored at any point.

**First time (Join Class):**
1. Student enters the class enrollment code given by the instructor
2. Student picks any alias — does not have to be their real name
3. Student selects their track (Networking+Hardware or Cybersecurity)
4. Student sets a password (6+ characters)

**Returning (Sign In):**
- Alias + password only. Class code is remembered on the device after first login.
- On a new device, the class code field reappears once, then is cached.

**Instructor setup:**
1. Create a class in Supabase → Table Editor → `classes` (set `name` and `code`)
2. Sign up via Join Class using that code
3. In Supabase → Table Editor → `profiles`, change your `role` to `admin`

---

## Project Structure

```
Cinder/
  index.html                ← Vite entry point (source, not built)
  vite.config.js            ← base path must match repo name
  package.json
  src/
    main.jsx                ← React entry point
    App.jsx                 ← all UI components and application logic
    lib/
      supabase.js           ← Supabase client (URL + anon key)
    data/
      constants.js          ← SLA targets, colors, priorities, IR phases
      courses.js            ← course definitions and categories
      scenarios.js          ← all 30 lab scenarios (edit here each quarter)
      seeds.js              ← fallback seed data for non-auth views
  supabase-schema.sql       ← initial database schema
  supabase-patch-1.sql      ← cohort column + public class read policy
  supabase-patch-2.sql      ← fix recursive RLS on profiles
  supabase-patch-3.sql      ← assigned_tickets column updates
  supabase-patch-4.sql      ← admin insert policies + lab_notes unique constraint
```

**Where to make common changes:**

| What | File |
|---|---|
| Lab scenario descriptions | `src/data/scenarios.js` |
| SLA targets (hours) | `src/data/constants.js` |
| Course names or categories | `src/data/courses.js` |
| Supabase connection | `src/lib/supabase.js` |
| UI or logic | `src/App.jsx` |

---

## Database Tables (Supabase)

| Table | Purpose |
|---|---|
| `classes` | Class name and enrollment code |
| `profiles` | Student/admin alias, role, track, class — no PII |
| `lab_assignments` | Instructor push events (one per week per class) |
| `assigned_tickets` | Student ↔ scenario link with status |
| `lab_notes` | Student documentation per assigned ticket |
| `ticket_templates` | Reserved for future scenario management |

---

## Deployment

Deployments are automated via GitHub Actions. Any push to `main` triggers a build and deploys to the `gh-pages` branch.

### Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/Cinder/` in your browser.

### Manual Deploy (if needed)

Push to `main` — the GitHub Actions workflow handles the rest.

If the workflow isn't set up, go to `.github/workflows/deploy.yml`.

---

## 30 Lab Scenarios

### Networking Fundamentals
| Week | Title | Mode |
|---|---|---|
| 1 | Identify Cable Types in the Lab | Broadcast |
| 2 | Connect Two PCs via Unmanaged Switch | Broadcast |
| 3 | Basic Cisco Switch Configuration | Individual |
| 4 | VLAN Setup and Inter-VLAN Routing | Pairs |
| 5 | Configure a Cisco Router — Basic Routing | Broadcast |
| 6 | Wireless Access Point Setup and Troubleshooting | Individual |
| 7 | Diagnose a Broken Network Path | Individual |
| 8 | Link Aggregation and Redundancy (Cross-course) | Pairs |
| 9 | Network Monitoring and Baselining | Broadcast |
| 10 | Full Network Build from Scratch (Cross-course) | Teams |

### Hardware Essentials
| Week | Title | Mode |
|---|---|---|
| 1 | PC Component Identification | Broadcast |
| 2 | POST Error Diagnosis | Individual |
| 3 | RAM and Storage Benchmarking | Individual |
| 4 | OS Installation and Driver Setup | Individual |
| 5 | BIOS Configuration and Boot Order | Individual |
| 6 | Laptop Disassembly and Reassembly | Pairs |
| 7 | Peripheral Troubleshooting | Individual |
| 8 | NIC Configuration and Network Integration (Cross-course) | Pairs |
| 9 | System Imaging and Cloning | Broadcast |
| 10 | Workstation Deployment (Cross-course) | Teams |

### Cybersecurity Fundamentals
| Week | Title | Mode |
|---|---|---|
| 1 | Security Audit of a Workstation | Individual |
| 2 | Access Control and User Permissions | Individual |
| 3 | Vulnerability Scanning with Nmap | Individual |
| 4 | Suspicious Activity Investigation | Individual |
| 5 | Firewall Rule Configuration | Pairs |
| 6 | Phishing Simulation and Analysis | Broadcast |
| 7 | Log Analysis and Threat Detection | Individual |
| 8 | Incident Response — Ransomware Scenario | Teams |
| 9 | Forensics: Recovering Deleted Evidence | Pairs |
| 10 | Full Security Assessment Report | Individual |

---

## Tech Stack

- **React 18** + **Vite 5**
- **Supabase** — Auth + Postgres database
- **GitHub Pages** — Hosting (auto-deployed via GitHub Actions)
- **gh-pages** npm package — Build artifact publishing
