// ─────────────────────────────────────────────
// constants.js
// Static config: priorities, statuses, colors,
// SLA targets, IR phases. Edit here to change
// system-wide behavior.
// ─────────────────────────────────────────────

export const PRIORITIES = ["Low", "Medium", "High", "Critical"];
export const STATUSES   = ["Open", "In Progress", "Pending", "Resolved", "Closed"];

export const PRIORITY_COLOR = {
  Low:      "#22c55e",
  Medium:   "#f59e0b",
  High:     "#ef4444",
  Critical: "#7c3aed",
};

export const STATUS_COLOR = {
  Open:          "#3b82f6",
  "In Progress": "#f59e0b",
  Pending:       "#8b5cf6",
  Resolved:      "#22c55e",
  Closed:        "#6b7280",
};

export const ROLE_COLOR = {
  student: "#38bdf8",
  tech:    "#a78bfa",
  admin:   "#fb923c",
};

// SLA targets in hours — edit to change targets
export const SLA = {
  Critical: { response: 1,  resolution: 4  },
  High:     { response: 4,  resolution: 8  },
  Medium:   { response: 8,  resolution: 24 },
  Low:      { response: 24, resolution: 72 },
};

// Incident Response phases (PICERL)
export const IR_PHASES = ["Prepare","Identify","Contain","Eradicate","Recover","Lessons Learned"];
export const IR_SEVERITIES = ["Critical","High","Medium","Low"];

export const IR_SEVERITY_COLOR = {
  Critical: "#7c3aed", High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e",
};

export const IR_PHASE_COLOR = {
  Prepare: "#475569", Identify: "#3b82f6", Contain: "#f59e0b",
  Eradicate: "#ef4444", Recover: "#22c55e", "Lessons Learned": "#a78bfa",
};

export const KB_CATEGORIES = [
  "Cable/Physical Layer","Switch Configuration","Router/Routing","VLAN/Segmentation",
  "Wireless","Diagnostics","Component Failure","POST/Boot Issue","Peripheral",
  "OS Installation","BIOS/Firmware","Laptop Repair","Suspicious Activity","Access Control",
  "Vulnerability Report","Incident Response","Policy Violation","Forensics","Threat Intel","General",
];
