"use client";

import AdminDialog from "@/components/admin/AdminDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import { useEffect, useState } from "react";

interface Cause {
	_id: string;
	title: string;
	slug: string;
	summary: string;
	description: string;
	image: string;
	goal: number;
	raised: number;
	featured: boolean;
	active: boolean;
	isDefault: boolean;
}

type ModalMode = "new" | Cause | null;

export default function AdminCauses() {
	const [causes, setCauses] = useState<Cause[]>([]);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<ModalMode>(null);
	const [dialog, setDialog] = useState<{
		message: string; detail?: string; confirmLabel?: string; danger?: boolean; onConfirm?: () => void;
	} | null>(null);
	const [bannerUrl, setBannerUrl] = useState("/images/page-banner.jpg");
	const [bannerSaved, setBannerSaved] = useState(false);
	const [form, setForm] = useState({
		title: "",
		slug: "",
		summary: "",
		description: "",
		image: "",
		goal: 0,
		raised: 0,
		featured: false,
		active: true,
	});

	async function saveBanner(url: string) {
		setBannerUrl(url);
		await fetch("/api/settings", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ causesBannerImage: url }),
		});
		setBannerSaved(true);
		setTimeout(() => setBannerSaved(false), 2500);
	}

	useEffect(() => {
		fetch("/api/settings")
			.then((r) => r.json())
			.then((s) => setBannerUrl(s.causesBannerImage || "/images/page-banner.jpg"));
		fetchCauses();
	}, []);

	async function fetchCauses() {
		const res = await fetch("/api/causes?all=true");
		const data = await res.json();
		setCauses(Array.isArray(data) ? data : []);
		setLoading(false);
	}

	function openNew() {
		setForm({
			title: "",
			slug: "",
			summary: "",
			description: "",
			image: "",
			goal: 0,
			raised: 0,
			featured: false,
			active: true,
		});
		setModal("new");
	}

	function openEdit(cause: Cause) {
		setForm({
			title: cause.title,
			slug: cause.slug,
			summary: cause.summary,
			description: cause.description || "",
			image: cause.image || "",
			goal: cause.goal,
			raised: cause.raised,
			featured: cause.featured,
			active: cause.active,
		});
		setModal(cause);
	}

	async function toggleActive(cause: Cause) {
		const next = !cause.active;
		setCauses((prev) => prev.map((c) => (c._id === cause._id ? { ...c, active: next } : c)));
		const res = await fetch(`/api/causes/${cause._id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ active: next }),
		});
		if (!res.ok) {
			setCauses((prev) => prev.map((c) => (c._id === cause._id ? { ...c, active: cause.active } : c)));
			const data = await res.json().catch(() => ({}));
			setDialog({ message: "Could not update cause", detail: (data as { error?: string }).error });
		}
	}

	async function saveCause(e: React.FormEvent) {
		e.preventDefault();
		if (modal === "new") {
			await fetch("/api/causes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
		} else if (modal && modal !== "new") {
			await fetch(`/api/causes/${modal._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
		}
		setModal(null);
		fetchCauses();
	}

	function promptDelete(cause: Cause) {
		setDialog({
			message: `Delete "${cause.title}"?`,
			detail: "This action cannot be undone.",
			confirmLabel: "Delete",
			danger: true,
			onConfirm: () => doDelete(cause),
		});
	}

	async function doDelete(cause: Cause) {
		const res = await fetch(`/api/causes/${cause._id}`, { method: "DELETE" });
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			setDialog({ message: "Cannot delete cause", detail: (data as { error?: string }).error });
			return;
		}
		await fetchCauses();
	}

	const isEditing = modal !== null && modal !== "new";

	if (loading) return <div className='p-10'>Loading...</div>;

	return (
		<div className='p-6 md:p-10'>
			{dialog && (
				<AdminDialog
					message={dialog.message}
					detail={dialog.detail}
					confirmLabel={dialog.confirmLabel}
					danger={dialog.danger}
					onConfirm={dialog.onConfirm}
					onClose={() => setDialog(null)}
				/>
			)}
			<div className='max-w-5xl mx-auto'>
				<div className='flex justify-between items-center mb-6'>
					<div>
						<h1 className='text-2xl font-bold text-dark'>Manage Causes</h1>
						<p className='text-sm text-gray-500 mt-1'>
							Default causes can only be enabled or disabled.
						</p>
					</div>
					<button
						onClick={openNew}
						className='px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-dark'
					>
						+ New Cause
					</button>
				</div>

				{/* Page Banner */}
				<div className='mb-8 bg-white rounded-xl p-5 shadow-sm'>
					<div className='flex items-center justify-between mb-4'>
						<div>
							<h2 className='font-semibold text-dark'>Causes Page Banner</h2>
							<p className='text-xs text-gray-400 mt-0.5'>
								Background image shown at the top of the public Causes page
							</p>
						</div>
						{bannerSaved && (
							<span className='text-xs text-green-600 font-medium'>Saved!</span>
						)}
					</div>
					<ImageUpload
						key={bannerUrl}
						onUpload={(result) => saveBanner(result.url)}
						currentImage={bannerUrl}
						label='Banner Image'
					/>
				</div>

				{/* Modal */}
				{modal !== null && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
						<form
							onSubmit={saveCause}
							className='bg-white rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4 max-h-[90vh] overflow-y-auto'
						>
							<h2 className='text-lg font-bold'>
								{isEditing ? "Edit Cause" : "New Cause"}
							</h2>
							<input
								placeholder='Title'
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
							<input
								placeholder='Slug (auto-generated if empty)'
								value={form.slug}
								onChange={(e) => setForm({ ...form, slug: e.target.value })}
								className='w-full px-3 py-2 border rounded-lg'
							/>
							<textarea
								placeholder='Summary'
								value={form.summary}
								onChange={(e) => setForm({ ...form, summary: e.target.value })}
								className='w-full px-3 py-2 border rounded-lg'
								rows={2}
								required
							/>
							<textarea
								placeholder='Description'
								value={form.description}
								onChange={(e) =>
									setForm({ ...form, description: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								rows={4}
							/>
							<ImageUpload
								key={isEditing ? (modal as Cause)._id : "new-cause"}
								onUpload={(result) => setForm({ ...form, image: result.url })}
								currentImage={form.image}
								label='Cause Image'
							/>
							<div className='grid grid-cols-2 gap-3'>
								<div>
									<label className='block text-xs text-gray-500 mb-1'>Goal ($)</label>
									<input
										type='number'
										value={form.goal}
										onChange={(e) =>
											setForm({ ...form, goal: Number(e.target.value) })
										}
										className='w-full px-3 py-2 border rounded-lg'
									/>
								</div>
								<div>
									<label className='block text-xs text-gray-500 mb-1'>Raised ($)</label>
									<input
										type='number'
										value={form.raised}
										onChange={(e) =>
											setForm({ ...form, raised: Number(e.target.value) })
										}
										className='w-full px-3 py-2 border rounded-lg'
									/>
								</div>
							</div>
							<div className='flex gap-4'>
								<label className='flex items-center gap-2 text-sm'>
									<input
										type='checkbox'
										checked={form.featured}
										onChange={(e) =>
											setForm({ ...form, featured: e.target.checked })
										}
									/>
									Featured
								</label>
								<label className='flex items-center gap-2 text-sm'>
									<input
										type='checkbox'
										checked={form.active}
										onChange={(e) =>
											setForm({ ...form, active: e.target.checked })
										}
									/>
									Active
								</label>
							</div>
							<div className='flex gap-3'>
								<button
									type='submit'
									className='flex-1 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark'
								>
									Save
								</button>
								<button
									type='button'
									onClick={() => setModal(null)}
									className='flex-1 py-2 bg-gray-200 rounded-lg'
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Causes List */}
				<div className='space-y-4'>
					{causes.map((cause) => (
						<div
							key={cause._id}
							className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row ${
								!cause.active ? "opacity-60" : ""
							}`}
						>
							{/* Image */}
							{cause.image ? (
								<div
									className='w-full sm:w-36 h-28 bg-cover bg-center shrink-0'
									style={{ backgroundImage: `url(${cause.image})` }}
								/>
							) : (
								<div className='w-full sm:w-36 h-28 bg-gray-100 flex items-center justify-center shrink-0'>
									<span className='text-xs text-gray-400'>No image</span>
								</div>
							)}

							{/* Content */}
							<div className='flex-1 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 flex-wrap'>
										<h3 className='font-semibold text-dark truncate'>
											{cause.title}
										</h3>
										{cause.isDefault && (
											<span className='text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium'>
												Default
											</span>
										)}
										{!cause.active && (
											<span className='text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full'>
												Disabled
											</span>
										)}
										{cause.featured && (
											<span className='text-xs text-brand'>Featured</span>
										)}
									</div>
									<p className='text-sm text-gray-500 truncate'>{cause.summary}</p>
									<p className='text-xs text-gray-400 mt-1'>
										${cause.raised.toLocaleString()} raised of $
										{cause.goal.toLocaleString()} goal
									</p>
								</div>

								<div className='flex gap-2 shrink-0'>
									<button
										onClick={() => toggleActive(cause)}
										className={`px-3 py-1 text-sm rounded-lg border font-medium transition-colors ${
											cause.active
												? "border-gray-200 text-gray-600 hover:bg-gray-50"
												: "border-green-200 text-green-600 hover:bg-green-50"
										}`}
									>
										{cause.active ? "Disable" : "Enable"}
									</button>
									{!cause.isDefault && (
										<>
											<button
												onClick={() => openEdit(cause)}
												className='px-3 py-1 text-sm border rounded-lg hover:bg-gray-100'
											>
												Edit
											</button>
											<button
												onClick={() => promptDelete(cause)}
												className='px-3 py-1 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50'
											>
												Delete
											</button>
										</>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
