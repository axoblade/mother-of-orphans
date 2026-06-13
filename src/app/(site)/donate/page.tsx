"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const PRESET_AMOUNTS = [
	{ label: "$10", value: 10 },
	{ label: "$25", value: 25 },
	{ label: "$50", value: 50 },
	{ label: "$100", value: 100 },
	{ label: "$250", value: 250 },
	{ label: "$500", value: 500 },
];

function DonateContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [pesapalReady, setPesapalReady] = useState<boolean | null>(null);
	const [amount, setAmount] = useState<number>(25);
	const [customAmount, setCustomAmount] = useState("");
	const [useCustom, setUseCustom] = useState(false);
	const [donorName, setDonorName] = useState("");
	const [donorEmail, setDonorEmail] = useState("");
	const [donorPhone, setDonorPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
	const [merchantRef, setMerchantRef] = useState<string | null>(null);
	const [polling, setPolling] = useState(false);
	const [completed, setCompleted] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Check if PesaPal is available
	useEffect(() => {
		fetch("/api/plugins")
			.then((r) => r.json())
			.then((data) => setPesapalReady(data.plugins?.pesapal?.enabled ?? false))
			.catch(() => setPesapalReady(false));
	}, []);

	// Check for return from PesaPal via query params
	useEffect(() => {
		const status = searchParams.get("status");
		const ref = searchParams.get("ref");
		if (status === "complete" && ref) {
			setMerchantRef(ref);
			setCompleted(true);
			// Clean URL
			window.history.replaceState({}, "", "/donate");
		}
		if (status === "cancelled" && ref) {
			setError("Payment was cancelled. You can try again.");
			window.history.replaceState({}, "", "/donate");
		}
	}, [searchParams]);

	// Cleanup polling
	useEffect(() => {
		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
		};
	}, []);

	const selectedAmount = useCustom ? Number(customAmount) || 0 : amount;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		if (selectedAmount <= 0) {
			setError("Please enter a valid donation amount.");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/donate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: selectedAmount,
					currency: "USD",
					donorName: donorName || undefined,
					donorEmail: donorEmail || undefined,
					donorPhone: donorPhone || undefined,
					description: `Donation to Mother of Orphans - $${selectedAmount}`,
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to initiate payment");

			setRedirectUrl(data.redirectUrl);
			setMerchantRef(data.merchantReference);

			// Start polling for payment status
			setPolling(true);
			pollRef.current = setInterval(async () => {
				try {
					const statusRes = await fetch(
						`/api/donate/status?orderTrackingId=${data.orderTrackingId}`,
					);
					const statusData = await statusRes.json();
					if (statusData.status === "COMPLETED") {
						if (pollRef.current) clearInterval(pollRef.current);
						setPolling(false);
						setRedirectUrl(null);
						setCompleted(true);
					}
				} catch {
					// ignore polling errors
				}
			}, 5000);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setLoading(false);
		}
	}

	// If not yet loaded, show loading
	if (pesapalReady === null) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<p className='text-gray-400'>Loading...</p>
			</div>
		);
	}

	// If PesaPal not configured, redirect to contact
	if (!pesapalReady) {
		router.replace("/contact");
		return null;
	}

	// Success state
	if (completed) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
				<div className='max-w-lg w-full bg-white rounded-2xl shadow-lg p-10 text-center'>
					<div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
						<svg
							className='w-10 h-10 text-green-500'
							fill='none'
							stroke='currentColor'
							strokeWidth={2}
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M5 13l4 4L19 7'
							/>
						</svg>
					</div>
					<h1 className='text-2xl font-bold text-dark mb-3'>Thank You!</h1>
					<p className='text-gray-600 mb-2'>
						Your donation of <strong>${selectedAmount} USD</strong> has been
						received.
					</p>
					{merchantRef && (
						<p className='text-sm text-gray-400 mb-6'>
							Reference: {merchantRef}
						</p>
					)}
					<p className='text-gray-500 text-sm mb-8'>
						Your generosity helps us transform the lives of orphans, widows,
						single mothers, elderly persons, and persons with disabilities
						across Uganda. God bless you!
					</p>
					<button
						onClick={() => {
							setCompleted(false);
							setRedirectUrl(null);
							setMerchantRef(null);
							setPolling(false);
						}}
						className='px-8 py-3 bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition-colors'
					>
						Make Another Donation
					</button>
				</div>
			</div>
		);
	}

	// Iframe payment view
	if (redirectUrl) {
		return (
			<div className='min-h-screen bg-gray-50 px-4 py-8'>
				<div className='max-w-2xl mx-auto'>
					<div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
						<div className='bg-brand text-white px-6 py-4 flex items-center justify-between'>
							<h2 className='font-bold text-lg'>Complete Your Payment</h2>
							{polling && (
								<span className='text-sm bg-white/20 px-3 py-1 rounded-full'>
									Waiting for payment...
								</span>
							)}
						</div>
						<div className='relative' style={{ minHeight: "600px" }}>
							<iframe
								ref={iframeRef}
								src={redirectUrl}
								className='w-full border-0'
								style={{ height: "650px" }}
								title='PesaPal Payment'
								allow='payment'
							/>
						</div>
						<div className='p-4 bg-gray-50 border-t text-center'>
							<button
								onClick={() => {
									if (pollRef.current) clearInterval(pollRef.current);
									setRedirectUrl(null);
									setPolling(false);
									setError("Payment was cancelled.");
								}}
								className='text-sm text-gray-500 hover:text-gray-700 underline'
							>
								Cancel Payment
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Donation form
	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Banner */}
			<section className='relative py-24 bg-dark'>
				<div className='absolute inset-0 bg-linear-to-r from-dark to-dark/80' />
				<div className='relative z-10 max-w-7xl mx-auto px-4 text-center text-white'>
					<h1 className='text-4xl md:text-5xl font-bold mb-3'>
						Make a Donation
					</h1>
					<p className='text-white/60 text-sm'>Home / Donate</p>
				</div>
			</section>

			<section className='py-16 px-4'>
				<div className='max-w-xl mx-auto'>
					<div className='bg-white rounded-2xl shadow-lg p-8'>
						<h2 className='text-xl font-bold text-dark mb-2'>
							Choose Your Donation Amount
						</h2>
						<p className='text-gray-500 text-sm mb-6'>
							All donations are in USD. Your support changes lives.
						</p>

						{error && (
							<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className='space-y-6'>
							{/* Preset amounts */}
							<div className='grid grid-cols-3 gap-3'>
								{PRESET_AMOUNTS.map((opt) => (
									<button
										key={opt.value}
										type='button'
										onClick={() => {
											setUseCustom(false);
											setAmount(opt.value);
										}}
										className={`py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-all ${
											!useCustom && amount === opt.value
												? "border-brand bg-orange-50 text-brand"
												: "border-gray-200 text-gray-600 hover:border-brand/50"
										}`}
									>
										{opt.label}
									</button>
								))}
							</div>

							{/* Custom amount */}
							<div>
								<button
									type='button'
									onClick={() => {
										setUseCustom(true);
										setCustomAmount("");
									}}
									className={`text-sm font-semibold mb-2 transition-colors ${
										useCustom ? "text-brand" : "text-gray-400 hover:text-brand"
									}`}
								>
									+ Custom Amount
								</button>
								{useCustom && (
									<div className='relative'>
										<span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg'>
											$
										</span>
										<input
											type='number'
											min='1'
											step='any'
											value={customAmount}
											onChange={(e) => setCustomAmount(e.target.value)}
											placeholder='Enter amount'
											className='w-full pl-10 pr-4 py-3 border-2 border-brand rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30'
										/>
									</div>
								)}
							</div>

							{/* Donor info */}
							<div className='space-y-4 pt-2'>
								<h3 className='font-semibold text-dark'>
									Your Information{" "}
									<span className='text-gray-400 font-normal text-sm'>
										(optional)
									</span>
								</h3>
								<div>
									<label className='block text-sm font-medium text-gray-600 mb-1'>
										Full Name
									</label>
									<input
										type='text'
										value={donorName}
										onChange={(e) => setDonorName(e.target.value)}
										className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
										placeholder='John Doe'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-600 mb-1'>
										Email Address
									</label>
									<input
										type='email'
										value={donorEmail}
										onChange={(e) => setDonorEmail(e.target.value)}
										className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
										placeholder='john@example.com'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-600 mb-1'>
										Phone Number
									</label>
									<input
										type='tel'
										value={donorPhone}
										onChange={(e) => setDonorPhone(e.target.value)}
										className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
										placeholder='+256 700 000000'
									/>
								</div>
							</div>

							<button
								type='submit'
								disabled={loading || selectedAmount <= 0}
								className='w-full py-3.5 bg-brand text-white rounded-xl font-bold text-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
							>
								{loading
									? "Connecting to PesaPal..."
									: `Donate $${selectedAmount || 0} USD`}
							</button>
						</form>
					</div>
				</div>
			</section>
		</div>
	);
}

export default function DonatePage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-gray-50'>
					<p className='text-gray-400'>Loading...</p>
				</div>
			}
		>
			<DonateContent />
		</Suspense>
	);
}
