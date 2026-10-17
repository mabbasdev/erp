/** SINGLE SOURCE OF DEMO RECORDS. No component should embed its own lead rows.
 * TODO(API): Replace the store bootstrap with GET /api/leads?cursor=... and
 * mutations with authenticated POST/PATCH/DELETE Node.js endpoints.
 * MySQL should own lead IDs, timestamps, ownership and permission checks.
 */
export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Lost"];
export const LEAD_SOURCES = ["Website", "Inbound", "Outbound", "Referral", "Partner", "Social", "Other"];
export const OWNERS = [
  { id: "u-alex", name: "Alex Morgan", initials: "AM", role: "admin" },
  { id: "u-priya", name: "Priya Nair", initials: "PN", role: "agent" },
  { id: "u-daniel", name: "Daniel Cho", initials: "DC", role: "agent" },
];
const names = [
  ["Sarah", "Chen", "Globex", "Qualified", 86, "u-alex", "Referral"],
  ["Marcus", "Rivera", "Cobalt Health", "Proposal", 72, "u-priya", "Outbound"],
  ["Emily", "Watson", "Northwind Traders", "Contacted", 54, "u-daniel", "Inbound"],
  ["David", "Wilson", "Meridian Bank", "New", 31, "u-alex", "Website"],
  ["Priya", "Nair", "Hexon Traders", "Qualified", 91, "u-priya", "Referral"],
  ["James", "Carter", "Orion Logistics", "Lost", 18, "u-daniel", "Outbound"],
  ["Lena", "Fischer", "Vantage Retail", "New", 44, "u-alex", "Website"],
  ["Tomás", "Rodríguez", "Fenwick Co.", "Contacted", 63, "u-priya", "Partner"],
  ["Aisha", "Patel", "Apex Solutions", "Qualified", 88, "u-alex", "Inbound"],
  ["Benjamin", "Hayes", "Summit Technologies", "Proposal", 79, "u-daniel", "Referral"],
  ["Sophia", "Zhang", "Nexus Media", "New", 25, "u-priya", "Website"],
  ["Oliver", "Bennett", "Crestview Capital", "Contacted", 61, "u-alex", "Outbound"],
  ["Tariq", "Al-Mansoor", "Skyline Ventures", "Contacted", 58, "u-daniel", "Inbound"],
  ["Camila", "Vance", "Solaris Energy", "Qualified", 94, "u-priya", "Partner"],
  ["Amara", "Okezie", "Pinnacle Health", "Proposal", 76, "u-alex", "Partner"],
  ["Liam", "O'Connor", "Beacon Labs", "Lost", 12, "u-daniel", "Website"],
  ["Zoe", "Kravitz", "Lumen Devs", "New", 41, "u-alex", "Website"],
  ["Hannah", "Schmidt", "Aerospace One", "Contacted", 67, "u-priya", "Inbound"],
  ["Chloe", "Tanaka", "Quantum Dynamics", "Qualified", 89, "u-alex", "Outbound"],
  ["Mateo", "Silva", "Terra Firma", "Proposal", 74, "u-daniel", "Outbound"],
  ["Victoria", "Sterling", "Sterling Fintech", "Lost", 15, "u-alex", "Website"],
  ["Fiona", "Gallagher", "Swift Logistics", "New", 29, "u-daniel", "Outbound"],
  ["Nadia", "Hussain", "CloudScale Inc", "Contacted", 52, "u-priya", "Inbound"],
  ["Rohan", "Kapoor", "Stride Analytics", "Qualified", 92, "u-alex", "Referral"],
  ["Kenji", "Sato", "Omni Holdings", "Proposal", 81, "u-daniel", "Referral"],
  ["Carlos", "Gomez", "SolarDrive Corp", "Lost", 19, "u-priya", "Outbound"],
  ["Maya", "Lin", "Prism Design Studios", "New", 38, "u-alex", "Referral"],
  ["Devon", "Miller", "Aspen Global", "Contacted", 65, "u-daniel", "Inbound"],
  ["Gabriel", "Rossi", "Kinetic Systems", "Qualified", 85, "u-alex", "Partner"],
  ["Julian", "Vance", "Atlas Networks", "Proposal", 70, "u-priya", "Website"],
  ["Kaitlyn", "Ross", "Horizon Manufacturing", "Contacted", 59, "u-daniel", "Inbound"],
  ["Soren", "Rasmussen", "Fjord Tech", "Contacted", 62, "u-alex", "Website"],
  ["Dimitri", "Volkov", "Aegis Cyber Security", "Qualified", 95, "u-alex", "Partner"],
  ["Isabelle", "Dubois", "Vanguard Partners", "Proposal", 83, "u-priya", "Referral"],
  ["Noah", "Adams", "Bright Peak", "New", 35, "u-daniel", "Website"],
  ["Mei", "Huang", "Pacific Digital", "Qualified", 82, "u-priya", "Inbound"],
  ["Adam", "Foster", "Redwood Works", "Proposal", 71, "u-alex", "Referral"],
  ["Grace", "Kim", "Starline Group", "Lost", 20, "u-daniel", "Website"],
];
export const demoLeads = names.map(([firstName, lastName, company, status, score, ownerId, source], index) => {
  const domain = company.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/ +/g, "");
  return {
    id: `lead-${String(index + 1).padStart(3, "0")}`, firstName, lastName,
    email: `${firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "")}.${lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "")}@${domain}.com`,
    phone: `+1 555 ${String(1000000 + index * 137).slice(0, 7)}`,
    company, companyWebsite: `https://${domain}.com`, industry: "Technology", companySize: "11-50", location: "United States",
    jobTitle: "Operations Manager", status, score, ownerId, source,
    priority: score > 80 ? "High" : score < 40 ? "Low" : "Medium",
    estimatedValue: (index + 2) * 1800, expectedClose: "", notes: "",
    createdAt: new Date(Date.UTC(2026, 9, 1 + (index % 15), 12)).toISOString(),
    updatedAt: new Date(Date.UTC(2026, 9, 16 - (index % 6), 11)).toISOString(),
  };
});
export const blankLead = () => ({ firstName:"", lastName:"", email:"", phone:"", jobTitle:"", company:"", companyWebsite:"", industry:"", companySize:"", location:"", status:"New", source:"Website", ownerId:"u-alex", priority:"Medium", estimatedValue:0, expectedClose:"", notes:"", score:50 });
export const displayLeadName = lead => `${lead.firstName} ${lead.lastName}`.trim();
export const initials = name => name.split(/\s+/).slice(0,2).map(s=>s[0]||"").join("").toUpperCase();
