import PartnersSection from "@/components/layout/PartnersSection";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { TeamMember } from "@/lib/models/TeamMember";
import { connectDB } from "@/lib/mongodb";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;
export const metadata: Metadata = { title: "About Us" };

const VALUE_ICONS = [
	// Heart
	<svg key="compassion" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
	// Shield
	<svg key="integrity" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
	// Users
	<svg key="inclusivity" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
	// Leaf
	<svg key="sustainability" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.249 2.249 0 0017.5 15.06L16.34 14.25a2.25 2.25 0 01-.887-1.16l-.048-.144a1.125 1.125 0 00-1.665-.57l-.766.51a2.25 2.25 0 01-1.49.217l-.89-1.068a.75.75 0 00-.864-.405l-.568.095" /></svg>,
];

const TEAM_DEFAULTS = [
	{ name: "Ms Nalumansi Sania", role: "Founder and Director", order: 1 },
	{ name: "Nalumansi Faridah Kirabo", role: "Treasurer", order: 2 },
	{ name: "Nalumansi Hamidah Kirabo", role: "Programs Manager", order: 3 },
];

async function getData() {
	try {
		await connectDB();
		const count = await TeamMember.countDocuments();
		if (count === 0) {
			await TeamMember.insertMany(
				TEAM_DEFAULTS.map((d) => ({ ...d, isDefault: true, active: true })),
			);
		}
		const [s, teamMembers] = await Promise.all([
			SiteSettings.findOne().lean() as Promise<Record<string, unknown> | null>,
			TeamMember.find({ active: true }).sort({ order: 1 }).lean(),
		]);
		return { s, teamMembers };
	} catch {
		return { s: null, teamMembers: [] };
	}
}

