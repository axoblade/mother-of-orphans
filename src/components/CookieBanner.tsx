"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const consent = localStorage.getItem("cookie-consent");
		if (!consent) setVisible(true);
	}, []);

	function accept() {
		localStorage.setItem("cookie-consent", "accepted");
		setVisible(false);
	}

	function decline() {
		localStorage.setItem("cookie-consent", "declined");
		setVisible(false);
	}

	if (!visible) return null;

	return (
		<div className='fixed bottom-0 left-0 right-0 z-50 bg-dark text-white shadow-2xl border-t border-white/10'>
			<div className='max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4'>
				<div className='flex-1 text-sm text-gray-300 leading-relaxed'>
					<span className='font-semibold text-white'>We value your privacy.</span>{" "}
					We use cookies and collect anonymized visit data to understand how people
					use our site. No personal data is stored or shared with third parties.
					You can decline and we will not track your visit.{" "}
					<a href='/privacy' className='text-brand underline hover:no-underline'>
						Privacy Policy
					</a>
				</div>
				<div className='flex gap-3 shrink-0'>
					<button
						onClick={decline}
						className='px-4 py-2 text-sm border border-white/20 rounded-full hover:bg-white/10 transition-colors'
					>
						Decline
					</button>
					<button
						onClick={accept}
						className='px-5 py-2 text-sm bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition-colors'
					>
						Accept
					</button>
				</div>
			</div>
		</div>
	);
}
