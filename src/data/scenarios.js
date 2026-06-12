// ─────────────────────────────────────────────
// scenarios.js
// All 30 pre-built lab scenarios.
// 10 per course × 3 courses.
//
// To edit a scenario: find it by id and update
// the title, description, priority, or mode.
// Do NOT change the id — it links to activeLabs.
//
// Fields:
//   id          unique string
//   courseId    "net" | "hw" | "cyber"
//   week        1–10
//   title       short display title
//   role        "user" | "tech" | "admin"
//   mode        "broadcast" | "individual" | "pairs" | "teams"
//   priority    "Low" | "Medium" | "High" | "Critical"
//   categories  array matching course categories
//   linkedCourse  (optional) cross-course link
//   description  full lab instructions shown to student
// ─────────────────────────────────────────────

export const SCENARIOS = [

  // ══════════════════════════════════════════
  // NETWORKING FUNDAMENTALS (net)
  // ══════════════════════════════════════════
  {
    id: "sc-net-01", courseId: "net", week: 1,
    title: "Identify Cable Types in the Lab",
    role: "user", mode: "broadcast", priority: "Low",
    categories: ["Cable/Physical Layer"],
    description:
      "You've just started at the campus IT department. Walk the lab, identify every cable type you see (Cat5e, Cat6, fiber, console, rollover), and submit a ticket documenting what you found and where. Include the purpose of each cable type in your notes.\n\n📓 Lab Book: Record cable standards, max lengths, and speeds.",
  },
  {
    id: "sc-net-02", courseId: "net", week: 2,
    title: "Connect Two PCs via Unmanaged Switch",
    role: "tech", mode: "broadcast", priority: "Medium",
    categories: ["Switch Configuration","Diagnostics"],
    description:
      "A ticket has come in: two lab workstations can't communicate. You are assigned as technician. Cable both machines to the unmanaged Netgear switch, assign static IPs in the same subnet, and verify connectivity with ping.\n\n📓 Lab Book: Draw the physical topology. Record IP assignments.",
  },
  {
    id: "sc-net-03", courseId: "net", week: 3,
    title: "Basic Cisco Switch Configuration",
    role: "tech", mode: "individual", priority: "Medium",
    categories: ["Switch Configuration"],
    description:
      "You've been assigned a Cisco Catalyst switch that arrived from another department with no documentation. Connect via console cable, access the CLI, set hostname, configure a password, and document the running config.\n\n📓 Lab Book: Record all commands used and their purpose.",
  },
  {
    id: "sc-net-04", courseId: "net", week: 4,
    title: "VLAN Setup and Inter-VLAN Routing",
    role: "tech", mode: "pairs", priority: "High",
    categories: ["VLAN/Segmentation"],
    description:
      "Create two VLANs (Sales: VLAN 10, IT: VLAN 20) on the Cisco switch. Assign ports. Verify that devices in the same VLAN can communicate and devices in different VLANs cannot (yet). Document findings.\n\n📓 Lab Book: Draw the VLAN topology diagram.",
  },
  {
    id: "sc-net-05", courseId: "net", week: 5,
    title: "Configure a Cisco Router — Basic Routing",
    role: "tech", mode: "broadcast", priority: "High",
    categories: ["Router/Routing"],
    description:
      "A Cisco router has arrived on your bench with a factory reset. Configure two interfaces, assign IPs, enable routing between subnets, and verify end-to-end connectivity from a host on each subnet.\n\n📓 Lab Book: Record the routing table output.",
  },
  {
    id: "sc-net-06", courseId: "net", week: 6,
    title: "Wireless Access Point Setup and Troubleshooting",
    role: "tech", mode: "individual", priority: "High",
    categories: ["Wireless","Diagnostics"],
    description:
      "A department has submitted a ticket: their wireless AP shows as connected to the switch but clients can't get an IP. You suspect DHCP or SSID misconfiguration. Diagnose and resolve.\n\n📓 Lab Book: Document each step of your troubleshooting process.",
  },
  {
    id: "sc-net-07", courseId: "net", week: 7,
    title: "Wireshark Packet Capture Analysis",
    role: "tech", mode: "broadcast", priority: "Medium",
    categories: ["Diagnostics"],
    description:
      "Capture live traffic on the lab network using Wireshark. Identify at least: one ARP request/reply, one ICMP exchange, and one TCP handshake. Annotate each in a ticket note.\n\n📓 Lab Book: Paste or sketch packet headers and label each field.",
  },
  {
    id: "sc-net-08", courseId: "net", week: 8,
    title: "Cross-Course: Network the PC You Built",
    role: "tech", mode: "individual", priority: "High",
    categories: ["Cross-Course","VLAN/Segmentation","Diagnostics"],
    linkedCourse: "hw",
    description:
      "CROSS-COURSE LAB — The PC you assembled in Hardware Lab 3 is now your endpoint. Configure its NIC, connect it to the switch, assign it to VLAN 10, and verify it can reach the router gateway.\n\n📓 Lab Book: Reference your Hardware lab build notes. Document IP config and ping results.",
  },
  {
    id: "sc-net-09", courseId: "net", week: 9,
    title: "Network Fault Simulation and Ticket Escalation",
    role: "admin", mode: "broadcast", priority: "Critical",
    categories: ["Diagnostics","Switch Configuration","Router/Routing"],
    description:
      "You are the on-call network admin. The instructor will introduce 3 faults into the lab network without telling you what they are. You must diagnose each, open or update the relevant tickets, assign to team members, and document the resolution path.\n\n📓 Lab Book: Write a brief incident report for each fault.",
  },
  {
    id: "sc-net-10", courseId: "net", week: 10,
    title: "Full Network Build — Capstone",
    role: "admin", mode: "teams", priority: "Critical",
    categories: ["Cross-Course","Router/Routing","VLAN/Segmentation","Wireless"],
    linkedCourse: "hw",
    description:
      "Capstone lab. Build a complete small office network from scratch: 1 router, 2 switches, 2 VLANs, wireless AP, 4 endpoints (including your hardware-built PC). Every decision must be documented as a ticket. You are the admin — manage your team's queue.\n\n📓 Lab Book: Complete network diagram, IP scheme, and lessons learned.",
  },

  // ══════════════════════════════════════════
  // HARDWARE ESSENTIALS (hw)
  // ══════════════════════════════════════════
  {
    id: "sc-hw-01", courseId: "hw", week: 1,
    title: "Component Identification Inventory",
    role: "user", mode: "broadcast", priority: "Low",
    categories: ["Component Failure"],
    description:
      "You've been asked to create an IT asset inventory. Open the lab desktop cases and identify every component. Submit a ticket listing: CPU, RAM (type + capacity), storage (type + size), GPU, motherboard form factor, and PSU wattage.\n\n📓 Lab Book: Sketch the inside of the case with labels.",
  },
  {
    id: "sc-hw-02", courseId: "hw", week: 2,
    title: "POST Failure — Diagnose and Document",
    role: "tech", mode: "pairs", priority: "High",
    categories: ["POST/Boot Issue"],
    description:
      "A ticket has been submitted: 'Lab PC won't boot — just beeps.' You are assigned. Identify the beep code, diagnose the likely cause (RAM, GPU, CPU), reseat or replace the faulty component, and resolve the ticket with full notes.\n\n📓 Lab Book: Beep code chart and what each code means.",
  },
  {
    id: "sc-hw-03", courseId: "hw", week: 3,
    title: "PC Build from Components",
    role: "tech", mode: "individual", priority: "High",
    categories: ["Component Failure","POST/Boot Issue"],
    description:
      "You have a box of parts on your bench. Build a working PC: install CPU + cooler, seat RAM, mount motherboard, connect storage, install PSU, cable management, and first POST. Document every step as ticket notes.\n\n📓 Lab Book: Step-by-step build log with any issues encountered.",
  },
  {
    id: "sc-hw-04", courseId: "hw", week: 4,
    title: "OS Installation and Driver Management",
    role: "tech", mode: "individual", priority: "Medium",
    categories: ["OS Installation"],
    description:
      "Install Windows 11 on the PC you built last week. After installation, check Device Manager for missing drivers, identify the unknown devices, find and install correct drivers. Document all driver sources.\n\n📓 Lab Book: Before/after Device Manager screenshots (or sketches).",
  },
  {
    id: "sc-hw-05", courseId: "hw", week: 5,
    title: "BIOS/UEFI Exploration and Configuration",
    role: "tech", mode: "broadcast", priority: "Medium",
    categories: ["BIOS/Firmware"],
    description:
      "Enter BIOS/UEFI on your lab machine. Document: boot order, SATA mode (AHCI vs IDE), virtualization setting, Secure Boot status, and system date/time. Submit a ticket with findings and enable virtualization if not already on.\n\n📓 Lab Book: Record all BIOS settings as found and any changes made.",
  },
  {
    id: "sc-hw-06", courseId: "hw", week: 6,
    title: "Laptop Disassembly and RAM/Storage Upgrade",
    role: "tech", mode: "pairs", priority: "High",
    categories: ["Laptop Repair","Component Failure"],
    description:
      "A ticket: 'Laptop is slow and low on disk space.' You've been assigned. Safely disassemble the lab laptop, upgrade RAM and swap in an SSD, reassemble, boot to BIOS to verify detection, then boot OS.\n\n📓 Lab Book: Disassembly diagram. Note every screw type and location.",
  },
  {
    id: "sc-hw-07", courseId: "hw", week: 7,
    title: "Peripheral Troubleshooting — USB and Display",
    role: "tech", mode: "individual", priority: "Medium",
    categories: ["Peripheral"],
    description:
      "Three peripherals on your bench are reportedly not working (USB drive not detected, monitor flickering, keyboard intermittent). Diagnose each, use Device Manager and display settings, and resolve or escalate each as a separate ticket.\n\n📓 Lab Book: Troubleshooting flowchart for each peripheral.",
  },
  {
    id: "sc-hw-08", courseId: "hw", week: 8,
    title: "Cross-Course: Prep Your PC for Network Integration",
    role: "tech", mode: "individual", priority: "High",
    categories: ["Cross-Course","OS Installation","Peripheral"],
    linkedCourse: "net",
    description:
      "CROSS-COURSE LAB — Your PC build from Lab 3 needs to join the lab network. Verify NIC is seated, install NIC drivers if needed, configure TCP/IP settings per the Networking team's subnet plan, and confirm you can ping the router.\n\n📓 Lab Book: Record IP config. Reference your Networking VLAN notes.",
  },
  {
    id: "sc-hw-09", courseId: "hw", week: 9,
    title: "Hardware Fault Introduction and Diagnosis",
    role: "admin", mode: "broadcast", priority: "Critical",
    categories: ["Component Failure","POST/Boot Issue","Peripheral"],
    description:
      "The instructor will introduce hidden hardware faults into 3 lab machines. You are the admin managing the queue. Triage incoming tickets, assign to techs, track resolution, and write a summary incident report.\n\n📓 Lab Book: Incident report format practice — problem, impact, cause, resolution.",
  },
  {
    id: "sc-hw-10", courseId: "hw", week: 10,
    title: "Full Workstation Deployment — Capstone",
    role: "admin", mode: "teams", priority: "Critical",
    categories: ["Cross-Course","OS Installation","Component Failure"],
    linkedCourse: "net",
    description:
      "Capstone: Deploy 4 workstations from bare hardware to network-ready. Each team member owns one machine. Admin manages tickets for all 4 machines — build, OS install, driver setup, network join, and final verification.\n\n📓 Lab Book: Deployment checklist signed off for each machine.",
  },

  // ══════════════════════════════════════════
  // CYBERSECURITY FUNDAMENTALS (cyber)
  // ══════════════════════════════════════════
  {
    id: "sc-cy-01", courseId: "cyber", week: 1,
    title: "Security Audit — Your Own Lab PC",
    role: "user", mode: "broadcast", priority: "Low",
    categories: ["Vulnerability Report"],
    description:
      "You are a new employee reporting a security concern. Submit a ticket documenting the security posture of your assigned workstation: OS patch level, Windows Defender status, open ports (netstat), and any obvious misconfigurations.\n\n📓 Lab Book: Security baseline checklist.",
  },
  {
    id: "sc-cy-02", courseId: "cyber", week: 2,
    title: "Network Reconnaissance with Nmap",
    role: "tech", mode: "broadcast", priority: "Medium",
    categories: ["Vulnerability Report","Threat Intel"],
    description:
      "A ticket has been assigned: 'Map the lab network and identify all live hosts and open services.' Use Nmap to scan the subnet, document all discovered hosts, open ports, and running services. Flag anything unexpected.\n\n📓 Lab Book: Nmap output table — host, IP, ports, services.",
  },
  {
    id: "sc-cy-03", courseId: "cyber", week: 3,
    title: "Password Policy Audit and Hardening",
    role: "tech", mode: "individual", priority: "Medium",
    categories: ["Access Control","Policy Violation"],
    description:
      "Audit the local password policy on your lab machine. Document current settings (min length, complexity, lockout). Compare against NIST SP 800-63B recommendations. Submit a ticket with findings and apply recommended changes.\n\n📓 Lab Book: Before/after policy settings. Summary of NIST guidelines.",
  },
  {
    id: "sc-cy-04", courseId: "cyber", week: 4,
    title: "Hak5 WiFi Pineapple — Recon and Awareness",
    role: "tech", mode: "broadcast", priority: "High",
    categories: ["Threat Intel","Suspicious Activity"],
    description:
      "Using the Hak5 WiFi Pineapple in a controlled lab environment: perform a passive recon scan, identify probe requests from devices, and document what an attacker could learn. Submit findings as a threat intel ticket.\n\n📓 Lab Book: What data was visible? What are the defensive implications?",
  },
  {
    id: "sc-cy-05", courseId: "cyber", week: 5,
    title: "Vulnerability Scanning with OpenVAS or Nessus",
    role: "tech", mode: "pairs", priority: "High",
    categories: ["Vulnerability Report"],
    description:
      "Run a vulnerability scan against a designated lab target VM. Review the findings, categorize by severity (Critical/High/Medium/Low), and submit a formal vulnerability report ticket with remediation recommendations.\n\n📓 Lab Book: Top 5 findings with CVE numbers and remediation steps.",
  },
  {
    id: "sc-cy-06", courseId: "cyber", week: 6,
    title: "Incident Response — Simulated Malware Alert",
    role: "tech", mode: "broadcast", priority: "Critical",
    categories: ["Incident Response","Suspicious Activity"],
    description:
      "An alert has fired: a lab machine is exhibiting suspicious behavior (unusual processes, outbound connections). You are the IR tech. Isolate the machine, collect evidence (process list, netstat, event logs), and write an incident report ticket.\n\n📓 Lab Book: IR checklist — contain, collect, analyze, report.",
  },
  {
    id: "sc-cy-07", courseId: "cyber", week: 7,
    title: "Hak5 Rubber Ducky — Physical Attack Awareness",
    role: "tech", mode: "broadcast", priority: "High",
    categories: ["Incident Response","Policy Violation","Access Control"],
    description:
      "Using the Hak5 USB Rubber Ducky in a controlled lab setting: execute a benign payload on a lab machine. Document what the attack accomplished, how fast it executed, and what defenses (USB policy, endpoint protection) would have stopped it.\n\n📓 Lab Book: Attack timeline. Defense recommendations.",
  },
  {
    id: "sc-cy-08", courseId: "cyber", week: 8,
    title: "Firewall Rule Audit and Hardening",
    role: "tech", mode: "individual", priority: "Medium",
    categories: ["Access Control","Vulnerability Report"],
    description:
      "Review the Windows Firewall rules on your lab machine. Identify any rules that are overly permissive or unnecessary. Submit a ticket documenting current state, proposed changes, and apply a default-deny outbound rule for a test application.\n\n📓 Lab Book: Before/after firewall rule table.",
  },
  {
    id: "sc-cy-09", courseId: "cyber", week: 9,
    title: "Full Incident Simulation — Red vs Blue",
    role: "admin", mode: "teams", priority: "Critical",
    categories: ["Incident Response","Suspicious Activity","Threat Intel"],
    description:
      "Red team (half class) will attempt to gain access to lab machines using tools covered this quarter. Blue team manages the incident queue — detect, document, contain, and report each attack. Admin oversees both queues and writes the after-action report.\n\n📓 Lab Book: After-action report — what succeeded, what was detected, what was missed.",
  },
  {
    id: "sc-cy-10", courseId: "cyber", week: 10,
    title: "Security Hardening Capstone — Full Environment",
    role: "admin", mode: "teams", priority: "Critical",
    categories: ["Access Control","Vulnerability Report","Incident Response","Policy Violation"],
    description:
      "Capstone: Harden the full lab environment built across all three courses. Apply OS hardening, network segmentation, access controls, and monitoring. Every change must be a ticket. Present the final security posture as an admin report.\n\n📓 Lab Book: Complete hardening checklist. Lessons learned across all three courses.",
  },
];
