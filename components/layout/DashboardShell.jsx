
"use client";

import { cn } from "@/lib/utils";

import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

import {
	SidebarProvider,
	useSidebar,
} from "@/components/layout/SidebarProvider";

import { LeadsProvider } from "@/context/LeadsProvider";

import { ThemeProvider } from "@/components/layout/ThemeProvider";

/* ============================================
   RESPONSIVE APPLICATION FRAME
============================================ */

function DashboardContent({ children }) {
	const { collapsed } = useSidebar();

	return (
		<div
			className={cn(
				"h-dvh w-full overflow-hidden",
				"bg-background text-foreground"
			)}
		>
			<Sidebar />

			<main
				className={cn(
					"h-full min-w-0",
					"p-0 sm:p-2 lg:p-2.5",
					"transition-[margin-left]",
					"duration-300 ease-in-out",
					collapsed
						? "lg:ml-[72px]"
						: "lg:ml-64"
				)}
			>
				{/* Application container */}
				<div
					className={cn(
						"flex h-full min-h-0 min-w-0 flex-col",
						"overflow-hidden",
						"bg-card text-card-foreground",

						// Mobile: nearly edge-to-edge
						"rounded-none border-0 shadow-none",

						// Tablet: subtle app frame
						"sm:rounded-xl sm:border sm:border-border",

						// Desktop: premium inset frame
						"lg:rounded-[14px]",
						"lg:shadow-[0_2px_12px_rgba(0,0,0,0.025)]",
						"dark:lg:shadow-none"
					)}
				>
					{/* Navbar stays visible */}
					<DashboardHeader />

					{/* Only page contents scroll */}
					<div
						id="dashboard-page-content"
						className={cn(
							"nexora-scrollbar",
							"min-h-0 min-w-0 flex-1",
							"overflow-x-hidden overflow-y-auto",
							"overscroll-contain",
							"bg-background text-foreground"
						)}
					>
						{children}
					</div>
				</div>
			</main>
		</div>
	);
}

/* ============================================
   DASHBOARD PROVIDERS
============================================ */

export default function DashboardShell({ children }) {
	return (
		<ThemeProvider>
			<SidebarProvider>
				<LeadsProvider>
                <DashboardContent>
					{children}
				</DashboardContent>
                </LeadsProvider>
			</SidebarProvider>
		</ThemeProvider>
	);
}
