import { Event } from "@/lib/models/Event";
import { connectDB } from "@/lib/mongodb";
import Link from "next/link";

export default async function EventsPreview() {
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
		const raw = (await Event.find({ active: true })
			.sort({ eventDate: 1 })
			.limit(3)
			.lean()) as unknown[];
		events = (raw as any[]).map((e: any) => ({
			_id: String(e._id),
			title: String(e.title || ""),
			summary: String(e.summary || ""),
			image: String(e.image || ""),
			location: String(e.location || ""),
			eventDate: e.eventDate as Date,
		}));
	} catch {
		events = [
			{
				_id: "1",
				title: "Annual Charity Gala 2026",
				summary: "Join us for an evening of inspiration and fundraising.",
				image: "/images/events/event-7-1.jpg",
				location: "Kampala Serena Hotel",
				eventDate: new Date("2026-08-15"),
			},
			{
				_id: "2",
				title: "Community Medical Camp",
				summary: "Free medical check-ups for the community.",
				image: "/images/events/event-7-1.jpg",
				location: "Makindye Luwafu",
				eventDate: new Date("2026-07-20"),
			},
			{
				_id: "3",
				title: "Ramadan Food Distribution",
				summary: "Distributing food packages to families in need.",
				image: "/images/events/event-7-1.jpg",
				location: "Various locations, Kampala",
				eventDate: new Date("2026-03-10"),
			},
		];
	}

	return (
		<section className='py-20 bg-white'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='text-center mb-12'>
					<h2 className='text-3xl md:text-4xl font-bold text-dark mb-3'>
						Upcoming Events
					</h2>
					<p className='text-gray-500 max-w-2xl mx-auto'>
						Join us at our upcoming events and be part of the change.
					</p>
				</div>

				<div className='grid md:grid-cols-3 gap-8'>
					{events.map((event) => (
						<div
							key={event._id}
							className='bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border'
						>
							<div className='h-48 bg-gray-200 overflow-hidden'>
								<img
									src={event.image}
									alt={event.title}
									className='w-full h-full object-cover'
								/>
							</div>
							<div className='p-6'>
								<div className='flex items-center gap-2 text-brand text-sm font-medium mb-2'>
									<svg
										className='w-4 h-4'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
										/>
									</svg>
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
								<div className='flex items-center gap-2 text-sm text-gray-400'>
									<svg
										className='w-4 h-4'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
										/>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
										/>
									</svg>
									{event.location}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className='text-center mt-10'>
					<Link
						href='/events'
						className='inline-block px-8 py-3 border-2 border-brand text-brand rounded-full font-semibold hover:bg-brand hover:text-white transition-colors'
					>
						View All Events
					</Link>
				</div>
			</div>
		</section>
	);
}
