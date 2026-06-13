import { getBannerImage } from "@/lib/getBannerImage";
import { Cause } from "@/lib/models/Cause";
import { connectDB } from "@/lib/mongodb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CauseDonateButton from "./CauseDonateButton";

export const revalidate = 60;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	return { title: `Cause: ${slug.replace(/-/g, " ")}` };
}

export default async function CauseDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const bannerImage = await getBannerImage("causes");

	let cause: {
		_id: string;
		title: string;
		slug: string;
		summary: string;
		description: string;
		image: string;
		goal: number;
		raised: number;
	} | null = null;

	try {
		await connectDB();
		const raw = await Cause.findOne({ slug, active: true }).lean();
		if (raw) {
			cause = {
				_id: String(raw._id),
				title: String(raw.title || ""),
				slug: String(raw.slug || ""),
				summary: String(raw.summary || ""),
				description: String(
					(raw as unknown as Record<string, unknown>).description || "",
				),
				image: String(raw.image || ""),
				goal: Number(raw.goal || 0),
				raised: Number(raw.raised || 0),
			};
		}
	} catch {
		cause = null;
	}

	if (!cause) notFound();

	const raised = cause.raised || 0;
	const goal = cause.goal || 1;
	const progress = Math.min(Math.round((raised / goal) * 100), 100);

	return (
		<>
			{/* Banner */}
			<section className='relative py-24 bg-dark'>
				<img
					src={bannerImage}
					alt=''
					className='absolute inset-0 w-full h-full object-cover opacity-20'
				/>
				<div className='relative z-10 max-w-7xl mx-auto px-4 text-center text-white'>
					<h1 className='text-4xl md:text-5xl font-bold mb-3'>{cause.title}</h1>
					<p className='text-white/60 text-sm'>Home / Causes / {cause.title}</p>
				</div>
			</section>

			{/* Detail */}
			<section className='py-20 bg-white'>
				<div className='max-w-4xl mx-auto px-4'>
					<div className='grid md:grid-cols-5 gap-10'>
						{/* Image */}
						<div className='md:col-span-2'>
							<div className='rounded-2xl overflow-hidden shadow-md'>
								{cause.image ? (
									<img
										src={cause.image}
										alt={cause.title}
										className='w-full h-auto object-cover'
									/>
								) : (
									<div className='w-full h-64 bg-linear-to-br from-orange-100 to-orange-200 flex items-center justify-center text-gray-400'>
										No image
									</div>
								)}
							</div>
						</div>

						{/* Info */}
						<div className='md:col-span-3 space-y-6'>
							<div>
								<h2 className='text-2xl font-bold text-dark mb-3'>
									{cause.title}
								</h2>
								<p className='text-gray-600 leading-relaxed'>
									{cause.description || cause.summary}
								</p>
							</div>

							{/* Progress */}
							<div className='bg-gray-50 rounded-xl p-6 space-y-3'>
								<div className='flex justify-between text-sm'>
									<span className='font-bold text-brand text-lg'>
										${raised.toLocaleString()} raised
									</span>
									<span className='text-gray-500'>
										Goal: ${goal.toLocaleString()}
									</span>
								</div>
								<div className='w-full bg-gray-200 rounded-full h-3'>
									<div
										className='bg-brand h-3 rounded-full transition-all'
										style={{ width: `${progress}%` }}
									/>
								</div>
								<div className='flex justify-between text-sm text-gray-500'>
									<span>{progress}% funded</span>
									<span>${(goal - raised).toLocaleString()} still needed</span>
								</div>
							</div>

							{/* Donate button */}
							<CauseDonateButton
								causeSlug={cause.slug}
								causeName={cause.title}
							/>
						</div>
					</div>

					{/* Back link */}
					<div className='mt-12 pt-8 border-t text-center'>
						<a
							href='/causes'
							className='inline-flex items-center gap-2 text-brand font-semibold hover:underline'
						>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								strokeWidth={2}
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M15 19l-7-7 7-7'
								/>
							</svg>
							Back to All Causes
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
