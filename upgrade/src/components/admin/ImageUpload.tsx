"use client";

import { ImageIcon, XIcon } from "@/components/ui/Icons";
import { useCallback, useRef, useState } from "react";

interface UploadResult {
	url: string;
	publicId: string;
	width: number;
	height: number;
}

interface ImageUploadProps {
	onUpload: (result: UploadResult) => void;
	onUploadingChange?: (uploading: boolean) => void;
	currentImage?: string;
	label?: string;
}

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function Spinner({ className }: { className?: string }) {
	return (
		<svg
			className={`animate-spin ${className || "w-4 h-4"}`}
			fill='none'
			viewBox='0 0 24 24'
		>
			<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
			<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
		</svg>
	);
}

export default function ImageUpload({
	onUpload,
	onUploadingChange,
	currentImage,
	label = "Upload Image",
}: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(currentImage || null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");
	const [dragOver, setDragOver] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function validateFile(file: File): string | null {
		if (file.size > MAX_SIZE) {
			return `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum is 2MB.`;
		}
		const allowed = [
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif",
			"image/avif",
		];
		if (!allowed.includes(file.type)) {
			return "Invalid file type. Use JPEG, PNG, WebP, GIF, or AVIF.";
		}
		return null;
	}

	async function handleFile(file: File) {
		const validationError = validateFile(file);
		if (validationError) {
			setError(validationError);
			return;
		}

		// Show local preview immediately
		const reader = new FileReader();
		reader.onload = (e) => setPreview(e.target?.result as string);
		reader.readAsDataURL(file);

		// Upload to Cloudinary
		setUploading(true);
		onUploadingChange?.(true);
		setError("");
		try {
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Upload failed");
				if (!currentImage) setPreview(null);
				return;
			}

			onUpload({
				url: data.url,
				publicId: data.publicId,
				width: data.width,
				height: data.height,
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Upload failed. Check your connection.";
			setError(msg);
			if (!currentImage) setPreview(null);
		} finally {
			setUploading(false);
			onUploadingChange?.(false);
		}
	}

	const onDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) handleFile(file);
	}, []);

	function clearImage() {
		setPreview(null);
		setError("");
		if (inputRef.current) inputRef.current.value = "";
	}

	return (
		<div className='space-y-2'>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>

			{preview ? (
				<div className='relative rounded-xl overflow-hidden border border-gray-200'>
					<img
						src={preview}
						alt='Preview'
						className='w-full h-48 object-cover'
					/>
					<button
						type='button'
						onClick={clearImage}
						className='absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition-colors'
						aria-label='Remove image'
					>
						<XIcon className='w-4 h-4 text-gray-600' />
					</button>
					{uploading && (
						<div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
							<div className='bg-white px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg'>
								<Spinner />
								Uploading...
							</div>
						</div>
					)}
				</div>
			) : uploading ? (
				<div className='border-2 border-dashed border-brand rounded-xl p-8 text-center bg-orange-50'>
					<Spinner className='w-8 h-8 mx-auto mb-3 text-brand' />
					<p className='text-sm text-brand font-medium'>Uploading...</p>
				</div>
			) : (
				<div
					onDragOver={(e) => {
						e.preventDefault();
						setDragOver(true);
					}}
					onDragLeave={() => setDragOver(false)}
					onDrop={onDrop}
					onClick={() => inputRef.current?.click()}
					className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
						dragOver
							? "border-brand bg-orange-50"
							: "border-gray-300 hover:border-gray-400"
					}`}
				>
					<ImageIcon className='w-10 h-10 mx-auto mb-3 text-gray-400' />
					<p className='text-sm text-gray-500 mb-1'>Drag and drop an image here</p>
					<p className='text-xs text-gray-400'>or click to browse</p>
					<p className='text-xs text-gray-400 mt-1'>JPEG, PNG, WebP, GIF, AVIF - max 2MB</p>
				</div>
			)}

			<input
				ref={inputRef}
				type='file'
				accept='image/jpeg,image/png,image/webp,image/gif,image/avif'
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFile(file);
				}}
				className='hidden'
			/>

			{error && <p className='text-red-500 text-xs'>{error}</p>}
		</div>
	);
}
