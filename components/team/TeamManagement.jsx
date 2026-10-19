"use client";
import { useMemo, useState } from "react";
import { Plus, Search, UsersRound, Pencil, Shield, UserRound, X } from "lucide-react";
import { useLeads } from "@/context/LeadsProvider";
import { cn } from "@/lib/utils";
import CompactSelect from "@/components/leads/CompactSelect";

const field = "h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary [color-scheme:light] dark:[color-scheme:dark]";
const empty = { name:"", email:"", role:"agent", department:"Sales", active:true };

/**
 * Team and lead ownership read from ONE shared provider (LeadsProvider).
 * TODO(API): GET /api/team returns organization-scoped users.
 * POST /api/team/invitations sends an invitation (do NOT create accounts with
 * plain-text passwords). PATCH /api/team/:id changes role/department/status.
 * The server MUST verify admin permission, tenant membership, and actor's role.
 * Disabling users should initiate a lead reassignment workflow in production.
 * Lead counts must be grouped on the server by owner_id, scoped to tenant.
 */
export default function TeamManagement() {
  const { team, leads, viewer, addMember, updateMember, removeMember } = useLeads();
  const [query,setQuery]=useState("");
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(empty);
  const [error,setError]=useState("");
  const visible=useMemo(()=>team.filter(t=>[t.name,t.email,t.role,t.department].join(" ").toLowerCase().includes(query.toLowerCase())),[team,query]);
  const counts=useMemo(()=>Object.fromEntries(team.map(t=>[t.id,leads.filter(l=>l.ownerId===t.id).length])),[team,leads]);
  const admin=viewer.role==="admin";
  function open(member){setEditing(member?.id||"new");setForm(member?{...member}:{...empty});setError("");}
  function save(e){e.preventDefault();if(!form.name.trim()||!/^\S+@\S+\.\S+$/.test(form.email)){setError("A name and valid email are required.");return;}
    if(team.some(m=>m.email.toLowerCase()===form.email.toLowerCase()&&m.id!==editing)){setError("Email already exists in this demo team.");return;}
    const ok=editing==="new"?addMember({...form,name:form.name.trim(),email:form.email.trim()}):updateMember(editing,{name:form.name.trim(),email:form.email.trim(),role:form.role,department:form.department,active:form.active});
    if(ok)setEditing(null);else setError("Only admins can change team members.");
  }
  return <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-7">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-[22px] font-semibold tracking-tight text-foreground">Team</h1><p className="mt-1 text-[12px] text-muted-foreground">Manage your workspace members and lead assignments.</p></div>{admin&&<button onClick={()=>open()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-[12px] font-semibold text-background hover:opacity-85"><Plus className="size-4"/> Add Member</button>}</div>
    <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-lg border border-border bg-card px-3 py-2 text-[12px]">{team.length} members</span><span className="rounded-lg border border-border bg-card px-3 py-2 text-[12px]">{team.filter(x=>x.active).length} active</span><span className="rounded-lg border border-border bg-card px-3 py-2 text-[12px]">{leads.length} assigned leads</span></div>
    <label className="relative mb-4 block max-w-sm"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><input className={cn(field,"pl-9")} placeholder="Search team members..." aria-label="Search team members" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map(member=><article key={member.id} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/25"><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-muted text-[12px] font-semibold">{member.initials}</div><div className="min-w-0"><h2 className="truncate text-[13px] font-semibold">{member.name}</h2><p className="truncate text-[11px] text-muted-foreground">{member.email}</p></div></div>{admin&&<button aria-label={`Edit ${member.name}`} onClick={()=>open(member)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-4"/></button>}</div><div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]"><span className="rounded-md bg-muted px-2 py-1 capitalize">{member.role==="admin"?<Shield className="mr-1 inline size-3"/>:<UserRound className="mr-1 inline size-3"/>}{member.role}</span><span className={cn("rounded-md px-2 py-1",member.active?"bg-emerald-500/10 text-emerald-500":"bg-muted text-muted-foreground")}>{member.active?"Active":"Inactive"}</span><span className="text-muted-foreground">{member.department}</span></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="text-[11px] text-muted-foreground">Assigned leads</span><strong className="text-[15px] tabular-nums">{counts[member.id]||0}</strong></div></article>)}</div>
    {!visible.length&&<p className="rounded-lg border border-border p-8 text-center text-[12px] text-muted-foreground">No matching members.</p>}
    {editing!==null&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null)}}><form onSubmit={save} role="dialog" aria-modal="true" aria-label={editing==="new"?"Add member":"Edit member"} className="w-full max-w-md space-y-4 rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-xl"><div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold">{editing==="new"?"Add team member":"Edit team member"}</h2><button type="button" onClick={()=>setEditing(null)} aria-label="Close" className="rounded-md p-1 hover:bg-muted"><X className="size-4"/></button></div><p className="text-[11px] text-muted-foreground">Demo only: real accounts require an authenticated invitation flow.</p>{[["Name","name","text"],["Email","email","email"],["Department","department","text"]].map(([label,key,type])=><label key={key} className="block text-[12px] font-medium">{label}<input required type={type} className={cn(field,"mt-1")} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/></label>)}<label className="block text-[12px] font-medium">Role<CompactSelect className="mt-1" label="Team member role" value={form.role} onChange={role=>setForm(f=>({...f,role}))} options={[{value:"agent",label:"Agent"},{value:"admin",label:"Admin"}]}/></label><label className="flex items-center gap-2 text-[12px]"><input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}/> Active member</label>{error&&<p className="text-[11px] text-rose-500" role="alert">{error}</p>}<div className="flex flex-wrap justify-end gap-2">{editing!=="new"&&<button type="button" className="mr-auto rounded-lg border border-rose-500/30 px-3 py-2 text-[12px] text-rose-500 hover:bg-rose-500/10" onClick={()=>{if(confirm("Remove member? Members with assigned leads cannot be removed.")){if(removeMember(editing))setEditing(null);else setError("Reassign leads first. You cannot remove yourself.")}}}>Remove</button>}<button type="button" className="rounded-lg border border-border px-3 py-2 text-[12px] hover:bg-muted" onClick={()=>setEditing(null)}>Cancel</button><button type="submit" className="rounded-lg bg-foreground px-3 py-2 text-[12px] font-semibold text-background">Save</button></div></form></div>}
    <p className="mt-4 text-[11px] text-muted-foreground">Demo mode: changes persist locally. Real invites, permissions, and member management must be implemented in Node.js with authenticated MySQL-backed APIs.</p>
  </div>;
}
