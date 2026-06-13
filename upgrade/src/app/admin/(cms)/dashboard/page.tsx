"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DayData {
	date: string;
	total: number;
	unique: number;
}

interface AnalyticsData {
	days: DayData[];
	totals: { visits: number; unique: number };
	last30: { newVisitors: number; returning: number };
	topPaths: { path: string; count: number }[];
}

function VisitorChart({ days }: { days: DayData[] }) {
	const [tooltip, setTooltip] = useState<{ index: number } | null>(null);

	if (!days.length) {
		return (
			<div className='flex items-center justify-center h-40 text-gray-400 text-sm'>
				No visit data yet
			</div>
		);
	}

	const maxTotal = Math.max(...days.map((d) => d.total), 1);

	const shortDate = (iso: string) => {
		const [, m, d] = iso.split("-");
		return `${Number(m)}/${Number(d)}`;
	};

	return (
		<div className='overflow-x-auto'>
			<div className='flex items-end gap-1 h-44 min-w-max'>
				{days.map((d, i) => {
					const active = tooltip?.index === i;
					return (
						<div
							key={d.date}
							className='relative flex flex-col items-center gap-0.5 cursor-default'
							style={{ width: Math.max(10, Math.floor(560 / days.length) - 2) }}
							onMouseEnter={() => setTooltip({ index: i })}
							onMouseLeave={() => setTooltip(null)}
						>
							{/* Tooltip */}
							{active && (
								<div className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-10 shadow-lg pointer-events-none'>
									<p className='font-semibold'>{shortDate(d.date)}</p>
									<p className='text-brand'>{d.unique} unique</p>
									<p className='text-white/60'>{d.total} total</p>
								</div>
							)}
							<div className='relative w-full flex flex-col justify-end' style={{ height: 128 }}>
								{/* Total bar */}
								<div
									className='w-full rounded-t transition-all duration-150'
									style={{
										height: `${(d.total / maxTotal) * 100}%`,
										background: active ? "#d45518" : "#ed622133",
									}}
								/>
								{/* Unique bar overlaid */}
								<div
									className='absolute bottom-0 w-full rounded-t transition-all duration-150'
									style={{
										height: `${(d.unique / maxTotal) * 100}%`,
										background: active ? "#d45518" : "#ed6221",
									}}
								/>
							</div>
							{days.length <= 14 && (
								<span className='text-xs text-gray-400 truncate w-full text-center'>
									{shortDate(d.date)}
								</span>
							)}
						</div>
					);
				})}
			</div>
			{days.length > 14 && (
				<div className='flex justify-between text-xs text-gray-400 mt-1'>
					<span>{shortDate(days[0].date)}</span>
					<span>{shortDate(days[days.length - 1].date)}</span>
				</div>
			)}
			<div className='flex items-center gap-4 mt-3 text-xs text-gray-500'>
				<span className='flex items-center gap-1.5'>
					<span className='w-3 h-3 rounded-sm bg-brand inline-block' /> Unique
				</span>
				<span className='flex items-center gap-1.5'>
					<span className='w-3 h-3 rounded-sm bg-brand/20 inline-block' /> Total
				</span>
			</div>
		</div>
	);
}

