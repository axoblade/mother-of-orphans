"use client";

import AdminDialog from "@/components/admin/AdminDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import { ImageIcon, PlusIcon, StarIcon } from "@/components/ui/Icons";
import { useEffect, useState } from "react";

interface GalleryItem {
	_id: string;
	title: string;
	category: string;
	image: string;
	featured: boolean;
	active: boolean;
	isDefault: boolean;
}

interface DialogState {
	message: string;
	detail?: string;
	confirmLabel?: string;
	danger?: boolean;
	onConfirm?: () => void;
}

export default function AdminGallery() {
	const [images, setImages] = useState<GalleryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialog, setDialog] = useState<DialogState | null>(null);
	const [imageUploading, setImageUploading] = useState(false);
	const [uploadKey, setUploadKey] = useState(0);
	const [success, setSuccess] = useState(false);
	const [bannerUrl, setBannerUrl] = useState("/images/page-banner.jpg");
	const [bannerSaved, setBannerSaved] = useState(false);
	const [form, setForm] = useState({
		title: "",
		category: "General",
		image: "",
		featured: false,
	});

	const CATEGORIES = ["General", "Education", "Healthcare", "Water", "Food", "Community"];

	useEffect(() => {
		fetchImages();
		fetch("/api/settings")
			.then((r) => r.json())
			.then((s) => setBannerUrl(s.galleryBannerImage || "/images/page-banner.jpg"));
	}, []);

	async function saveBanner(url: string) {
		setBannerUrl(url);
		await fetch("/api/settings", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ galleryBannerImage: url }),
		});
		setBannerSaved(true);
		setTimeout(() => setBannerSaved(false), 2500);
	}

	async function fetchImages() {
		const res = await fetch("/api/gallery?all=true", { cache: "no-store" });
		const data = await res.json();
		setImages(Array.isArray(data) ? data : []);
		setLoading(false);
	}

	async function addImage(e: React.FormEvent) {
		e.preventDefault();
		if (!form.image) return;
		await fetch("/api/gallery", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: form.title,
				category: form.category,
				image: form.image,
				featured: form.featured,
				order: images.length + 1,
			}),
		});
		setForm({ title: "", category: "General", image: "", featured: false });
		setUploadKey((k) => k + 1);
		setSuccess(true);
		setTimeout(() => setSuccess(false), 3000);
		await fetchImages();
	}

	async function toggleActive(img: GalleryItem) {
		const next = !img.active;
		setImages((prev) => prev.map((i) => (i._id === img._id ? { ...i, active: next } : i)));
		const res = await fetch(`/api/gallery/${img._id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ active: next }),
		});
		if (!res.ok) {
			setImages((prev) => prev.map((i) => (i._id === img._id ? { ...i, active: img.active } : i)));
			const data = await res.json().catch(() => ({}));
			setDialog({
				message: "Could not update image",
				detail: (data as { error?: string }).error || "An unexpected error occurred.",
			});
		}
	}

	function promptDelete(img: GalleryItem) {
		setDialog({
			message: `Delete "${img.title}"?`,
			detail: "This action cannot be undone.",
			confirmLabel: "Delete",
			danger: true,
			onConfirm: () => doDelete(img),
		});
	}

	async function doDelete(img: GalleryItem) {
		const res = await fetch(`/api/gallery/${img._id}`, { method: "DELETE" });
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			setDialog({
				message: "Cannot delete image",
				detail: (data as { error?: string }).error || "An unexpected error occurred.",
			});
			return;
		}
		await fetchImages();
	}

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

			<div className='mb-6'>
				<h1 className='text-2xl font-bold text-dark'>Manage Gallery</h1>
				<p className='text-sm text-gray-500 mt-1'>
					Default images can only be enabled or disabled, not deleted.
				</p>
			</div>

			{/* Page Banner */}
			<div className='mb-8 bg-white rounded-xl p-5 shadow-sm'>
				<div className='flex items-center justify-between mb-4'>
					<div>
						<h2 className='font-semibold text-dark'>Gallery Page Banner</h2>
						<p className='text-xs text-gray-400 mt-0.5'>
							Background image shown at the top of the public Gallery page
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

			{/* Add Image Form */}
			<form
				onSubmit={addImage}
				className='bg-white rounded-xl p-5 shadow-sm mb-8 space-y-4'
			>
				<h2 className='font-semibold text-dark'>Add New Image</h2>
				<div className='grid sm:grid-cols-2 gap-3'>
					<input
						placeholder='Title'
						value={form.title}
						onChange={(e) => setForm({ ...form, title: e.target.value })}
						className='px-3 py-2 border rounded-lg'
						required
					/>
					<select
						value={form.category}
						onChange={(e) => setForm({ ...form, category: e.target.value })}
						className='px-3 py-2 border rounded-lg bg-white'
					>
						{CATEGORIES.map((cat) => (
							<option key={cat} value={cat}>{cat}</option>
						))}
					</select>
				</div>
				<ImageUpload
					key={uploadKey}
					onUpload={(result) => setForm({ ...form, image: result.url })}
					onUploadingChange={(v) => setImageUploading(v)}
					currentImage={form.image}
					label='Gallery Image'
				/>
				<label className='flex items-center gap-2 text-sm'>
					<input
						type='checkbox'
						checked={form.featured}
						onChange={(e) => setForm({ ...form, featured: e.target.checked })}
					/>
					Featured
				</label>
				<button
					type='submit'
					disabled={imageUploading || !form.image}
					className='px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed'
				>
					<PlusIcon className='w-4 h-4 inline mr-1' /> Add
				</button>
			</form>

			{success && (
				<div className='fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2'>
					<svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={2.5} viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' d='M4.5 12.75l6 6 9-13.5' />
					</svg>
					Image added successfully!
				</div>
			)}

			{/* Gallery Grid */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
				{images.map((img) => (
					<div
						key={img._id}
						className={`bg-white rounded-xl overflow-hidden shadow-sm ${
							!img.active ? "opacity-60" : ""
						}`}
					>
						{img.image ? (
							<img
								src={img.image}
								alt={img.title}
								className='h-32 w-full object-cover'
							/>
						) : (
							<div className='h-32 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center'>
								<ImageIcon className='w-8 h-8 text-gray-400' />
							</div>
						)}
						<div className='p-3'>
							<p className='text-sm font-medium truncate'>{img.title}</p>
							<div className='flex items-center gap-2 mt-1 flex-wrap'>
								<span className='text-xs text-gray-400'>{img.category}</span>
								{img.featured && <StarIcon className='w-3 h-3 text-brand' />}
								{img.isDefault && (
									<span className='text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full'>
										Default
									</span>
								)}
								{!img.active && (
									<span className='text-xs text-gray-400'>Disabled</span>
								)}
							</div>
							<div className='mt-2 flex gap-2'>
								<button
									onClick={() => toggleActive(img)}
									className={`text-xs px-2 py-1 rounded border font-medium ${
										img.active
											? "border-gray-200 text-gray-500 hover:bg-gray-50"
											: "border-green-200 text-green-600 hover:bg-green-50"
									}`}
								>
									{img.active ? "Disable" : "Enable"}
								</button>
								{!img.isDefault && (
									<button
										onClick={() => promptDelete(img)}
										className='text-xs text-red-500 hover:underline'
									>
										Delete
									</button>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

		</div>
	);
}
