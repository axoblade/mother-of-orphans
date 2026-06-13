"use client";

import React from "react";
import {
	CalendarIcon,
	HeartIcon,
	HomeIcon,
	ImageIcon,
	LayoutIcon,
	LogOutIcon,
	MenuIcon,
	MessageIcon,
	UserIcon,
	UsersIcon,
} from "@/components/ui/Icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const SettingsIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-5 h-5"} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24' strokeLinecap='round' strokeLinejoin='round'>
		<circle cx='12' cy='12' r='3' />
		<path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
	</svg>
);

const SlideshowIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-5 h-5"} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24' strokeLinecap='round' strokeLinejoin='round'>
		<rect x='2' y='7' width='20' height='10' rx='2' />
		<path d='M17 2l5 5-5 5' />
		<path d='M7 2L2 7l5 5' />
	</svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-5 h-5"} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24' strokeLinecap='round' strokeLinejoin='round'>
		<path d='M15 18l-6-6 6-6' />
	</svg>
);

const navItems: { href: string; label: string; Icon: React.FC<{ className?: string }>; adminOnly?: boolean }[] = [
	{ href: "/admin/dashboard", label: "Dashboard", Icon: LayoutIcon },
	{ href: "/admin/sliders", label: "Sliders", Icon: SlideshowIcon },
	{ href: "/admin/causes", label: "Causes", Icon: HeartIcon },
	{ href: "/admin/events", label: "Events", Icon: CalendarIcon },
	{ href: "/admin/gallery", label: "Gallery", Icon: ImageIcon },
	{ href: "/admin/team", label: "Team", Icon: UsersIcon },
	{ href: "/admin/messages", label: "Messages", Icon: MessageIcon },
	{ href: "/admin/users", label: "Users", Icon: UserIcon, adminOnly: true },
	{ href: "/admin/settings", label: "Settings", Icon: SettingsIcon, adminOnly: true },
];

const mobileItems = [
	{ href: "/admin/dashboard", Icon: HomeIcon },
	{ href: "/admin/sliders", Icon: SlideshowIcon },
	{ href: "/admin/causes", Icon: HeartIcon },
	{ href: "/admin/events", Icon: CalendarIcon },
	{ href: "/admin/messages", Icon: MessageIcon },
	{ href: "/admin/settings", Icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);
	const [loading, setLoading] = useState(true);
	const [collapsed, setCollapsed] = useState(false);
	const [logoUrl, setLogoUrl] = useState("/images/logo-white.png");

	useEffect(() => {
		const stored = localStorage.getItem("adminSidebarCollapsed");
		if (stored === "true") setCollapsed(true);
	}, []);

	function toggleCollapsed() {
		setCollapsed((prev) => {
			localStorage.setItem("adminSidebarCollapsed", String(!prev));
			return !prev;
		});
	}

	useEffect(() => {
		fetch("/api/auth/me")
			.then((r) => r.json())
			.then((data) => {
				if (!data.authenticated) router.push("/admin/login");
				else setUser(data.user);
			})
			.catch(() => router.push("/admin/login"))
			.finally(() => setLoading(false));

		fetch("/api/settings")
			.then((r) => r.json())
			.then((data) => {
				const url = data?.logoWhite || data?.logo;
				if (url) setLogoUrl(url);
			})
			.catch(() => {});
	}, [router]);

	async function handleLogout() {
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/admin/login");
	}

	if (loading) {
		return (
			<div className='h-screen flex items-center justify-center bg-gray-50 text-gray-400'>
				Loading...
			</div>
		);
	}

	return (
		<div className='h-screen flex flex-col overflow-hidden'>
			{/* Brand top bar */}
			<div className='bg-brand text-white text-sm py-2 shrink-0 hidden md:block'>
				<div className='px-4 flex justify-between items-center'>
					<span>
						We only have what we give...{" "}
						<Link href='/' className='underline font-semibold' target='_blank'>
							Visit Site
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

			{/* Sidebar + content */}
			<div className='flex flex-1 overflow-hidden bg-gray-50'>
				{/* Desktop Sidebar */}
				<aside
					className={`bg-dark text-white hidden md:flex flex-col shrink-0 transition-all duration-200 ease-in-out ${
						collapsed ? "w-16" : "w-64"
					}`}
				>
					{/* Sidebar header - logo */}
					<div
						className={`border-b border-white/10 flex items-center ${
							collapsed ? "p-3 justify-center" : "p-4 justify-between"
						}`}
					>
						{!collapsed && (
							<Link href='/' target='_blank' className='min-w-0 flex-1 mr-2'>
								<img
									src={logoUrl}
									alt='Mother of Orphans'
									className='h-9 w-auto object-contain object-left'
								/>
							</Link>
						)}
						{collapsed && (
							<Link href='/' target='_blank' className='shrink-0'>
								<img
									src={logoUrl}
									alt='Mother of Orphans'
									className='h-7 w-auto object-contain'
								/>
							</Link>
						)}
						{!collapsed && (
							<button
								onClick={toggleCollapsed}
								className='p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0'
								aria-label='Collapse sidebar'
							>
								<ChevronLeftIcon className='w-4 h-4' />
							</button>
						)}
					</div>

					{/* Collapse toggle when collapsed */}
					{collapsed && (
						<button
							onClick={toggleCollapsed}
							className='mx-auto mt-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors'
							aria-label='Expand sidebar'
						>
							<MenuIcon className='w-4 h-4' />
						</button>
					)}

					{/* Nav links */}
					<nav className='flex-1 p-2 space-y-0.5 overflow-y-auto'>
						{navItems.filter((item) => !item.adminOnly || user?.role === "admin").map(({ href, label, Icon }) => {
							const active = pathname === href;
							return (
								<Link
									key={href}
									href={href}
									title={collapsed ? label : undefined}
									className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
										active
											? "bg-white/15 text-white"
											: "text-white/70 hover:bg-white/10 hover:text-white"
									} ${collapsed ? "justify-center" : ""}`}
								>
									<Icon className='w-4 h-4 shrink-0' />
									{!collapsed && <span className='truncate'>{label}</span>}
								</Link>
							);
						})}
					</nav>

					{/* Sidebar footer / sign-out */}
					<div className={`border-t border-white/10 ${collapsed ? "p-3" : "p-4"}`}>
						{!collapsed && (
							<p className='text-white/50 text-xs truncate mb-2'>{user?.email}</p>
						)}
						<button
							onClick={handleLogout}
							title={collapsed ? "Sign Out" : undefined}
							className={`flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors ${
								collapsed ? "justify-center w-full" : ""
							}`}
						>
							<LogOutIcon className='w-4 h-4 shrink-0' />
							{!collapsed && "Sign Out"}
						</button>
					</div>
				</aside>

				{/* Content area */}
				<main className='flex-1 overflow-y-auto pb-16 md:pb-0'>{children}</main>
			</div>

			{/* Mobile bottom nav */}
			<nav className='md:hidden fixed bottom-0 left-0 right-0 bg-dark text-white flex justify-around py-3 z-50'>
				{mobileItems.map(({ href, Icon }) => (
					<Link
						key={href}
						href={href}
						className={`p-2 rounded-lg ${pathname === href ? "bg-white/15" : ""}`}
					>
						<Icon className='w-5 h-5' />
					</Link>
				))}
			</nav>
		</div>
	);
}
