
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import {
	ChevronsUpDown,
	Palette,
	Sun,
	Moon,
	Monitor,
	Sparkles,
	CircleUserRound,
	CreditCard,
	Bell,
	Settings2,
	LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { currentUser } from "@/data/sidebar-menu";
import { useTheme } from "@/components/layout/ThemeProvider";
import AnimatedPopover from "@/components/layout/AnimatedPopover";

/* ============================================
   CONFIGURATION
============================================ */

const profileMenu = [
	{ label: "Account", icon: CircleUserRound, href: "/account" },
	{ label: "Billing", icon: CreditCard, href: "/billing" },
	{ label: "Notifications", icon: Bell, href: "/notifications" },
	{ label: "Settings", icon: Settings2, href: "/settings" },
];

const themes = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
];

/* ============================================
   THEME SELECTOR
============================================ */

function ThemeSelector() {
	const { theme, changeTheme, ready } = useTheme();

	return (
		<div className="flex h-10 items-center justify-between gap-2 px-2.5">
			<div className="flex items-center gap-2">
				<Palette
					className="h-3.5 w-3.5 text-muted-foreground"
					strokeWidth={1.8}
				/>

				<span className="text-[11px] font-medium text-popover-foreground">
					Theme
				</span>
			</div>

			<div className="flex items-center gap-0.5 rounded-md border border-border bg-muted p-0.5">
				{themes.map((option) => {
					const Icon = option.icon;
					const selected = theme === option.value;

					return (
						<button
							key={option.value}
							type="button"
							disabled={!ready}
							title={option.label}
							aria-label={`${option.label} theme`}
							aria-pressed={selected}
							onClick={() => changeTheme(option.value)}
							className={cn(
								"nexora-menu-item",
								"flex h-6 w-6 items-center justify-center",
								"rounded-md",
								"focus-visible:outline-none",
								"focus-visible:ring-2 focus-visible:ring-ring",
								selected
									? "bg-card text-primary shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
						</button>
					);
				})}
			</div>
		</div>
	);
}

/* ============================================
   PROFILE AVATAR
============================================ */

function ProfileAvatar({ size = "sm" }) {
	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center",
				"rounded-full font-semibold",
				"bg-[#e8e8e8] text-[#292929]",
				"dark:bg-[#303030] dark:text-[#e5e5e5]",
				size === "lg"
					? "h-9 w-9 text-[11px]"
					: "h-8 w-8 text-[10px]"
			)}
		>
			{currentUser.initials}
		</div>
	);
}

/* ============================================
   PROFILE MENU
============================================ */

export default function SidebarProfile({
	collapsed = false,
	onNavigate,
}) {
	const [open, setOpen] = useState(false);

	const containerRef = useRef(null);
	const triggerRef = useRef(null);
	const menuId = useId();

	useEffect(() => {
		if (!open) return;

		function handleOutside(event) {
			if (!containerRef.current?.contains(event.target)) {
				setOpen(false);
			}
		}

		function handleEscape(event) {
			if (event.key === "Escape") {
				setOpen(false);
				triggerRef.current?.focus();
			}
		}

		document.addEventListener("pointerdown", handleOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("pointerdown", handleOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [open]);

	function closeMenu() {
		setOpen(false);
		onNavigate?.();
	}

	return (
		<div
			ref={containerRef}
			className={cn(
				"relative z-50 shrink-0",
				"border-t border-sidebar-border bg-sidebar",
				collapsed ? "p-2" : "p-2.5"
			)}
		>
			{/* Profile trigger */}

			<button
				ref={triggerRef}
				type="button"
				aria-label="User profile menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				onClick={() => setOpen((value) => !value)}
				className={cn(
					"nexora-menu-item",
					"flex h-[49px] w-full items-center",
					"rounded-lg border text-left",
					"focus-visible:outline-none",
					"focus-visible:ring-2 focus-visible:ring-ring/30",
					collapsed
						? "justify-center border-transparent p-1"
						: "gap-2 border-sidebar-border px-2",
					open
						? "bg-sidebar-accent"
						: "bg-sidebar hover:bg-sidebar-accent/60"
				)}
			>
				<ProfileAvatar />

				{!collapsed && (
					<>
						<div className="min-w-0 flex-1">
							<p className="truncate text-[11.5px] font-semibold leading-[17px] text-foreground">
								{currentUser.name}
							</p>

							<p className="truncate text-[10px] leading-[15px] text-muted-foreground">
								{currentUser.email}
							</p>
						</div>

						<ChevronsUpDown
							className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
							strokeWidth={1.8}
						/>
					</>
				)}
			</button>

			{/* Animated profile dropdown */}

			<AnimatedPopover
				id={menuId}
				open={open}
				className={cn(
					"bottom-full mb-2",
					"w-[244px] max-w-[calc(100vw-20px)]",
					"overflow-hidden",
					collapsed
						? "left-[calc(100%+8px)] bottom-0 mb-0"
						: "left-2.5"
				)}
			>
				{/* User identity */}

				<div className="flex items-center gap-2.5 px-3 py-2.5">
					<ProfileAvatar size="lg" />

					<div className="min-w-0 flex-1">
						<p className="truncate text-[11.5px] font-semibold leading-[17px] text-popover-foreground">
							{currentUser.name}
						</p>

						<p className="truncate text-[10px] leading-[15px] text-muted-foreground">
							{currentUser.email}
						</p>
					</div>
				</div>

				<div className="mx-2 border-t border-border" />

				<ThemeSelector />

				{/* Upgrade */}

				<div className="px-1.5 pb-1">
					<Link
						href="/upgrade"
						onClick={closeMenu}
						className={cn(
							"nexora-menu-item",
							"flex h-8 items-center gap-2",
							"rounded-md px-2.5",
							"text-[11px] font-medium",
							"text-popover-foreground",
							"hover:bg-accent hover:text-accent-foreground"
						)}
					>
						<Sparkles className="h-3.5 w-3.5 text-primary" />
						<span>Upgrade to Pro</span>
					</Link>
				</div>

				<div className="mx-2 border-t border-border" />

				{/* Account navigation */}

				<div className="space-y-0.5 px-1.5 py-1.5">
					{profileMenu.map((item) => {
						const Icon = item.icon;

						return (
							<Link
								key={item.label}
								href={item.href}
								onClick={closeMenu}
								className={cn(
									"nexora-menu-item",
									"flex h-8 items-center gap-2",
									"rounded-md px-2.5",
									"text-[11px] font-medium",
									"text-popover-foreground",
									"hover:bg-accent hover:text-accent-foreground"
								)}
							>
								<Icon
									className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
									strokeWidth={1.8}
								/>
								<span>{item.label}</span>
							</Link>
						);
					})}
				</div>

				<div className="mx-2 border-t border-border" />

				{/* Logout remains a placeholder until authentication */}

				<div className="px-1.5 py-1.5">
					<button
						type="button"
						disabled
						title="Available when authentication is implemented"
						className={cn(
							"flex h-8 w-full items-center gap-2",
							"cursor-not-allowed rounded-md px-2.5",
							"text-left text-[11px] font-medium",
							"text-red-600 opacity-65",
							"dark:text-red-400"
						)}
					>
						<LogOut className="h-3.5 w-3.5" />
						<span>Log out</span>
					</button>
				</div>
			</AnimatedPopover>
		</div>
	);
}
