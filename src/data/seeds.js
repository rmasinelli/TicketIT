// ─────────────────────────────────────────────
// seeds.js
// Default data loaded on first run.
// After first load, all data lives in storage —
// changes here won't affect existing sessions
// unless you clear storage or reset from Admin.
//
// TO ADD STUDENTS: add entries to SEED_USERS.
// TO ADD KB ARTICLES: add entries to SEED_KB.
// ─────────────────────────────────────────────

const now = Date.now();

// ── Users ────────────────────────────────────
// roles:   "student" | "tech" | "admin"
// cohort:  "net-hw" | "cyber" | "all"
// NOTE: Passwords are plain text (demo only).
//       Change before sharing with students.
export const SEED_USERS = [
  { id:"u1", name:"Alex Rivera",  email:"arivera@ember.io",  role:"student", password:"student123", cohort:"net-hw" },
  { id:"u2", name:"Jordan Kim",   email:"jkim@ember.io",     role:"student", password:"student123", cohort:"net-hw" },
  { id:"u3", name:"Casey Nguyen", email:"cnguyen@ember.io",  role:"student", password:"student123", cohort:"net-hw" },
  { id:"u4", name:"Morgan Lee",   email:"mlee@ember.io",     role:"student", password:"student123", cohort:"cyber"  },
  { id:"u5", name:"Sam Torres",   email:"storres@ember.io",  role:"tech",    password:"tech123",    cohort:"net-hw" },
  { id:"u6", name:"Dana Park",    email:"dpark@ember.io",    role:"tech",    password:"tech123",    cohort:"cyber"  },
  { id:"u7", name:"Instructor",   email:"instructor@ember.io",role:"admin",  password:"admin123",   cohort:"all"    },
];

// ── Tickets ───────────────────────────────────
export const SEED_TICKETS = [
  {
    id: "TKT-001",
    title: "WiFi down on the floor — need someone out here",
    courseId: "net",
    categories: ["Diagnostics","Wireless"],
    priority: "High",
    status: "Open",
    submittedBy: "u1",
    requesterId: "pgd-reyes",
    assignedTo: "u5",
    description: "WIFI IS DOWN IN OPERATORIES 2 AND 3. WE HAVE PATIENTS WAITING. THE IMAGING SYSTEM RUNS ON WIRELESS AND WE CANNOT TAKE X-RAYS. THIS NEEDS TO BE FIXED NOW.\n\n— Dr. Reyes",
    created: new Date(now - 5 * 3600000).toISOString(),
    notes: [{ author:"u5", text:"Checking SSID config and IP lease on the Meraki AP covering ops 2–3.", ts: new Date(now - 4 * 3600000).toISOString() }],
    linkedCourse: null, labScenarioId: null, week: null,
  },
  {
    id: "TKT-002",
    title: "Computer in the back is doing it again",
    courseId: "hw",
    categories: ["POST/Boot Issue","Component Failure"],
    priority: "High",
    status: "Open",
    submittedBy: "u2",
    requesterId: "cmw-marcus",
    assignedTo: null,
    description: "The computer in the back. It's doing that thing again. Can someone come look at it.",
    created: new Date(now - 2 * 3600000).toISOString(),
    notes: [],
    linkedCourse: null, labScenarioId: null, week: null,
  },
  {
    id: "TKT-003",
    title: "New hire laptop — Riley starts Monday",
    courseId: null,
    categories: ["Hardware Setup"],
    priority: "Medium",
    status: "Open",
    submittedBy: "u1",
    requesterId: "emb-priya",
    assignedTo: null,
    description: "Hi! We have a new hire starting Monday — Riley Chen, joining the dispatch team. I ordered the laptop (it's on Dean's desk). Can someone get it imaged and set up with the standard apps? She'll need access to the ticketing system and Outlook. Thanks so much! 😊\n\n— Priya",
    created: new Date(now - 1 * 86400000).toISOString(),
    notes: [],
    linkedCourse: null, labScenarioId: null, week: null,
  },
  {
    id: "TKT-004",
    title: "I need a new hard drive for my PC",
    courseId: "hw",
    categories: ["Storage","Diagnostics"],
    priority: "Medium",
    status: "Open",
    submittedBy: "u1",
    requesterId: "cmw-sam",
    assignedTo: null,
    description: "My PC is slow and I've done some research. It's definitely the hard drive — I need a new SSD. The current one is failing. Can you order a 1TB SSD and swap it out? I need this done this week, I have quotes due Friday.",
    created: new Date(now - 3 * 3600000).toISOString(),
    notes: [],
    linkedCourse: null, labScenarioId: null, week: null,
  },
  {
    id: "TKT-005",
    title: "Internet has been a little slow lately",
    courseId: "net",
    categories: ["Diagnostics","WAN/ISP"],
    priority: "Low",
    status: "Open",
    submittedBy: "u1",
    requesterId: "cmw-denise",
    assignedTo: null,
    description: "I'm so sorry to bother you with this, I know you're all really busy. The internet has just been a little slow for me lately. It's probably nothing. I can wait if there are more important things going on. It's just that sometimes QuickBooks takes forever to save and I wasn't sure if that was normal.",
    created: new Date(now - 6 * 3600000).toISOString(),
    notes: [],
    linkedCourse: null, labScenarioId: null, week: null,
  },
];

