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

  // ── NETWORKING ───────────────────────────────────────────────

  {
    id: "kb-001",
    title: "How to Cable a Patch Panel",
    courseId: "net",
    category: "Cable/Physical Layer",
    status: "published",
    authorId: "u5",
    tags: ["cabling","patch panel","T568B"],
    created: new Date(now - 30 * 86400000).toISOString(),
    updated: new Date(now - 30 * 86400000).toISOString(),
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
See also: Switch Configuration Basics, Structured Cabling Standards`,
  },

  {
    id: "kb-005",
    title: "Switch Configuration Basics",
    courseId: "net",
    category: "Switch/Router Config",
    status: "published",
    authorId: "u5",
    tags: ["switch","cisco","CLI","IOS"],
    created: new Date(now - 28 * 86400000).toISOString(),
    updated: new Date(now - 28 * 86400000).toISOString(),
    body: `## Connecting to a Cisco Switch
Use a console cable (rollover) from the switch's console port to a USB-to-serial adapter on your laptop. Open PuTTY or a terminal at 9600 baud, 8N1.

## Essential First Commands
\`\`\`
enable                        ! enter privileged EXEC mode
show version                  ! hardware, IOS version, uptime
show running-config           ! current config in RAM
show interfaces status        ! port up/down, speed, duplex
show mac address-table        ! which MAC is on which port
show ip interface brief       ! IP address summary (Layer 3 switches)
\`\`\`

## Basic Hardening
\`\`\`
conf t
hostname SW-FLOOR1
no ip domain-lookup           ! stop DNS lookup on typos
service password-encryption
banner motd # Authorized access only #
line con 0
 password cisco
 login
line vty 0 15
 password cisco
 login
 transport input ssh
\`\`\`

## Saving Your Work
\`\`\`
copy running-config startup-config
! or shorthand:
wr
\`\`\`
⚠️ If you don't save, changes are lost on reboot.

## Common Mistakes
- Forgetting \`enable\` before trying configuration commands.
- Saving a broken config — always verify with \`show run\` before writing.
- Leaving VTY lines open with no password (security violation on any real network).

## Related
See also: VLAN Configuration, How to Cable a Patch Panel`,
  },

  {
    id: "kb-006",
    title: "VLAN Configuration and Troubleshooting",
    courseId: "net",
    category: "Switch/Router Config",
    status: "published",
    authorId: "u5",
    tags: ["VLAN","trunking","802.1Q","switch"],
    created: new Date(now - 25 * 86400000).toISOString(),
    updated: new Date(now - 25 * 86400000).toISOString(),
    body: `## What is a VLAN?
A Virtual LAN segments a physical switch into isolated broadcast domains. Traffic between VLANs requires a Layer 3 device (router or L3 switch).

## Creating VLANs
\`\`\`
conf t
vlan 10
 name OFFICE
vlan 20
 name IMAGING
vlan 99
 name MANAGEMENT
\`\`\`

## Assigning Access Ports
\`\`\`
interface fa0/1
 switchport mode access
 switchport access vlan 10
 description PC-Workstation
\`\`\`

## Configuring a Trunk Port
\`\`\`
interface gi0/1
 switchport mode trunk
 switchport trunk encapsulation dot1q     ! may not be needed on newer IOS
 switchport trunk allowed vlan 10,20,99
 description UPLINK-TO-ROUTER
\`\`\`

## Verification Commands
\`\`\`
show vlan brief                ! all VLANs and their ports
show interfaces trunk          ! trunk ports, allowed VLANs, native VLAN
show interfaces fa0/1 switchport
\`\`\`

## Common Problems
| Symptom | Likely Cause |
|---|---|
| Device can't reach gateway | Port in wrong VLAN |
| Traffic crosses VLAN boundary | Native VLAN mismatch on trunk |
| VLAN missing on remote switch | Not added to trunk allowed list |
| Intermittent drops on trunk | Duplex/speed mismatch |

## Related
See also: Switch Configuration Basics, DHCP Troubleshooting`,
  },

  {
    id: "kb-007",
    title: "Wireless Troubleshooting",
    courseId: "net",
    category: "Wireless",
    status: "published",
    authorId: "u5",
    tags: ["wifi","wireless","AP","SSID","troubleshooting"],
    created: new Date(now - 22 * 86400000).toISOString(),
    updated: new Date(now - 22 * 86400000).toISOString(),
    body: `## Wireless Troubleshooting Methodology
Work from the physical layer up. Most wireless issues are caused by signal, association, or DHCP — in that order.

## Layer 1 — Signal
- Is the AP powered? Check PoE switch port LED and AP status light.
- Is the client within range? Walls, metal, and microwave ovens cause interference.
- Check channel congestion: use inSSIDer or WiFi Analyzer to see nearby SSIDs and their channels.
- 2.4 GHz has more range but more congestion. 5 GHz is faster but shorter range.

## Layer 2 — Association
- Can the client see the SSID? If not, check SSID broadcast setting on the AP.
- Is the client connecting to the right AP? Check which BSSID (AP MAC) the client is associated with.
- Is the password correct? Wrong PSK = immediate failure after association attempt.
- Check for MAC filtering — the client's MAC may be blocked.

## Layer 3 — IP Address
\`\`\`
ipconfig /all         ! is the client getting a valid IP? 169.254.x.x = APIPA, no DHCP
ipconfig /release
ipconfig /renew
ping 192.168.1.1      ! can you reach the default gateway?
ping 8.8.8.8          ! can you reach the internet?
nslookup google.com   ! is DNS working?
\`\`\`

## AP-Side Checks (Meraki / Ubiquiti)
- Check the AP's client list — is the device associated?
- Review AP event logs for deauth or auth failure messages.
- Confirm the AP is on the correct VLAN for that SSID.

## Quick Wins
- Reboot the AP (unplug PoE or power cycle injector). Wait 90 seconds.
- Forget the network on the client and reconnect.
- Move the client closer to the AP to rule out signal issues.

## Related
See also: DHCP Troubleshooting, VLAN Configuration`,
  },

  {
    id: "kb-008",
    title: "DHCP Troubleshooting",
    courseId: "net",
    category: "Diagnostics",
    status: "published",
    authorId: "u5",
    tags: ["DHCP","IP","169.254","ipconfig","troubleshooting"],
    created: new Date(now - 20 * 86400000).toISOString(),
    updated: new Date(now - 20 * 86400000).toISOString(),
    body: `## Recognizing a DHCP Problem
A client that can't get a DHCP lease shows an APIPA address: **169.254.x.x**. This means the device tried to reach a DHCP server and failed, then assigned itself a link-local address.

## Client-Side Steps
\`\`\`
ipconfig /all                 ! check IP, subnet, gateway, DHCP server, lease time
ipconfig /release             ! drop the current lease
ipconfig /renew               ! request a new lease
ipconfig /flushdns            ! clear stale DNS cache
\`\`\`
If \`/renew\` fails with "unable to contact DHCP server" — the problem is upstream.

## Server/Network-Side Steps
1. **Is the DHCP server reachable?** Ping the DHCP server IP from a known-good machine.
2. **Is the scope exhausted?** Log into the DHCP server and check available addresses. A full scope means no new leases until old ones expire.
3. **Is there a DHCP relay?** If the client is on a different VLAN than the DHCP server, a relay agent (ip helper-address) must be configured on the router/L3 switch.
4. **Rogue DHCP server?** Check if an unauthorized device (consumer router plugged in backwards) is handing out wrong addresses.

## Cisco DHCP Commands
\`\`\`
show ip dhcp pool             ! configured scopes
show ip dhcp binding          ! active leases (IP → MAC mapping)
show ip dhcp conflict         ! addresses that caused conflicts
ip helper-address 10.0.0.10   ! configure relay on router interface
\`\`\`

## Field Journal Prompt
Document: client IP before and after, DHCP server IP, lease duration, resolution steps.`,
  },

  {
    id: "kb-009",
    title: "DNS Troubleshooting",
    courseId: "net",
    category: "Diagnostics",
    status: "published",
    authorId: "u5",
    tags: ["DNS","nslookup","dig","troubleshooting","name resolution"],
    created: new Date(now - 18 * 86400000).toISOString(),
    updated: new Date(now - 18 * 86400000).toISOString(),
    body: `## How to Confirm It's a DNS Problem
If \`ping 8.8.8.8\` works but \`ping google.com\` fails — it's DNS.

## Basic DNS Commands
\`\`\`
nslookup google.com                   ! query default DNS server
nslookup google.com 8.8.8.8           ! query a specific server
nslookup -type=MX ember.io            ! look up mail records
ipconfig /displaydns                  ! show local DNS cache
ipconfig /flushdns                    ! clear local DNS cache
\`\`\`

## Common Problems
| Symptom | Likely Cause |
|---|---|
| All DNS fails, IP works | Wrong DNS server configured |
| Intermittent failures | DNS server overloaded or flapping |
| Internal names fail, external works | Missing internal DNS zone |
| Stale record (old IP) | Cache not yet expired, flush needed |

## Checking DNS Server Config
\`\`\`
ipconfig /all     ! look at "DNS Servers" field
\`\`\`
The DNS server should be the domain controller IP (internal) or gateway — not 127.0.0.1 unless a local resolver is running.

## Quick Fix Checklist
- [ ] Flush DNS cache on client
- [ ] Confirm correct DNS server IP in adapter settings
- [ ] Test with a known-good external DNS (8.8.8.8, 1.1.1.1)
- [ ] Check DNS server logs if internal names are failing
- [ ] Verify A records exist for internal hostnames`,
  },

  {
    id: "kb-010",
    title: "Firewall Rules — Concepts and Basics",
    courseId: "net",
    category: "Firewall/Security",
    status: "draft",
    authorId: "u5",
    tags: ["firewall","ACL","rules","security"],
    created: new Date(now - 5 * 86400000).toISOString(),
    updated: new Date(now - 5 * 86400000).toISOString(),
    body: `## 🚧 In Progress
This article is being written. Check back soon.

## Topics Planned
- Stateful vs stateless inspection
- Reading a firewall rule table (source, destination, port, action)
- Common rules for SMB environments
- Testing rules without breaking things
- Meraki MX firewall — GUI walkthrough
- Logging and alert interpretation`,
  },

  // ── HARDWARE ─────────────────────────────────────────────────

  {
    id: "kb-002",
    title: "POST Beep Code Reference",
    courseId: "hw",
    category: "POST/Boot Issue",
    status: "published",
    authorId: "u5",
    tags: ["POST","beep codes","hardware","troubleshooting"],
    created: new Date(now - 29 * 86400000).toISOString(),
    updated: new Date(now - 29 * 86400000).toISOString(),
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
4. Try known-good RAM in slot A1 only to isolate memory issues.

## No Beeps at All?
- Check power connections (24-pin ATX and 8-pin EPS CPU connector).
- Try a known-good power supply.
- Remove all non-essential components and try to POST with CPU + 1 stick RAM only.`,
  },

  {
    id: "kb-011",
    title: "RAM Troubleshooting and Replacement",
    courseId: "hw",
    category: "Component Failure",
    status: "published",
    authorId: "u5",
    tags: ["RAM","memory","BSOD","memtest","troubleshooting"],
    created: new Date(now - 26 * 86400000).toISOString(),
    updated: new Date(now - 26 * 86400000).toISOString(),
    body: `## Symptoms of Bad RAM
- Random BSODs, especially memory-related stop codes (0x0000001A, 0x0000007E)
- System crashes during memory-intensive tasks (video editing, large spreadsheets)
- Failure to POST, continuous beep codes
- System only boots with one stick installed

## Diagnosing with MemTest86
1. Download MemTest86 and write it to a USB drive.
2. Boot from the USB (change boot order in BIOS).
3. Run at least 2 full passes — errors = bad RAM.
4. If errors found, test each stick individually to isolate the faulty module.

## Windows Memory Diagnostic (Quick Check)
\`\`\`
mdsched.exe
\`\`\`
Schedule a scan on next reboot. Less thorough than MemTest86 but built-in.

## Replacing RAM
1. Ground yourself — touch the metal chassis before handling sticks.
2. Match the spec: DDR4 vs DDR5, speed (MHz), and form factor (DIMM vs SO-DIMM for laptops).
3. Check the motherboard manual for correct slot population order (usually A1/B1 for dual-channel).
4. Seat firmly until both clips click. A half-seated stick won't POST.

## Compatibility Check
\`\`\`
wmic memorychip get capacity, speed, memorytype, partnumber
\`\`\`
Or use CPU-Z (free tool) for full memory info.`,
  },

  {
    id: "kb-012",
    title: "Storage: Diagnosing and Replacing a Drive",
    courseId: "hw",
    category: "Storage",
    status: "published",
    authorId: "u5",
    tags: ["SSD","HDD","storage","SMART","CrystalDiskInfo"],
    created: new Date(now - 24 * 86400000).toISOString(),
    updated: new Date(now - 24 * 86400000).toISOString(),
    body: `## Don't Trust the User's Diagnosis
When a user says "my hard drive is dying," verify before ordering parts. Slow performance has many causes — malware, a full drive, or a fragmented spinning disk are just as common as hardware failure.

## SMART Check — Always Do This First
Download **CrystalDiskInfo** (free). Run it and check:
- **Health Status**: Good / Caution / Bad
- **Reallocated Sectors Count**: any value above 0 is concerning; growing = imminent failure
- **Pending Sector Count**: sectors flagged for reallocation
- **Uncorrectable Sector Count**: sectors that couldn't be recovered

A "Bad" status or rapidly growing Reallocated Sectors = replace immediately. Back up first.

## Command-Line SMART Check
\`\`\`
wmic diskdrive get model,status
\`\`\`

## Checking Drive Health in Disk Management
- Look for drives showing as "Unknown" or "Not Initialized" — could be a connection issue or failed controller.
- Check for partitions showing as RAW instead of NTFS.

## SSD vs HDD Decision
| Situation | Recommendation |
|---|---|
| Aging HDD, good SMART | Replace with SSD — huge performance gain |
| SSD with bad SMART | Replace with same or better SSD |
| HDD just slow | Check if nearly full (>85%), defrag, scan for malware first |
| NVMe vs SATA | Check motherboard M.2 slot spec before ordering |

## Before Pulling the Drive
- **Back up data first.** Always. Even if the user says it's all in OneDrive.
- Note the drive model and capacity — document it in the ticket.
- For warranty/insurance claims: photograph the drive label before removal.`,
  },

  {
    id: "kb-013",
    title: "Imaging a Workstation — Windows Deployment",
    courseId: "hw",
    category: "Hardware Setup",
    status: "published",
    authorId: "u5",
    tags: ["imaging","Windows","deployment","new hire","setup"],
    created: new Date(now - 21 * 86400000).toISOString(),
    updated: new Date(now - 21 * 86400000).toISOString(),
    body: `## Overview
Imaging a workstation means deploying a standard OS configuration rather than doing a manual install. Most MSPs maintain a gold image or use tools like Windows Deployment Services (WDS), MDT, or Autopilot.

## Pre-Imaging Checklist
- [ ] Confirm hardware meets Windows 11 requirements (TPM 2.0, Secure Boot, 64GB storage, 4GB RAM minimum)
- [ ] Have the product key or confirm volume licensing is active
- [ ] Know the client's standard app list (Office, antivirus, line-of-business software)
- [ ] Have domain credentials ready if joining to Active Directory

## Manual Clean Install (No Image Tool)
1. Boot from Windows USB (created with Media Creation Tool or Rufus).
2. Select "Custom: Install Windows only" for a clean install.
3. Delete existing partitions on the target drive and let Windows create new ones.
4. Complete OOBE — use a local account during setup, join domain after.
5. Run Windows Update immediately after first boot.

## Post-Install Checklist
- [ ] All Windows Updates installed
- [ ] Drivers updated (use manufacturer's site, not Windows Update alone)
- [ ] Antivirus installed and scanning
- [ ] Standard applications installed
- [ ] Domain joined and tested with user credentials
- [ ] Remote management agent installed (if applicable)
- [ ] Asset tag applied and documented

## Naming Convention
Follow the client's naming standard. If none exists, recommend: \`[SITE]-[TYPE]-[NUMBER]\` e.g. \`CMW-WKS-007\`.

## Field Journal Prompt
Document: machine make/model, serial number, OS version, apps installed, domain join status, assigned user.`,
  },

  {
    id: "kb-014",
    title: "Power Supply Troubleshooting",
    courseId: "hw",
    category: "Component Failure",
    status: "published",
    authorId: "u5",
    tags: ["PSU","power supply","no power","troubleshooting"],
    created: new Date(now - 19 * 86400000).toISOString(),
    updated: new Date(now - 19 * 86400000).toISOString(),
    body: `## Symptoms of PSU Failure
- System completely dead — no fans, no LEDs, no POST
- Random shutdowns under load (GPU or CPU intensive tasks)
- System powers on then immediately off
- Burning smell or visible damage to PSU or capacitors

## Safety First
⚠️ A PSU stores charge even when unplugged. Never open a PSU. If you suspect internal damage, replace it.

## Diagnosis Steps
1. **Check the obvious**: Is the power cable seated? Is the wall outlet live? Test with a known-good cable.
2. **Check the switch**: Some PSUs have a physical on/off switch on the back — verify it's set to ON.
3. **Paperclip test**: Disconnect PSU from everything. Short the green wire (PS_ON) to any black wire (ground) on the 24-pin connector with a paperclip. The PSU fan should spin. If it doesn't, the PSU is likely dead.
4. **Check DC output**: Use a multimeter on the 24-pin connector to verify voltages:
   - +12V rail (yellow): should be 11.4V–12.6V
   - +5V rail (red): should be 4.75V–5.25V
   - +3.3V rail (orange): should be 3.135V–3.465V

## Replacing a PSU
- Match or exceed the wattage of the original (use a PSU calculator for custom builds).
- Check the form factor: ATX is standard; SFF systems use SFX.
- Fully modular PSUs are easier to work with in tight cases.
- Route cables before connecting — cable management matters for airflow.`,
  },

  {
    id: "kb-015",
    title: "Laptop Disassembly and Component Access",
    courseId: "hw",
    category: "Hardware Setup",
    status: "draft",
    authorId: "u5",
    tags: ["laptop","disassembly","thermal paste","RAM","SSD"],
    created: new Date(now - 4 * 86400000).toISOString(),
    updated: new Date(now - 4 * 86400000).toISOString(),
    body: `## 🚧 In Progress
This article is being written. Check back soon.

## Topics Planned
- Tools needed (spudger, iFixit kit, ESD mat)
- How to find the service manual for any laptop model
- Safe disassembly order: battery first, always
- RAM and SSD access (when user-accessible vs. soldered)
- Thermal paste replacement — when and how
- Reassembly tips and common mistakes
- Testing before closing the case`,
  },

  // ── CYBERSECURITY ─────────────────────────────────────────────

  {
    id: "kb-003",
    title: "Nmap Quick Reference",
    courseId: "cyber",
    category: "Threat Intel",
    status: "published",
    authorId: "u6",
    tags: ["nmap","scanning","recon","cyber"],
    created: new Date(now - 27 * 86400000).toISOString(),
    updated: new Date(now - 27 * 86400000).toISOString(),
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
    created: new Date(now - 23 * 86400000).toISOString(),
    updated: new Date(now - 23 * 86400000).toISOString(),
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
\`\`\`
netstat -ano          ! active connections
tasklist /v           ! running processes
ipconfig /all         ! network config
wevtutil qe Security  ! security event log
\`\`\`

### 5. Open an IR ticket immediately
- Log everything you observe, even if it seems minor.
- Timestamps are critical.

## Remember
Eradication comes AFTER full investigation. Wiping a machine before understanding the attack destroys evidence and may leave the root cause in place.`,
  },

  {
    id: "kb-016",
    title: "Phishing Recognition and User Response",
    courseId: "cyber",
    category: "Social Engineering",
    status: "published",
    authorId: "u6",
    tags: ["phishing","email","social engineering","awareness"],
    created: new Date(now - 17 * 86400000).toISOString(),
    updated: new Date(now - 17 * 86400000).toISOString(),
    body: `## What is Phishing?
Phishing is a social engineering attack delivered via email (or text/voice) that tricks users into revealing credentials, clicking malicious links, or opening infected attachments.

## Red Flags to Teach Users
- **Urgency**: "Your account will be suspended in 24 hours."
- **Mismatched sender**: Display name says "Microsoft" but domain is \`micros0ft-support.net\`.
- **Generic greeting**: "Dear Customer" instead of your actual name.
- **Suspicious links**: Hover before clicking — does the URL match the supposed sender?
- **Unexpected attachments**: Invoice from a vendor you don't recognize, especially .zip or .docm files.
- **Too good to be true**: Prize notifications, unexpected refunds.

## What To Do When a User Reports a Suspicious Email
1. **Don't delete it yet** — you need it for analysis.
2. Ask: did they click any links or open attachments?
3. If they clicked: isolate the machine from the network immediately.
4. Forward the email as an attachment to your security team.
5. Check email headers to identify the true sending server.
6. Report to your email security platform (Defender, Proofpoint, etc.).

## Viewing Email Headers
In Outlook: File → Properties → Internet Headers.
Look for \`Received\` headers (read bottom to top) to trace the origin.

## If a User Clicked
- Change their password immediately.
- Enable MFA if not already active.
- Check for mail forwarding rules that attackers often add.
- Review sign-in logs for unusual locations or times.
- Open an incident ticket.`,
  },

  {
    id: "kb-017",
    title: "Windows Event Log Analysis",
    courseId: "cyber",
    category: "Threat Intel",
    status: "published",
    authorId: "u6",
    tags: ["event log","Windows","security","4624","4625","SIEM"],
    created: new Date(now - 14 * 86400000).toISOString(),
    updated: new Date(now - 14 * 86400000).toISOString(),
    body: `## Key Event IDs to Know

| Event ID | Meaning |
|---|---|
| 4624 | Successful logon |
| 4625 | Failed logon |
| 4634 | Logoff |
| 4648 | Logon attempt with explicit credentials (runas) |
| 4672 | Special privileges assigned (admin logon) |
| 4698 | Scheduled task created |
| 4720 | User account created |
| 4732 | Member added to security-enabled local group |
| 7045 | New service installed |

## Accessing Event Viewer
\`\`\`
eventvwr.msc
\`\`\`
Navigate to: Windows Logs → Security

## Filtering for Specific Events
1. Right-click "Security" → Filter Current Log.
2. Enter Event ID(s) in the field. Multiple IDs: \`4624,4625\`.

## Command-Line Queries
\`\`\`
! Last 50 failed logons:
wevtutil qe Security /q:"*[System[EventID=4625]]" /c:50 /f:text /rd:true

! Last 20 successful logons:
wevtutil qe Security /q:"*[System[EventID=4624]]" /c:20 /f:text /rd:true
\`\`\`

## What to Look For
- **Brute force**: many 4625 events from the same source IP in a short window.
- **Off-hours access**: 4624 events at 3 AM for an account that works 9-5.
- **Lateral movement**: 4648 events showing logins to remote machines.
- **Persistence**: 4698 (scheduled task) or 7045 (new service) created unexpectedly.

## Field Journal Prompt
Document: which Event IDs you reviewed, the time range, any anomalies found, and your conclusion.`,
  },

  {
    id: "kb-018",
    title: "Password Policy and MFA Best Practices",
    courseId: "cyber",
    category: "Access Control",
    status: "published",
    authorId: "u6",
    tags: ["password","MFA","policy","Active Directory","security"],
    created: new Date(now - 12 * 86400000).toISOString(),
    updated: new Date(now - 12 * 86400000).toISOString(),
    body: `## Modern Password Guidance (NIST SP 800-63B)
The old advice — complex passwords that expire every 90 days — is now considered counterproductive. Users write them on sticky notes or increment a number. Current guidance:

- **Length over complexity**: a 16-character passphrase is stronger than a 10-character complex password.
- **No arbitrary expiration**: only force resets when a breach is suspected.
- **Block known-bad passwords**: check against breach databases (HaveIBeenPwned API).
- **Allow all characters**: spaces, symbols, Unicode — don't artificially restrict.

## SMB Password Policy Recommendations
| Setting | Recommendation |
|---|---|
| Minimum length | 12 characters |
| Complexity | Encouraged but not enforced if length is high |
| Expiration | 365 days or "never" with breach monitoring |
| Lockout threshold | 5–10 attempts |
| Lockout duration | 15–30 minutes (not permanent — causes support calls) |

## Multi-Factor Authentication
MFA is the single most effective control against account compromise. Prioritize:
1. Admin and privileged accounts — MFA is non-negotiable.
2. Remote access (VPN, RDP, remote desktop tools).
3. Email — especially for Microsoft 365 and Google Workspace.
4. Line-of-business applications with sensitive data.

## MFA Methods (Best to Worst)
1. Hardware key (YubiKey) — phishing-resistant
2. Authenticator app (TOTP) — good for most users
3. Push notification — convenient but vulnerable to MFA fatigue attacks
4. SMS — better than nothing, but SIM-swappable

## Setting Up MFA in Microsoft 365
Go to: Microsoft Entra admin center → Users → Per-user MFA, or enforce via Conditional Access policy.`,
  },

  {
    id: "kb-019",
    title: "Malware Removal Checklist",
    courseId: "cyber",
    category: "Incident Response",
    status: "published",
    authorId: "u6",
    tags: ["malware","removal","antivirus","remediation"],
    created: new Date(now - 10 * 86400000).toISOString(),
    updated: new Date(now - 10 * 86400000).toISOString(),
    body: `## Before You Start
⚠️ If you suspect ransomware, **do not try to clean it — isolate and escalate immediately.** Ransomware removal is an incident response situation, not a malware removal situation.

## Indicators of Infection
- Antivirus alerts and quarantine notifications
- Unexplained CPU/RAM/disk usage (check Task Manager)
- Browser redirects, new toolbars, or changed homepage
- Pop-ups even when no browser is open
- Antivirus disabled and unable to re-enable
- Slow performance with no hardware explanation

## Removal Steps

### Step 1 — Isolate
Disconnect from the network. Don't shut down (preserves volatile evidence).

### Step 2 — Identify
Note the malware name from AV alerts. Look it up on MalwareTips, BleepingComputer, or vendor threat encyclopedias to understand what it does and what it drops.

### Step 3 — Boot into Safe Mode
\`\`\`
msconfig → Boot → Safe boot (minimal)
\`\`\`
Malware often can't load in Safe Mode, making removal easier.

### Step 4 — Run Multiple Scanners
One scanner is not enough. Run:
- Windows Defender (built-in, offline scan mode)
- Malwarebytes Free
- ESET Online Scanner

### Step 5 — Check Persistence Mechanisms
\`\`\`
msconfig     ! Startup tab
regedit      ! HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run
Task Scheduler → check for unfamiliar tasks
\`\`\`

### Step 6 — Verify and Monitor
Reconnect to network. Monitor for 24–48 hours. If symptoms return, consider a full reimaging.

## When to Reimage Instead of Clean
- Rootkit confirmed
- Infection spread to multiple systems
- You can't determine the full scope of compromise
- Faster than cleaning for non-critical workstations`,
  },

  {
    id: "kb-020",
    title: "Vulnerability Scanning with Nessus Essentials",
    courseId: "cyber",
    category: "Threat Intel",
    status: "draft",
    authorId: "u6",
    tags: ["nessus","vulnerability","scanning","CVE"],
    created: new Date(now - 3 * 86400000).toISOString(),
    updated: new Date(now - 3 * 86400000).toISOString(),
    body: `## 🚧 In Progress
This article is being written. Check back soon.

## Topics Planned
- Installing Nessus Essentials (free tier)
- Running your first basic network scan
- Reading a scan report — Critical / High / Medium / Low / Info
- CVE IDs and CVSS scores explained
- Prioritizing remediation
- Re-scanning after patching to verify closure`,
  },

  // ── GENERAL IT / HELP DESK ────────────────────────────────────

  {
    id: "kb-021",
    title: "How to Write a Good Ticket",
    courseId: null,
    category: "Help Desk Skills",
    status: "published",
    authorId: "u5",
    tags: ["tickets","documentation","communication","help desk"],
    created: new Date(now - 16 * 86400000).toISOString(),
    updated: new Date(now - 16 * 86400000).toISOString(),
    body: `## Why Ticket Quality Matters
A well-written ticket saves everyone time. A vague ticket — "internet is broken" — forces the tech to schedule a callback, ask intake questions, and delay resolution. In a real MSP, time is billed. Bad documentation costs clients money and techs credibility.

## Anatomy of a Good Ticket

### Subject Line
Short, specific, actionable. Not "Help" — use "WiFi down in operatories 2 and 3 — imaging system offline."

### Description — Cover These Five Points
1. **What is the symptom?** What exactly is happening? Error messages verbatim.
2. **When did it start?** First noticed vs. definitely started.
3. **Who is affected?** One user, one device, whole office?
4. **What has already been tried?** Save the tech from repeating steps.
5. **What is the business impact?** Is revenue being lost? Is a patient waiting?

### Example — Bad Ticket
> "Computer not working. Please help ASAP."

### Example — Good Ticket
> Subject: Desktop won't POST — Marcus Tran, Shop Floor PC (rear of building)
>
> The Windows desktop on the shop floor (the beige tower under the back workbench) won't turn on. When powered on it beeps three times and the screen stays black. This started this morning — it was working yesterday at 5 PM. Only Marcus uses this machine. He hasn't tried anything yet. This PC runs the CNC job scheduler, so Shop Floor 3 is idle.

## Priority vs. Urgency
| | High Urgency | Low Urgency |
|---|---|---|
| **High Impact** | Critical — call the tech now | High — schedule same day |
| **Low Impact** | Medium — next available | Low — queue it |

## Closing a Ticket
Always include in the resolution notes:
- Root cause (what actually caused the issue)
- What was done to fix it
- Any follow-up recommended`,
  },

  {
    id: "kb-022",
    title: "Customer Communication for Technicians",
    courseId: null,
    category: "Help Desk Skills",
    status: "published",
    authorId: "u5",
    tags: ["communication","soft skills","customer service","help desk"],
    created: new Date(now - 13 * 86400000).toISOString(),
    updated: new Date(now - 13 * 86400000).toISOString(),
    body: `## The Tech's Communication Trap
Technical people often default to jargon, skip explanations, or underestimate the user's frustration. A technically correct fix delivered badly leaves the client feeling dismissed. Communication is a billable skill.

## The Opening
Always open with acknowledgment before diagnosis.

❌ "What's your IP address?"
✅ "Thanks for reaching out. I can see you're having trouble with the imaging system — let's get this sorted out. Can I ask a few quick questions?"

## Intake Questions (OSI-Inspired Order)
1. "When did this start? Did anything change before it happened?"
2. "Is it just you, or are others affected?"
3. "What have you already tried?"
4. "Can you describe what you see on screen — any error messages?"
5. "What's the business impact right now — how urgent is this for you?"

## Managing Expectations
- Always give a timeframe, even a rough one: "I'll have an update for you within the hour."
- If it's going to take longer than expected, call before the deadline — not after.
- Never promise a fix. Promise an investigation with a goal.

## Talking to Frustrated Users
- Let them finish. Don't interrupt to diagnose.
- Validate: "I completely understand — downtime is genuinely costly."
- Stay calm. Matching their energy escalates things.
- Redirect: "Let me focus on getting this resolved for you right now."

## Explaining Technical Issues Simply
Avoid: "The DHCP scope is exhausted so your NIC is using an APIPA address."
Use: "The system that hands out IP addresses ran out, so your computer assigned itself a placeholder address that doesn't work on the network. I'm going to free up some addresses now — it'll take about 5 minutes."

## Closing the Call
- Confirm resolution: "Can you test it for me while I'm still on the line?"
- Set expectations: "If this comes back, here's what to try first..."
- Leave the door open: "Is there anything else I can help with before I let you go?"`,
  },

  {
    id: "kb-023",
    title: "Escalation Procedures",
    courseId: null,
    category: "Help Desk Skills",
    status: "published",
    authorId: "u5",
    tags: ["escalation","Tier 2","procedures","help desk"],
    created: new Date(now - 11 * 86400000).toISOString(),
    updated: new Date(now - 11 * 86400000).toISOString(),
    body: `## When to Escalate
Escalation is not failure — it's the right call when:
- You've exhausted your troubleshooting options
- The issue requires access or expertise you don't have
- The scope is larger than a single workstation (server, network, security incident)
- The client is at risk (patient safety, data exposure, regulatory violation)
- You've been on the issue for more than your target resolution time

## How to Escalate Well
A bad escalation: "Hey, this ticket is weird, can you look at it?"
A good escalation hands off a complete picture so Tier 2 doesn't start from zero.

### What to Include in an Escalation
1. **What the user reported** (their words, not your interpretation)
2. **What you've already tried** — list every step
3. **What you found** — error messages, test results, observations
4. **Your working theory** — what do you think is causing it?
5. **Business impact** — why does this matter, how urgent is it?
6. **Client contact** — name, phone, best time to reach them

## Tier Structure at Ember IT
| Tier | Handles |
|---|---|
| Tier 1 | Intake, basic troubleshooting, password resets, standard software |
| Tier 2 | Server issues, network configuration, complex hardware, security events |
| Tier 3 / Vendor | Manufacturer support, specialized software, major infrastructure |

## After the Escalation
- Stay in the loop — the client still sees you as their contact.
- Update the ticket with the escalation details and who it was sent to.
- Follow up with the client within 2 hours to confirm they've been contacted.`,
  },

  {
    id: "kb-024",
    title: "Remote Support Tools Reference",
    courseId: null,
    category: "Help Desk Skills",
    status: "published",
    authorId: "u5",
    tags: ["remote","RMM","RDP","remote desktop","support tools"],
    created: new Date(now - 9 * 86400000).toISOString(),
    updated: new Date(now - 9 * 86400000).toISOString(),
    body: `## Remote Desktop Protocol (RDP)
Built into Windows Pro and above. Use for full desktop access on domain-joined machines.

\`\`\`
mstsc                          ! open RDP client
mstsc /v:192.168.1.50         ! connect directly to IP
mstsc /v:hostname /admin      ! connect to admin session
\`\`\`

**Requirements**: Target must have RDP enabled (System Properties → Remote), firewall must allow port 3389, user must be in Remote Desktop Users group.

## Quick Assist (Windows 11)
Built-in, no install needed. Good for non-technical users.
- Helper: open Quick Assist, click "Help someone," share the 6-digit code.
- User: open Quick Assist, enter the code, approve the connection.
Limitation: requires both parties to be signed into Microsoft accounts or use the code flow.

## Common RMM Tools in the Field
| Tool | Notes |
|---|---|
| ConnectWise Automate | Full RMM — scripting, monitoring, remote |
| Datto RMM | Popular with MSPs; strong backup integration |
| NinjaRMM | Modern UI, easy onboarding |
| Splashtop | Lightweight remote access, good for unattended |

## When Remote Isn't Enough
Some issues require hands-on:
- Hardware failure (you can't reseat RAM over RDP)
- No network connectivity (you can't remote into an offline machine)
- BIOS/UEFI changes required
- Physical cable work

Always confirm with the client whether a remote session or a site visit is needed before dispatching.

## Security Notes
- Never leave RDP open to the internet on port 3389 — brute-force attacks are constant.
- Use a VPN or RD Gateway for remote access from outside the network.
- Log off remote sessions fully when done — don't just close the window.`,
  },

  {
    id: "kb-025",
    title: "SLA — What It Is and Why It Matters",
    courseId: null,
    category: "Help Desk Skills",
    status: "published",
    authorId: "u5",
    tags: ["SLA","response time","priority","MSP","help desk"],
    created: new Date(now - 8 * 86400000).toISOString(),
    updated: new Date(now - 8 * 86400000).toISOString(),
    body: `## What is an SLA?
A Service Level Agreement is a contract between an MSP and a client that defines expected response and resolution times. Breaching an SLA can mean financial penalties, lost contracts, and damaged trust.

## Typical SLA Tiers
| Priority | Response Time | Resolution Target | Example |
|---|---|---|---|
| Critical | 15–30 min | 4 hours | Server down, full office offline |
| High | 1–2 hours | 8 hours | Department can't work, key system unavailable |
| Medium | 4 hours | 24 hours | Single user impacted, workaround exists |
| Low | Next business day | 72 hours | Minor inconvenience, cosmetic issues |

## Response vs. Resolution
- **Response time**: How long until a tech acknowledges the ticket and makes contact.
- **Resolution time**: How long until the issue is fully fixed.
These are different. You can meet the response SLA and still breach the resolution SLA.

## What "Business Hours" Means
Most SMB SLAs are measured in business hours (e.g., 8 AM–5 PM, Mon–Fri). A ticket opened at 4:30 PM Friday with a 4-hour SLA isn't due until Monday at 8:30 AM in a business-hours agreement — unless the client has a 24/7 add-on.

## Why Technicians Care
- **Setting priority correctly** matters. Incorrectly marking Critical when it's Low inflates breach risk for actual critical issues.
- **Documenting first contact** is essential — the SLA clock often starts at ticket creation, not when you first look at it.
- **Communicating delays** before the SLA breaches is professional. Silence is not.

## Field Journal Prompt
When reviewing a ticket, note: what priority was it assigned, what were the SLA targets, was the response time met, was resolution on time? If not — what caused the breach?`,
  },

  {
    id: "kb-026",
    title: "Documentation Standards",
    courseId: null,
    category: "Help Desk Skills",
    status: "draft",
    authorId: "u5",
    tags: ["documentation","runbook","knowledge base","standards"],
    created: new Date(now - 2 * 86400000).toISOString(),
    updated: new Date(now - 2 * 86400000).toISOString(),
    body: `## 🚧 In Progress
This article is being written. Check back soon.

## Topics Planned
- What belongs in a ticket note vs. a KB article
- Writing a runbook: what it is and who reads it
- Network documentation: what to capture for every client site
- Password manager and credential vault basics
- IT Glue / Hudu style documentation overview
- How to keep documentation from going stale`,
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
