const PARTNERS = [
	{ src: "/images/partners/one-ummah.png", name: "One Ummah" },
	{ src: "/images/partners/house-of-zaka.png", name: "House of Zakah and Waqf Uganda" },
	{ src: "/images/partners/umoja.png", name: "Umoja" },
	{ src: "/images/partners/pal.png", name: "PAL" },
	{ src: "/images/partners/thurayya-safaris.png", name: "Thurayya Safaris" },
	{ src: "/images/partners/thurayya.png", name: "Thurayya" },
];

export default function PartnersSection() {
	return (
		<section className='py-16 bg-[#f4f1ee]'>
			<div className='max-w-7xl mx-auto px-4'>
				<p className='text-center text-sm font-semibold uppercase tracking-widest text-brand mb-10'>
					Our Partners
				</p>
				<div className='flex flex-wrap items-center justify-center gap-8 md:gap-14'>
					{PARTNERS.map((p) => (
						<div
							key={p.src}
							className='opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500'
						>
							<img
								src={p.src}
								alt={p.name}
								className='h-12 w-auto object-contain'
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
