"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoLeads, OWNERS } from "@/data/leads-demo";

const LeadsContext = createContext(null);
const STORAGE_KEY = "nexora-leads-demo-v1";
const TEAM_STORAGE = "nexora-team-demo-v1";
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
  const [leads, setLeads] = useState(demoLeads);
  const [team, setTeam] = useState(OWNERS.map(o => ({...o, email: o.id === "u-alex" ? "alex@nexora.dev" : `${o.name.toLowerCase().replace(" ", ".")}@nexora.dev`, active:true, department:"Sales"})));
  const [ready, setReady] = useState(false);
  const [viewerId, setViewerId] = useState("u-alex");
  useEffect(() => {
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
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); } catch { /* demo still works in memory */ }
  }, [ready, leads]);
  useEffect(() => { if(!ready) return; try { localStorage.setItem(TEAM_STORAGE,JSON.stringify(team)); } catch {} }, [team,ready]);
  const viewer = team.find(o=>o.id===viewerId) || team[0] || OWNERS[0];
  // TODO(API): GET /api/team scoped to authenticated tenant, not localStorage.
  function addMember(data){ if(viewer.role!=="admin")return false; setTeam(prev=>[...prev,{...data,id:`u-${crypto.randomUUID()}`,initials:data.name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(),active:true}]);return true; }
  function updateMember(id,patch){ if(viewer.role!=="admin")return false; setTeam(prev=>prev.map(member=>member.id===id?{...member,...patch,id:member.id}:member));return true; }
  function removeMember(id){ if(viewer.role!=="admin"||id===viewer.id||leads.some(l=>l.ownerId===id))return false;setTeam(prev=>prev.filter(m=>m.id!==id));return true; }
  const canEdit = lead => viewer.role === "admin" || lead.ownerId === viewer.id;
  const visibleLeads = useMemo(() => viewer.role === "admin" ? leads : leads.filter(l=>l.ownerId===viewer.id), [leads,viewer]);
  function createLead(values) {
    const created = { ...values, id:`lead-${crypto.randomUUID()}`, score:Number(values.score ?? 50), estimatedValue:Number(values.estimatedValue || 0), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
    setLeads(prev=>[created,...prev]); return created.id;
  }
  function updateLead(id, patch) {
    const original=leads.find(l=>l.id===id);
    if (!original || !canEdit(original)) return false;
    setLeads(prev=>prev.map(l=>l.id===id ? {...l,...patch,id:l.id,createdAt:l.createdAt,updatedAt:new Date().toISOString()} : l)); return true;
  }
  function deleteLeads(ids) {
    const allowed=new Set(leads.filter(l=>ids.includes(l.id)&&canEdit(l)).map(l=>l.id));
    setLeads(prev=>prev.filter(l=>!allowed.has(l.id)));
  }
  function resetDemo() { setLeads(demoLeads); }
  return <LeadsContext.Provider value={{ leads, team, addMember, updateMember, removeMember, visibleLeads, viewer, viewerId, setViewerId, ready, canEdit, createLead, updateLead, deleteLeads, resetDemo }}>{children}</LeadsContext.Provider>;
}
export function useLeads(){const value=useContext(LeadsContext);if(!value)throw new Error("useLeads must be used within LeadsProvider");return value;}