export default function AdminDashboard() {
	const [stats, setStats] = useState({
		causes: 0,
		events: 0,
		gallery: 0,
		messages: 0,
		unread: 0,
	});
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [analyticsLoading, setAnalyticsLoading] = useState(true);

	useEffect(() => {
		async function load() {
			const [causes, events, gallery, messages] = await Promise.all([
				fetch("/api/causes").then((r) => r.json()).catch(() => []),
				fetch("/api/events").then((r) => r.json()).catch(() => []),
				fetch("/api/gallery").then((r) => r.json()).catch(() => []),
				fetch("/api/contact").then((r) => r.json()).catch(() => []),
			]);
			setStats({
				causes: Array.isArray(causes) ? causes.length : 0,
				events: Array.isArray(events) ? events.length : 0,
				gallery: Array.isArray(gallery) ? gallery.length : 0,
				messages: Array.isArray(messages) ? messages.length : 0,
				unread: Array.isArray(messages)
					? messages.filter((m: Record<string, unknown>) => !m.read).length
					: 0,
			});
			setLoading(false);
		}

		async function loadAnalytics() {
			try {
				const res = await fetch("/api/analytics");
				const data = await res.json();
				setAnalytics(data);
			} catch {
				// analytics unavailable
			}
			setAnalyticsLoading(false);
		}

		load();
		loadAnalytics();
	}, []);

	if (loading) return <div className='p-10 text-gray-400'>Loading...</div>;

	const statCards = [
		{ label: "Causes", value: stats.causes, color: "bg-orange-100 text-orange-700", href: "/admin/causes" },
		{ label: "Events", value: stats.events, color: "bg-purple-100 text-purple-700", href: "/admin/events" },
		{ label: "Gallery", value: stats.gallery, color: "bg-green-100 text-green-700", href: "/admin/gallery" },
		{ label: "Messages", value: `${stats.messages} (${stats.unread} new)`, color: "bg-blue-100 text-blue-700", href: "/admin/messages" },
	];

	return (
		<div className='p-6 md:p-10 space-y-8'>
			<h1 className='text-2xl font-bold text-dark'>Dashboard</h1>

			{/* Clickable stat cards */}
			<div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
				{statCards.map((stat) => (
					<Link
						key={stat.label}
						href={stat.href}
						className='bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group'
					>
						<div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${stat.color}`}>
							{stat.label}
						</div>
						<div className='text-3xl font-bold text-dark group-hover:text-brand transition-colors'>
							{stat.value}
						</div>
					</Link>
				))}
			</div>

			{/* Analytics chart */}
			<div className='bg-white rounded-xl p-6 shadow-sm'>
				<div className='flex items-center justify-between mb-6'>
					<div>
						<h2 className='font-bold text-lg text-dark'>Visitor Analytics</h2>
						<p className='text-xs text-gray-400 mt-0.5'>Last 30 days - unique and total visitors per day</p>
					</div>
					{analytics && (
						<div className='flex gap-6 text-sm text-right'>
							<div>
								<p className='text-xs text-gray-400'>All-time visits</p>
								<p className='font-bold text-dark'>{analytics.totals.visits.toLocaleString()}</p>
							</div>
							<div>
								<p className='text-xs text-gray-400'>Unique IPs</p>
								<p className='font-bold text-dark'>{analytics.totals.unique.toLocaleString()}</p>
							</div>
						</div>
					)}
				</div>

				{analyticsLoading ? (
					<div className='h-40 flex items-center justify-center text-gray-400 text-sm'>
						Loading analytics...
					</div>
				) : (
					<VisitorChart days={analytics?.days || []} />
				)}
			</div>

			{/* New vs returning + top pages */}
			{analytics && (
				<div className='grid sm:grid-cols-2 gap-6'>
					<div className='bg-white rounded-xl p-6 shadow-sm'>
						<h3 className='font-semibold text-dark mb-4'>New vs Returning (30 days)</h3>
						{(() => {
							const total = analytics.last30.newVisitors + analytics.last30.returning;
							const newPct = total ? Math.round((analytics.last30.newVisitors / total) * 100) : 0;
							const retPct = 100 - newPct;
							return (
								<div className='space-y-3'>
									<div>
										<div className='flex justify-between text-sm mb-1'>
											<span className='text-gray-600'>New visitors</span>
											<span className='font-semibold'>{analytics.last30.newVisitors} ({newPct}%)</span>
										</div>
										<div className='w-full bg-gray-100 rounded-full h-2'>
											<div className='bg-brand h-2 rounded-full' style={{ width: `${newPct}%` }} />
										</div>
									</div>
									<div>
										<div className='flex justify-between text-sm mb-1'>
											<span className='text-gray-600'>Returning visitors</span>
											<span className='font-semibold'>{analytics.last30.returning} ({retPct}%)</span>
										</div>
										<div className='w-full bg-gray-100 rounded-full h-2'>
											<div className='bg-purple-400 h-2 rounded-full' style={{ width: `${retPct}%` }} />
										</div>
									</div>
								</div>
							);
						})()}
					</div>

					<div className='bg-white rounded-xl p-6 shadow-sm'>
						<h3 className='font-semibold text-dark mb-4'>Top Pages (30 days)</h3>
						{analytics.topPaths.length === 0 ? (
							<p className='text-sm text-gray-400'>No data yet</p>
						) : (
							<ul className='space-y-2'>
								{analytics.topPaths.map((p) => {
									const max = analytics.topPaths[0].count;
									return (
										<li key={p.path} className='flex items-center gap-3'>
											<span className='text-sm text-gray-600 w-28 truncate shrink-0'>{p.path}</span>
											<div className='flex-1 bg-gray-100 rounded-full h-1.5'>
												<div
													className='bg-brand h-1.5 rounded-full'
													style={{ width: `${(p.count / max) * 100}%` }}
												/>
											</div>
											<span className='text-xs text-gray-500 w-6 text-right'>{p.count}</span>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
