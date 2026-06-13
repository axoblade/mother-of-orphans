import { getBannerImage } from "@/lib/getBannerImage";
import { Cause } from "@/lib/models/Cause";
import { connectDB } from "@/lib/mongodb";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;
export const metadata: Metadata = { title: "Our Causes" };

export default async function CausesPage() {
	const bannerImage = await getBannerImage("causes");

	let causes: {
		_id: string;
		title: string;
		slug: string;
		summary: string;
		image: string;
		goal: number;
		raised: number;
	}[] = [];

	try {
		await connectDB();
		const raw = await Cause.find({ active: true }).sort({ createdAt: -1 }).lean();
		causes = (raw as unknown as typeof causes).map((c) => ({
			_id: String(c._id),
			title: String(c.title || ""),
			slug: String(c.slug || ""),
			summary: String(c.summary || ""),
			image: String(c.image || ""),
			goal: Number(c.goal || 0),
			raised: Number(c.raised || 0),
		}));
	} catch {
		causes = [];
	}

	return (
		<>
			<section className='relative py-24 bg-dark'>
				<img
					src={bannerImage}
					alt=''
					className='absolute inset-0 w-full h-full object-cover opacity-20'
				/>
				<div className='relative z-10 max-w-7xl mx-auto px-4 text-center text-white'>
					<h1 className='text-4xl md:text-5xl font-bold mb-3'>Our Causes</h1>
					<p className='text-white/60 text-sm'>Home / Our Causes</p>
				</div>
			</section>

			<section className='py-20 bg-gray-50'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{causes.map((cause) => {
							const raised = cause.raised || 0;
							const goal = cause.goal || 1;
							const progress = Math.min(Math.round((raised / goal) * 100), 100);
							return (
								<div
									key={cause._id}
									className='bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow'
								>
									<div className='h-52 bg-gray-200 overflow-hidden'>
										{cause.image ? (
											<img
												src={cause.image}
												alt={cause.title}
												className='w-full h-full object-cover'
											/>
										) : (
											<div className='w-full h-full bg-linear-to-br from-orange-100 to-orange-200' />
										)}
									</div>
									<div className='p-6'>
										<h3 className='text-lg font-bold text-dark mb-2'>
											{cause.title}
										</h3>
										<p className='text-sm text-gray-500 mb-4 line-clamp-2'>
											{cause.summary}
										</p>
										<div className='mb-4'>
											<div className='flex justify-between text-sm mb-1'>
												<span className='font-semibold text-brand'>
													${raised.toLocaleString()} raised
												</span>
												<span className='text-gray-400'>
													Goal: ${goal.toLocaleString()}
												</span>
											</div>
											<div className='w-full bg-gray-200 rounded-full h-2'>
												<div
													className='bg-brand h-2 rounded-full transition-all'
													style={{ width: `${progress}%` }}
												/>
											</div>
											<p className='text-xs text-gray-400 mt-1'>{progress}% funded</p>
										</div>
										<Link
											href={`/causes/${cause.slug}`}
											className='inline-block px-5 py-2 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors'
										>
											Donate Now
										</Link>
									</div>
								</div>
							);
						})}
					</div>

					{causes.length === 0 && (
						<div className='text-center py-20 text-gray-400'>
							No active causes at this time. Check back soon.
						</div>
					)}
				</div>
			</section>
		</>
	);
}
