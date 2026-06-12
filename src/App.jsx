import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase.js";
import { COURSES, courseById } from "./data/courses.js";
import { CLIENTS } from "./data/clients.js";
import { PERSON_BY_ID, ORG_COLOR } from "./data/people.js";
import { SCENARIOS } from "./data/scenarios.js";
import {
  SEED_USERS, SEED_TICKETS, SEED_KB, SEED_INCIDENTS,
  SEED_NOTIFS, SEED_ACTIVE_LABS,
} from "./data/seeds.js";
import {
  PRIORITIES, STATUSES,
  PRIORITY_COLOR, STATUS_COLOR, ROLE_COLOR,
  SLA, IR_PHASES, IR_SEVERITIES, IR_SEVERITY_COLOR, IR_PHASE_COLOR,
  KB_CATEGORIES,
} from "./data/constants.js";

// ── SLA helpers ───────────────────────────────────────────────
function slaDeadline(created, priority) {
  return new Date(new Date(created).getTime() + SLA[priority].resolution * 3600000);
}
function slaInfo(created, priority, status) {
  if (status==="Resolved"||status==="Closed") return null;
  const deadline = slaDeadline(created, priority);
  const msLeft = deadline - Date.now();
  const pct = Math.max(0, msLeft / (SLA[priority].resolution * 3600000));
  if (msLeft<0) return { label:"Breached", color:"#ef4444", msLeft, pct:0, breached:true };
  if (pct<0.25) return { label:"Critical", color:"#ef4444", msLeft, pct, breached:false };
  if (pct<0.5)  return { label:"Warning",  color:"#f59e0b", msLeft, pct, breached:false };
  return { label:"On Track", color:"#22c55e", msLeft, pct, breached:false };
}
function fmtDur(ms) {
  const abs = Math.abs(ms);
  const h=Math.floor(abs/3600000), m=Math.floor((abs%3600000)/60000), s=Math.floor((abs%60000)/1000);
  const pre = ms<0?"-":"";
  if(h>0) return `${pre}${h}h ${m}m`;
  if(m>0) return `${pre}${m}m ${s}s`;
  return `${pre}${s}s`;
}

// Alias so LabManager still works
const SEED_SCENARIOS = SCENARIOS;

const inputStyle = {
  width:"100%", background:"#0D0D0D", border:"1px solid #242424",
  borderRadius:6, padding:"9px 12px", color:"#EDE9E3",
  fontSize:13, fontFamily:"'Inter',sans-serif",
};
const btnPrimary = {
  background:"#E8922E", color:"#0D0D0D", border:"none", borderRadius:6,
  padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer",
  width:"100%", fontFamily:"'Inter',sans-serif", letterSpacing:"0.02em",
};


