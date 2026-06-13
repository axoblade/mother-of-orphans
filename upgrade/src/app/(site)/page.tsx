import CausesPreview from "@/components/home/CausesPreview";
import EventsPreview from "@/components/home/EventsPreview";
import HeroSlider from "@/components/home/HeroSlider";
import PartnersSection from "@/components/layout/PartnersSection";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { connectDB } from "@/lib/mongodb";
import Link from "next/link";

export const revalidate = 300;

interface Stat {
	label: string;
	value: string;
}

const defaultSettings = {
	aboutTitle: "Be part of a change you want to see in the world",
	aboutText:
		"Mother of Orphans is a fully incorporated community-based charity organization founded in 2016 by Ms. Nalumansi Sania in an attempt to support and improve the quality of life of indigent and unprivileged members within her community.",
	missionText:
		"To transform and improve the quality of life of vulnerable and marginalized groups including widowed mothers, elderly, persons with disabilities, orphaned children through education, healthcare, water, and economic empowerment.",
	visionText:
		"Mother of Orphans envisions a society that is God-fearing, educated, healthy, and economically empowered with the ability to sustain itself.",
	stats: [
		{ label: "Volunteers", value: "400+" },
		{ label: "Years Experience", value: "8+" },
		{ label: "Active Causes", value: "15+" },
		{ label: "Lives Impacted", value: "5000+" },
	] as Stat[],
	ctaTitle: "Together We Can Make a Difference",
	ctaText:
		"Your generosity can change lives. Join us in supporting orphans and vulnerable communities across Uganda.",
};

export default async function Home() {
	let settings = defaultSettings;

	try {
		await connectDB();
		const raw = await SiteSettings.findOne().lean();
		if (raw) {
			settings = {
				aboutTitle: String((raw as typeof settings).aboutTitle || defaultSettings.aboutTitle),
				aboutText: String((raw as typeof settings).aboutText || defaultSettings.aboutText),
				missionText: String((raw as typeof settings).missionText || defaultSettings.missionText),
				visionText: String((raw as typeof settings).visionText || defaultSettings.visionText),
				stats: ((raw as typeof settings).stats?.length
					? (raw as typeof settings).stats
					: defaultSettings.stats) as Stat[],
				ctaTitle: String((raw as typeof settings).ctaTitle || defaultSettings.ctaTitle),
				ctaText: String((raw as typeof settings).ctaText || defaultSettings.ctaText),
			};
		}
	} catch {
		// use defaults
	}

	return (
		<>
			<HeroSlider />

			{/* About Section */}
			<section className='py-20 bg-white'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='grid md:grid-cols-2 gap-16 items-center'>
						<div>
							<h2 className='text-3xl md:text-4xl font-bold text-dark leading-tight mb-6'>
								{settings.aboutTitle}
							</h2>
							<p className='text-gray-600 italic text-lg mb-6 border-l-4 border-brand pl-4'>
								Generosity consists not of the sum given, but the manner in which it is bestowed by The Creator.
							</p>
							<p className='text-gray-600 leading-relaxed mb-8'>
								{settings.aboutText}
							</p>
							<div className='grid sm:grid-cols-2 gap-6'>
								<div className='bg-orange-50 rounded-xl p-5'>
									<h3 className='font-semibold text-dark mb-2'>Our Mission</h3>
									<p className='text-sm text-gray-600'>{settings.missionText}</p>
								</div>
								<div className='bg-purple-50 rounded-xl p-5'>
									<h3 className='font-semibold text-dark mb-2'>Our Vision</h3>
									<p className='text-sm text-gray-600'>{settings.visionText}</p>
								</div>
							</div>
							<Link
								href='/about'
								className='inline-block mt-8 px-8 py-3 bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition-colors shadow-md'
							>
								More About Us
							</Link>
						</div>

						{/* About image grid */}
						<div className='grid grid-cols-2 gap-4'>
							<div className='h-52 rounded-xl overflow-hidden bg-gray-100'>
								<img
									src='/images/about/image-3.jpg'
									alt='Our work'
									className='w-full h-full object-cover'
								/>
							</div>
							<div className='h-52 rounded-xl overflow-hidden bg-gray-100 mt-8'>
								<img
									src='/images/about/image-15.jpg'
									alt='Our team'
									className='w-full h-full object-cover'
								/>
							</div>
							<div className='h-52 rounded-xl overflow-hidden bg-gray-100 -mt-8'>
								<img
									src='/images/about/image-16.jpg'
									alt='Community'
									className='w-full h-full object-cover'
								/>
							</div>
							<div className='h-52 rounded-xl overflow-hidden bg-gray-100'>
								<img
									src='/images/about/image-17.jpg'
									alt='Impact'
									className='w-full h-full object-cover'
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Bar */}
			<section className='py-16 bg-brand text-white'>
				<div className='max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
					{settings.stats.map((stat, i) => (
						<div key={i}>
							<div className='text-3xl md:text-4xl font-bold mb-1'>{stat.value}</div>
							<div className='text-white/80 text-sm'>{stat.label}</div>
						</div>
					))}
				</div>
			</section>

			<CausesPreview />
			<EventsPreview />

			<PartnersSection />

			{/* CTA */}
			<section className='py-20 bg-dark text-white text-center'>
				<div className='max-w-3xl mx-auto px-4'>
					<h2 className='text-3xl md:text-4xl font-bold mb-4'>
						{settings.ctaTitle}
					</h2>
					<p className='text-gray-300 mb-8 text-lg'>{settings.ctaText}</p>
					<Link
						href='/contact'
						className='inline-block px-10 py-4 bg-brand text-white rounded-full text-lg font-semibold hover:bg-brand-dark transition-colors shadow-lg'
					>
						Donate Now
					</Link>
				</div>
			</section>
		</>
	);
}