export default async function AboutPage() {
	const { s, teamMembers } = await getData();

	const aboutTitle = String(s?.aboutTitle || "A small charity has a big impact");
	const aboutText = String(s?.aboutText || "Mother of Orphans is a fully incorporated community-based charity organization founded in 2016 by Ms. Nalumansi Sania.");
	const aboutImage = String(s?.aboutImage || "");
	const missionText = String(s?.missionText || "");
	const visionText = String(s?.visionText || "");
	const stats = (s?.stats as { label: string; value: string }[]) || [
		{ label: "Volunteers", value: "400+" },
		{ label: "Years Experience", value: "8+" },
		{ label: "Active Causes", value: "15+" },
		{ label: "Lives Impacted", value: "5000+" },
	];
	const coreValues = (s?.coreValues as { title: string; description: string }[]) || [
		{ title: "Compassion", description: "We care and act to alleviate suffering." },
		{ title: "Integrity", description: "We are transparent and accountable." },
		{ title: "Inclusivity", description: "We serve all regardless of background." },
		{ title: "Sustainability", description: "We create lasting change." },
	];
	const ctaTitle = String(s?.ctaTitle || "Together We Can Make a Difference");
	const ctaText = String(s?.ctaText || "Your generosity can change lives.");

	return (
		<>
			{/* Hero */}
			<section className='relative py-24 bg-dark'>
				{aboutImage && (
					<img
						src={aboutImage}
						alt=''
						className='absolute inset-0 w-full h-full object-cover opacity-20'
					/>
				)}
				<div className='relative z-10 max-w-7xl mx-auto px-4 text-center text-white'>
					<h1 className='text-4xl md:text-5xl font-bold mb-3'>Know About Us</h1>
					<p className='text-white/60 text-sm'>Home / About Us</p>
				</div>
			</section>

			{/* Who We Are */}
			<section className='py-20'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='grid md:grid-cols-2 gap-12 items-center'>
						<div>
							<p className='text-brand text-sm font-semibold uppercase tracking-widest mb-3'>
								Who We Are
							</p>
							<h2 className='text-3xl md:text-4xl font-bold text-dark mb-6 leading-tight'>
								{aboutTitle}
							</h2>
							<p className='text-gray-600 leading-relaxed text-lg'>{aboutText}</p>
							<div className='mt-8 grid grid-cols-2 gap-4'>
								{stats.map((stat, i) => (
									<div key={i} className='bg-orange-50 rounded-xl p-4 text-center'>
										<p className='text-3xl font-bold text-brand'>{stat.value}</p>
										<p className='text-sm text-gray-500 mt-1'>{stat.label}</p>
									</div>
								))}
							</div>
						</div>
						<div className='relative'>
							{aboutImage ? (
								<img
									src={aboutImage}
									alt='About Mother of Orphans'
									className='rounded-2xl shadow-xl w-full object-cover aspect-4/3'
								/>
							) : (
								<div className='grid grid-cols-2 gap-3'>
									<img src='/images/gallery/image-1.jpg' alt='' className='rounded-xl object-cover aspect-square w-full' />
									<img src='/images/gallery/image-2.jpg' alt='' className='rounded-xl object-cover aspect-square w-full mt-6' />
									<img src='/images/gallery/image-3.jpg' alt='' className='rounded-xl object-cover aspect-square w-full' />
									<img src='/images/gallery/image-15.jpg' alt='' className='rounded-xl object-cover aspect-square w-full mt-6' />
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Mission & Vision */}
			<section className='py-20 bg-gray-50'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='text-center mb-12'>
						<p className='text-brand text-sm font-semibold uppercase tracking-widest mb-2'>
							Our Purpose
						</p>
						<h2 className='text-3xl md:text-4xl font-bold text-dark'>Mission and Vision</h2>
					</div>
					<div className='grid md:grid-cols-2 gap-8'>
						<div className='bg-white rounded-2xl p-8 shadow-sm border-t-4 border-brand'>
							<div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5'>
								<svg className='w-6 h-6 text-brand' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' />
								</svg>
							</div>
							<h3 className='text-xl font-bold text-dark mb-4'>Our Mission</h3>
							<p className='text-gray-600 leading-relaxed'>{missionText}</p>
						</div>
						<div className='bg-white rounded-2xl p-8 shadow-sm border-t-4 border-dark'>
							<div className='w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5'>
								<svg className='w-6 h-6 text-dark' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z' /><path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
								</svg>
							</div>
							<h3 className='text-xl font-bold text-dark mb-4'>Our Vision</h3>
							<p className='text-gray-600 leading-relaxed'>{visionText}</p>
						</div>
					</div>
				</div>
			</section>

			{/* Core Values */}
			{coreValues.length > 0 && (
				<section className='py-20'>
					<div className='max-w-7xl mx-auto px-4'>
						<div className='text-center mb-12'>
							<p className='text-brand text-sm font-semibold uppercase tracking-widest mb-2'>
								What Guides Us
							</p>
							<h2 className='text-3xl md:text-4xl font-bold text-dark'>Our Core Values</h2>
						</div>
						<div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
							{coreValues.map((val, i) => (
								<div key={i} className='text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow'>
									<div className='w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand'>
										{VALUE_ICONS[i % VALUE_ICONS.length]}
									</div>
									<h3 className='font-bold text-dark text-lg mb-2'>{val.title}</h3>
									<p className='text-gray-500 text-sm leading-relaxed'>{val.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Team */}
			{teamMembers.length > 0 && (
				<section className='py-20 bg-gray-50'>
					<div className='max-w-7xl mx-auto px-4'>
						<div className='text-center mb-12'>
							<p className='text-brand text-sm font-semibold uppercase tracking-widest mb-2'>
								The People
							</p>
							<h2 className='text-3xl md:text-4xl font-bold text-dark'>
								Team behind Mother of Orphans
							</h2>
							<p className='text-gray-500 mt-3 max-w-xl mx-auto'>
								Our work would not be possible without the dedication of our team and volunteers.
							</p>
						</div>
						<div className={`grid gap-8 justify-items-center ${teamMembers.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : teamMembers.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
							{teamMembers.map((member, i) => (
								<div key={i} className='bg-white rounded-2xl overflow-hidden shadow-sm w-full max-w-xs'>
									{member.image ? (
										<img
											src={member.image}
											alt={member.name}
											className='w-full h-56 object-cover object-top'
										/>
									) : (
										<div className='w-full h-56 bg-linear-to-br from-orange-100 to-indigo-100 flex items-center justify-center'>
											<svg className='w-20 h-20 text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
												<path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z' />
											</svg>
										</div>
									)}
									<div className='p-5 text-center'>
										<h3 className='font-bold text-dark text-lg'>{member.name}</h3>
										<p className='text-brand text-sm mt-1'>{member.role}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			<PartnersSection />

			{/* CTA */}
			<section className='py-20 bg-brand'>
				<div className='max-w-3xl mx-auto px-4 text-center text-white'>
					<h2 className='text-3xl md:text-4xl font-bold mb-4'>{ctaTitle}</h2>
					<p className='text-white/80 text-lg mb-8'>{ctaText}</p>
					<Link
						href='/contact'
						className='inline-block px-10 py-4 bg-white text-brand font-bold rounded-full text-lg hover:bg-orange-50 transition-colors shadow-lg'
					>
						Donate Now
					</Link>
				</div>
			</section>
		</>
	);
}
