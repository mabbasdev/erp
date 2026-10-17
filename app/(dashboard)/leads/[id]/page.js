"use client";
import { use } from "react";
import { LeadDetails } from "@/components/leads/LeadUI";
export default function LeadPage({params}){const {id}=use(params);return <LeadDetails id={id}/>}
