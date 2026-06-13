import { autoSeed } from "@/lib/autoSeed";
import type { Metadata } from "next";
import { Prata, Rubik } from "next/font/google";
import "./globals.css";

autoSeed();

const rubik = Rubik({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	variable: "--font-rubik",
});

const prata = Prata({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-prata",
});

export const metadata: Metadata = {
	title: {
		default: "Mother of Orphans - Giving Hope to the Needy",
		template: "Mother of Orphans | %s",
	},
	description:
		"Mother of Orphans is a fully incorporated community-based charity organization supporting orphans, widows, and vulnerable groups in Uganda through education, healthcare, water, and economic empowerment.",
	keywords: ["charity", "orphans", "Uganda", "donate", "NGO", "humanitarian"],
	icons: {
		icon: "/favicon.png",
		apple: "/favicon.png",
	},
	openGraph: {
		type: "website",
		siteName: "Mother of Orphans",
		title: "Mother of Orphans - Giving Hope",
		description: "Supporting orphans and vulnerable communities in Uganda.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' data-scroll-behavior='smooth'>
			<body
				className={`${rubik.variable} ${prata.variable} font-sans bg-white text-gray-800 antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
