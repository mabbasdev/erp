"use client";
import { use } from "react";
import { LeadForm } from "@/components/leads/LeadUI";
export default function EditLeadPage({params}){const {id}=use(params);return <LeadForm key={id} id={id}/>}