// ── Shared helpers (defined early so all components can use them) ──
function badge(label, color) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}55`,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase"}}>{label}</span>;
}
function fmt(iso) {
  return new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function nextId(tickets) {
  const nums = tickets.map(t=>parseInt(t.id.split("-")[1])||0);
  return "TKT-" + String(Math.max(0,...nums)+1).padStart(3,"0");
}
function makeNotif(toId,subject,body,ticketId) {
  return {id:"n"+Date.now()+Math.random().toString(36).slice(2),toId,subject,body,ticketId,read:false,ts:new Date().toISOString()};
}
function PageTitle({title,sub}){return(<div style={{marginBottom:28}}><h1 style={{margin:0,fontFamily:"'Raleway',sans-serif",fontSize:28,fontWeight:800,color:"#F0EDE8",letterSpacing:"-0.02em"}}>{title}</h1>{sub&&<p style={{margin:"4px 0 0",color:"#6A5848",fontSize:13}}>{sub}</p>}</div>);}
function SectionLabel({children}){return <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.12em",color:"#6A5848",marginBottom:12,fontWeight:700}}>{children}</div>;}
function Card({children,style={}}){return <div style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:12,padding:24,...style}}>{children}</div>;}
function Field({label,children}){return(<div style={{marginBottom:16}}><label style={{display:"block",fontSize:11,color:"#6A5848",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>{children}</div>);}
function DetailRow({label,val}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:12,color:"#6A5848"}}>{label}</span><span style={{fontSize:13,color:"#B8A898"}}>{val}</span></div>);}
function EmptyState({msg}){return <div style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:12,padding:40,textAlign:"center",color:"#6A5848",fontSize:14}}>{msg}</div>;}
function Toast({msg,type}){return(<div style={{position:"fixed",bottom:24,right:24,background:type==="success"?"#166534":"#7f1d1d",border:"1px solid "+(type==="success"?"#22c55e44":"#ef444444"),color:type==="success"?"#86efac":"#fca5a5",borderRadius:8,padding:"12px 20px",fontSize:13,zIndex:9999,fontFamily:"'Inter',sans-serif",color:"#F0EDE8"}}>{msg}</div>);}


// ═══════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════
async function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
async function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ═══════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [ready,setReady]           = useState(false);
  const [users,setUsers]           = useState([]);
  const [tickets,setTickets]       = useState([]);
  const [notifs,setNotifs]         = useState([]);
  const [activeLabs,setActiveLabs] = useState({});
  const [kb,setKb]                 = useState([]);
  const [incidents,setIncidents]   = useState([]);
  const [session,setSession]       = useState(null);
  const [view,setView]             = useState("dashboard");
  const [selected,setSelected]     = useState(null);
  const [toast,setToast]           = useState(null);
  const [classStudents,setClassStudents]   = useState([]);
  const [assignedTickets,setAssignedTickets] = useState([]);
  const [customScenarios,setCustomScenarios] = useState([]);
  const [showOnboarding,setShowOnboarding]   = useState(false);

  // ── Load profile from Supabase after auth ──────────────────────
  const loadProfile = useCallback(async (userId) => {
    const [profileRes, membershipRes] = await Promise.all([
      supabase.from("profiles").select("*, classes!profiles_class_id_fkey(name, code, course_id)").eq("id", userId).single(),
      supabase.from("profile_classes").select("class_id, classes(id, name, code, course_id)").eq("profile_id", userId),
    ]);
    const { data: profile, error } = profileRes;
    const memberships = membershipRes.data;
    if (membershipRes.error) console.warn("profile_classes load error:", membershipRes.error);
    console.log("loadProfile — profile:", profile, "error:", error, "memberships:", memberships);
    if (error) { console.error("loadProfile error:", error); return null; }
    if (profile) {
      setSession({
        id: profile.id,
        name: profile.alias,
        role: profile.role,
        cohort: profile.cohort || "net-hw",
        class_id: profile.class_id,
        className: profile.classes?.name || "",
        classCode: profile.classes?.code || "",
        classes: (memberships||[]).length > 0
          ? (memberships||[]).map(m=>m.classes).filter(Boolean)
          : profile.classes ? [profile.classes] : [],
      });
      setView("dashboard");
      if (!localStorage.getItem(`cinder:onboarded:${userId}`)) {
        setShowOnboarding(true);
      }
      return profile;
    }
    return null;
  }, []);

  useEffect(()=>{
    // Load app data (localStorage for now; Supabase migration in next phase)
    (async()=>{
      const u=await load("hd:users",SEED_USERS);
      const t=await load("hd:tickets",SEED_TICKETS);
      const n=await load("hd:notifs",SEED_NOTIFS);
      const al=await load("hd:activeLabs",SEED_ACTIVE_LABS);
      const k=await load("hd:kb",SEED_KB);
      const inc=await load("hd:incidents",SEED_INCIDENTS);
      setUsers(u); setTickets(t); setNotifs(n); setActiveLabs(al); setKb(k); setIncidents(inc);

      // Restore Supabase session if one exists
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession) await loadProfile(authSession.user.id);

      setReady(true);
    })();

    // Keep session in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (authSession) {
        await loadProfile(authSession.user.id);
      } else {
        setSession(null);
      }
    });
    return () => subscription.unsubscribe();
  },[loadProfile]);

  function showToast(msg,type="success") { setToast({msg,type}); setTimeout(()=>setToast(null),3500); }

  async function persistTickets(next) { setTickets(next); await save("hd:tickets",next); }
  async function persistUsers(next)   { setUsers(next);   await save("hd:users",next); }
  async function persistNotifs(next)  { setNotifs(next);  await save("hd:notifs",next); }
  async function persistLabs(next)    { setActiveLabs(next); await save("hd:activeLabs",next); }
  async function persistKb(next)      { setKb(next);      await save("hd:kb",next); }
  async function persistIncidents(next){ setIncidents(next); await save("hd:incidents",next); }

  async function addNotifs(batch) {
    const next=[...batch,...notifs].slice(0,300);
    await persistNotifs(next);
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null); setView("dashboard"); setSelected(null);
    setClassStudents([]); setAssignedTickets([]);
  }

  // ── Load class students (admin) or assigned tickets (student) after login ──
  useEffect(()=>{
    if (!session) return;
    if (session.role === "admin") {
      // Admins see ALL classes and ALL students
      Promise.all([
        supabase.from("classes").select("id,name,code,course_id"),
        supabase.from("profile_classes").select("profile_id, class_id, profiles(id,alias,role,cohort,class_id)"),
        supabase.from("profiles").select("id,alias,role,cohort,class_id").not("class_id","is",null),
      ]).then(([classesRes, junctionRes, legacyRes]) => {
        // Store all classes on session so LabManager tabs work too
        if (classesRes.data) {
          setSession(s => ({...s, classes: classesRes.data}));
        }
        const seen = new Set();
        const all = [];
        for (const r of (junctionRes.data||[])) {
          if (!r.profiles) continue;
          const key = r.profiles.id + r.class_id;
          if (seen.has(key)) continue;
          seen.add(key);
          all.push({...r.profiles, enrolled_class_id: r.class_id});
        }
        for (const p of (legacyRes.data||[])) {
          if (!p || p.role === "admin") continue;
          const key = p.id + p.class_id;
          if (seen.has(key)) continue;
          seen.add(key);
          all.push({...p, enrolled_class_id: p.class_id});
        }
        setClassStudents(all);
      });
      supabase.from("ticket_templates").select("*").order("course_id").order("week")
        .then(({data})=>{ if(data) setCustomScenarios(data); });
    } else {
      supabase.from("assigned_tickets")
        .select("*, lab_assignments(week_label, assigned_at)")
        .eq("student_id", session.id).order("created_at",{ascending:false})
        .then(({data})=>{ if(data) setAssignedTickets(data); });
    }
  },[session]);

  async function saveCustomScenario(scenario) {
    if (scenario.id) {
      const {error} = await supabase.from("ticket_templates").update(scenario).eq("id",scenario.id);
      if (error) { showToast("Save failed: "+error.message,"error"); return false; }
      setCustomScenarios(prev=>prev.map(s=>s.id===scenario.id?scenario:s));
    } else {
      const id = "cst-"+Date.now();
      const {data,error} = await supabase.from("ticket_templates").insert({...scenario,id}).select().single();
      if (error) { showToast("Save failed: "+error.message,"error"); return false; }
      setCustomScenarios(prev=>[...prev,data]);
    }
    showToast("Scenario saved.");
    return true;
  }

  async function deleteCustomScenario(id) {
    const {error} = await supabase.from("ticket_templates").delete().eq("id",id);
    if (error) { showToast("Delete failed: "+error.message,"error"); return; }
    setCustomScenarios(prev=>prev.filter(s=>s.id!==id));
    showToast("Scenario deleted.");
  }

  async function importScenarios(rows) {
    const timestamped = rows.map((r,i)=>({...r, id:"cst-"+Date.now()+"-"+i}));
    const {data,error} = await supabase.from("ticket_templates").insert(timestamped).select();
    if (error) { showToast("Import failed: "+error.message,"error"); return; }
    setCustomScenarios(prev=>[...prev,...data]);
    showToast(`Imported ${data.length} scenario(s).`);
  }

  async function pushLabAssignment(courseId, week, scenarioId, mode, studentIds, classId) {
    const scenario = SCENARIOS.find(s=>s.id===scenarioId);
    if (!scenario) return;
    const { data: assignment, error } = await supabase.from("lab_assignments").insert({
      class_id: classId || session.class_id,
      week_label: `Week ${week} — ${scenario.title}`,
      assigned_by: session.id,
    }).select().single();
    if (error || !assignment) { showToast("Failed to create assignment.","error"); return; }

    // Build rows — pairs share a group_tag
    const rows = mode==="pairs"
      ? studentIds.reduce((acc,sid,i)=>{
          const tag=`W${week}-pair${Math.floor(i/2)+1}`;
          acc.push({assignment_id:assignment.id,student_id:sid,scenario_id:scenarioId,
            course_id:courseId,week,title:`[W${week}] ${scenario.title}`,
            description:scenario.description,priority:scenario.priority,status:"Open",group_tag:tag});
          return acc;
        },[])
      : studentIds.map(sid=>({
          assignment_id:assignment.id,student_id:sid,scenario_id:scenarioId,
          course_id:courseId,week,title:`[W${week}] ${scenario.title}`,
          description:scenario.description,priority:scenario.priority,status:"Open",group_tag:null,
        }));

    const {error:rowsErr} = await supabase.from("assigned_tickets").insert(rows);
    if (rowsErr) { showToast("Push failed: "+rowsErr.message,"error"); return; }
    showToast(`Week ${week} lab pushed to ${studentIds.length} student(s)!`);
  }

  async function saveLabNote(assignedTicketId, content) {
    await supabase.from("lab_notes").upsert(
      {assigned_ticket_id:assignedTicketId, student_id:session.id, content, updated_at:new Date().toISOString()},
      {onConflict:"assigned_ticket_id,student_id"}
    );
  }

  async function updateAssignedTicketStatus(ticketId, status) {
    await supabase.from("assigned_tickets").update({status, ...(["Resolved","Closed"].includes(status)?{resolved_at:new Date().toISOString()}:{})}).eq("id",ticketId);
    setAssignedTickets(prev=>prev.map(t=>t.id===ticketId?{...t,status}:t));
  }

  const myUnread = session ? notifs.filter(n=>n.toId===session.id&&!n.read).length : 0;

  // Active lab ticket for this student this week
  function getMyLabTicket(courseId, week) {
    const key = `${courseId}-${week}`;
    const lab = activeLabs[key];
    if (!lab) return null;
    const assigneeTicketId = lab.assignees?.[session?.id];
    if (!assigneeTicketId) return null;
    return tickets.find(t=>t.id===assigneeTicketId) || null;
  }

  if(!ready) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0D0D0D",color:"#F0B060",fontFamily:"monospace",fontSize:18}}>
      Loading Cinder by Ember…
    </div>
  );
  if(!session) return <Login onSignIn={loadProfile} />;

  function dismissOnboarding() {
    localStorage.setItem(`cinder:onboarded:${session.id}`, "1");
    setShowOnboarding(false);
  }

  return (
    <Shell session={session} onLogout={logout} view={view} setView={setView} unread={myUnread}>
      {showOnboarding && <OnboardingModal onDone={dismissOnboarding} />}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {view==="dashboard" && (
        <Dashboard session={session} tickets={tickets} users={users} activeLabs={activeLabs}
          getMyLabTicket={getMyLabTicket}
          onOpen={id=>{setSelected(id);setView("ticket");}} />
      )}
      {view==="submit" && (
        <SubmitTicket session={session} courses={COURSES}
          onSubmit={async(t)=>{
            const ticket={...t,id:nextId(tickets),created:new Date().toISOString(),notes:[],assignedTo:null,labScenarioId:null,week:null};
            const nextT=[ticket,...tickets];
            await persistTickets(nextT);
            const notifBatch=users.filter(u=>u.role==="tech"||u.role==="admin")
              .map(u=>makeNotif(u.id,`[${ticket.id}] New ticket: ${ticket.title}`,
                `Priority: ${ticket.priority}\nCourse: ${courseById(ticket.courseId)?.label||"General"}`,ticket.id));
            await addNotifs(notifBatch);
            showToast("Ticket submitted!"); setView("my-tickets");
          }} />
      )}
      {view==="my-tickets" && (
        <MyTickets session={session} tickets={tickets} users={users}
          onOpen={id=>{setSelected(id);setView("ticket");}} />
      )}
      {view==="queue" && (session.role==="tech"||session.role==="admin") && (
        <Queue session={session} tickets={tickets} users={users}
          onOpen={id=>{setSelected(id);setView("ticket");}} />
      )}
      {view==="ticket" && selected && (
        <TicketDetail
          ticket={tickets.find(t=>t.id===selected)}
          session={session} users={users}
          onUpdate={async(updated,notifBatch)=>{
            const next=tickets.map(t=>t.id===updated.id?updated:t);
            await persistTickets(next);
            if(notifBatch?.length) await addNotifs(notifBatch);
            showToast("Ticket updated.");
          }}
          onBack={()=>setView(session.role==="student"?"my-tickets":"queue")}
        />
      )}
      {view==="inbox" && (
        <Inbox session={session} notifs={notifs} tickets={tickets}
          onRead={async(id)=>{ const n=notifs.map(x=>x.id===id?{...x,read:true}:x); await persistNotifs(n); setNotifs(n); }}
          onReadAll={async()=>{ const n=notifs.map(x=>x.toId===session.id?{...x,read:true}:x); await persistNotifs(n); setNotifs(n); }}
          onOpen={id=>{setSelected(id);setView("ticket");}} />
      )}
      {view==="labs" && session.role==="admin" && (
        <LabManager
          session={session} classStudents={classStudents}
          customScenarios={customScenarios}
          onActivate={pushLabAssignment}
        />
      )}
      {view==="my-labs" && session.role==="student" && (
        <MyLabs session={session} assignedTickets={assignedTickets}
          onStatusChange={updateAssignedTicketStatus}
          onSaveNote={saveLabNote} />
      )}
      {view==="scenarios" && session.role==="admin" && (
        <ScenarioLibrary
          customScenarios={customScenarios}
          onSave={saveCustomScenario}
          onDelete={deleteCustomScenario}
          onImport={importScenarios}
        />
      )}
      {view==="admin" && session.role==="admin" && (
        <AdminPanel session={session} classStudents={classStudents}
          tickets={tickets}
          onSaveTickets={persistTickets}
          showToast={showToast} />
      )}
      {view==="kb" && (
        <KnowledgeBase session={session} kb={kb}
          onSave={async(article)=>{
            const exists=kb.find(a=>a.id===article.id);
            const next=exists?kb.map(a=>a.id===article.id?article:a):[article,...kb];
            await persistKb(next); showToast(article.status==="published"?"Article published!":"Draft saved.");
          }}
          onDelete={async(id)=>{ await persistKb(kb.filter(a=>a.id!==id)); showToast("Article deleted."); }}
        />
      )}
      {view==="ir" && (
        <IncidentResponse session={session} incidents={incidents} tickets={tickets} users={users}
          onSave={async(inc)=>{
            const exists=incidents.find(i=>i.id===inc.id);
            const next=exists?incidents.map(i=>i.id===inc.id?inc:i):[inc,...incidents];
            await persistIncidents(next); showToast("Incident updated.");
          }}
          onDelete={async(id)=>{ await persistIncidents(incidents.filter(i=>i.id!==id)); showToast("Incident deleted."); }}
        />
      )}
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// ONBOARDING MODAL
// ═══════════════════════════════════════════════════════════════
const ONBOARD_STEPS = [
  { icon:"🔥", title:"Welcome to Cinder", body:"Cinder is your IT Help Desk training platform. You'll work through real-world IT scenarios, document your troubleshooting process, and build hands-on skills every lab day." },
  { icon:"🧪", title:"My Labs", body:"This is where your weekly lab ticket appears. Each ticket is a scenario your instructor assigned — read the instructions carefully before starting on the physical equipment." },
  { icon:"📓", title:"Lab Documentation", body:"As you troubleshoot, document every step in the Lab Documentation section. Record what you tried, what commands you ran, what you observed, and how you resolved the issue. This IS your lab report." },
  { icon:"📖", title:"Knowledge Base", body:"The Knowledge Base is a shared class reference. After completing a lab, consider submitting an article explaining what you learned. Your classmates will benefit from it." },
  { icon:"✅", title:"You're ready!", body:"That's the quick tour. Your instructor will push a lab ticket to you each week. Check My Labs at the start of every lab session. Good luck!" },
];

function OnboardingModal({onDone}) {
  const [step,setStep]=useState(0);
  const s=ONBOARD_STEPS[step];
  const isLast=step===ONBOARD_STEPS.length-1;
  return (
    <div style={{position:"fixed",inset:0,background:"#0D0D0Dcc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,fontFamily:"'Inter',sans-serif"}}>
      <div style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:16,padding:40,maxWidth:460,width:"90%",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>{s.icon}</div>
        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:22,fontWeight:800,color:"#F0EDE8",marginBottom:12,letterSpacing:"-0.01em"}}>{s.title}</div>
        <div style={{fontSize:14,color:"#8A7868",lineHeight:1.8,marginBottom:32}}>{s.body}</div>
        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:28}}>
          {ONBOARD_STEPS.map((_,i)=>(
            <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?"#E8922E":"#2A2A2A",transition:"width 0.2s"}} />
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,background:"none",border:"1px solid #242424",color:"#8A7868",borderRadius:8,padding:"12px",fontSize:13,cursor:"pointer"}}>Back</button>}
          <button onClick={isLast?onDone:()=>setStep(s=>s+1)}
            style={{flex:2,background:"#E8922E",border:"none",color:"#0D0D0D",borderRadius:8,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {isLast?"Get Started →":"Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
function Login({ onSignIn }) {
  function getStoredCodes() { try { return JSON.parse(localStorage.getItem("cinder:codes")||"{}"); } catch { return {}; } }
  function saveCode(a, c) { const m=getStoredCodes(); m[a.toLowerCase().trim()]=c.toUpperCase(); localStorage.setItem("cinder:codes",JSON.stringify(m)); }

  const [tab, setTab]         = useState("signin");
  const [alias, setAlias]     = useState("");
  const [classCode, setClassCode] = useState("");
  const [extraCodes, setExtraCodes] = useState([]); // additional class codes for join
  const [pass, setPass]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  function handleAliasChange(val) {
    setAlias(val);
    setErr("");
    const saved = getStoredCodes()[val.toLowerCase().trim()];
    if (saved) setClassCode(saved);
    else if (tab === "signin") setClassCode("");
  }

  function makeEmail(a, c) {
    return `${a.toLowerCase().replace(/\s+/g,"_")}@${c.toLowerCase().replace(/\s+/g,"_")}.cinder.io`;
  }

  const codeKnown = !!getStoredCodes()[alias.toLowerCase().trim()];

  async function handleSignIn() {
    setErr(""); setLoading(true);
    if (!alias.trim() || !pass) { setErr("Alias and password required."); setLoading(false); return; }
    const code = classCode.trim();
    if (!code) { setErr("Enter your class code."); setLoading(false); return; }
    const email = makeEmail(alias.trim(), code);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { setErr("Invalid alias or password. Check your class code is correct."); setLoading(false); return; }
    saveCode(alias.trim(), code);
    const profile = await onSignIn(data.user.id);
    if (!profile) setErr("Account found but profile missing — contact your instructor.");
    setLoading(false);
  }

  async function handleJoin() {
    setErr(""); setLoading(true);
    const allCodes = [classCode.trim(), ...extraCodes.map(c=>c.trim())].filter(Boolean);
    if (!allCodes.length || !alias.trim() || !pass) { setErr("All fields required."); setLoading(false); return; }
    if (pass !== confirm) { setErr("Passwords do not match."); setLoading(false); return; }
    if (pass.length < 6)  { setErr("Password must be at least 6 characters."); setLoading(false); return; }

    // Validate all class codes
    const classResults = await Promise.all(allCodes.map(code=>
      supabase.from("classes").select("id, name, code").ilike("code", code).single()
    ));
    const badCode = classResults.findIndex(r=>r.error||!r.data);
    if (badCode>=0) { setErr(`Class code "${allCodes[badCode]}" not found. Check with your instructor.`); setLoading(false); return; }
    const classes = classResults.map(r=>r.data);
    const primaryClass = classes[0];

    // Check alias not already taken in primary class
    const { data: existing } = await supabase.from("profiles").select("id")
      .eq("alias", alias.trim()).eq("class_id", primaryClass.id).maybeSingle();
    if (existing) { setErr("That alias is already taken in this class. Choose another."); setLoading(false); return; }

    const email = makeEmail(alias.trim(), allCodes[0]);
    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password: pass });
    if (signUpErr) { setErr(signUpErr.message); setLoading(false); return; }

    // Create profile
    const { error: profErr } = await supabase.from("profiles").insert({
      id: data.user.id, alias: alias.trim(), role: "student", class_id: primaryClass.id,
    });
    if (profErr) { setErr("Account created but profile failed. Contact your instructor."); setLoading(false); return; }

    // Enroll in all classes via junction table
    await supabase.from("profile_classes").insert(
      classes.map(c=>({ profile_id: data.user.id, class_id: c.id }))
    );

    saveCode(alias.trim(), allCodes[0]);
    const profile = await onSignIn(data.user.id);
    if (!profile) setErr("Joined but profile missing — contact your instructor.");
    setLoading(false);
  }

  const tabBtn = (id, label) => (
    <button onClick={()=>{setTab(id);setErr("");setOk("");}}
      style={{flex:1,padding:"10px 0",background:tab===id?"#E8922E":"transparent",
        color:tab===id?"#0D0D0D":"#6A5848",border:"none",borderRadius:6,
        fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase"}}>
      {label}
    </button>
  );

  // ── Reset password tab state ──
  const [resetPin, setResetPin]         = useState("");
  const [newPass, setNewPass]           = useState("");
  const [confirmNew, setConfirmNew]     = useState("");
  const [ok, setOk]                     = useState("");

  async function handleReset() {
    setErr(""); setOk(""); setLoading(true);
    if (!alias.trim() || !classCode.trim() || !resetPin.trim() || !newPass) {
      setErr("All fields required."); setLoading(false); return;
    }
    if (newPass !== confirmNew) { setErr("Passwords do not match."); setLoading(false); return; }
    if (newPass.length < 6)    { setErr("Password must be at least 6 characters."); setLoading(false); return; }
    const { data, error } = await supabase.rpc("reset_student_password", {
      p_alias: alias.trim(), p_class_code: classCode.trim(),
      p_pin: resetPin.trim(), p_new_password: newPass,
    });
    setLoading(false);
    if (error) { setErr("Reset failed. Check your details and try again."); return; }
    if (data === "ok") {
      setOk("Password updated. You can now sign in.");
      setResetPin(""); setNewPass(""); setConfirmNew("");
      saveCode(alias.trim(), classCode.trim());
      setTimeout(()=>{ setTab("signin"); setOk(""); }, 2000);
    } else if (data === "invalid_credentials") {
      setErr("Alias, class code, or PIN is incorrect.");
    } else if (data === "invalid_class") {
      setErr("Class code not found.");
    } else if (data === "password_too_short") {
      setErr("Password must be at least 6 characters.");
    } else {
      setErr("Reset failed — contact your instructor.");
    }
  }

  return (
    <div style={{minHeight:"100vh",background:"#0D0D0D",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Raleway:wght@700;800&display=swap');`}</style>
      <div style={{width:420}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:11,letterSpacing:"0.3em",color:"#6A5848",textTransform:"uppercase",marginBottom:8}}>Cinder by Ember</div>
          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:36,fontWeight:800,color:"#F0EDE8",letterSpacing:"-0.02em"}}>Cinder<span style={{color:"#E8922E"}}>.</span></div>
          <div style={{fontSize:12,color:"#6A5848",marginTop:6}}>IT Help Desk Training System</div>
        </div>
        <div style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:12,padding:32}}>
          <div style={{display:"flex",gap:4,background:"#0D0D0D",borderRadius:8,padding:4,marginBottom:24}}>
            {tabBtn("signin","Sign In")}
            {tabBtn("join","Join Class")}
            {tabBtn("reset","Reset Password")}
          </div>

          {/* ── SIGN IN ── */}
          {tab==="signin" && <>
            <Field label="Alias">
              <input value={alias} onChange={e=>handleAliasChange(e.target.value)}
                style={inputStyle} placeholder="Your alias" autoComplete="username" />
            </Field>
            {!codeKnown && (
              <Field label="Class Code">
                <input value={classCode} onChange={e=>{setClassCode(e.target.value);setErr("");}}
                  style={inputStyle} placeholder="e.g. FALL2026-NET" />
              </Field>
            )}
            <Field label="Password">
              <input value={pass} type="password" onChange={e=>{setPass(e.target.value);setErr("");}}
                style={inputStyle} placeholder="••••••••" autoComplete="current-password"
                onKeyDown={e=>e.key==="Enter"&&handleSignIn()} />
            </Field>
            {err && <div style={{color:"#f87171",fontSize:12,marginBottom:12}}>{err}</div>}
            <button onClick={handleSignIn} style={{...btnPrimary,opacity:loading?0.6:1}} disabled={loading}>
              {loading ? "Please wait…" : "Sign In →"}
            </button>
            <p style={{fontSize:11,color:"#4A3828",textAlign:"center",marginTop:16}}>
              Forgot your password? Use the Reset Password tab.<br/>You'll need the PIN from your instructor.
            </p>
          </>}

          {/* ── JOIN CLASS ── */}
          {tab==="join" && <>
            <Field label="Alias">
              <input value={alias} onChange={e=>handleAliasChange(e.target.value)}
                style={inputStyle} placeholder="Choose an alias" />
            </Field>
            <Field label="Class Code(s)">
              <input value={classCode} onChange={e=>{setClassCode(e.target.value);setErr("");}}
                style={{...inputStyle, marginBottom:6}}
                placeholder="e.g. FALL2026-NET (from your instructor)" />
              {extraCodes.map((code,i)=>(
                <div key={i} style={{display:"flex",gap:6,marginBottom:6}}>
                  <input value={code} onChange={e=>{const n=[...extraCodes];n[i]=e.target.value;setExtraCodes(n);setErr("");}}
                    style={{...inputStyle,flex:1}} placeholder={`Additional class code ${i+2}`} />
                  <button onClick={()=>setExtraCodes(extraCodes.filter((_,j)=>j!==i))}
                    style={{background:"none",border:"1px solid #7f1d1d44",color:"#f87171",borderRadius:6,padding:"0 10px",cursor:"pointer",fontSize:16}}>×</button>
                </div>
              ))}
              <button onClick={()=>setExtraCodes([...extraCodes,""])}
                style={{background:"none",border:"1px dashed #4A3828",color:"#6A5848",borderRadius:6,padding:"6px 12px",fontSize:11,cursor:"pointer",width:"100%",marginTop:2}}>
                + Add another class
              </button>
            </Field>
            <Field label="Password">
              <input value={pass} type="password" onChange={e=>{setPass(e.target.value);setErr("");}}
                style={inputStyle} placeholder="••••••••" />
            </Field>
            <Field label="Confirm Password">
              <input value={confirm} type="password" onChange={e=>{setConfirm(e.target.value);setErr("");}}
                style={inputStyle} placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&handleJoin()} />
            </Field>
            {err && <div style={{color:"#f87171",fontSize:12,marginBottom:12}}>{err}</div>}
            <button onClick={handleJoin} style={{...btnPrimary,opacity:loading?0.6:1}} disabled={loading}>
              {loading ? "Please wait…" : "Join Class →"}
            </button>
            <p style={{fontSize:11,color:"#4A3828",textAlign:"center",marginTop:16,lineHeight:1.6}}>
              No personal information is collected.<br/>Your alias is the only identifier stored.
            </p>
          </>}

          {/* ── RESET PASSWORD ── */}
          {tab==="reset" && <>
            <div style={{background:"#0D0D0D",border:"1px solid #2E2E2E",borderRadius:8,padding:"12px 14px",marginBottom:20,fontSize:12,color:"#8A7868",lineHeight:1.7}}>
              Ask your instructor for a reset PIN. Enter it below along with your alias and class code to set a new password.
            </div>
            <Field label="Alias">
              <input value={alias} onChange={e=>handleAliasChange(e.target.value)}
                style={inputStyle} placeholder="Your alias" />
            </Field>
            {!codeKnown && (
              <Field label="Class Code">
                <input value={classCode} onChange={e=>{setClassCode(e.target.value);setErr("");}}
                  style={inputStyle} placeholder="e.g. FALL2026-NET" />
              </Field>
            )}
            <Field label="Reset PIN (from instructor)">
              <input value={resetPin} onChange={e=>{setResetPin(e.target.value);setErr("");}}
                style={inputStyle} placeholder="4-digit PIN" maxLength={8} />
            </Field>
            <Field label="New Password">
              <input value={newPass} type="password" onChange={e=>{setNewPass(e.target.value);setErr("");}}
                style={inputStyle} placeholder="••••••••" />
            </Field>
            <Field label="Confirm New Password">
              <input value={confirmNew} type="password" onChange={e=>{setConfirmNew(e.target.value);setErr("");}}
                style={inputStyle} placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&handleReset()} />
            </Field>
            {err && <div style={{color:"#f87171",fontSize:12,marginBottom:12}}>{err}</div>}
            {ok  && <div style={{color:"#86efac",fontSize:12,marginBottom:12}}>{ok}</div>}
            <button onClick={handleReset} style={{...btnPrimary,opacity:loading?0.6:1}} disabled={loading}>
              {loading ? "Resetting…" : "Reset Password →"}
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHELL
// ═══════════════════════════════════════════════════════════════
function Shell({session,onLogout,view,setView,unread,children}) {
  const navItems=[
    {id:"dashboard",  label:"Dashboard",    roles:["student","tech","admin"], icon:"⊞"},
    {id:"submit",     label:"New Ticket",   roles:["student","tech","admin"], icon:"＋"},
    {id:"my-tickets", label:"My Tickets",   roles:["student","tech","admin"], icon:"≡"},
    {id:"queue",      label:"Ticket Queue", roles:["tech","admin"],           icon:"▤"},
    {id:"kb",         label:"Knowledge Base",roles:["student","tech","admin"],icon:"📖"},
    {id:"ir",         label:"Incidents",    roles:["student","tech","admin"], icon:"🚨"},
    {id:"my-labs",    label:"My Labs",       roles:["student"],               icon:"🧪"},
    {id:"labs",       label:"Lab Manager",  roles:["admin"],                  icon:"🔬"},
    {id:"scenarios",  label:"Scenarios",    roles:["admin"],                  icon:"📋"},
    {id:"inbox",      label:"Inbox",        roles:["student","tech","admin"], icon:"✉"},
    {id:"admin",      label:"Admin Panel",  roles:["admin"],                  icon:"⚙"},
  ].filter(n=>n.roles.includes(session.role));

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#0D0D0D",fontFamily:"'Inter',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Raleway:wght@700;800&display=swap');
        *{box-sizing:border-box} ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0D0D0D} ::-webkit-scrollbar-thumb{background:#242424;border-radius:3px}
        input:focus,textarea:focus,select:focus{outline:2px solid #E8922E !important;outline-offset:2px;}
      `}</style>
      <div style={{width:224,background:"#0D0D0D",borderRight:"1px solid #242424",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"24px 20px 12px"}}>
          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:18,fontWeight:800,color:"#F0EDE8",letterSpacing:"-0.01em"}}>Ember<span style={{color:"#E8922E"}}>.</span></div>
          <div style={{fontSize:10,color:"#6A5848",letterSpacing:"0.18em",textTransform:"uppercase",marginTop:2}}>Cinder</div>
        </div>
        {/* Course pills */}
        <div style={{padding:"0 12px 12px",display:"flex",gap:4,flexWrap:"wrap"}}>
          {(session.cohort==="all" ? COURSES : COURSES.filter(c=>c.cohort===session.cohort||session.cohort==="cyber"&&c.id==="cyber")).map(c=>(
            <span key={c.id} style={{fontSize:9,background:c.color+"18",color:c.color,border:`1px solid ${c.color}33`,borderRadius:3,padding:"2px 6px",fontWeight:700,letterSpacing:"0.06em"}}>
              {c.icon} {c.id.toUpperCase()}
            </span>
          ))}
        </div>
        <nav style={{padding:"4px 12px",flex:1}}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 12px",borderRadius:8,
                background:view===n.id?"#1A1A1A":"transparent",
                border:view===n.id?"1px solid #242424":"1px solid transparent",
                color:view===n.id?"#F0EDE8":"#8A7868",
                fontSize:13,cursor:"pointer",textAlign:"left",marginBottom:2,transition:"all 0.15s"}}>
              <span style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14}}>{n.icon}</span>{n.label}</span>
              {n.id==="inbox"&&unread>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:10,fontSize:10,padding:"1px 6px",fontWeight:700}}>{unread}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"16px 20px",borderTop:"1px solid #242424"}}>
          <div style={{fontSize:12,color:"#B8A898",fontWeight:500}}>{session.name}</div>
          <div style={{fontSize:10,marginTop:3,display:"flex",gap:6,flexWrap:"wrap"}}>
            <span style={{background:ROLE_COLOR[session.role]+"22",color:ROLE_COLOR[session.role],padding:"1px 6px",borderRadius:3,textTransform:"uppercase",letterSpacing:"0.08em",fontSize:9,fontWeight:700}}>{session.role}</span>
            {session.cohort&&session.cohort!=="all"&&<span style={{color:"#4A3828",fontSize:9}}>{session.cohort==="net-hw"?"NET + HW":"CYBER"}</span>}
          </div>
          <button onClick={onLogout} style={{marginTop:12,fontSize:11,color:"#6A5848",background:"none",border:"none",cursor:"pointer",padding:0}}>← Sign out</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:32}}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({session,tickets,users,activeLabs,getMyLabTicket,onOpen}) {
  const myTickets = session.role==="student"
    ? tickets.filter(t=>t.submittedBy===session.id)
    : tickets;

  const stats = {
    open:      myTickets.filter(t=>t.status==="Open").length,
    inProgress:myTickets.filter(t=>t.status==="In Progress").length,
    resolved:  myTickets.filter(t=>["Resolved","Closed"].includes(t.status)).length,
    breached:  myTickets.filter(t=>t.priority&&slaInfo(t.created,t.priority,t.status)?.breached).length,
  };

  // Active lab tickets for this student
  const myActiveLabs = session.role==="student"
    ? Object.entries(activeLabs).map(([key,lab])=>{
        const lastDash = key.lastIndexOf("-");
        const cid = key.slice(0, lastDash);
        const week = parseInt(key.slice(lastDash + 1));
        const ticketId=lab.assignees?.[session.id];
        const ticket=ticketId?tickets.find(t=>t.id===ticketId):null;
        return ticket?{courseId:cid,week,ticket}:null;
      }).filter(Boolean)
    : [];

  const recent=[...myTickets].sort((a,b)=>new Date(b.created)-new Date(a.created)).slice(0,5);

  return (
    <div>
      <PageTitle title="Dashboard" sub={`Welcome back, ${session.name.split(" ")[0]}`} />

      {/* Active lab callouts */}
      {myActiveLabs.length>0&&(
        <div style={{marginBottom:28}}>
          <SectionLabel>📋 Active Lab Assignments</SectionLabel>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {myActiveLabs.map(({courseId,week,ticket})=>{
              const course=courseById(courseId);
              return (
                <div key={ticket.id} onClick={()=>onOpen(ticket.id)}
                  style={{background:"#0D0D0D",border:`1px solid ${course.color}44`,borderLeft:`3px solid ${course.color}`,borderRadius:10,padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}
                  onMouseEnter={e=>e.currentTarget.style.background="#181410"}
                  onMouseLeave={e=>e.currentTarget.style.background="#0D0D0D"}>
                  <div>
                    <div style={{fontSize:11,color:course.color,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>
                      {course.icon} {course.label} — Week {week}
                    </div>
                    <div style={{color:"#EDE9E3",fontSize:14,fontWeight:600}}>{ticket.title.replace(/^\[W\d+\] /,"")}</div>
                    <div style={{marginTop:4}}>{badge(ticket.status,STATUS_COLOR[ticket.status])}</div>
                  </div>
                  <div style={{fontSize:12,color:"#E8922E",whiteSpace:"nowrap"}}>Open → </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
        {[
          {label:"Open",        val:stats.open,        color:"#3b82f6"},
          {label:"In Progress", val:stats.inProgress,  color:"#f59e0b"},
          {label:"Resolved",    val:stats.resolved,    color:"#22c55e"},
          {label:"SLA Breached",val:stats.breached,    color:"#ef4444"},
        ].map(s=>(
          <div key={s.label} style={{background:"#1A1A1A",border:`1px solid ${s.label==="SLA Breached"&&s.val>0?"#ef444444":"#242424"}`,borderRadius:12,padding:"18px 22px"}}>
            <div style={{fontSize:11,color:"#6A5848",textTransform:"uppercase",letterSpacing:"0.1em"}}>{s.label}</div>
            <div style={{fontSize:34,fontWeight:700,color:s.color,fontFamily:"'Raleway',sans-serif",lineHeight:1.2,marginTop:4}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Course progress (admin view) */}
      {session.role==="admin"&&(
        <div style={{marginBottom:28}}>
          <SectionLabel>Course Overview</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {COURSES.map(c=>{
              const cTickets=tickets.filter(t=>t.courseId===c.id);
              const open=cTickets.filter(t=>t.status==="Open").length;
              const active=Object.keys(activeLabs).filter(k=>k.startsWith(c.id)).length;
              return (
                <div key={c.id} style={{background:"#1A1A1A",border:`1px solid ${c.color}33`,borderRadius:12,padding:"18px 22px"}}>
                  <div style={{fontSize:11,color:c.color,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{c.icon} {c.label}</div>
                  <div style={{fontSize:12,color:"#8A7868"}}>{c.term} Quarter · {active} active lab{active!==1?"s":""}</div>
                  <div style={{fontSize:12,color:"#8A7868",marginTop:2}}>{cTickets.length} total tickets · {open} open</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SectionLabel>Recent Tickets</SectionLabel>
      <TicketTable tickets={recent} users={users} session={session} onOpen={onOpen} showSLA showCourse />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUBMIT TICKET
// ═══════════════════════════════════════════════════════════════
function SubmitTicket({session,courses,onSubmit}) {
  const availCourses = session.cohort==="all" ? courses
    : session.cohort==="cyber" ? courses.filter(c=>c.id==="cyber")
    : courses.filter(c=>c.cohort==="net-hw");

  const [form,setForm]=useState({
    title:"", courseId: availCourses[0]?.id||"net",
    categories:[], priority:"Medium", description:"", linkedCourse:""
  });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const course=courseById(form.courseId);

  function toggleCat(c) {
    set("categories", form.categories.includes(c)
      ? form.categories.filter(x=>x!==c)
      : [...form.categories,c]);
  }

  return (
    <div style={{maxWidth:660}}>
      <PageTitle title="Submit a Ticket" sub="Document an issue or lab finding." />
      <Card>
        <Field label="Course">
          <select value={form.courseId} onChange={e=>set("courseId",e.target.value)} style={inputStyle}>
            {availCourses.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </Field>
        <Field label="Issue Title">
          <input value={form.title} onChange={e=>set("title",e.target.value)} style={inputStyle} placeholder="Brief description of the issue" />
        </Field>
        <Field label="Categories (select all that apply)">
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {course?.categories.map(c=>(
              <button key={c} onClick={()=>toggleCat(c)}
                style={{padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer",
                  background:form.categories.includes(c)?course.color+"33":"#0D0D0D",
                  color:form.categories.includes(c)?course.color:"#8A7868",
                  border:`1px solid ${form.categories.includes(c)?course.color+"66":"#242424"}`,
                  fontWeight:form.categories.includes(c)?700:400}}>
                {c}
              </button>
            ))}
          </div>
        </Field>
        {course?.categories.includes("Cross-Course")&&form.categories.includes("Cross-Course")&&(
          <Field label="Linked Course">
            <select value={form.linkedCourse} onChange={e=>set("linkedCourse",e.target.value)} style={inputStyle}>
              <option value="">None</option>
              {courses.filter(c=>c.id!==form.courseId).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
        )}
        <Field label="Priority">
          <select value={form.priority} onChange={e=>set("priority",e.target.value)} style={inputStyle}>
            {PRIORITIES.map(p=><option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={e=>set("description",e.target.value)}
            style={{...inputStyle,height:140,resize:"vertical"}}
            placeholder="Describe the issue in detail. For labs, document what you observed and what you tried." />
        </Field>
        <button onClick={()=>{if(form.title.trim()&&form.description.trim()&&form.categories.length>0)onSubmit(form);}}
          style={btnPrimary} disabled={!form.title.trim()||!form.description.trim()||form.categories.length===0}>
          Submit Ticket →
        </button>
        {form.categories.length===0&&<div style={{fontSize:11,color:"#6A5848",marginTop:8,textAlign:"center"}}>Select at least one category</div>}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MY TICKETS
// ═══════════════════════════════════════════════════════════════
function MyTickets({session,tickets,users,onOpen}) {
  const mine=tickets.filter(t=>t.submittedBy===session.id||t.assignedTo===session.id)
    .sort((a,b)=>new Date(b.created)-new Date(a.created));
  return (
    <div>
      <PageTitle title="My Tickets" sub={`${mine.length} ticket${mine.length!==1?"s":""}`} />
      {mine.length===0?<EmptyState msg="No tickets yet."/>
        :<TicketTable tickets={mine} users={users} session={session} onOpen={onOpen} showSLA showCourse />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUEUE
// ═══════════════════════════════════════════════════════════════
function Queue({session,tickets,users,onOpen}) {
  const [filter,setFilter]=useState("Open");
  const [courseFilter,setCourseFilter]=useState("all");

  const visible=tickets
    .filter(t=>filter==="All"?true:t.status===filter)
    .filter(t=>courseFilter==="all"?true:t.courseId===courseFilter)
    .sort((a,b)=>{
      const pri={Critical:0,High:1,Medium:2,Low:3};
      const aB=slaInfo(a.created,a.priority,a.status)?.breached?-1:0;
      const bB=slaInfo(b.created,b.priority,b.status)?.breached?-1:0;
      return (aB-bB)||(pri[a.priority]-pri[b.priority]);
    });

  return (
    <div>
      <PageTitle title="Ticket Queue" sub={`${visible.length} ticket${visible.length!==1?"s":""} shown`} />
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {["Open","In Progress","Pending","Resolved","All"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{padding:"6px 14px",borderRadius:6,fontSize:12,cursor:"pointer",
              background:filter===s?"#E8922E":"#1A1A1A",color:filter===s?"#0D0D0D":"#B8A898",
              border:"1px solid "+(filter===s?"#E8922E":"#242424"),fontWeight:filter===s?700:400}}>
            {s}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <button onClick={()=>setCourseFilter("all")}
          style={{padding:"5px 12px",borderRadius:6,fontSize:11,cursor:"pointer",background:courseFilter==="all"?"#4A3828":"transparent",color:courseFilter==="all"?"#EDE9E3":"#8A7868",border:"1px solid #242424"}}>
          All Courses
        </button>
        {COURSES.map(c=>(
          <button key={c.id} onClick={()=>setCourseFilter(c.id)}
            style={{padding:"5px 12px",borderRadius:6,fontSize:11,cursor:"pointer",
              background:courseFilter===c.id?c.color+"22":"transparent",
              color:courseFilter===c.id?c.color:"#8A7868",
              border:`1px solid ${courseFilter===c.id?c.color+"55":"#242424"}`}}>
            {c.icon} {c.id.toUpperCase()}
          </button>
        ))}
      </div>
      {visible.length===0?<EmptyState msg="No tickets in this view."/>
        :<TicketTable tickets={visible} users={users} session={session} onOpen={onOpen} showAssigned showSLA showCourse />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TICKET DETAIL
// ═══════════════════════════════════════════════════════════════
function SLABar({ticket}) {
  const [,setTick]=useState(0);
  useEffect(()=>{
    if(ticket.status==="Resolved"||ticket.status==="Closed") return;
    const id=setInterval(()=>setTick(n=>n+1),1000);
    return ()=>clearInterval(id);
  },[ticket.status]);
  const info=slaInfo(ticket.created,ticket.priority,ticket.status);
  if(!info) return <div style={{fontSize:12,color:"#22c55e"}}>✓ Resolved within SLA</div>;
  return (
    <div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:11,color:"#6A5848",textTransform:"uppercase",letterSpacing:"0.08em"}}>SLA Resolution</span>
        <span style={{fontSize:12,color:info.color,fontWeight:700,animation:info.breached?"pulse 1s infinite":"none"}}>
          {info.breached?"⚠ BREACHED":fmtDur(info.msLeft)+" remaining"}
        </span>
      </div>
      <div style={{height:6,background:"#0D0D0D",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${Math.round(info.pct*100)}%`,background:info.color,borderRadius:3,transition:"width 1s linear",boxShadow:info.pct<0.25?`0 0 8px ${info.color}`:"none"}} />
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#6A5848",marginTop:4}}>
        <span>Target: {SLA[ticket.priority].resolution}h</span>
        <span>Deadline: {fmt(slaDeadline(ticket.created,ticket.priority).toISOString())}</span>
      </div>
    </div>
  );
}

