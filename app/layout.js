
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";

const montserrat = Montserrat({
	variable: "--font-montserrat",
	subsets: ["latin"],
	display: "swap",
	weight: [
		"400",
		"500",
		"600",
		"700",
		"800",
	],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata = {
	title: {
		default: "Nexora CRM",
		template: "%s | Nexora CRM",
	},
	description:
		"Nexora CRM - Modern Enterprise Resource Planning and Customer Relationship Management",
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			className={`
				${montserrat.variable}
				${geistMono.variable}
				h-full
				antialiased
			`}
		>
			<body className="min-h-screen bg-background font-sans text-foreground">
				<TooltipProvider>
					{children}
				</TooltipProvider>
			</body>
		</html>
	);
}