// ── Knowledge Base Articles ───────────────────
export const SEED_KB = [
  {
    id: "kb-001",
    title: "How to Cable a Patch Panel",
    courseId: "net",
    category: "Cable/Physical Layer",
    status: "published",
    authorId: "u5",
    tags: ["cabling","patch panel","T568B"],
    created: new Date(now - 10 * 86400000).toISOString(),
    updated: new Date(now - 10 * 86400000).toISOString(),
    body: `## Overview
Patch panels provide a central termination point for structured cabling. Proper termination ensures signal integrity and makes troubleshooting easier.

## Steps
1. Strip the outer jacket ~1 inch — avoid nicking the pairs.
2. Untwist each pair only as much as needed (keep untwist < 1/2 inch for Cat6).
3. Follow the T568B wiring standard: W/O, O, W/G, B, W/B, G, W/Br, Br.
4. Seat each conductor into the IDC slot and punch down firmly.
5. Label the port on both the patch panel and the wall plate.

## Tips
- Always use a proper punch-down tool — a screwdriver will damage the IDC.
- Document every port in your cable management spreadsheet.
- Test with a cable tester before closing up the rack.

## Related
See also: Switch Configuration, Structured Cabling Standards`,
  },
  {
    id: "kb-002",
    title: "POST Beep Code Reference",
    courseId: "hw",
    category: "POST/Boot Issue",
    status: "published",
    authorId: "u5",
    tags: ["POST","beep codes","hardware","troubleshooting"],
    created: new Date(now - 7 * 86400000).toISOString(),
    updated: new Date(now - 7 * 86400000).toISOString(),
    body: `## What is POST?
Power-On Self-Test (POST) runs every time a PC boots. If it detects a hardware failure, it signals via beep codes before video initializes.

## AMI BIOS Beep Codes
| Beeps | Meaning |
|---|---|
| 1 short | Normal boot |
| 2 short | CMOS error |
| 1 long, 2 short | Video card failure |
| 1 long, 3 short | Video memory failure |
| 3 long | Keyboard error |
| Continuous | RAM or power issue |

## Award BIOS
| Beeps | Meaning |
|---|---|
| 1 long, 2 short | Video failure |
| Repeating short | RAM failure |

## Troubleshooting Steps
1. Identify your BIOS manufacturer (check the boot screen or motherboard manual).
2. Count the beeps carefully — pattern matters.
3. Reseat the indicated component first before replacing.
4. Try known-good RAM in slot A1 only to isolate memory issues.`,
  },
  {
    id: "kb-003",
    title: "Nmap Quick Reference",
    courseId: "cyber",
    category: "Threat Intel",
    status: "published",
    authorId: "u6",
    tags: ["nmap","scanning","recon","cyber"],
    created: new Date(now - 5 * 86400000).toISOString(),
    updated: new Date(now - 5 * 86400000).toISOString(),
    body: `## Common Nmap Commands

### Basic host discovery
\`nmap -sn 192.168.1.0/24\`
Ping scan — finds live hosts without port scanning.

### SYN scan (stealth)
\`nmap -sS -p 1-1024 192.168.1.10\`
Requires root. Fast and less likely to appear in logs.

### Service version detection
\`nmap -sV 192.168.1.10\`
Identifies running service versions — critical for vuln matching.

### OS detection
\`nmap -O 192.168.1.10\`

### Full aggressive scan
\`nmap -A -T4 192.168.1.0/24\`
⚠️ Only use on networks you own or have explicit permission to scan.

## Output Formats
- \`-oN\` — normal text
- \`-oX\` — XML (for import into tools)
- \`-oG\` — grepable

## Lab Notes
Always document: target IP, scan type, timestamp, and key findings in your ticket notes.`,
  },
  {
    id: "kb-004",
    title: "Incident Response Checklist — First 30 Minutes",
    courseId: "cyber",
    category: "Incident Response",
    status: "published",
    authorId: "u6",
    tags: ["IR","incident response","checklist","containment"],
    created: new Date(now - 3 * 86400000).toISOString(),
    updated: new Date(now - 3 * 86400000).toISOString(),
    body: `## The First 30 Minutes Matter Most
The actions you take immediately after detecting an incident determine how much damage is done and how much evidence survives.

## Immediate Steps

### 1. Don't panic — document first
- Note the exact time you detected the issue.
- Screenshot or photograph anything on screen before touching it.

### 2. Identify scope
- What systems are affected?
- Is this isolated or spreading?
- What data might be at risk?

### 3. Contain — don't eradicate yet
- Isolate affected systems from the network (pull cable or disable NIC — do NOT power off).
- Preserve volatile data: running processes, network connections, logged-in users.

### 4. Collect evidence
\`netstat -ano\`          active connections
\`tasklist /v\`           running processes
\`ipconfig /all\`         network config
\`wevtutil qe Security\`  security event log

### 5. Open an IR ticket immediately
- Log everything you observe, even if it seems minor.
- Timestamps are critical.

## Remember
Eradication comes AFTER full investigation. Wiping a machine before understanding the attack destroys evidence and may leave the root cause in place.`,
  },
];

