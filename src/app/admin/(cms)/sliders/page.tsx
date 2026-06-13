"use client";

import AdminDialog from "@/components/admin/AdminDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import { useEffect, useState } from "react";

interface Slide {
	_id: string;
	title: string;
	subtitle: string;
	text: string;
	image: string;
	active: boolean;
	order: number;
	isDefault: boolean;
}

type ModalMode = "new" | Slide | null;

export default function AdminSliders() {
	const [slides, setSlides] = useState<Slide[]>([]);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<ModalMode>(null);
	const [dialog, setDialog] = useState<{
		message: string; detail?: string; confirmLabel?: string; danger?: boolean; onConfirm?: () => void;
	} | null>(null);
	const [form, setForm] = useState({
		title: "",
		subtitle: "",
		text: "",
		image: "",
		active: true,
		order: 0,
	});

	useEffect(() => {
		fetchSlides();
	}, []);

	async function fetchSlides() {
		const res = await fetch("/api/sliders?all=true");
		const data = await res.json();
		setSlides(Array.isArray(data) ? data : []);
		setLoading(false);
	}

	function openNew() {
		setForm({ title: "", subtitle: "", text: "", image: "", active: true, order: slides.length });
		setModal("new");
	}

	function openEdit(slide: Slide) {
		setForm({
			title: slide.title,
			subtitle: slide.subtitle || "",
			text: slide.text || "",
			image: slide.image || "",
			active: slide.active,
			order: slide.order,
		});
		setModal(slide);
	}

	async function toggleActive(slide: Slide) {
		const next = !slide.active;
		setSlides((prev) => prev.map((s) => (s._id === slide._id ? { ...s, active: next } : s)));
		const res = await fetch(`/api/sliders/${slide._id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ active: next }),
		});
		if (!res.ok) {
			setSlides((prev) => prev.map((s) => (s._id === slide._id ? { ...s, active: slide.active } : s)));
			const data = await res.json().catch(() => ({}));
			setDialog({ message: "Could not update slide", detail: (data as { error?: string }).error });
		}
	}

	async function saveSlide(e: React.FormEvent) {
		e.preventDefault();
		if (typeof modal === "string") {
			await fetch("/api/sliders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
		} else if (modal && typeof modal !== "string") {
			await fetch(`/api/sliders/${modal._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
		}
		setModal(null);
		fetchSlides();
	}

	function promptDelete(slide: Slide) {
		setDialog({
			message: `Delete "${slide.title}"?`,
			detail: "This action cannot be undone.",
			confirmLabel: "Delete",
			danger: true,
			onConfirm: () => doDelete(slide),
		});
	}

	async function doDelete(slide: Slide) {
		const res = await fetch(`/api/sliders/${slide._id}`, { method: "DELETE" });
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			setDialog({ message: "Cannot delete slide", detail: (data as { error?: string }).error });
			return;
		}
		await fetchSlides();
	}

	const isEditing = modal !== null && typeof modal !== "string";

	if (loading) return <div className='p-10 text-gray-400'>Loading...</div>;

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
				<div className='flex justify-between items-center mb-8'>
					<div>
						<h1 className='text-2xl font-bold text-[#302c51]'>Hero Slides</h1>
						<p className='text-sm text-gray-500 mt-1'>
							Default slides can only be enabled or disabled.
						</p>
					</div>
					<button
						onClick={openNew}
						className='px-4 py-2 bg-[#ed6221] text-white rounded-lg text-sm font-semibold hover:bg-[#d45518]'
					>
						+ New Slide
					</button>
				</div>

				{/* Modal */}
				{modal !== null && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
						<form
							onSubmit={saveSlide}
							className='bg-white rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4 max-h-[90vh] overflow-y-auto'
						>
							<h2 className='text-lg font-bold'>
								{isEditing ? "Edit Slide" : "New Slide"}
							</h2>
							<input
								placeholder='Title'
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
							<input
								placeholder='Subtitle (optional)'
								value={form.subtitle}
								onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
								className='w-full px-3 py-2 border rounded-lg'
							/>
							<textarea
								placeholder='Body text (optional)'
								value={form.text}
								onChange={(e) => setForm({ ...form, text: e.target.value })}
								className='w-full px-3 py-2 border rounded-lg'
								rows={2}
							/>
							<ImageUpload
								key={isEditing ? (modal as Slide)._id : "new"}
								onUpload={(result) => setForm({ ...form, image: result.url })}
								currentImage={form.image}
								label='Slide Background Image'
							/>
							<div className='grid grid-cols-2 gap-3'>
								<div>
									<label className='block text-xs text-gray-500 mb-1'>Order</label>
									<input
										type='number'
										value={form.order}
										onChange={(e) =>
											setForm({ ...form, order: Number(e.target.value) })
										}
										className='w-full px-3 py-2 border rounded-lg'
									/>
								</div>
								<div className='flex items-end pb-2'>
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
							</div>
							<div className='flex gap-3'>
								<button
									type='submit'
									className='flex-1 py-2 bg-[#ed6221] text-white rounded-lg font-semibold hover:bg-[#d45518]'
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

				{/* Slides list */}
				<div className='space-y-4'>
					{slides.map((slide) => (
						<div
							key={slide._id}
							className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row ${
								!slide.active ? "opacity-60" : ""
							}`}
						>
							{/* Image preview */}
							<div
								className='w-full sm:w-48 h-32 bg-cover bg-center flex-shrink-0'
								style={{
									backgroundImage: slide.image ? `url(${slide.image})` : undefined,
									backgroundColor: slide.image ? undefined : "#f3f4f6",
								}}
							>
								{!slide.image && (
									<div className='h-full flex items-center justify-center text-gray-400 text-xs'>
										No image
									</div>
								)}
							</div>

							{/* Content */}
							<div className='flex-1 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 flex-wrap'>
										<h3 className='font-semibold text-[#302c51] truncate'>
											{slide.title}
										</h3>
										{slide.isDefault && (
											<span className='text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium'>
												Default
											</span>
										)}
										{!slide.active && (
											<span className='text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full'>
												Disabled
											</span>
										)}
									</div>
									{slide.subtitle && (
										<p className='text-sm text-[#ed6221]'>{slide.subtitle}</p>
									)}
									{slide.text && (
										<p className='text-sm text-gray-500 truncate'>{slide.text}</p>
									)}
									<p className='text-xs text-gray-400 mt-1'>Order: {slide.order}</p>
								</div>

								<div className='flex gap-2 flex-shrink-0'>
									<button
										onClick={() => toggleActive(slide)}
										className={`px-3 py-1 text-sm rounded-lg border font-medium transition-colors ${
											slide.active
												? "border-gray-200 text-gray-600 hover:bg-gray-50"
												: "border-green-200 text-green-600 hover:bg-green-50"
										}`}
									>
										{slide.active ? "Disable" : "Enable"}
									</button>
									{!slide.isDefault && (
										<>
											<button
												onClick={() => openEdit(slide)}
												className='px-3 py-1 text-sm border rounded-lg hover:bg-gray-100'
											>
												Edit
											</button>
											<button
												onClick={() => promptDelete(slide)}
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
