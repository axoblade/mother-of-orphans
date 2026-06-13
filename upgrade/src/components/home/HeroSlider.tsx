"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Slide {
	_id: string;
	title: string;
	subtitle: string;
	text: string;
	image: string;
}

const fallbackSlides: Slide[] = [
	{
		_id: "1",
		image: "/images/slider/slider-1.jpg",
		subtitle: "Giving hope by",
		title: "Supporting Orphans and the Needy",
		text: "We reach out to them because they need our help more",
	},
	{
		_id: "2",
		image: "/images/slider/slider-2.jpg",
		subtitle: "To change lives",
		title: "Together We Can Make a Difference",
		text: "",
	},
	{
		_id: "3",
		image: "/images/slider/slider-3.jpg",
		subtitle: "",
		title: "Giving Smiles",
		text: "To improve the lives of orphans across the country.",
	},
	{
		_id: "4",
		image: "/images/slider/image-4.jpg",
		subtitle: "",
		title: "We Are Their Hope",
		text: "To improve the lives of orphans across the country.",
	},
];

export default function HeroSlider() {
	const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		fetch("/api/sliders")
			.then((r) => r.json())
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) setSlides(data);
			})
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (slides.length < 2) return;
		const timer = setInterval(() => {
			setCurrent((prev) => (prev + 1) % slides.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [slides.length]);

	return (
		<section className='relative h-[500px] md:h-[600px] overflow-hidden'>
			{slides.map((slide, i) => (
				<div
					key={slide._id}
					className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center ${
						i === current ? "opacity-100" : "opacity-0"
					}`}
					style={{ backgroundImage: `url(${slide.image})` }}
				/>
			))}
			<div className='absolute inset-0 bg-black/50' />

			<div className='relative z-10 h-full flex items-center justify-center text-center text-white px-4'>
				<div>
					{slides[current]?.subtitle && (
						<p className='text-lg md:text-xl mb-2 text-orange-200'>
							{slides[current].subtitle}
						</p>
					)}
					<h1 className='text-3xl md:text-6xl font-bold mb-4 leading-tight'>
						{slides[current]?.title}
					</h1>
					{slides[current]?.text && (
						<p className='text-base md:text-lg text-gray-200 mb-8'>
							{slides[current].text}
						</p>
					)}
					<Link
						href='/contact'
						className='inline-block px-8 py-3 bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition-colors shadow-lg'
					>
						Donate Now
					</Link>
				</div>
			</div>

			{/* Dots */}
			<div className='absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2'>
				{slides.map((_, i) => (
					<button
						key={i}
						onClick={() => setCurrent(i)}
						className={`w-3 h-3 rounded-full transition-colors ${
							i === current ? "bg-brand" : "bg-white/50"
						}`}
						aria-label={`Slide ${i + 1}`}
					/>
				))}
			</div>
		</section>
	);
}
