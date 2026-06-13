"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
	causeSlug: string;
	causeName: string;
}

export default function CauseDonateButton({ causeSlug, causeName }: Props) {
	const [pesapalActive, setPesapalActive] = useState(false);
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		fetch("/api/plugins")
			.then((r) => r.json())
			.then((data) => setPesapalActive(data.plugins?.pesapal?.enabled ?? false))
			.catch(() => {})
			.finally(() => setChecked(true));
	}, []);

	if (!checked) {
		return (
			<div className='px-8 py-4 bg-gray-100 rounded-xl text-gray-400 text-center font-semibold'>
				Loading...
			</div>
		);
	}

	const href = pesapalActive
		? `/donate?cause=${encodeURIComponent(causeSlug)}&causeName=${encodeURIComponent(causeName)}`
		: "/contact";

	return (
		<Link
			href={href}
			className='inline-block w-full text-center px-8 py-4 bg-brand text-white rounded-xl font-bold text-lg hover:bg-brand-dark transition-colors shadow-md'
		>
			{pesapalActive ? `Donate to "${causeName}"` : "Contact Us to Donate"}
		</Link>
	);
}
