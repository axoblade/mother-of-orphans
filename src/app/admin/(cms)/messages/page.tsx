"use client";

import { useEffect, useState } from "react";

interface Message {
	_id: string;
	name: string;
	email: string;
	subject: string;
	message: string;
	read: boolean;
	createdAt: string;
}

export default function AdminMessages() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchMessages();
	}, []);

	async function fetchMessages() {
		const res = await fetch("/api/contact");
		const data = await res.json();
		setMessages(Array.isArray(data) ? data : []);
		setLoading(false);
	}

	if (loading) return <div className='p-10'>Loading...</div>;

	return (
		<div className='p-6 md:p-10'>
			<div className='max-w-5xl mx-auto'>
				<h1 className='text-2xl font-bold text-[#302c51] mb-8'>
					Messages ({messages.length})
				</h1>

				<div className='space-y-4'>
					{messages.length === 0 && (
						<p className='text-gray-500'>No messages yet.</p>
					)}
					{messages.map((msg) => (
						<div
							key={msg._id}
							className={`bg-white rounded-xl p-5 shadow-sm ${!msg.read ? "border-l-4 border-[#ed6221]" : ""}`}
						>
							<div className='flex justify-between items-start mb-2'>
								<div>
									<h3 className='font-semibold text-[#302c51]'>{msg.name}</h3>
									<p className='text-sm text-gray-500'>{msg.email}</p>
								</div>
								<span className='text-xs text-gray-400'>
									{new Date(msg.createdAt).toLocaleDateString()}
								</span>
							</div>
							{msg.subject && (
								<p className='text-sm font-medium text-gray-600 mb-1'>
									{msg.subject}
								</p>
							)}
							<p className='text-sm text-gray-600 whitespace-pre-wrap'>
								{msg.message}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
