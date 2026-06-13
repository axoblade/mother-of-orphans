import { Cause } from "@/lib/models/Cause";
import { connectDB } from "@/lib/mongodb";
import Link from "next/link";

export default async function CausesPreview() {
	let causes: {
		_id: string;
		title: string;
		summary: string;
		image: string;
		goal: number;
		raised: number;
	}[] = [];

	try {
		await connectDB();
		const raw = (await Cause.find({ active: true, featured: true })
			.sort({ createdAt: -1 })
			.limit(3)
			.lean()) as unknown[];
		causes = (raw as any[]).map((c: any) => ({
			_id: String(c._id),
			title: String(c.title || ""),
			summary: String(c.summary || ""),
			image: String(c.image || ""),
			goal: Number(c.goal || 0),
			raised: Number(c.raised || 0),
		}));
	} catch {
		// DB not available - show static fallback
		causes = [
			{
				_id: "1",
				title: "Education for Orphans",
				summary:
					"Providing school fees, books, and uniforms to orphaned children in Uganda.",
				image: "/images/causes/education.jpg",
				goal: 25000,
				raised: 12750,
			},
			{
				_id: "2",
				title: "Clean Water Initiative",
				summary: "Building boreholes and water systems for rural communities.",
				image: "/images/causes/education.jpg",
				goal: 15000,
				raised: 8200,
			},
			{
				_id: "3",
				title: "Food & Nutrition Program",
				summary:
					"Providing nutritious meals to orphanages and displaced families.",
				image: "/images/causes/education.jpg",
				goal: 10000,
				raised: 6800,
			},
		];
	}

	return (
		<section className='py-20 bg-gray-50'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='text-center mb-12'>
					<h2 className='text-3xl md:text-4xl font-bold text-dark mb-3'>
						Our Causes
					</h2>
					<p className='text-gray-500 max-w-2xl mx-auto'>
						Support our initiatives and help us make a lasting difference in the
						lives of those who need it most.
					</p>
				</div>

				<div className='grid md:grid-cols-3 gap-8'>
					{causes.map((cause) => {
						const progress =
							cause.goal > 0
								? Math.round((cause.raised / cause.goal) * 100)
								: 0;
						return (
							<div
								key={cause._id}
								className='bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow'
							>
								<div className='h-48 bg-gray-200 overflow-hidden'>
									<img
										src={cause.image}
										alt={cause.title}
										className='w-full h-full object-cover'
									/>
								</div>
								<div className='p-6'>
									<h3 className='text-lg font-bold text-dark mb-2'>
										{cause.title}
									</h3>
									<p className='text-sm text-gray-500 mb-4 line-clamp-2'>
										{cause.summary}
									</p>
									<div className='mb-2'>
										<div className='flex justify-between text-sm mb-1'>
											<span className='font-semibold text-brand'>
												${cause.raised.toLocaleString()}
											</span>
											<span className='text-gray-400'>
												Goal: ${cause.goal.toLocaleString()}
											</span>
										</div>
										<div className='w-full bg-gray-200 rounded-full h-2'>
											<div
												className='bg-brand h-2 rounded-full'
												style={{ width: `${Math.min(progress, 100)}%` }}
											/>
										</div>
										<span className='text-xs text-gray-400 mt-1 block'>
											{progress}% funded
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<div className='text-center mt-10'>
					<Link
						href='/causes'
						className='inline-block px-8 py-3 border-2 border-brand text-brand rounded-full font-semibold hover:bg-brand hover:text-white transition-colors'
					>
						View All Causes
					</Link>
				</div>
			</div>
		</section>
	);
}