// ── Incidents ─────────────────────────────────
export const SEED_INCIDENTS = [
  {
    id: "INC-001",
    title: "Unauthorized Access Attempt — Lab Workstation 3",
    severity: "High",
    phase: "Contain",
    courseId: "cyber",
    affectedSystems: ["Lab WS-03","Lab Switch Port 12"],
    description: "Student reported unusual login prompts on WS-03 during open lab. Investigation revealed repeated failed SSH attempts from an internal IP followed by one successful login with a default credential.",
    linkedTickets: [],
    timeline: [
      { ts: new Date(now - 4*3600000).toISOString(), author:"u6", phase:"Identify", note:"Alert received. Student reported suspicious activity on WS-03. Began investigation." },
      { ts: new Date(now - 3*3600000).toISOString(), author:"u6", phase:"Identify", note:"Pulled auth logs — 47 failed SSH attempts from 192.168.1.88 over 20 mins, then one success using credentials 'admin/admin'." },
      { ts: new Date(now - 2*3600000).toISOString(), author:"u6", phase:"Contain",  note:"Isolated WS-03 from network. Disabled the default account. Preserved memory dump and event logs." },
    ],
    postMortem: "",
    created: new Date(now - 4*3600000).toISOString(),
    createdBy: "u6",
  },
];

export const SEED_NOTIFS     = [];
export const SEED_ACTIVE_LABS = {};
