import AnalyticsTracker from "@/components/AnalyticsTracker";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { connectDB } from "@/lib/mongodb";

async function getBranding() {
	try {
		await connectDB();
		const s = await SiteSettings.findOne().lean() as Record<string, unknown> | null;
		return {
			logo: String(s?.logo || "/images/logo.png"),
			logoWhite: String(s?.logoWhite || "/images/logo-white.png"),
		};
	} catch {
		return { logo: "/images/logo.png", logoWhite: "/images/logo-white.png" };
	}
}

export default async function SiteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { logo } = await getBranding();

	return (
		<>
			<AnalyticsTracker />
			<CookieBanner />
			<Header logoUrl={logo} />
			<main className='min-h-screen'>{children}</main>
			<Footer />
		</>
	);
}
