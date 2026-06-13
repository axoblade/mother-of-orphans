"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
	logoUrl?: string;
}

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/about", label: "About" },
	{ href: "/causes", label: "Causes" },
	{ href: "/events", label: "Events" },
	{ href: "/gallery", label: "Gallery" },
	{ href: "/contact", label: "Contact" },
];

export default function Header({ logoUrl = "/images/logo.png" }: HeaderProps) {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className='sticky top-0 z-50 bg-white shadow-sm'>
			{/* Top bar */}
			<div className='bg-brand text-white text-sm py-2 hidden md:block'>
				<div className='max-w-7xl mx-auto px-4 flex justify-between items-center'>
					<span>
						We only have what we give...{" "}
						<Link href='/contact' className='underline font-semibold'>
							Donate Now.
						</Link>
					</span>
					<div className='flex items-center gap-4'>
						<a href='mailto:info@motheroforphans.org' className='hover:underline'>
							info@motheroforphans.org
						</a>
						<a href='tel:+256786224398' className='hover:underline'>
							+256 786 224 398
						</a>
					</div>
				</div>
			</div>

			{/* Main nav */}
			<div className='max-w-7xl mx-auto px-4'>
				<div className='flex items-center justify-between h-16 md:h-20'>
					<Link href='/' className='flex items-center gap-3 shrink-0'>
						<img
							src={logoUrl}
							alt='Mother of Orphans'
							className='h-10 md:h-12 w-auto object-contain'
						/>
					</Link>

					{/* Desktop nav */}
					<nav className='hidden md:flex items-center gap-1'>
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
									pathname === link.href
										? "text-brand bg-orange-50"
										: "text-gray-600 hover:text-brand hover:bg-orange-50"
								}`}
							>
								{link.label}
							</Link>
						))}
						<Link
							href='/contact'
							className='ml-3 px-6 py-2.5 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors shadow-md'
						>
							Donate
						</Link>
					</nav>

					{/* Mobile hamburger */}
					<button
						onClick={() => setMobileOpen(!mobileOpen)}
						className='md:hidden p-2 text-dark'
						aria-label='Toggle menu'
					>
						<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							{mobileOpen ? (
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
							) : (
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
							)}
						</svg>
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileOpen && (
				<nav className='md:hidden border-t bg-white'>
					<div className='px-4 py-3 space-y-1'>
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setMobileOpen(false)}
								className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
									pathname === link.href
										? "text-brand bg-orange-50"
										: "text-gray-600 hover:text-brand"
								}`}
							>
								{link.label}
							</Link>
						))}
						<Link
							href='/contact'
							onClick={() => setMobileOpen(false)}
							className='block mt-2 text-center px-6 py-2.5 bg-brand text-white rounded-full text-base font-semibold'
						>
							Donate Now
						</Link>
					</div>
				</nav>
			)}
		</header>
	);
}
