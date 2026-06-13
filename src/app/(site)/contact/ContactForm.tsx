"use client";

import { useEffect, useRef, useState } from "react";

interface CaptchaChallenge {
	question: string;
	token: string;
}

export default function ContactForm() {
	const [form, setForm] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
		// Honeypot - must stay empty
		website: "",
	});
	const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
	const [captchaAnswer, setCaptchaAnswer] = useState("");
	const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
		"idle",
	);
	const [errorMsg, setErrorMsg] = useState("");
	const loadedAt = useRef(Date.now());

	useEffect(() => {
		loadCaptcha();
	}, []);

	async function loadCaptcha() {
		try {
			const res = await fetch("/api/captcha");
			const data = await res.json();
			setCaptcha(data);
			setCaptchaAnswer("");
		} catch {
			// Retry silently on next submit attempt
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// Honeypot check - bots fill hidden fields
		if (form.website) return;

		// Minimum time check - bots submit instantly
		if (Date.now() - loadedAt.current < 2000) return;

		if (!captcha || !captchaAnswer.trim()) {
			setErrorMsg("Please answer the verification question.");
			return;
		}

		setStatus("sending");
		setErrorMsg("");

		try {
			const { website: _hp, ...fields } = form;
			void _hp;
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...fields,
					captchaToken: captcha.token,
					captchaAnswer: captchaAnswer.trim(),
				}),
			});

			if (res.ok) {
				setStatus("sent");
				setForm({ name: "", email: "", subject: "", message: "", website: "" });
				setCaptchaAnswer("");
				loadCaptcha();
			} else {
				const data = await res.json().catch(() => ({}));
				setStatus("error");
				setErrorMsg((data as { error?: string }).error || "Something went wrong. Please try again.");
				loadCaptcha();
			}
		} catch {
			setStatus("error");
			setErrorMsg("Something went wrong. Please try again.");
			loadCaptcha();
		}
	}

	const sending = status === "sending";

	return (
		<form onSubmit={handleSubmit} className='space-y-5'>
			{/* Honeypot - hidden from real users, visible to bots */}
			<input
				type='text'
				name='website'
				value={form.website}
				onChange={(e) => setForm({ ...form, website: e.target.value })}
				tabIndex={-1}
				autoComplete='off'
				aria-hidden='true'
				className='hidden'
			/>

			<div className='grid sm:grid-cols-2 gap-5'>
				<input
					type='text'
					placeholder='Your Name'
					required
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
					className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ed6221]'
				/>
				<input
					type='email'
					placeholder='Your Email'
					required
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
					className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ed6221]'
				/>
			</div>
			<input
				type='text'
				placeholder='Subject'
				value={form.subject}
				onChange={(e) => setForm({ ...form, subject: e.target.value })}
				className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ed6221]'
			/>
			<textarea
				placeholder='Your Message'
				rows={5}
				required
				value={form.message}
				onChange={(e) => setForm({ ...form, message: e.target.value })}
				className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ed6221] resize-y'
			/>

			{/* CAPTCHA */}
			<div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
				<label className='text-sm text-gray-600 shrink-0 font-medium'>
					{captcha ? captcha.question : "Loading..."}
				</label>
				<input
					type='text'
					inputMode='numeric'
					placeholder='Your answer'
					required
					value={captchaAnswer}
					onChange={(e) => setCaptchaAnswer(e.target.value)}
					className='w-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ed6221] text-sm'
				/>
				<button
					type='button'
					onClick={loadCaptcha}
					className='text-xs text-gray-400 hover:text-[#ed6221] transition-colors ml-auto'
					title='Get a new question'
				>
					Refresh
				</button>
			</div>

			<button
				type='submit'
				disabled={sending}
				className='w-full py-3 bg-[#ed6221] text-white rounded-full font-semibold hover:bg-[#d45518] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
			>
				{sending ? "Sending..." : status === "sent" ? "Message Sent!" : "Send Message"}
			</button>

			{errorMsg && (
				<p className='text-red-500 text-sm text-center'>{errorMsg}</p>
			)}
		</form>
	);
}