function TicketDetail({ticket,session,users,onUpdate,onBack}) {
  const [note,setNote]=useState("");
  const [status,setStatus]=useState(ticket.status);
  const [assignedTo,setAssigned]=useState(ticket.assignedTo||"");
  const [priority,setPriority]=useState(ticket.priority);
  const techs=users.filter(u=>u.role==="tech"||u.role==="admin");
  const course=courseById(ticket.courseId);
  function nameOf(id){return users.find(u=>u.id===id)?.name||"Unknown";}
  const canEdit=session.role==="tech"||session.role==="admin";

  function makeNotifBatch(updated,newStatus,newAssigned) {
    const batch=[];
    if(newStatus!==ticket.status) {
      const sub=users.find(u=>u.id===ticket.submittedBy);
      if(sub) batch.push(makeNotif(sub.id,`[${ticket.id}] Status: ${newStatus}`,
        `Your ticket "${ticket.title}" is now: ${newStatus}`,ticket.id));
    }
    if(newAssigned&&newAssigned!==ticket.assignedTo)
      batch.push(makeNotif(newAssigned,`[${ticket.id}] Assigned to you`,
        `You have been assigned: "${ticket.title}"\nPriority: ${updated.priority}\nSLA: ${SLA[updated.priority].resolution}h`,ticket.id));
    return batch;
  }

  async function saveChanges() {
    const updated={...ticket,status,assignedTo:assignedTo||null,priority};
    await onUpdate(updated,makeNotifBatch(updated,status,assignedTo));
  }

  async function addNote() {
    if(!note.trim()) return;
    const updated={...ticket,status,assignedTo:assignedTo||null,priority,
      notes:[...ticket.notes,{author:session.id,text:note.trim(),ts:new Date().toISOString()}]};
    const batch=[];
    const targets=new Set();
    if(ticket.submittedBy!==session.id) targets.add(ticket.submittedBy);
    if(ticket.assignedTo&&ticket.assignedTo!==session.id) targets.add(ticket.assignedTo);
    targets.forEach(id=>batch.push(makeNotif(id,`[${ticket.id}] New note`,
      `Note on "${ticket.title}":\n"${note.trim().slice(0,100)}${note.length>100?"…":""}"`,ticket.id)));
    await onUpdate(updated,batch);
    setNote("");
  }

  return (
    <div style={{maxWidth:880}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6A5848",cursor:"pointer",fontSize:13,marginBottom:20,padding:0}}>← Back</button>

      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <span style={{fontSize:12,color:"#6A5848",fontFamily:"monospace"}}>{ticket.id}</span>
          {course&&<span style={{fontSize:11,color:course.color,fontWeight:700,background:course.color+"18",border:`1px solid ${course.color}33`,borderRadius:4,padding:"1px 8px"}}>{course.icon} {course.id.toUpperCase()}</span>}
          {ticket.linkedCourse&&<span style={{fontSize:11,color:"#8A7868",background:"#242424",borderRadius:4,padding:"1px 8px"}}>↔ {ticket.linkedCourse.toUpperCase()}</span>}
          {ticket.week&&<span style={{fontSize:11,color:"#8A7868"}}>Week {ticket.week}</span>}
        </div>
        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:24,fontWeight:700,color:"#F0EDE8"}}>{ticket.title}</div>
        <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
          {badge(ticket.status,STATUS_COLOR[ticket.status])}
          {badge(ticket.priority,PRIORITY_COLOR[ticket.priority])}
          {ticket.categories?.map(c=><span key={c} style={{background:"#242424",color:"#8A7868",borderRadius:4,padding:"2px 7px",fontSize:11}}>{c}</span>)}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20,alignItems:"start"}}>
        <div>
          <Card style={{marginBottom:16}}><SLABar ticket={{...ticket,priority}} /></Card>

          {/* Lab scenario callout */}
          {ticket.labScenarioId&&(
            <div style={{background:"#0D0D0D",border:`1px solid ${course?.color||"#242424"}33`,borderRadius:10,padding:"14px 18px",marginBottom:16}}>
              <div style={{fontSize:11,color:course?.color||"#B8A898",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>📋 Lab Scenario — Week {ticket.week}</div>
              <div style={{color:"#B8A898",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{ticket.description}</div>
            </div>
          )}

          {!ticket.labScenarioId&&(
            <Card style={{marginBottom:16}}>
              {ticket.requesterId && (
                <div style={{marginBottom:14}}>
                  <SectionLabel>Requester</SectionLabel>
                  <RequesterChip requesterId={ticket.requesterId} />
                </div>
              )}
              <SectionLabel>Description</SectionLabel>
              <p style={{color:"#B8A898",fontSize:14,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{ticket.description}</p>
              {!ticket.requesterId && (
                <div style={{marginTop:12,fontSize:12,color:"#6A5848"}}>Submitted by <strong style={{color:"#8A7868"}}>{nameOf(ticket.submittedBy)}</strong> · {fmt(ticket.created)}</div>
              )}
            </Card>
          )}

          <Card>
            <SectionLabel>Activity Log</SectionLabel>
            {ticket.notes.length===0&&<div style={{color:"#6A5848",fontSize:13,marginBottom:16}}>No notes yet. {ticket.labScenarioId?"Document your lab progress here.":""}</div>}
            {ticket.notes.map((n,i)=>(
              <div key={i} style={{borderLeft:"2px solid #242424",paddingLeft:12,marginBottom:14}}>
                <div style={{fontSize:12,color:"#8A7868"}}><strong>{nameOf(n.author)}</strong> · {fmt(n.ts)}</div>
                <div style={{fontSize:14,color:"#B8A898",marginTop:4,whiteSpace:"pre-wrap"}}>{n.text}</div>
              </div>
            ))}
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              style={{...inputStyle,height:100,resize:"vertical",marginTop:8}}
              placeholder={ticket.labScenarioId?"Document your steps, findings, and commands used…":"Add a note…"} />
            <button onClick={addNote} style={{...btnPrimary,marginTop:8}} disabled={!note.trim()}>Post Note</button>
          </Card>
        </div>

        <div>
          <Card>
            <SectionLabel>Ticket Details</SectionLabel>
            {canEdit?(
              <>
                <Field label="Status"><select value={status} onChange={e=>setStatus(e.target.value)} style={inputStyle}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></Field>
                <Field label="Priority"><select value={priority} onChange={e=>setPriority(e.target.value)} style={inputStyle}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></Field>
                <Field label="Assigned To">
                  <select value={assignedTo} onChange={e=>setAssigned(e.target.value)} style={inputStyle}>
                    <option value="">Unassigned</option>
                    {techs.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </Field>
                <button onClick={saveChanges} style={btnPrimary}>Save Changes</button>
              </>
            ):(
              <>
                <DetailRow label="Status" val={badge(status,STATUS_COLOR[status])} />
                <DetailRow label="Priority" val={badge(priority,PRIORITY_COLOR[priority])} />
                <DetailRow label="Assigned" val={assignedTo?nameOf(assignedTo):"Unassigned"} />
              </>
            )}
          </Card>

          <Card style={{marginTop:16}}>
            <SectionLabel>SLA Targets</SectionLabel>
            {[{label:"Response",h:SLA[ticket.priority].response},{label:"Resolution",h:SLA[ticket.priority].resolution}].map(r=>(
              <div key={r.label} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,color:"#6A5848"}}>{r.label}</span>
                <span style={{fontSize:12,color:"#B8A898"}}>{r.h}h</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid #242424",paddingTop:10,marginTop:4,fontSize:11,color:"#6A5848"}}>
              Deadline: {fmt(slaDeadline(ticket.created,ticket.priority).toISOString())}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LAB MANAGER (Instructor)
// ═══════════════════════════════════════════════════════════════
function LabManager({session,classStudents,customScenarios,onActivate}) {
  const myClasses = session.classes||[];
  const [activeClassId,setActiveClassId]=useState(myClasses[0]?.id||null);
  const [expandWeek,setExpandWeek]=useState(null);
  const [assignMode,setAssignMode]=useState("broadcast");
  const [selectedStudents,setSelectedStudents]=useState([]);
  const [pushing,setPushing]=useState(false);
  const [scenarioOverride,setScenarioOverride]=useState({});

  const activeClass = myClasses.find(c=>c.id===activeClassId)||myClasses[0];
  const courseTab = activeClass?.course_id||"net";
  const course = courseById(courseTab);

  // Students enrolled in the active class specifically
  const courseStudents = classStudents.filter(u=>u.enrolled_class_id===activeClassId);

  // Merge built-in + custom for this course
  const builtIn=SEED_SCENARIOS.filter(s=>s.courseId===courseTab);
  const custom=(customScenarios||[]).filter(s=>s.course_id===courseTab);
  const allScenarios=[...builtIn,...custom.map(s=>({...s,courseId:s.course_id}))];
  const scenarios=builtIn;

  function toggleStudent(uid) {
    setSelectedStudents(s=>s.includes(uid)?s.filter(x=>x!==uid):[...s,uid]);
  }

  async function activate(week) {
    const defaultScenario=scenarios.find(s=>s.week===week);
    const overrideId=scenarioOverride[week];
    const scenario=overrideId
      ? allScenarios.find(s=>s.id===overrideId)||defaultScenario
      : defaultScenario;
    if(!scenario) return;
    const assignees=assignMode==="broadcast"?courseStudents.map(u=>u.id):selectedStudents;
    if(assignees.length===0) return;
    setPushing(true);
    await onActivate(courseTab,week,scenario.id,assignMode,assignees,activeClassId);
    setPushing(false);
    setExpandWeek(null); setSelectedStudents([]);
  }

  return (
    <div style={{maxWidth:900}}>
      <PageTitle title="Lab Manager" sub="Assign lab scenarios by class and week." />

      {myClasses.length===0 && <EmptyState msg="You aren't enrolled in any classes yet. Join a class first." />}

      {/* Class tabs */}
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {myClasses.map(c=>{
          const courseInfo=courseById(c.course_id)||{color:"#E8922E",icon:"📋"};
          const isActive=activeClassId===c.id;
          return (
            <button key={c.id} onClick={()=>{setActiveClassId(c.id);setExpandWeek(null);setSelectedStudents([]);}}
              style={{padding:"8px 18px",borderRadius:8,fontSize:13,cursor:"pointer",
                background:isActive?courseInfo.color+"22":"#1A1A1A",
                color:isActive?courseInfo.color:"#8A7868",
                border:`1px solid ${isActive?courseInfo.color+"55":"#242424"}`,
                fontWeight:isActive?700:400}}>
              {courseInfo.icon} {c.name}
            </button>
          );
        })}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {Array.from({length:10},(_,i)=>i+1).map(week=>{
          const scenario=scenarios.find(s=>s.week===week);
          const expanded=expandWeek===week;
          return (
            <div key={week} style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:16,padding:"14px 20px",cursor:"pointer"}}
                onClick={()=>setExpandWeek(expanded?null:week)}>
                <div style={{width:32,height:32,borderRadius:8,background:"#0D0D0D",
                  border:"1px solid #242424",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:700,color:"#6A5848",flexShrink:0}}>
                  {week}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:"#B8A898",fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {scenario?.title||"No scenario defined"}
                  </div>
                  {scenario&&<div style={{fontSize:11,color:"#6A5848",marginTop:2,display:"flex",gap:8,alignItems:"center"}}>
                    {badge(scenario.priority,PRIORITY_COLOR[scenario.priority])}
                    <span>{scenario.mode}</span>
                    {scenario.linkedCourse&&<span style={{color:"#a78bfa"}}>↔ cross-course</span>}
                  </div>}
                </div>
                <div style={{color:"#6A5848",fontSize:12,flexShrink:0}}>{expanded?"▲":"▼"}</div>
              </div>

              {expanded&&(
                <div style={{borderTop:"1px solid #242424",padding:"20px 24px",background:"#0D0D0D"}}>
                  {/* Scenario picker */}
                  <Field label="Scenario">
                    <select value={scenarioOverride[week]||scenario?.id||""}
                      onChange={e=>setScenarioOverride(p=>({...p,[week]:e.target.value}))}
                      style={inputStyle}>
                      {allScenarios.map(s=>(
                        <option key={s.id} value={s.id}>
                          {s.week?`W${s.week} · `:""}{s.title}{s.courseId!==courseTab?" (other course)":""}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {/* Description preview */}
                  {(()=>{
                    const sel=scenarioOverride[week]?allScenarios.find(s=>s.id===scenarioOverride[week]):scenario;
                    return sel ? <div style={{color:"#8A7868",fontSize:12,lineHeight:1.7,marginBottom:20,whiteSpace:"pre-wrap",background:"#1A1A1A",borderRadius:8,padding:"12px 16px"}}>{sel.description}</div> : null;
                  })()}
                  <Field label="Assignment Mode">
                    <select value={assignMode} onChange={e=>setAssignMode(e.target.value)} style={inputStyle}>
                      <option value="broadcast">Broadcast — all enrolled students</option>
                      <option value="individual">Individual — select specific students</option>
                      <option value="pairs">Pairs — students work in pairs</option>
                    </select>
                  </Field>
                  {assignMode!=="broadcast"&&(
                    <Field label={`Select Students (${selectedStudents.length} selected)`}>
                      {courseStudents.length===0
                        ? <div style={{color:"#6A5848",fontSize:12}}>No students enrolled in this track yet.</div>
                        : <div style={{display:"flex",flexDirection:"column",gap:6}}>
                            {courseStudents.map(u=>(
                              <label key={u.id} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"7px 12px",
                                background:selectedStudents.includes(u.id)?"#1A1A1A":"transparent",
                                borderRadius:6,border:"1px solid "+(selectedStudents.includes(u.id)?"#242424":"transparent")}}>
                                <input type="checkbox" checked={selectedStudents.includes(u.id)} onChange={()=>toggleStudent(u.id)} style={{accentColor:course.color}} />
                                <span style={{fontSize:13,color:"#B8A898"}}>{u.alias}</span>
                              </label>
                            ))}
                          </div>
                      }
                    </Field>
                  )}
                  <button onClick={()=>activate(week)}
                    style={{...btnPrimary,background:course.color,
                      opacity:(pushing||(!assignMode==="broadcast"&&selectedStudents.length===0))?0.5:1}}
                    disabled={pushing||(assignMode!=="broadcast"&&selectedStudents.length===0)}>
                    {pushing?"Pushing…":`Push Week ${week} Lab to Students →`}
                  </button>
                  {assignMode==="broadcast"&&<div style={{fontSize:11,color:"#6A5848",marginTop:8,textAlign:"center"}}>
                    {courseStudents.length} student(s) enrolled in this track
                  </div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCENARIO LIBRARY
// ═══════════════════════════════════════════════════════════════
const BLANK_SCENARIO = {title:"",course_id:"net",week:1,priority:"Medium",mode:"broadcast",categories:[],description:""};

function ScenarioLibrary({customScenarios,onSave,onDelete,onImport}) {
  const [editing,setEditing]   = useState(null); // null | "new" | scenario object
  const [filter,setFilter]     = useState("all");
  const [importing,setImporting] = useState(false);
  const [importErr,setImportErr] = useState("");
  const [saving,setSaving]     = useState(false);
  const [form,setForm]         = useState(BLANK_SCENARIO);

  const builtIn = SCENARIOS.map(s=>({...s,course_id:s.courseId,_builtin:true}));
  const all = [...builtIn,...customScenarios];
  const filtered = filter==="all" ? all : filter==="custom" ? customScenarios : all.filter(s=>s.course_id===filter||s.courseId===filter);

  function startNew()  { setForm(BLANK_SCENARIO); setEditing("new"); }
  function startEdit(s){ setForm({...s}); setEditing(s); }
  function cancel()    { setEditing(null); setImporting(false); setImportErr(""); }

  async function handleSave() {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    const ok = await onSave(editing==="new" ? form : {...form, id: editing.id});
    setSaving(false);
    if (ok) setEditing(null);
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let rows;
        if (file.name.endsWith(".json")) {
          rows = JSON.parse(ev.target.result);
          if (!Array.isArray(rows)) throw new Error("JSON must be an array of scenarios.");
        } else {
          // CSV: first row = headers
          const lines = ev.target.result.trim().split("\n");
          const headers = lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
          rows = lines.slice(1).map(line=>{
            const vals = line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
            return Object.fromEntries(headers.map((h,i)=>[h,vals[i]||""]));
          });
        }
        // Validate required fields
        const required = ["title","course_id","week","priority","mode","description"];
        const missing = rows.findIndex(r=>required.some(k=>!r[k]));
        if (missing>=0) throw new Error(`Row ${missing+1} is missing required fields.`);
        rows = rows.map(r=>({...r, week:parseInt(r.week)||1, categories: r.categories ? (Array.isArray(r.categories)?r.categories:r.categories.split(";").map(c=>c.trim())) : []}));
        setImportErr("");
        onImport(rows);
        setImporting(false);
      } catch(err) { setImportErr(err.message); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const courseColor = {net:"#38bdf8",hw:"#fb923c",cyber:"#a78bfa"};
  const courseLabel = {net:"Networking",hw:"Hardware",cyber:"Cybersecurity"};

  if (editing) return (
    <div style={{maxWidth:720}}>
      <button onClick={cancel} style={{background:"none",border:"1px solid #242424",color:"#8A7868",borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer",marginBottom:20}}>← Back</button>
      <PageTitle title={editing==="new"?"New Scenario":"Edit Scenario"} sub="Custom scenarios are saved to Supabase and available in Lab Manager." />
      <Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Field label="Title" style={{gridColumn:"1/-1"}}>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={inputStyle} placeholder="e.g. Configure VLANs on Cisco Switch" />
          </Field>
          <Field label="Course">
            <select value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))} style={inputStyle}>
              <option value="net">Networking Fundamentals</option>
              <option value="hw">Hardware Essentials</option>
              <option value="cyber">Cybersecurity Fundamentals</option>
            </select>
          </Field>
          <Field label="Week">
            <select value={form.week} onChange={e=>setForm(f=>({...f,week:parseInt(e.target.value)}))} style={inputStyle}>
              {Array.from({length:10},(_,i)=>i+1).map(w=><option key={w} value={w}>Week {w}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={inputStyle}>
              {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Mode">
            <select value={form.mode} onChange={e=>setForm(f=>({...f,mode:e.target.value}))} style={inputStyle}>
              <option value="broadcast">Broadcast — whole class</option>
              <option value="individual">Individual</option>
              <option value="pairs">Pairs</option>
              <option value="teams">Teams</option>
            </select>
          </Field>
        </div>
        <Field label="Description / Lab Instructions">
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            style={{...inputStyle,minHeight:200,resize:"vertical",lineHeight:1.7,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}
            placeholder={"Write the lab instructions here.\n\nTip: End with a 📓 Lab Book prompt so students know what to document."} />
        </Field>
        <div style={{display:"flex",gap:10}}>
          <button onClick={handleSave} disabled={saving||!form.title.trim()||!form.description.trim()} style={{...btnPrimary,flex:1,opacity:saving?0.6:1}}>
            {saving?"Saving…":"Save Scenario"}
          </button>
          <button onClick={cancel} style={{background:"none",border:"1px solid #242424",color:"#8A7868",borderRadius:6,padding:"10px 20px",fontSize:13,cursor:"pointer"}}>Cancel</button>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{maxWidth:900}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
        <PageTitle title="Scenario Library" sub={`${builtIn.length} built-in · ${customScenarios.length} custom`} />
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <button onClick={()=>setImporting(true)} style={{background:"none",border:"1px solid #242424",color:"#8A7868",borderRadius:6,padding:"8px 16px",fontSize:12,cursor:"pointer"}}>
            Import JSON / CSV
          </button>
          <button onClick={startNew} style={{...btnPrimary,width:"auto",padding:"8px 18px"}}>+ New Scenario</button>
        </div>
      </div>

      {importing && (
        <Card style={{marginBottom:20}}>
          <SectionLabel>Import Scenarios</SectionLabel>
          <p style={{fontSize:12,color:"#8A7868",marginBottom:12,lineHeight:1.6}}>
            Upload a <strong style={{color:"#B8A898"}}>JSON</strong> file (array of objects) or <strong style={{color:"#B8A898"}}>CSV</strong> file.<br/>
            Required columns: <code style={{color:"#E8922E"}}>title, course_id, week, priority, mode, description</code><br/>
            Optional: <code style={{color:"#6A5848"}}>categories</code> (semicolon-separated in CSV)
          </p>
          <a href="data:text/plain,title,course_id,week,priority,mode,description,categories" download="scenario-template.csv"
            style={{fontSize:11,color:"#E8922E",display:"block",marginBottom:12}}>
            Download CSV template
          </a>
          {importErr && <div style={{color:"#f87171",fontSize:12,marginBottom:10}}>{importErr}</div>}
          <input type="file" accept=".json,.csv" onChange={handleImportFile}
            style={{color:"#B8A898",fontSize:13}} />
          <button onClick={cancel} style={{display:"block",marginTop:12,background:"none",border:"none",color:"#6A5848",fontSize:12,cursor:"pointer"}}>Cancel</button>
        </Card>
      )}

      {/* Filter tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["all","custom","net","hw","cyber"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{padding:"6px 14px",borderRadius:6,fontSize:12,cursor:"pointer",
              background:filter===f?"#E8922E22":"#1A1A1A",
              color:filter===f?"#E8922E":"#8A7868",
              border:`1px solid ${filter===f?"#E8922E55":"#242424"}`}}>
            {f==="all"?"All":f==="custom"?"Custom Only":courseLabel[f]}
          </button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(s=>(
          <div key={s.id} style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:6,height:36,borderRadius:3,background:courseColor[s.course_id||s.courseId]||"#6A5848",flexShrink:0}} />
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"#F0EDE8",marginBottom:4}}>{s.title}</div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:courseColor[s.course_id||s.courseId]}}>{courseLabel[s.course_id||s.courseId]}</span>
                <span style={{fontSize:11,color:"#6A5848"}}>Week {s.week}</span>
                {badge(s.priority,PRIORITY_COLOR[s.priority])}
                <span style={{fontSize:11,color:"#6A5848"}}>{s.mode}</span>
                {s._builtin && <span style={{fontSize:10,color:"#4A3828",border:"1px solid #4A3828",borderRadius:3,padding:"1px 5px"}}>built-in</span>}
              </div>
            </div>
            {!s._builtin && (
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>startEdit(s)} style={{background:"none",border:"1px solid #242424",color:"#8A7868",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>Edit</button>
                <button onClick={()=>{if(window.confirm("Delete this scenario?"))onDelete(s.id);}}
                  style={{background:"none",border:"1px solid #7f1d1d44",color:"#f87171",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>Delete</button>
              </div>
            )}
          </div>
        ))}
        {filtered.length===0 && <EmptyState msg="No scenarios match this filter." />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LAB NOTES
// ═══════════════════════════════════════════════════════════════
function LabNotes({assignedTicketId, studentId, onSave}) {
  const [content,setContent]=useState("");
  const [saved,setSaved]=useState(true);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    supabase.from("lab_notes").select("content")
      .eq("assigned_ticket_id",assignedTicketId).eq("student_id",studentId)
      .maybeSingle()
      .then(({data})=>{ if(data) setContent(data.content||""); setLoading(false); });
  },[assignedTicketId,studentId]);

  async function handleSave() {
    await onSave(assignedTicketId,content);
    setSaved(true);
  }

  if(loading) return <div style={{color:"#6A5848",fontSize:13}}>Loading notes…</div>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <SectionLabel>Lab Documentation</SectionLabel>
        {!saved&&<span style={{fontSize:11,color:"#f59e0b"}}>Unsaved changes</span>}
      </div>
      <textarea value={content} onChange={e=>{setContent(e.target.value);setSaved(false);}}
        style={{...inputStyle,minHeight:280,resize:"vertical",lineHeight:1.7,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}
        placeholder={"Document your troubleshooting process here.\n\nInclude:\n• Steps you took\n• Commands run\n• What you observed\n• How you resolved the issue\n• What you learned"} />
      <button onClick={handleSave} disabled={saved}
        style={{...btnPrimary,marginTop:12,opacity:saved?0.5:1,background:saved?"#166534":"#E8922E",color:"#F0EDE8"}}>
        {saved?"Notes Saved ✓":"Save Notes"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MY LABS (student view)
// ═══════════════════════════════════════════════════════════════
function MyLabs({session, assignedTickets, onStatusChange, onSaveNote}) {
  const [selected,setSelected]=useState(null);
  const ticket=assignedTickets.find(t=>t.id===selected);

  const statusOptions=["Open","In Progress","Resolved","Closed"];

  if(selected&&ticket) {
    const course=courseById(ticket.course_id);
    return (
      <div style={{maxWidth:800}}>
        <button onClick={()=>setSelected(null)}
          style={{background:"none",border:"1px solid #242424",color:"#8A7868",borderRadius:6,
            padding:"6px 14px",fontSize:12,cursor:"pointer",marginBottom:20}}>
          ← Back to My Labs
        </button>
        <PageTitle title={ticket.title} sub={ticket.lab_assignments?.week_label||`Week ${ticket.week}`} />
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          {badge(ticket.status,STATUS_COLOR[ticket.status])}
          {badge(ticket.priority,PRIORITY_COLOR[ticket.priority])}
          {course&&<span style={{fontSize:12,color:course.color}}>{course.icon} {course.label}</span>}
          {ticket.group_tag&&badge("Group: "+ticket.group_tag,"#a78bfa")}
        </div>

        <Card style={{marginBottom:16}}>
          <SectionLabel>Scenario</SectionLabel>
          <div style={{color:"#B8A898",fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{ticket.description}</div>
        </Card>

        <Card style={{marginBottom:16}}>
          <Field label="Update Status">
            <select value={ticket.status}
              onChange={e=>onStatusChange(ticket.id,e.target.value)}
              style={inputStyle}>
              {statusOptions.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </Card>

        <Card>
          <LabNotes assignedTicketId={ticket.id} studentId={session.id} onSave={onSaveNote} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{maxWidth:800}}>
      <PageTitle title="My Labs" sub={`${assignedTickets.length} lab(s) assigned to you`} />
      {assignedTickets.length===0
        ? <EmptyState msg="No labs assigned yet. Check back on lab day!" />
        : <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {assignedTickets.map(t=>{
              const course=courseById(t.course_id);
              const isOpen=!["Resolved","Closed"].includes(t.status);
              return (
                <div key={t.id} onClick={()=>setSelected(t.id)}
                  style={{background:"#1A1A1A",border:`1px solid ${isOpen?"#E8922E44":"#242424"}`,
                    borderRadius:12,padding:"18px 20px",cursor:"pointer",display:"flex",
                    alignItems:"center",gap:16}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#E8922E88"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=isOpen?"#E8922E44":"#242424"}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:"#F0EDE8",marginBottom:6}}>{t.title}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      {badge(t.status,STATUS_COLOR[t.status])}
                      {badge(t.priority,PRIORITY_COLOR[t.priority])}
                      {course&&<span style={{fontSize:11,color:course.color}}>{course.icon} {course.label}</span>}
                      {t.group_tag&&<span style={{fontSize:11,color:"#a78bfa"}}>👥 {t.group_tag}</span>}
                    </div>
                  </div>
                  <div style={{color:"#6A5848",fontSize:12,flexShrink:0}}>Open →</div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

// Inbox, AdminPanel, shared components follow
function Inbox({session,notifs,onRead,onReadAll,onOpen}) {
  const [sel,setSel]=useState(null);
  const mine=notifs.filter(n=>n.toId===session.id).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  const unread=mine.filter(n=>!n.read).length;
  const selN=mine.find(n=>n.id===sel);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <PageTitle title="Inbox" sub={unread+" unread"} />
        {unread>0&&<button onClick={onReadAll} style={{background:"none",border:"1px solid #242424",color:"#8A7868",borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>Mark all read</button>}
      </div>
      {mine.length===0?<EmptyState msg="Your inbox is empty." />:(
        <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:16,alignItems:"start"}}>
          <div style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:12,overflow:"hidden"}}>
            {mine.map((n,i)=>(
              <div key={n.id} onClick={()=>{setSel(n.id);if(!n.read)onRead(n.id);}}
                style={{padding:"13px 16px",borderBottom:i<mine.length-1?"1px solid #242424":"none",cursor:"pointer",
                  background:sel===n.id?"#2A2420":"transparent",
                  borderLeft:!n.read?"3px solid #E8922E":"3px solid transparent"}}
                onMouseEnter={e=>{if(sel!==n.id)e.currentTarget.style.background="#221E1A";}}
                onMouseLeave={e=>{if(sel!==n.id)e.currentTarget.style.background="transparent";}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                  <div style={{fontSize:13,color:n.read?"#8A7868":"#EDE9E3",fontWeight:n.read?400:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{n.subject}</div>
                  {!n.read&&<span style={{width:7,height:7,borderRadius:"50%",background:"#E8922E",flexShrink:0,marginTop:4,display:"block"}}/>}
                </div>
                <div style={{fontSize:11,color:"#6A5848",marginTop:3}}>{new Date(n.ts).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            ))}
          </div>
          {selN?(
            <div style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:12,padding:24}}>
              <div style={{marginBottom:16}}>
                <div style={{fontFamily:"'Raleway',sans-serif",fontSize:18,fontWeight:700,color:"#F0EDE8",marginBottom:4}}>{selN.subject}</div>
                <div style={{fontSize:12,color:"#6A5848"}}>{new Date(selN.ts).toLocaleString()}</div>
              </div>
              <div style={{borderTop:"1px solid #242424",paddingTop:16,color:"#B8A898",fontSize:14,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{selN.body}</div>
              {selN.ticketId&&<button onClick={()=>onOpen(selN.ticketId)} style={{...btnPrimary,marginTop:20,width:"auto",padding:"8px 20px"}}>View Ticket {selN.ticketId} →</button>}
            </div>
          ):(
            <div style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:12,padding:40,textAlign:"center",color:"#6A5848",fontSize:14}}>Select a message to read</div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminPanel({session, classStudents, tickets, onSaveTickets, showToast}) {
  const allClasses = session.classes || [];
  const [search,   setSearch]   = useState("");
  const [filterQ,  setFilterQ]  = useState(""); // quarter filter
  const [filterY,  setFilterY]  = useState(""); // year filter
  const [pinMap,   setPinMap]   = useState({}); // profileId → generated PIN display
  const [activeTab, setActiveTab] = useState("students"); // "students" | "clients"

  // Derive available quarters/years from loaded classes
  const quarters = [...new Set(allClasses.map(c=>c.quarter).filter(Boolean))].sort();
  const years    = [...new Set(allClasses.map(c=>c.year).filter(Boolean))].sort((a,b)=>b-a);

  const visibleClasses = allClasses.filter(c => {
    if (filterQ && c.quarter !== filterQ) return false;
    if (filterY && c.year !== Number(filterY)) return false;
    return true;
  });

  const filteredStudents = search.trim()
    ? classStudents.filter(s => s.alias?.toLowerCase().includes(search.toLowerCase()))
    : classStudents;

  const byClass = visibleClasses.map(cls => ({
    cls,
    students: filteredStudents.filter(s => s.enrolled_class_id === cls.id),
  }));

  const totalStudents = classStudents.length;

  async function generatePin(student) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const { error } = await supabase.rpc("set_student_reset_pin", {
      p_profile_id: student.id, p_pin: pin,
    });
    if (error) { showToast("Failed to set PIN — check Supabase logs."); return; }
    setPinMap(m => ({...m, [student.id]: pin}));
  }

  const tabBtn = (id, label) => (
    <button onClick={()=>setActiveTab(id)}
      style={{padding:"8px 18px",background:activeTab===id?"#E8922E":"transparent",
        color:activeTab===id?"#0D0D0D":"#6A5848",border:"none",borderRadius:6,
        fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase"}}>
      {label}
    </button>
  );

  return (
    <div style={{maxWidth:960}}>
      <PageTitle title="Admin Panel"
        sub={`${totalStudents} student${totalStudents!==1?"s":""} · ${allClasses.length} class${allClasses.length!==1?"es":""}`} />

      {/* Tab bar */}
      <div style={{display:"flex",gap:4,background:"#1A1A1A",border:"1px solid #242424",borderRadius:8,padding:4,marginBottom:24,width:"fit-content"}}>
        {tabBtn("students","Enrolled Students")}
        {tabBtn("clients","Client Directory")}
      </div>

      {/* ── STUDENTS TAB ── */}
      {activeTab==="students" && <>
        {/* Filters */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by alias…" style={{...inputStyle, width:220}} />
          {quarters.length > 0 && (
            <select value={filterQ} onChange={e=>setFilterQ(e.target.value)} style={{...inputStyle,width:"auto"}}>
              <option value="">All quarters</option>
              {quarters.map(q=><option key={q} value={q}>{q}</option>)}
            </select>
          )}
          {years.length > 0 && (
            <select value={filterY} onChange={e=>setFilterY(e.target.value)} style={{...inputStyle,width:"auto"}}>
              <option value="">All years</option>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {(filterQ||filterY||search) && (
            <button onClick={()=>{setSearch("");setFilterQ("");setFilterY("");}}
              style={{background:"none",border:"1px solid #2E2E2E",color:"#6A5848",borderRadius:6,padding:"8px 14px",fontSize:12,cursor:"pointer"}}>
              Clear
            </button>
          )}
        </div>

        {byClass.map(({cls, students}) => (
          <div key={cls.id} style={{marginBottom:24}}>
            <Card>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:students.length?16:0}}>
                <div>
                  <div style={{fontFamily:"'Raleway',sans-serif",fontWeight:700,fontSize:15,color:"#F0EDE8"}}>{cls.name}</div>
                  <div style={{fontSize:12,color:"#6A5848",marginTop:3,display:"flex",gap:12,flexWrap:"wrap"}}>
                    <span>Code: <span style={{color:"#B8A898",fontFamily:"monospace"}}>{cls.code}</span></span>
                    {cls.course_id && <span style={{color:"#8A7868"}}>{cls.course_id.toUpperCase()}</span>}
                    {cls.quarter   && <span style={{color:"#8A7868"}}>{cls.quarter} {cls.year||""}</span>}
                  </div>
                </div>
                <div style={{fontSize:12,color:"#6A5848",flexShrink:0}}>{students.length} student{students.length!==1?"s":""}</div>
              </div>

              {students.length === 0
                ? <div style={{color:"#4A3828",fontSize:13}}>No students enrolled yet.</div>
                : (
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid #242424"}}>
                        {["Alias","Track","Reset PIN",""].map(h=>(
                          <th key={h} style={{textAlign:"left",padding:"6px 8px",color:"#6A5848",fontSize:11,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => {
                        const shownPin = pinMap[s.id];
                        return (
                          <tr key={s.id+cls.id} style={{borderBottom:"1px solid #111"}}>
                            <td style={{padding:"9px 8px",color:"#EDE9E3",fontFamily:"monospace"}}>{s.alias}</td>
                            <td style={{padding:"9px 8px",color:"#8A7868",fontSize:12}}>{s.cohort||"—"}</td>
                            <td style={{padding:"9px 8px"}}>
                              {shownPin
                                ? <span style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:"#E8922E",background:"#E8922E15",border:"1px solid #E8922E44",borderRadius:4,padding:"2px 8px"}}>
                                    {shownPin}
                                  </span>
                                : <span style={{color:"#4A3828",fontSize:12}}>—</span>
                              }
                            </td>
                            <td style={{padding:"9px 8px",textAlign:"right"}}>
                              <button onClick={()=>generatePin(s)}
                                style={{background:"none",border:"1px solid #2E2E2E",color:"#8A7868",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>
                                {shownPin ? "Regenerate PIN" : "Set PIN"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              }
            </Card>
          </div>
        ))}

        {visibleClasses.length === 0 && (
          <EmptyState msg="No classes match the current filter." />
        )}

        {/* Danger Zone */}
        <Card style={{marginTop:8}}>
          <SectionLabel>Danger Zone</SectionLabel>
          <div style={{background:"#0D0D0D",border:"1px solid #7f1d1d44",borderRadius:8,padding:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{color:"#fca5a5",fontSize:13,fontWeight:600}}>Reset Ticket Data</div>
              <div style={{color:"#6A5848",fontSize:12}}>Wipes all tickets and reloads seed data.</div>
            </div>
            <button onClick={async()=>{await onSaveTickets(SEED_TICKETS); showToast("Reset.");}}
              style={{background:"#7f1d1d",border:"none",color:"#fca5a5",borderRadius:6,padding:"8px 16px",fontSize:12,cursor:"pointer"}}>Reset</button>
          </div>
        </Card>
      </>}

      {/* ── CLIENT DIRECTORY TAB ── */}
      {activeTab==="clients" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
          {CLIENTS.map(c=>(
            <Card key={c.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{fontFamily:"'Raleway',sans-serif",fontWeight:700,fontSize:14,color:"#F0EDE8"}}>{c.company}</div>
                <span style={{fontSize:10,color:"#6A5848",background:"#0D0D0D",border:"1px solid #242424",borderRadius:4,padding:"2px 7px",whiteSpace:"nowrap",marginLeft:8}}>{c.industry}</span>
              </div>
              <div style={{fontSize:12,color:"#B8A898",marginBottom:4}}>
                <span style={{color:"#6A5848"}}>Contact: </span>{c.contact}
                <span style={{color:"#4A3828"}}> · {c.title}</span>
              </div>
              <div style={{fontSize:11,color:"#6A5848",marginBottom:8}}>{c.size}</div>
              <div style={{fontSize:11,color:"#4A3828",borderTop:"1px solid #242424",paddingTop:8,lineHeight:1.7}}>{c.notes}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SLACompact({ticket}) {
  const [,setT]=useState(0);
  useEffect(()=>{ if(ticket.status==="Resolved"||ticket.status==="Closed") return; const id=setInterval(()=>setT(n=>n+1),1000); return ()=>clearInterval(id); },[ticket.status]);
  const info=slaInfo(ticket.created,ticket.priority,ticket.status);
  if(!info) return <span style={{fontSize:11,color:"#4A3828"}}>-</span>;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11}}><span style={{width:7,height:7,borderRadius:"50%",background:info.color,display:"inline-block"}}/><span style={{color:info.color,fontWeight:700}}>{info.breached?"BREACH":fmtDur(info.msLeft)}</span></span>);
}

function RequesterChip({requesterId, inline=false}) {
  const p = PERSON_BY_ID[requesterId];
  if (!p) return null;
  const color = ORG_COLOR[p.org] || "#6A5848";
  if (inline) return (
    <span style={{fontSize:11,color,fontWeight:600}}>{p.name}</span>
  );
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,background:"#0D0D0D",border:`1px solid ${color}33`,borderRadius:8,padding:"10px 14px"}}>
      <div style={{width:32,height:32,borderRadius:"50%",background:`${color}22`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color,flexShrink:0}}>
        {p.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
      </div>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:"#EDE9E3"}}>{p.name}</div>
        <div style={{fontSize:11,color:"#6A5848"}}>{p.role} · <span style={{color}}>{p.orgName}</span></div>
        <div style={{fontSize:10,color:"#4A3828",fontFamily:"monospace",marginTop:1}}>{p.email}</div>
      </div>
    </div>
  );
}

function TicketTable({tickets,users,session,onOpen,showAssigned=false,showSLA=false,showCourse=false}) {
  function nameOf(id){return users.find(u=>u.id===id)?.name?.split(" ")[0]||"—";}
  const headers=["ID","Title",showCourse&&"Course","From","Priority","Status",showAssigned&&"Assigned",showSLA&&"SLA","Created"].filter(Boolean);
  return (
    <div style={{background:"#1A1A1A",border:"1px solid #242424",borderRadius:12,overflow:"hidden"}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{borderBottom:"1px solid #242424"}}>{headers.map(h=><th key={h} style={{textAlign:"left",padding:"12px 16px",color:"#6A5848",fontWeight:500,fontSize:11,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>)}</tr></thead>
        <tbody>
          {tickets.map(t=>{
            const course=courseById(t.courseId);
            const breached=slaInfo(t.created,t.priority,t.status)?.breached;
            const requester = PERSON_BY_ID[t.requesterId];
            return (
              <tr key={t.id} onClick={()=>onOpen(t.id)}
                style={{borderBottom:"1px solid #0D0D0D",cursor:"pointer",borderLeft:breached?"3px solid #ef4444":"3px solid transparent",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#2A2420"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"11px 16px",color:"#6A5848",fontFamily:"monospace",fontSize:12}}>{t.id}</td>
                <td style={{padding:"11px 16px",color:"#EDE9E3",maxWidth:200}}><div style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>{t.week&&<div style={{fontSize:10,color:"#6A5848",marginTop:1}}>Week {t.week}</div>}</td>
                {showCourse&&<td style={{padding:"11px 16px"}}>{course?<span style={{fontSize:11,color:course.color,fontWeight:700}}>{course.icon} {course.id.toUpperCase()}</span>:<span style={{color:"#4A3828"}}>-</span>}</td>}
                <td style={{padding:"11px 16px",maxWidth:160}}>
                  {requester
                    ? <div>
                        <div style={{fontSize:12,color:ORG_COLOR[requester.org]||"#8A7868",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{requester.name}</div>
                        <div style={{fontSize:10,color:"#4A3828",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{requester.orgName}</div>
                      </div>
                    : <span style={{color:"#4A3828"}}>—</span>
                  }
                </td>
                <td style={{padding:"11px 16px"}}>{badge(t.priority,PRIORITY_COLOR[t.priority])}</td>
                <td style={{padding:"11px 16px"}}>{badge(t.status,STATUS_COLOR[t.status])}</td>
                {showAssigned&&<td style={{padding:"11px 16px",color:"#8A7868"}}>{t.assignedTo?nameOf(t.assignedTo):<span style={{color:"#4A3828"}}>-</span>}</td>}
                {showSLA&&<td style={{padding:"11px 16px"}}><SLACompact ticket={t}/></td>}
                <td style={{padding:"11px 16px",color:"#6A5848",whiteSpace:"nowrap",fontSize:12}}>{new Date(t.created).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════
function KnowledgeBase({session,kb,onSave,onDelete}) {
  const [subview,setSubview]=useState("list"); // list | read | edit
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const [catFilter,setCatFilter]=useState("all");
  const [courseFilter,setCourseFilter]=useState("all");

  const canPublish=session.role==="tech"||session.role==="admin";

  const visible=kb
    .filter(a=>canPublish?true:a.status==="published")
    .filter(a=>catFilter==="all"?true:a.category===catFilter)
    .filter(a=>courseFilter==="all"?true:a.courseId===courseFilter)
    .filter(a=>search===""?true:
      a.title.toLowerCase().includes(search.toLowerCase())||
      a.body.toLowerCase().includes(search.toLowerCase())||
      a.tags?.some(t=>t.toLowerCase().includes(search.toLowerCase())));

  const drafts=kb.filter(a=>a.status==="draft"&&(a.authorId===session.id||session.role==="admin"));

  function newArticle() {
    const blank={id:"kb-"+Date.now(),title:"",courseId:"net",category:"General",
      status:"draft",authorId:session.id,body:"",tags:[],
      created:new Date().toISOString(),updated:new Date().toISOString()};
    setSelected(blank); setSubview("edit");
  }

  if(subview==="edit"&&selected) return (
    <KBEditor article={selected} session={session} canPublish={canPublish}
      onSave={async(a)=>{ await onSave(a); setSelected(a); setSubview("read"); }}
      onCancel={()=>{ setSubview(kb.find(x=>x.id===selected.id)?"read":"list"); }} />
  );

  if(subview==="read"&&selected) {
    const art=kb.find(a=>a.id===selected.id)||selected;
    return <KBArticle article={art} session={session} canPublish={canPublish}
      onEdit={()=>{ setSelected(art); setSubview("edit"); }}
      onDelete={async()=>{ await onDelete(art.id); setSubview("list"); }}
      onBack={()=>setSubview("list")} />;
  }

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <PageTitle title="Knowledge Base" sub={`${visible.length} article${visible.length!==1?"s":""}`} />
        <button onClick={newArticle} style={{...btnPrimary,width:"auto",padding:"9px 20px"}}>+ New Article</button>
      </div>

      {/* Search + filters */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          style={{...inputStyle,flex:1,minWidth:200}} placeholder="Search articles…" />
        <select value={courseFilter} onChange={e=>setCourseFilter(e.target.value)} style={{...inputStyle,width:"auto"}}>
          <option value="all">All Courses</option>
          {COURSES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
      </div>

      {/* Pending review (tech/admin only) */}
      {canPublish&&drafts.filter(a=>a.authorId!==session.id).length>0&&(
        <div style={{marginBottom:20}}>
          <SectionLabel>⏳ Pending Review ({drafts.filter(a=>a.authorId!==session.id).length})</SectionLabel>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {drafts.filter(a=>a.authorId!==session.id).map(a=>(
              <div key={a.id} onClick={()=>{setSelected(a);setSubview("read");}}
                style={{background:"#0D0D0D",border:"1px solid #f59e0b44",borderLeft:"3px solid #f59e0b",borderRadius:8,padding:"12px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background="#181410"}
                onMouseLeave={e=>e.currentTarget.style.background="#0D0D0D"}>
                <div>
                  <div style={{color:"#EDE9E3",fontSize:14,fontWeight:600}}>{a.title||"Untitled Draft"}</div>
                  <div style={{fontSize:11,color:"#f59e0b",marginTop:2}}>Draft · {a.category}</div>
                </div>
                <span style={{fontSize:12,color:"#f59e0b"}}>Review →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Article grid */}
      {visible.length===0?<EmptyState msg="No articles found."/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
          {visible.map(a=>{
            const course=courseById(a.courseId);
            return (
              <div key={a.id} onClick={()=>{setSelected(a);setSubview("read");}}
                style={{background:"#1A1A1A",border:`1px solid ${a.status==="draft"?"#f59e0b33":"#242424"}`,borderRadius:12,padding:20,cursor:"pointer",transition:"border-color 0.15s,background 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#221E1A";e.currentTarget.style.borderColor=course?.color+"55"||"#E8922E";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#1A1A1A";e.currentTarget.style.borderColor=a.status==="draft"?"#f59e0b33":"#242424";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  {course&&<span style={{fontSize:10,color:course.color,fontWeight:700,background:course.color+"18",border:`1px solid ${course.color}33`,borderRadius:3,padding:"2px 7px"}}>{course.icon} {course.id.toUpperCase()}</span>}
                  {a.status==="draft"&&<span style={{fontSize:10,color:"#f59e0b",background:"#f59e0b18",border:"1px solid #f59e0b33",borderRadius:3,padding:"2px 7px",fontWeight:700}}>DRAFT</span>}
                </div>
                <div style={{fontFamily:"'Raleway',sans-serif",fontSize:16,fontWeight:700,color:"#F0EDE8",marginBottom:6,lineHeight:1.3}}>{a.title||"Untitled"}</div>
                <div style={{fontSize:12,color:"#6A5848",marginBottom:10}}>{a.category}</div>
                <div style={{fontSize:12,color:"#8A7868",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                  {a.body.replace(/#{1,6} /g,"").replace(/```[\s\S]*?```/g,"[code]").replace(/\*\*/g,"").slice(0,180)}
                </div>
                {a.tags?.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:10}}>
                    {a.tags.slice(0,4).map(t=><span key={t} style={{fontSize:10,color:"#6A5848",background:"#242424",borderRadius:3,padding:"2px 6px"}}>#{t}</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KBArticle({article,session,canPublish,onEdit,onDelete,onBack}) {
  const course=courseById(article.courseId);
  // Very simple markdown renderer
  function renderMd(text) {
    const lines=text.split("\n");
    return lines.map((line,i)=>{
      if(line.startsWith("### ")) return <h3 key={i} style={{color:"#F0EDE8",fontFamily:"'Raleway',sans-serif",fontSize:16,marginTop:20,marginBottom:6}}>{line.slice(4)}</h3>;
      if(line.startsWith("## "))  return <h2 key={i} style={{color:"#F0EDE8",fontFamily:"'Raleway',sans-serif",fontSize:19,marginTop:24,marginBottom:8,borderBottom:"1px solid #242424",paddingBottom:6}}>{line.slice(3)}</h2>;
      if(line.startsWith("# "))   return <h1 key={i} style={{color:"#F0EDE8",fontFamily:"'Raleway',sans-serif",fontSize:22,marginTop:24,marginBottom:10}}>{line.slice(2)}</h1>;
      if(line.startsWith("```"))  return null;
      if(line.startsWith("| "))   return <div key={i} style={{fontFamily:"monospace",fontSize:12,color:"#B8A898",borderBottom:"1px solid #24242433",padding:"4px 0"}}>{line}</div>;
      if(line.startsWith("- "))   return <li key={i} style={{color:"#B8A898",fontSize:14,marginBottom:4,marginLeft:16}}>{line.slice(2)}</li>;
      if(line.match(/^\d+\. /))   return <li key={i} style={{color:"#B8A898",fontSize:14,marginBottom:6,marginLeft:16}}>{line.replace(/^\d+\. /,"")}</li>;
      if(line.trim()==="")        return <div key={i} style={{height:8}}/>;
      // inline code
      const parts=line.split(/(`[^`]+`)/g);
      return <p key={i} style={{color:"#B8A898",fontSize:14,lineHeight:1.7,margin:"4px 0"}}>{parts.map((p,j)=>p.startsWith("`")?<code key={j} style={{background:"#0D0D0D",border:"1px solid #242424",borderRadius:3,padding:"1px 6px",fontSize:12,color:"#E8922E",fontFamily:"monospace"}}>{p.slice(1,-1)}</code>:p)}</p>;
    });
  }
  const canEdit=session.role==="tech"||session.role==="admin"||article.authorId===session.id;
  return (
    <div style={{maxWidth:800}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6A5848",cursor:"pointer",fontSize:13,marginBottom:20,padding:0}}>← Back to Knowledge Base</button>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:8}}>
        <div style={{flex:1}}>
          {course&&<span style={{fontSize:11,color:course.color,fontWeight:700,background:course.color+"18",border:`1px solid ${course.color}33`,borderRadius:3,padding:"2px 7px",marginBottom:8,display:"inline-block"}}>{course.icon} {course.label}</span>}
          <h1 style={{fontFamily:"'Raleway',sans-serif",fontSize:26,fontWeight:800,color:"#F0EDE8",margin:"8px 0",lineHeight:1.2}}>{article.title}</h1>
          <div style={{fontSize:12,color:"#6A5848",marginBottom:8}}>{article.category} · Updated {fmt(article.updated)}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {article.status==="draft"&&<span style={{fontSize:11,color:"#f59e0b",background:"#f59e0b18",border:"1px solid #f59e0b44",borderRadius:4,padding:"2px 8px",fontWeight:700}}>DRAFT — Not Published</span>}
            {article.tags?.map(t=><span key={t} style={{fontSize:11,color:"#6A5848",background:"#242424",borderRadius:3,padding:"2px 7px"}}>#{t}</span>)}
          </div>
        </div>
        {canEdit&&(
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button onClick={onEdit} style={{background:"#1A1A1A",border:"1px solid #242424",color:"#B8A898",borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>Edit</button>
            {session.role==="admin"&&<button onClick={onDelete} style={{background:"none",border:"1px solid #7f1d1d44",color:"#f87171",borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>Delete</button>}
          </div>
        )}
      </div>
      <Card style={{marginTop:16}}>
        <div style={{lineHeight:1.8}}>{renderMd(article.body)}</div>
      </Card>
    </div>
  );
}

function KBEditor({article,session,canPublish,onSave,onCancel}) {
  const [form,setForm]=useState({...article});
  const [tagInput,setTagInput]=useState(article.tags?.join(", ")||"");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  function handleSave(publish) {
    const tags=tagInput.split(",").map(t=>t.trim()).filter(Boolean);
    const updated={...form,tags,status:publish?"published":"draft",updated:new Date().toISOString()};
    onSave(updated);
  }

  return (
    <div style={{maxWidth:800}}>
      <button onClick={onCancel} style={{background:"none",border:"none",color:"#6A5848",cursor:"pointer",fontSize:13,marginBottom:20,padding:0}}>← Cancel</button>
      <PageTitle title={form.id.startsWith("kb-")?form.title||"New Article":"Edit Article"} sub={form.status==="draft"?"Draft":"Published"} />
      <Card>
        <Field label="Title">
          <input value={form.title} onChange={e=>set("title",e.target.value)} style={inputStyle} placeholder="Article title" />
        </Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Field label="Course">
            <select value={form.courseId} onChange={e=>set("courseId",e.target.value)} style={inputStyle}>
              {COURSES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              <option value="">General</option>
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e=>set("category",e.target.value)} style={inputStyle}>
              {KB_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Tags (comma separated)">
          <input value={tagInput} onChange={e=>setTagInput(e.target.value)} style={inputStyle} placeholder="e.g. cabling, switch, cisco" />
        </Field>
        <Field label="Body (Markdown supported)">
          <textarea value={form.body} onChange={e=>set("body",e.target.value)}
            style={{...inputStyle,height:360,resize:"vertical",fontFamily:"'Inter',sans-serif",fontSize:12,lineHeight:1.7}}
            placeholder={"## Overview\nDescribe the topic here.\n\n## Steps\n1. First step\n2. Second step\n\n## Notes\nAny additional tips."} />
        </Field>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>handleSave(false)}
            style={{...btnPrimary,background:"#242424",color:"#B8A898",flex:1}}>
            Save Draft
          </button>
          {canPublish&&(
            <button onClick={()=>handleSave(true)} style={{...btnPrimary,flex:1}}>
              {form.status==="published"?"Update Published Article":"Publish Article"}
            </button>
          )}
          {!canPublish&&(
            <button onClick={()=>handleSave(false)} style={{...btnPrimary,flex:1,background:"#f59e0b",color:"#0D0D0D"}}>
              Submit for Review
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INCIDENT RESPONSE
// ═══════════════════════════════════════════════════════════════
function nextIncidentId(incidents) {
  const nums=incidents.map(i=>parseInt(i.id.split("-")[1])||0);
  return "INC-"+String(Math.max(0,...nums)+1).padStart(3,"0");
}

function IncidentResponse({session,incidents,tickets,users,onSave,onDelete}) {
  const [subview,setSubview]=useState("list");
  const [selected,setSelected]=useState(null);
  const [phaseFilter,setPhaseFilter]=useState("all");

  const canCreate=session.role==="tech"||session.role==="admin";

  const visible=incidents
    .filter(i=>phaseFilter==="all"?true:i.phase===phaseFilter)
    .sort((a,b)=>new Date(b.created)-new Date(a.created));

  function newIncident() {
    const blank={
      id:nextIncidentId(incidents),
      title:"", severity:"High", phase:"Identify", courseId:"cyber",
      affectedSystems:[], description:"", linkedTickets:[],
      timeline:[], postMortem:"",
      created:new Date().toISOString(), createdBy:session.id,
    };
    setSelected(blank); setSubview("detail");
  }

  if(subview==="detail"&&selected) {
    const inc=incidents.find(i=>i.id===selected.id)||selected;
    return <IRDetail incident={inc} session={session} users={users} tickets={tickets}
      onSave={async(updated)=>{ await onSave(updated); setSelected(updated); }}
      onDelete={async()=>{ await onDelete(inc.id); setSubview("list"); }}
      onBack={()=>setSubview("list")} />;
  }

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <PageTitle title="Incident Response" sub={`${incidents.length} incident${incidents.length!==1?"s":""} on record`} />
        {canCreate&&<button onClick={newIncident} style={{...btnPrimary,width:"auto",padding:"9px 20px"}}>+ New Incident</button>}
      </div>

      {/* Phase filter */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setPhaseFilter("all")}
          style={{padding:"5px 14px",borderRadius:6,fontSize:12,cursor:"pointer",background:phaseFilter==="all"?"#4A3828":"transparent",color:phaseFilter==="all"?"#EDE9E3":"#8A7868",border:"1px solid #242424"}}>
          All
        </button>
        {IR_PHASES.map(p=>(
          <button key={p} onClick={()=>setPhaseFilter(p)}
            style={{padding:"5px 14px",borderRadius:6,fontSize:12,cursor:"pointer",
              background:phaseFilter===p?IR_PHASE_COLOR[p]+"33":"transparent",
              color:phaseFilter===p?IR_PHASE_COLOR[p]:"#8A7868",
              border:`1px solid ${phaseFilter===p?IR_PHASE_COLOR[p]+"55":"#242424"}`}}>
            {p}
          </button>
        ))}
      </div>

      {visible.length===0?<EmptyState msg="No incidents recorded." />:(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {visible.map(inc=>{
            const course=courseById(inc.courseId);
            return (
              <div key={inc.id} onClick={()=>{setSelected(inc);setSubview("detail");}}
                style={{background:"#1A1A1A",border:`1px solid ${IR_SEVERITY_COLOR[inc.severity]}44`,borderLeft:`3px solid ${IR_SEVERITY_COLOR[inc.severity]}`,borderRadius:12,padding:"16px 20px",cursor:"pointer",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#221E1A"}
                onMouseLeave={e=>e.currentTarget.style.background="#1A1A1A"}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                      <span style={{fontSize:12,color:"#6A5848",fontFamily:"monospace"}}>{inc.id}</span>
                      {badge(inc.severity,IR_SEVERITY_COLOR[inc.severity])}
                      <span style={{fontSize:11,color:IR_PHASE_COLOR[inc.phase],background:IR_PHASE_COLOR[inc.phase]+"22",border:`1px solid ${IR_PHASE_COLOR[inc.phase]}44`,borderRadius:4,padding:"2px 8px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em"}}>{inc.phase}</span>
                      {course&&<span style={{fontSize:10,color:course.color,fontWeight:700}}>{course.icon}</span>}
                    </div>
                    <div style={{fontFamily:"'Raleway',sans-serif",fontSize:16,fontWeight:700,color:"#F0EDE8",marginBottom:4}}>{inc.title||"Untitled Incident"}</div>
                    <div style={{fontSize:12,color:"#8A7868",display:"flex",gap:16}}>
                      <span>{inc.affectedSystems?.length||0} system{inc.affectedSystems?.length!==1?"s":""} affected</span>
                      <span>{inc.timeline?.length||0} timeline entries</span>
                      {inc.linkedTickets?.length>0&&<span>{inc.linkedTickets.length} linked ticket{inc.linkedTickets.length!==1?"s":""}</span>}
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#6A5848",textAlign:"right",flexShrink:0}}>
                    <div>{fmt(inc.created)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IRDetail({incident,session,users,tickets,onSave,onDelete,onBack}) {
  const [form,setForm]=useState({...incident,affectedSystems:[...(incident.affectedSystems||[])],linkedTickets:[...(incident.linkedTickets||[])],timeline:[...(incident.timeline||[])]});
  const [newSystem,setNewSystem]=useState("");
  const [noteText,setNoteText]=useState("");
  const [notePhase,setNotePhase]=useState(form.phase);
  const [linkTicket,setLinkTicket]=useState("");
  const [editing,setEditing]=useState(!incident.title);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const canEdit=session.role==="tech"||session.role==="admin"||incident.createdBy===session.id;

  function nameOf(id){return users.find(u=>u.id===id)?.name||"Unknown";}

  function addSystem(){if(newSystem.trim()){set("affectedSystems",[...form.affectedSystems,newSystem.trim()]);setNewSystem("");}}
  function removeSystem(s){set("affectedSystems",form.affectedSystems.filter(x=>x!==s));}

  function addTimelineNote(){
    if(!noteText.trim()) return;
    const entry={ts:new Date().toISOString(),author:session.id,phase:notePhase,note:noteText.trim()};
    set("timeline",[...form.timeline,entry]);
    setNoteText("");
  }

  function toggleLinkedTicket(tid){
    set("linkedTickets",form.linkedTickets.includes(tid)?form.linkedTickets.filter(x=>x!==tid):[...form.linkedTickets,tid]);
  }

  const unlinkedTickets=tickets.filter(t=>!form.linkedTickets.includes(t.id));

  const phaseIndex=IR_PHASES.indexOf(form.phase);

  return (
    <div style={{maxWidth:900}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#6A5848",cursor:"pointer",fontSize:13,marginBottom:20,padding:0}}>← Back to Incidents</button>

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:20}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:12,color:"#6A5848",fontFamily:"monospace"}}>{form.id}</span>
            {badge(form.severity,IR_SEVERITY_COLOR[form.severity])}
          </div>
          {editing?(
            <input value={form.title} onChange={e=>set("title",e.target.value)}
              style={{...inputStyle,fontFamily:"'Raleway',sans-serif",fontSize:22,fontWeight:700,marginBottom:8}}
              placeholder="Incident title" />
          ):(
            <h1 style={{fontFamily:"'Raleway',sans-serif",fontSize:24,fontWeight:800,color:"#F0EDE8",margin:"0 0 8px"}}>{form.title||"Untitled Incident"}</h1>
          )}
        </div>
        {canEdit&&(
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            {editing?(
              <button onClick={async()=>{await onSave(form);setEditing(false);}} style={{...btnPrimary,width:"auto",padding:"8px 18px"}}>Save</button>
            ):(
              <button onClick={()=>setEditing(true)} style={{background:"#1A1A1A",border:"1px solid #242424",color:"#B8A898",borderRadius:6,padding:"8px 14px",fontSize:12,cursor:"pointer"}}>Edit</button>
            )}
            {session.role==="admin"&&<button onClick={onDelete} style={{background:"none",border:"1px solid #7f1d1d44",color:"#f87171",borderRadius:6,padding:"8px 14px",fontSize:12,cursor:"pointer"}}>Delete</button>}
          </div>
        )}
      </div>

      {/* PICERL Phase stepper */}
      <Card style={{marginBottom:20}}>
        <SectionLabel>Response Phase</SectionLabel>
        <div style={{display:"flex",gap:0}}>
          {IR_PHASES.map((p,i)=>{
            const done=i<phaseIndex;
            const active=i===phaseIndex;
            return (
              <button key={p} onClick={()=>canEdit&&set("phase",p)}
                style={{flex:1,padding:"10px 4px",fontSize:11,fontWeight:active?700:400,cursor:canEdit?"pointer":"default",
                  background:active?IR_PHASE_COLOR[p]+"33":done?"#1A1A1A":"#0D0D0D",
                  color:active?IR_PHASE_COLOR[p]:done?"#6A5848":"#4A3828",
                  border:`1px solid ${active?IR_PHASE_COLOR[p]+"55":"#242424"}`,
                  borderRadius:i===0?"6px 0 0 6px":i===IR_PHASES.length-1?"0 6px 6px 0":"0",
                  textAlign:"center",lineHeight:1.3,transition:"all 0.15s",letterSpacing:"0.02em"}}>
                {done?"✓ ":""}{p}
              </button>
            );
          })}
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20,alignItems:"start"}}>
        {/* Left col */}
        <div>
          {/* Description */}
          <Card style={{marginBottom:16}}>
            <SectionLabel>Description</SectionLabel>
            {editing?(
              <textarea value={form.description} onChange={e=>set("description",e.target.value)}
                style={{...inputStyle,height:120,resize:"vertical"}}
                placeholder="Describe what happened, how it was detected, and initial observations." />
            ):(
              <p style={{color:"#B8A898",fontSize:14,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{form.description||<span style={{color:"#4A3828"}}>No description yet.</span>}</p>
            )}
          </Card>

          {/* Timeline */}
          <Card style={{marginBottom:16}}>
            <SectionLabel>Timeline</SectionLabel>
            {form.timeline.length===0&&<div style={{color:"#6A5848",fontSize:13,marginBottom:16}}>No entries yet. Start documenting what you observe.</div>}
            <div style={{position:"relative"}}>
              {form.timeline.map((e,i)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:16,position:"relative"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:IR_PHASE_COLOR[e.phase],marginTop:3,flexShrink:0,zIndex:1}}/>
                    {i<form.timeline.length-1&&<div style={{width:2,flex:1,background:"#242424",marginTop:4}}/>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:IR_PHASE_COLOR[e.phase],fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{e.phase}</span>
                      <span style={{fontSize:11,color:"#6A5848"}}>{fmt(e.ts)}</span>
                      <span style={{fontSize:11,color:"#8A7868"}}>· {nameOf(e.author)}</span>
                    </div>
                    <div style={{fontSize:13,color:"#B8A898",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{e.note}</div>
                  </div>
                </div>
              ))}
            </div>
            {canEdit&&(
              <div style={{borderTop:"1px solid #242424",paddingTop:16,marginTop:8}}>
                <div style={{display:"flex",gap:10,marginBottom:8}}>
                  <select value={notePhase} onChange={e=>setNotePhase(e.target.value)} style={{...inputStyle,width:"auto"}}>
                    {IR_PHASES.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <textarea value={noteText} onChange={e=>setNoteText(e.target.value)}
                  style={{...inputStyle,height:80,resize:"vertical"}}
                  placeholder="Document an observation, action taken, or finding…" />
                <button onClick={addTimelineNote} style={{...btnPrimary,marginTop:8}} disabled={!noteText.trim()}>Add to Timeline</button>
              </div>
            )}
          </Card>

          {/* Post-mortem */}
          {(form.phase==="Lessons Learned"||form.postMortem)&&(
            <Card>
              <SectionLabel>Post-Mortem / Lessons Learned</SectionLabel>
              {editing?(
                <textarea value={form.postMortem} onChange={e=>set("postMortem",e.target.value)}
                  style={{...inputStyle,height:160,resize:"vertical"}}
                  placeholder={"What happened?\nWhat was the impact?\nWhat went well?\nWhat should change?\nAction items:"} />
              ):(
                <p style={{color:"#B8A898",fontSize:14,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{form.postMortem||<span style={{color:"#4A3828"}}>No post-mortem written yet.</span>}</p>
              )}
            </Card>
          )}
        </div>

        {/* Right col */}
        <div>
          {/* Metadata */}
          <Card style={{marginBottom:16}}>
            <SectionLabel>Incident Details</SectionLabel>
            {editing?(
              <>
                <Field label="Severity">
                  <select value={form.severity} onChange={e=>set("severity",e.target.value)} style={inputStyle}>
                    {IR_SEVERITIES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Course">
                  <select value={form.courseId} onChange={e=>set("courseId",e.target.value)} style={inputStyle}>
                    {COURSES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </Field>
              </>
            ):(
              <>
                <DetailRow label="Severity" val={badge(form.severity,IR_SEVERITY_COLOR[form.severity])} />
                <DetailRow label="Phase" val={<span style={{color:IR_PHASE_COLOR[form.phase],fontWeight:700,fontSize:12}}>{form.phase}</span>} />
                <DetailRow label="Opened" val={fmt(form.created)} />
                <DetailRow label="Created by" val={nameOf(form.createdBy)} />
              </>
            )}
          </Card>

          {/* Affected Systems */}
          <Card style={{marginBottom:16}}>
            <SectionLabel>Affected Systems</SectionLabel>
            {form.affectedSystems.length===0&&<div style={{fontSize:12,color:"#6A5848",marginBottom:12}}>None listed.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {form.affectedSystems.map(s=>(
                <div key={s} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0D0D0D",borderRadius:6,padding:"6px 10px"}}>
                  <span style={{fontSize:12,color:"#B8A898"}}>{s}</span>
                  {canEdit&&<button onClick={()=>removeSystem(s)} style={{background:"none",border:"none",color:"#6A5848",cursor:"pointer",fontSize:11}}>✕</button>}
                </div>
              ))}
            </div>
            {canEdit&&(
              <div style={{display:"flex",gap:8}}>
                <input value={newSystem} onChange={e=>setNewSystem(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addSystem()}
                  style={{...inputStyle,flex:1,fontSize:12}} placeholder="e.g. Lab WS-03" />
                <button onClick={addSystem} style={{background:"#242424",border:"1px solid #242424",color:"#B8A898",borderRadius:6,padding:"0 12px",cursor:"pointer",fontSize:13,whiteSpace:"nowrap"}}>Add</button>
              </div>
            )}
          </Card>

          {/* Linked Tickets */}
          <Card>
            <SectionLabel>Linked Tickets</SectionLabel>
            {form.linkedTickets.length===0&&<div style={{fontSize:12,color:"#6A5848",marginBottom:12}}>No tickets linked.</div>}
            {form.linkedTickets.map(tid=>{
              const t=tickets.find(x=>x.id===tid);
              return t?(
                <div key={tid} style={{background:"#0D0D0D",borderRadius:6,padding:"8px 10px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:11,color:"#6A5848",fontFamily:"monospace"}}>{t.id}</div>
                    <div style={{fontSize:12,color:"#B8A898",marginTop:2}}>{t.title}</div>
                  </div>
                  {canEdit&&<button onClick={()=>toggleLinkedTicket(tid)} style={{background:"none",border:"none",color:"#6A5848",cursor:"pointer",fontSize:11}}>✕</button>}
                </div>
              ):null;
            })}
            {canEdit&&unlinkedTickets.length>0&&(
              <div style={{marginTop:8}}>
                <select value="" onChange={e=>{if(e.target.value)toggleLinkedTicket(e.target.value);}} style={{...inputStyle,fontSize:12}}>
                  <option value="">Link a ticket…</option>
                  {unlinkedTickets.map(t=><option key={t.id} value={t.id}>{t.id} — {t.title.slice(0,40)}</option>)}
                </select>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
