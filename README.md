# Cinder by Ember

> **Supporting You** — IT Help Desk Training System

Cinder is a simulated IT help desk ticketing platform built for classroom use at EvCC. Students learn real IT workflows across three courses by submitting, managing, and resolving tickets against hands-on lab work.

---

## Courses

| Course | Term | Cohort |
|---|---|---|
| 🌐 Networking Fundamentals | Fall | NET + HW |
| 🖥 Hardware Essentials | Fall | NET + HW |
| 🔒 Cybersecurity Fundamentals | Spring | Cyber |

Networking and Hardware are cohorted — students take both simultaneously in Fall. Cybersecurity follows in Spring, building on the foundation from both Fall courses.

---

## How It Works

**Lecture day (Day 1):** Instructor introduces the week's concept. Students take notes in their physical lab book. Instructor activates the week's lab scenario in Cinder — students receive an inbox notification.

**Lab day (Day 2):** Students log in and see their assigned lab ticket front-and-center. The ticket is the lab instruction. Students work through the lab using physical equipment, document their steps as ticket notes, and resolve the ticket when done.

---

## Features

- **Ticket System** — Submit, assign, and resolve tickets with SLA timers and priority levels
- **Lab Manager** — Instructor activates lab scenarios week by week, assigns to individuals or broadcasts to the whole class
- **Knowledge Base** — Students submit draft articles, techs and admins publish them; builds a living class reference over the quarter
- **Incident Response** — Full PICERL lifecycle tracking (Prepare → Identify → Contain → Eradicate → Recover → Lessons Learned) for Cyber course
- **Inbox** — Simulated email notifications for ticket assignments, status changes, and lab activations
- **Role-based access** — Student, Tech, and Admin roles with different views and permissions
- **SLA Timers** — Live countdown timers per priority level; breached tickets surface to the top of the queue
- **Cross-course tickets** — Labs in weeks 8 and 10 explicitly link Networking and Hardware work

---

## Roles

| Role | Can Do |
|---|---|
| **Student** | Submit tickets, view own tickets, post notes, read KB, submit KB drafts |
| **Tech** | Everything above + manage queue, assign tickets, publish KB articles |
| **Admin / Instructor** | Everything above + Lab Manager, user management, reset data |

---

## Demo Logins

| Role | Email | Password |
|---|---|---|
| Student (Net/HW) | arivera@ember.io | student123 |
| Student (Cyber) | mlee@ember.io | student123 |
| Technician | storres@ember.io | tech123 |
| Instructor | instructor@ember.io | admin123 |

> ⚠️ Change all passwords in `src/data/seeds.js` before sharing with students.

---

## Project Structure

```
cinder/
  index.html              ← app entry point
  vite.config.js          ← Vite config (update base to match repo name)
  package.json            ← dependencies and scripts
  src/
    main.jsx              ← React entry point
    App.jsx               ← all UI components and application logic
    data/
      constants.js        ← SLA targets, colors, priorities, IR phases
      courses.js          ← course definitions and categories
      scenarios.js        ← all 30 lab scenarios (edit here each quarter)
      seeds.js            ← default users, tickets, KB articles, incidents
```

**Where to make common changes:**

| What you want to change | File |
|---|---|
| Lab scenario descriptions | `src/data/scenarios.js` |
| SLA targets (hours) | `src/data/constants.js` |
| Course names or categories | `src/data/courses.js` |
| Seed users or KB articles | `src/data/seeds.js` |
| UI components or logic | `src/App.jsx` |

---

## Setup

### Prerequisites
- [Node.js](https://nodejs.org) (LTS version)
- [Git](https://git-scm.com)
- GitHub account

### Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/TicketIT/` in your browser.

### Deploy to GitHub Pages

```bash
# First time setup — build and push to gh-pages branch
npm run build
git --work-tree dist add --all
git --work-tree dist commit -m "Deploy"
git push origin gh-pages --force
git checkout main
```

Then in GitHub → Settings → Pages → set branch to **gh-pages**.

Your live URL: `https://yourusername.github.io/TicketIT/`

### Subsequent Deploys

After making changes:

```bash
npm run build
git --work-tree dist add --all
git --work-tree dist commit -m "describe your change"
git push origin gh-pages --force
git checkout main
```

---

## 30 Lab Scenarios

### Networking Fundamentals
| Week | Title | Role | Mode |
|---|---|---|---|
| 1 | Identify Cable Types in the Lab | User | Broadcast |
| 2 | Connect Two PCs via Unmanaged Switch | Tech | Broadcast |
| 3 | Basic Cisco Switch Configuration | Tech | Individual |
| 4 | VLAN Setup and Inter-VLAN Routing | Tech | Pairs |
| 5 | Configure a Cisco Router — Basic Routing | Tech | Broadcast |
| 6 | Wireless Access Point Setup and Troubleshooting | Tech | Individual |
| 7 | Wireshark Packet Capture Analysis | Tech | Broadcast |
| 8 | ↔ Cross-Course: Network the PC You Built | Tech | Individual |
| 9 | Network Fault Simulation and Ticket Escalation | Admin | Broadcast |
| 10 | ↔ Full Network Build — Capstone | Admin | Teams |

### Hardware Essentials
| Week | Title | Role | Mode |
|---|---|---|---|
| 1 | Component Identification Inventory | User | Broadcast |
| 2 | POST Failure — Diagnose and Document | Tech | Pairs |
| 3 | PC Build from Components | Tech | Individual |
| 4 | OS Installation and Driver Management | Tech | Individual |
| 5 | BIOS/UEFI Exploration and Configuration | Tech | Broadcast |
| 6 | Laptop Disassembly and RAM/Storage Upgrade | Tech | Pairs |
| 7 | Peripheral Troubleshooting — USB and Display | Tech | Individual |
| 8 | ↔ Cross-Course: Prep Your PC for Network Integration | Tech | Individual |
| 9 | Hardware Fault Introduction and Diagnosis | Admin | Broadcast |
| 10 | ↔ Full Workstation Deployment — Capstone | Admin | Teams |

### Cybersecurity Fundamentals
| Week | Title | Role | Mode |
|---|---|---|---|
| 1 | Security Audit — Your Own Lab PC | User | Broadcast |
| 2 | Network Reconnaissance with Nmap | Tech | Broadcast |
| 3 | Password Policy Audit and Hardening | Tech | Individual |
| 4 | Hak5 WiFi Pineapple — Recon and Awareness | Tech | Broadcast |
| 5 | Vulnerability Scanning with OpenVAS or Nessus | Tech | Pairs |
| 6 | Incident Response — Simulated Malware Alert | Tech | Broadcast |
| 7 | Hak5 Rubber Ducky — Physical Attack Awareness | Tech | Broadcast |
| 8 | Firewall Rule Audit and Hardening | Tech | Individual |
| 9 | Full Incident Simulation — Red vs Blue | Admin | Teams |
| 10 | Security Hardening Capstone — Full Environment | Admin | Teams |

↔ = Cross-course lab (references both Networking and Hardware)

---

## Brand

**Company:** Ember — boutique IT specialist
**Product:** Cinder by Ember
**Tagline:** Supporting You
**Personality:** Cozy, craft, trustworthy, reliable

| Token | Value |
|---|---|
| Amber Warm (accent) | `#E8922E` |
| Black (background) | `#0D0D0D` |
| Charcoal Deep (surface) | `#1A1A1A` |
| Charcoal (border) | `#242424` |
| White (text) | `#F0EDE8` |
| Display font | Raleway |
| Body font | Inter |
| Mono font | JetBrains Mono |

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
