"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoLeads, OWNERS } from "@/data/leads-demo";
import { crmApi } from "@/lib/crm-api";

const LeadsContext = createContext(null);
const STORAGE_KEY = "nexora-leads-demo-v1";
const TEAM_STORAGE = "nexora-team-demo-v1";
/** TODO(DEMO): Browser storage is allowed for local development only.
 * NEXT_PUBLIC_* flags must never authorize server operations. In production,
 * authenticated API requests replace this provider's demo persistence. */
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
/**
 * SHARED CLIENT STATE (demo only): sidebar routes, table, pipeline, form and details
 * all call useLeads(). Mutations instantly update all screens and survive reloads.
 * TODO(API): replace this provider's localStorage persistence with authenticated
 * TanStack Query queries/mutations against your Node.js backend; invalidate
 * ['leads'], ['lead', id], ['pipeline'] after create/update/delete.
 * TODO(AUTH): identity and roles MUST come from verified server sessions, never
 * user-controlled browser state. Node.js must enforce tenant + owner restrictions
 * in every SELECT/INSERT/UPDATE/DELETE, regardless of UI visibility.
 */
export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState(IS_DEVELOPMENT ? demoLeads : []);
  const [team, setTeam] = useState((IS_DEVELOPMENT ? OWNERS : []).map(o => ({...o, email: o.id === "u-alex" ? "alex@nexora.dev" : `${o.name.toLowerCase().replace(" ", ".")}@nexora.dev`, active:true, department:"Sales"})));
  const [ready, setReady] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [authenticatedViewer, setAuthenticatedViewer] = useState(null);
  const [viewerId, setViewerId] = useState("u-alex");
  useEffect(() => {
    if (!IS_DEVELOPMENT) {
      // TODO(API): Node.js backend must expose the three endpoints. No demo fallback in production.
      // TODO(AUTH): Session identity MUST be resolved by backend, never a role dropdown.
      const abort = new AbortController();
      Promise.all([crmApi.getSession(abort.signal), crmApi.listTeam(abort.signal), crmApi.listLeads(abort.signal)])
        .then(([session, members, records]) => {
          if (!session?.viewer?.id || !Array.isArray(members.team) || !Array.isArray(records.leads))
            throw new Error("Invalid CRM API response");
          setAuthenticatedViewer(session.viewer);
          setTeam(members.team); setLeads(records.leads); setDataError(null);
        })
        .catch(error => { if (!abort.signal.aborted) setDataError(error.message || "Unable to load CRM data"); })
        .finally(() => { if (!abort.signal.aborted) setReady(true); });
      return () => abort.abort();
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const teamRaw = localStorage.getItem(TEAM_STORAGE);
      if (teamRaw) { const parsedTeam=JSON.parse(teamRaw); if(Array.isArray(parsedTeam)) setTeam(parsedTeam); }
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLeads(parsed);
      }
    } catch { /* Corrupt or unavailable storage -> seed demo data */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !IS_DEVELOPMENT) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); } catch { /* demo still works in memory */ }
  }, [ready, leads]);
  useEffect(() => { if(!ready || !IS_DEVELOPMENT) return; try { localStorage.setItem(TEAM_STORAGE,JSON.stringify(team)); } catch {} }, [team,ready]);
  const viewer = (!IS_DEVELOPMENT ? authenticatedViewer : team.find(o=>o.id===viewerId) || team[0]) || {id:"",name:"Unauthenticated",role:"agent",active:false};
  // TODO(API): GET /api/team scoped to authenticated tenant, not localStorage.
  function addMember(data){ if(!IS_DEVELOPMENT||viewer.role!=="admin")return false; setTeam(prev=>[...prev,{...data,id:`u-${crypto.randomUUID()}`,initials:data.name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(),active:true}]);return true; }
  function updateMember(id,patch){ if(!IS_DEVELOPMENT||viewer.role!=="admin")return false; setTeam(prev=>prev.map(member=>member.id===id?{...member,...patch,id:member.id}:member));return true; }
  function removeMember(id){ if(!IS_DEVELOPMENT||viewer.role!=="admin"||id===viewer.id||leads.some(l=>l.ownerId===id))return false;setTeam(prev=>prev.filter(m=>m.id!==id));return true; }
  /** TODO(API): `teamStats` is derived from the SAME leads array. In Node.js,
   * SELECT owner_id, COUNT(*) FROM leads WHERE tenant_id=? GROUP BY owner_id.
   * Re-fetch/invalidate ['team','stats'] after reassignment/create/delete.
   */
  const teamStats = useMemo(() => Object.fromEntries(team.map(member => {
    const assigned = leads.filter(lead => lead.ownerId === member.id);
    return [member.id, { assigned: assigned.length, active: assigned.filter(l => l.status !== "Lost").length }];
  })), [team,leads]);
  const canEdit = lead => viewer.role === "admin" || lead.ownerId === viewer.id;
  const visibleLeads = useMemo(() => viewer.role === "admin" ? leads : leads.filter(l=>l.ownerId===viewer.id), [leads,viewer]);
  function createLead(values) {
    // TODO(API): POST /api/leads must verify authenticated tenant, active owner,
    // and permissions. This state mutation is development demo only.
    if (!IS_DEVELOPMENT) { setDataError("Live create requires the authenticated API mutation flow; see README.md"); return null; }
    const assignedOwner = team.find(m=>m.id===values.ownerId && m.active!==false);
    if (!assignedOwner) return null;
    // TODO(DB): Persist owner_id as a FK to tenant_users(id).
    // Team stats are derived from leads, so assignment automatically updates both agent cards.
    const created = { ...values, id:`lead-${crypto.randomUUID()}`, score:Number(values.score ?? 50), estimatedValue:Number(values.estimatedValue || 0), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
    setLeads(prev=>[created,...prev]); return created.id;
  }
  function updateLead(id, patch) {
    // TODO(API): PATCH /api/leads/:id with DB transaction + tenant/role checks.
    if (!IS_DEVELOPMENT) { setDataError("Live edit requires the authenticated API mutation flow; see README.md"); return false; }
    if (patch.ownerId && !team.some(m=>m.id===patch.ownerId && m.active!==false)) return false;
    const original=leads.find(l=>l.id===id);
    if (!original || !canEdit(original)) return false;
    // TODO(API): After mutation invalidate ["leads"], ["team-stats"], ["pipeline"], ["dashboard"].
    setLeads(prev=>prev.map(l=>l.id===id ? {...l,...patch,id:l.id,createdAt:l.createdAt,updatedAt:new Date().toISOString()} : l)); return true;
  }
  function deleteLeads(ids) {
    if (!IS_DEVELOPMENT) return; // TODO(API): bulk DELETE with server-side authorization.
    const allowed=new Set(leads.filter(l=>ids.includes(l.id)&&canEdit(l)).map(l=>l.id));
    setLeads(prev=>prev.filter(l=>!allowed.has(l.id)));
  }
  function resetDemo() { if(IS_DEVELOPMENT) setLeads(demoLeads); } // TODO(DEMO): Remove reset in production UI.
  return <LeadsContext.Provider value={{ leads, team, teamStats, isDemo: IS_DEVELOPMENT, addMember, updateMember, removeMember, visibleLeads, viewer, viewerId, setViewerId, ready, dataError, canEdit, createLead, updateLead, deleteLeads, resetDemo }}>{children}</LeadsContext.Provider>;
}
export function useLeads(){const value=useContext(LeadsContext);if(!value)throw new Error("useLeads must be used within LeadsProvider");return value;}
