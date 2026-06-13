import { getBannerImage } from "@/lib/getBannerImage";
import { GalleryImage } from "@/lib/models/Gallery";
import { connectDB } from "@/lib/mongodb";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "Gallery" };

const categories = ["All", "Education", "Healthcare", "Water", "Food", "Community"];

export default async function GalleryPage() {
	const bannerImage = await getBannerImage("gallery");

	let images: {
		_id: string;
		title: string;
		image: string;
		category: string;
	}[] = [];

	try {
		await connectDB();
		const raw = await GalleryImage.find({ active: true })
			.sort({ order: 1, createdAt: -1 })
			.lean();
		images = (raw as unknown as typeof images).map((img) => ({
			_id: String(img._id),
			title: String(img.title || ""),
			image: String(img.image || ""),
			category: String(img.category || "General"),
		}));
	} catch {
		images = [];
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
					<h1 className='text-4xl md:text-5xl font-bold mb-3'>Our Gallery</h1>
					<p className='text-white/60 text-sm'>Home / Gallery</p>
				</div>
			</section>

			<section className='py-20'>
				<div className='max-w-7xl mx-auto px-4'>
					{/* Category filter chips */}
					<div className='flex flex-wrap gap-2 mb-10 justify-center'>
						{categories.map((cat) => (
							<span
								key={cat}
								className='px-4 py-1.5 rounded-full text-sm border border-gray-200 text-gray-600 bg-white'
							>
								{cat}
							</span>
						))}
					</div>

					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
						{images.map((img) => (
							<div
								key={img._id}
								className='group relative aspect-square overflow-hidden rounded-xl bg-gray-100'
							>
								{img.image ? (
									<img
										src={img.image}
										alt={img.title}
										className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
									/>
								) : (
									<div className='w-full h-full bg-linear-to-br from-orange-100 to-pink-100' />
								)}
								<div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300' />
								<div className='absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
									<p className='text-white text-sm font-medium truncate'>{img.title}</p>
									<p className='text-white/70 text-xs'>{img.category}</p>
								</div>
							</div>
						))}
					</div>

					{images.length === 0 && (
						<div className='text-center py-20 text-gray-400'>
							No gallery images at this time.
						</div>
					)}
				</div>
			</section>
		</>
	);
}
