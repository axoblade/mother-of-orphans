import { CalendarIcon, MapPinIcon } from "@/components/ui/Icons";
import { getBannerImage } from "@/lib/getBannerImage";
import { Event } from "@/lib/models/Event";
import { connectDB } from "@/lib/mongodb";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
	const bannerImage = await getBannerImage("events");

	let events: {
		_id: string;
		title: string;
		summary: string;
		image: string;
		location: string;
		eventDate: Date;
	}[] = [];

	try {
		await connectDB();
		const raw = await Event.find({ active: true }).sort({ eventDate: -1 }).lean();
		events = (raw as unknown as typeof events).map((e) => ({
			_id: String(e._id),
			title: String(e.title || ""),
			summary: String(e.summary || ""),
			image: String(e.image || ""),
			location: String(e.location || ""),
			eventDate: e.eventDate as Date,
		}));
	} catch {
		events = [];
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
					<h1 className='text-4xl md:text-5xl font-bold mb-3'>Our Events</h1>
					<p className='text-white/60 text-sm'>Home / Our Events</p>
				</div>
			</section>

			<section className='py-20'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{events.map((event) => (
							<div
								key={event._id}
								className='bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border'
							>
								<div className='h-52 bg-gray-200 overflow-hidden'>
									{event.image ? (
										<img
											src={event.image}
											alt={event.title}
											className='w-full h-full object-cover'
										/>
									) : (
										<div className='w-full h-full bg-linear-to-br from-purple-100 to-purple-200' />
									)}
								</div>
								<div className='p-6'>
									<div className='flex items-center gap-2 text-brand text-sm font-medium mb-2'>
										<CalendarIcon className='w-4 h-4' />
										{new Date(event.eventDate).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</div>
									<h3 className='text-lg font-bold text-dark mb-2'>
										{event.title}
									</h3>
									<p className='text-sm text-gray-500 mb-3 line-clamp-2'>
										{event.summary}
									</p>
									{event.location && (
										<div className='flex items-center gap-2 text-sm text-gray-400'>
											<MapPinIcon className='w-4 h-4 shrink-0' />
											{event.location}
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					{events.length === 0 && (
						<div className='text-center py-20 text-gray-400'>
							No events at this time. Check back soon.
						</div>
					)}
				</div>
			</section>
		</>
	);
}
