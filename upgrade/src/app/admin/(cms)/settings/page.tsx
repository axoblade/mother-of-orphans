"use client";

import ImageUpload from "@/components/admin/ImageUpload";
import { useEffect, useState } from "react";

interface Stat {
	label: string;
	value: string;
}

interface CoreValue {
	title: string;
	description: string;
}

export default function AdminSettings() {
	const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		fetch("/api/settings")
			.then((r) => r.json())
			.then(setSettings);
	}, []);

	async function save(e: React.FormEvent) {
		e.preventDefault();
		await fetch("/api/settings", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(settings),
		});
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	function update(key: string, value: unknown) {
		setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
	}

	function updateStat(index: number, field: "label" | "value", value: string) {
		setSettings((prev) => {
			if (!prev) return null;
			const stats = [...(prev.stats as Stat[])];
			stats[index] = { ...stats[index], [field]: value };
			return { ...prev, stats };
		});
	}

	function updateCoreValue(index: number, field: "title" | "description", value: string) {
		setSettings((prev) => {
			if (!prev) return null;
			const coreValues = [...((prev.coreValues as CoreValue[]) || [])];
			coreValues[index] = { ...coreValues[index], [field]: value };
			return { ...prev, coreValues };
		});
	}

	function addCoreValue() {
		setSettings((prev) => {
			if (!prev) return null;
			const coreValues = [...((prev.coreValues as CoreValue[]) || []), { title: "", description: "" }];
			return { ...prev, coreValues };
		});
	}

	function removeCoreValue(index: number) {
		setSettings((prev) => {
			if (!prev) return null;
			const coreValues = ((prev.coreValues as CoreValue[]) || []).filter((_, i) => i !== index);
			return { ...prev, coreValues };
		});
	}

	if (!settings) return <div className='p-10 text-gray-400'>Loading...</div>;

	return (
		<div className='p-6 md:p-10'>
			<div className='max-w-3xl mx-auto'>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-2xl font-bold text-dark'>Site Settings</h1>
					<button
						onClick={save}
						className='px-6 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark'
					>
						{saved ? "Saved!" : "Save Changes"}
					</button>
				</div>

				<form onSubmit={save} className='space-y-8'>
					{/* Branding */}
					<section className='bg-white rounded-xl p-6 shadow-sm space-y-6'>
						<h2 className='font-bold text-lg text-dark'>Branding</h2>
						<div className='grid sm:grid-cols-2 gap-6'>
							<div>
								<ImageUpload
									key='logo'
									onUpload={(result) => update("logo", result.url)}
									currentImage={(settings.logo as string) || "/images/logo.png"}
									label='Logo (dark background use)'
								/>
								<p className='text-xs text-gray-400 mt-1'>
									Current: {(settings.logo as string) || "/images/logo.png"}
								</p>
							</div>
							<div>
								<ImageUpload
									key='logoWhite'
									onUpload={(result) => update("logoWhite", result.url)}
									currentImage={
										(settings.logoWhite as string) || "/images/logo-white.png"
									}
									label='Logo White (light background use)'
								/>
								<p className='text-xs text-gray-400 mt-1'>
									Current: {(settings.logoWhite as string) || "/images/logo-white.png"}
								</p>
							</div>
						</div>
						<div className='max-w-xs'>
							<ImageUpload
								key='favicon'
								onUpload={(result) => update("favicon", result.url)}
								currentImage={
									(settings.favicon as string) || "/images/favicon.png"
								}
								label='Favicon'
							/>
							<p className='text-xs text-gray-400 mt-1'>
								Current: {(settings.favicon as string) || "/images/favicon.png"}
							</p>
						</div>
						<p className='text-xs text-gray-400'>
							To manage hero slider images, go to{" "}
							<a
								href='/admin/sliders'
								className='text-brand underline hover:no-underline'
							>
								Slider Settings
							</a>
							.
						</p>
					</section>

					{/* About */}
					<section className='bg-white rounded-xl p-6 shadow-sm space-y-4'>
						<h2 className='font-bold text-lg text-dark'>About Section</h2>
						<input
							placeholder='About Title'
							value={(settings.aboutTitle as string) || ""}
							onChange={(e) => update("aboutTitle", e.target.value)}
							className='w-full px-3 py-2 border rounded-lg'
						/>
						<textarea
							placeholder='About Text'
							value={(settings.aboutText as string) || ""}
							onChange={(e) => update("aboutText", e.target.value)}
							className='w-full px-3 py-2 border rounded-lg'
							rows={4}
						/>
						<div>
							<p className='text-sm text-gray-500 mb-2'>About Page Image (hero / side image)</p>
							<ImageUpload
								key='aboutImage'
								onUpload={(result) => update("aboutImage", result.url)}
								currentImage={(settings.aboutImage as string) || ""}
								label='About Image'
							/>
						</div>
						<div>
							<p className='text-sm text-gray-500 mb-2'>Contact Page Banner</p>
							<ImageUpload
								key='contactBannerImage'
								onUpload={(result) => update("contactBannerImage", result.url)}
								currentImage={(settings.contactBannerImage as string) || "/images/page-banner.jpg"}
								label='Contact Banner'
							/>
						</div>
						<textarea
							placeholder='Mission Statement'
							value={(settings.missionText as string) || ""}
							onChange={(e) => update("missionText", e.target.value)}
							className='w-full px-3 py-2 border rounded-lg'
							rows={4}
						/>
						<textarea
							placeholder='Vision Statement'
							value={(settings.visionText as string) || ""}
							onChange={(e) => update("visionText", e.target.value)}
							className='w-full px-3 py-2 border rounded-lg'
							rows={3}
						/>
					</section>

					{/* Stats */}
					<section className='bg-white rounded-xl p-6 shadow-sm space-y-4'>
						<h2 className='font-bold text-lg text-dark'>Stats Bar</h2>
						{((settings.stats as Stat[]) || []).map((stat, i) => (
							<div key={i} className='grid grid-cols-2 gap-3'>
								<input
									placeholder='Label'
									value={stat.label}
									onChange={(e) => updateStat(i, "label", e.target.value)}
									className='px-3 py-2 border rounded-lg text-sm'
								/>
								<input
									placeholder='Value'
									value={stat.value}
									onChange={(e) => updateStat(i, "value", e.target.value)}
									className='px-3 py-2 border rounded-lg text-sm'
								/>
							</div>
						))}
					</section>

					{/* Core Values */}
					<section className='bg-white rounded-xl p-6 shadow-sm space-y-4'>
						<div className='flex justify-between items-center'>
							<h2 className='font-bold text-lg text-dark'>Core Values</h2>
							<button
								type='button'
								onClick={addCoreValue}
								className='text-sm px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-dark'
							>
								+ Add Value
							</button>
						</div>
						{((settings.coreValues as CoreValue[]) || []).map((val, i) => (
							<div key={i} className='border rounded-lg p-4 space-y-2'>
								<div className='flex justify-between items-start gap-2'>
									<input
										placeholder='Value Title (e.g. Compassion)'
										value={val.title}
										onChange={(e) => updateCoreValue(i, "title", e.target.value)}
										className='flex-1 px-3 py-2 border rounded-lg text-sm font-medium'
									/>
									<button
										type='button'
										onClick={() => removeCoreValue(i)}
										className='text-red-400 hover:text-red-600 text-sm px-2 py-2 shrink-0'
									>
										Remove
									</button>
								</div>
								<textarea
									placeholder='Description'
									value={val.description}
									onChange={(e) => updateCoreValue(i, "description", e.target.value)}
									className='w-full px-3 py-2 border rounded-lg text-sm'
									rows={2}
								/>
							</div>
						))}
					</section>

					{/* CTA */}
					<section className='bg-white rounded-xl p-6 shadow-sm space-y-4'>
						<h2 className='font-bold text-lg text-dark'>Call to Action</h2>
						<input
							placeholder='CTA Title'
							value={(settings.ctaTitle as string) || ""}
							onChange={(e) => update("ctaTitle", e.target.value)}
							className='w-full px-3 py-2 border rounded-lg'
						/>
						<textarea
							placeholder='CTA Text'
							value={(settings.ctaText as string) || ""}
							onChange={(e) => update("ctaText", e.target.value)}
							className='w-full px-3 py-2 border rounded-lg'
							rows={3}
						/>
					</section>

					{/* Social Links */}
					<section className='bg-white rounded-xl p-6 shadow-sm space-y-4'>
						<h2 className='font-bold text-lg text-dark'>Social Links</h2>
						<p className='text-sm text-gray-400'>Leave blank to hide a link in the footer.</p>
						{[
							{ key: "socialFacebook", label: "Facebook URL" },
							{ key: "socialInstagram", label: "Instagram URL" },
							{ key: "socialTwitter", label: "Twitter / X URL" },
							{ key: "socialYoutube", label: "YouTube URL" },
							{ key: "socialWhatsapp", label: "WhatsApp number (e.g. +256701574447)" },
						].map(({ key, label }) => (
							<div key={key}>
								<label className='block text-xs text-gray-500 mb-1'>{label}</label>
								<input
									placeholder={label}
									value={(settings[key] as string) || ""}
									onChange={(e) => update(key, e.target.value)}
									className='w-full px-3 py-2 border rounded-lg text-sm'
								/>
							</div>
						))}
					</section>
				</form>
			</div>
		</div>
	);
}
