// ─────────────────────────────────────────────
// courses.js
// Course definitions for all three courses.
// Edit label, term, color, or categories here.
// ─────────────────────────────────────────────

export const COURSES = [
  {
    id:     "net",
    label:  "Networking Fundamentals",
    term:   "Fall",
    color:  "#38bdf8",
    icon:   "🌐",
    cohort: "net-hw",
    categories: [
      "Cable/Physical Layer",
      "Switch Configuration",
      "Router/Routing",
      "VLAN/Segmentation",
      "Wireless",
      "Diagnostics",
      "Cross-Course",
    ],
  },
  {
    id:     "hw",
    label:  "Hardware Essentials",
    term:   "Fall",
    color:  "#a78bfa",
    icon:   "🖥",
    cohort: "net-hw",
    categories: [
      "Component Failure",
      "POST/Boot Issue",
      "Peripheral",
      "OS Installation",
      "BIOS/Firmware",
      "Laptop Repair",
      "Cross-Course",
    ],
  },
  {
    id:     "cyber",
    label:  "Cybersecurity Fundamentals",
    term:   "Spring",
    color:  "#fb923c",
    icon:   "🔒",
    cohort: "cyber",
    categories: [
      "Suspicious Activity",
      "Access Control",
      "Vulnerability Report",
      "Incident Response",
      "Policy Violation",
      "Forensics",
      "Threat Intel",
    ],
  },
];

export function courseById(id) {
  return COURSES.find(c => c.id === id);
}
