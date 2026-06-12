// ─────────────────────────────────────────────
// people.js
// Ticket requester personas for lab simulations.
// Each persona has a consistent voice/quirk that
// drives how their ticket copy is written.
//
// Fields:
//   id          requester ID used in tickets/scenarios
//   name        display name
//   role        job title
//   org         "ember" | "cascade-millworks" | "port-gardner-dental"
//   orgName     display name of org
//   email       simulated from-address (never real)
//   quirk       one-line behavioural summary
//   voiceNotes  writing guidance for ticket copy
// ─────────────────────────────────────────────

export const PEOPLE = [

  // ── Ember (internal) ─────────────────────────────────────────
  {
    id: "emb-rosa",
    name: "Rosa Maldonado",
    role: "Owner / Founder",
    org: "ember",
    orgName: "Ember IT",
    email: "r.maldonado@ember.io",
    quirk: "Impatient VIP — files tickets only when a client complained.",
    voiceNotes: "Warm but direct. Signals a relationship or SLA problem, not just a technical one. Never technical jargon. Short sentences.",
  },
  {
    id: "emb-dean",
    name: "Dean Okafor",
    role: "Service Manager / Tier 2",
    org: "ember",
    orgName: "Ember IT",
    email: "d.okafor@ember.io",
    quirk: "Model reporter — precise, complete, professional.",
    voiceNotes: "The gold standard students should imitate. Includes model, OS, error text, steps already tried. Clear subject line. Calm tone.",
  },
  {
    id: "emb-priya",
    name: "Priya Shah",
    role: "Office Manager / Dispatcher",
    org: "ember",
    orgName: "Ember IT",
    email: "p.shah@ember.io",
    quirk: "Cheerful, mildly non-technical — files mundane internal tickets.",
    voiceNotes: "Friendly and apologetic. Printer, projector, new-hire laptop requests. Uses lay terms. Good for week-1 onboarding scenarios.",
  },

  // ── Cascade Millworks ─────────────────────────────────────────
  {
    id: "cmw-walt",
    name: "Walt Jensen",
    role: "Owner",
    org: "cascade-millworks",
    orgName: "Cascade Millworks",
    email: "w.jensen@cascademillworks.com",
    quirk: "Impatient VIP — resents every IT dollar, demands instant fixes.",
    voiceNotes: "Terse. Challenges the necessity of the fix. Questions cost. Short, blunt sentences. May imply the last tech caused the problem.",
  },
  {
    id: "cmw-marcus",
    name: "Marcus Tran",
    role: "Shop Foreman",
    org: "cascade-millworks",
    orgName: "Cascade Millworks",
    email: "m.tran@cascademillworks.com",
    quirk: "Vague reporter — no model numbers, no errors, no timeline.",
    voiceNotes: '"The computer in the back is doing it again." Teaches intake questioning. Never includes specifics unless asked directly.',
  },
  {
    id: "cmw-cody",
    name: "Cody Briggs",
    role: "CNC Operator",
    org: "cascade-millworks",
    orgName: "Cascade Millworks",
    email: "c.briggs@cascademillworks.com",
    quirk: "Tinkerer — already tried stuff, made it worse.",
    voiceNotes: 'Opens with "I already tried…" Has swapped cables, edited settings, reseated parts incorrectly. Problem is now layered.',
  },
  {
    id: "cmw-denise",
    name: "Denise Kowalski",
    role: "Office Admin / Bookkeeping",
    org: "cascade-millworks",
    orgName: "Cascade Millworks",
    email: "d.kowalski@cascademillworks.com",
    quirk: "Under-reporter — minimizes the problem, real issue is always worse.",
    voiceNotes: 'Apologetic. "It\'s just a little slow" = drive failing. "I didn\'t want to bother anyone." Teaches probing beyond the stated issue.',
  },
  {
    id: "cmw-sam",
    name: "Sam Whitefeather",
    role: "Estimator / Sales",
    org: "cascade-millworks",
    orgName: "Cascade Millworks",
    email: "s.whitefeather@cascademillworks.com",
    quirk: "Confident misdiagnoser — opens with the solution, not the symptom.",
    voiceNotes: '"I need a new hard drive." Usually wrong. Teaches verifying claims instead of trusting them. Confident, certain tone.',
  },

  // ── Port Gardner Dental ───────────────────────────────────────
  {
    id: "pgd-reyes",
    name: "Dr. Alana Reyes",
    role: "Dentist / Practice Owner",
    org: "port-gardner-dental",
    orgName: "Port Gardner Dental",
    email: "a.reyes@portgardnerdental.com",
    quirk: "Impatient VIP — every minute of downtime costs a patient slot.",
    voiceNotes: "Tickets arrive in ALL CAPS during business hours. Escalates fast. HIPAA awareness baked in. Patient-care framing.",
  },
  {
    id: "pgd-tina",
    name: "Tina Park",
    role: "Office Manager",
    org: "port-gardner-dental",
    orgName: "Port Gardner Dental",
    email: "t.park@portgardnerdental.com",
    quirk: "Competent power user — clear reports, includes screenshots, usually right.",
    voiceNotes: "The contrast persona. Good information but still needs verification. Shows students that even good reporters need their claims confirmed.",
  },
  {
    id: "pgd-jerome",
    name: "Jerome Walker",
    role: "Front Desk / Scheduling",
    org: "port-gardner-dental",
    orgName: "Port Gardner Dental",
    email: "frontdesk@portgardnerdental.com",
    quirk: "Vague reporter — could be network, server, workstation, or printer.",
    voiceNotes: '"Patients can\'t check in." Teaches layer isolation before touching anything. No specifics, just symptoms.',
  },
  {
    id: "pgd-beth",
    name: "Beth Nguyen",
    role: "Dental Hygienist",
    org: "port-gardner-dental",
    orgName: "Port Gardner Dental",
    email: "b.nguyen@portgardnerdental.com",
    quirk: "Tinkerer — rebooted mid-update, moved hardware, well-meaning.",
    voiceNotes: "Moved the AP because it was ugly. Rebooted the imaging sensor during an update. Helpful tone, unaware of consequences.",
  },
  {
    id: "pgd-marsh",
    name: "Dr. Felix Marsh",
    role: "Associate Dentist",
    org: "port-gardner-dental",
    orgName: "Port Gardner Dental",
    email: "f.marsh@portgardnerdental.com",
    quirk: "Under-reporter — mentions problems days after they start.",
    voiceNotes: '"Oh, the x-ray viewer hasn\'t worked since Tuesday." Teaches cost of late reports and gentle user education. Casual, almost offhand.',
  },
];

export const PERSON_BY_ID = Object.fromEntries(PEOPLE.map(p => [p.id, p]));

export const ORG_LABELS = {
  "ember":               "Ember IT",
  "cascade-millworks":   "Cascade Millworks",
  "port-gardner-dental": "Port Gardner Dental",
};

export const ORG_COLOR = {
  "ember":               "#E8922E",
  "cascade-millworks":   "#6B8F71",
  "port-gardner-dental": "#6B7F8F",
};
