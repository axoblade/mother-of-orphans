"use client";

import AdminDialog from "@/components/admin/AdminDialog";
import ImageUpload from "@/components/admin/ImageUpload";
import { useEffect, useState } from "react";

interface TeamMember {
	_id: string;
	name: string;
	role: string;
	image: string;
	bio: string;
	order: number;
	active: boolean;
	isDefault: boolean;
}

type ModalMode = "new" | TeamMember | null;

const emptyForm = () => ({
	name: "",
	role: "",
	image: "",
	bio: "",
	active: true,
});

export default function AdminTeam() {
	const [members, setMembers] = useState<TeamMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<ModalMode>(null);
	const [form, setForm] = useState(emptyForm());
	const [dialog, setDialog] = useState<{
		message: string;
		detail?: string;
		confirmLabel?: string;
		danger?: boolean;
		onConfirm?: () => void;
	} | null>(null);

	async function fetchMembers() {
		const res = await fetch("/api/team?all=true");
		const data = await res.json();
		setMembers(Array.isArray(data) ? data : []);
		setLoading(false);
	}

	useEffect(() => {
		fetchMembers();
	}, []);

	function openNew() {
		setForm(emptyForm());
		setModal("new");
	}

	function openEdit(m: TeamMember) {
		setForm({ name: m.name, role: m.role, image: m.image, bio: m.bio, active: m.active });
		setModal(m);
	}

	async function save(e: React.FormEvent) {
		e.preventDefault();
		if (typeof modal === "string") {
			await fetch("/api/team", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
		} else if (modal && typeof modal !== "string") {
			await fetch(`/api/team/${modal._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
		}
		setModal(null);
		fetchMembers();
	}

	async function toggleActive(m: TeamMember) {
		const next = !m.active;
		setMembers((prev) => prev.map((x) => (x._id === m._id ? { ...x, active: next } : x)));
		const res = await fetch(`/api/team/${m._id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ active: next }),
		});
		if (!res.ok) {
			setMembers((prev) => prev.map((x) => (x._id === m._id ? { ...x, active: m.active } : x)));
			const data = await res.json().catch(() => ({}));
			setDialog({ message: "Could not update member", detail: (data as { error?: string }).error });
		}
	}

	function promptDelete(m: TeamMember) {
		setDialog({
			message: `Delete "${m.name}"?`,
			detail: "This action cannot be undone.",
			confirmLabel: "Delete",
			danger: true,
			onConfirm: () => doDelete(m),
		});
	}

	async function doDelete(m: TeamMember) {
		const res = await fetch(`/api/team/${m._id}`, { method: "DELETE" });
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			setDialog({ message: "Cannot delete member", detail: (data as { error?: string }).error });
			return;
		}
		await fetchMembers();
	}

	async function reorder(m: TeamMember, direction: -1 | 1) {
		const sorted = [...members].sort((a, b) => a.order - b.order);
		const idx = sorted.findIndex((x) => x._id === m._id);
		const swap = sorted[idx + direction];
		if (!swap) return;
		await Promise.all([
			fetch(`/api/team/${m._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ order: swap.order }),
			}),
			fetch(`/api/team/${swap._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ order: m.order }),
			}),
		]);
		fetchMembers();
	}

	const isEditing = modal !== null && typeof modal !== "string";
	const sorted = [...members].sort((a, b) => a.order - b.order);

	if (loading) return <div className="p-10 text-gray-400">Loading...</div>;

	return (
		<div className="p-6 md:p-10">
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

			<div className="max-w-3xl mx-auto">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-2xl font-bold text-dark">Manage Team</h1>
						<p className="text-sm text-gray-500 mt-1">
							Default members can only be enabled, disabled, or edited - not deleted.
						</p>
					</div>
					<button
						onClick={openNew}
						className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-dark"
					>
						+ Add Member
					</button>
				</div>

				{/* Modal */}
				{modal !== null && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<form
							onSubmit={save}
							className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 space-y-4 max-h-[90vh] overflow-y-auto"
						>
							<h2 className="text-lg font-bold">
								{isEditing ? "Edit Member" : "New Team Member"}
							</h2>
							<input
								placeholder="Full Name"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								className="w-full px-3 py-2 border rounded-lg"
								required
							/>
							<input
								placeholder="Role / Title"
								value={form.role}
								onChange={(e) => setForm({ ...form, role: e.target.value })}
								className="w-full px-3 py-2 border rounded-lg"
							/>
							<textarea
								placeholder="Short bio (optional)"
								value={form.bio}
								onChange={(e) => setForm({ ...form, bio: e.target.value })}
								className="w-full px-3 py-2 border rounded-lg"
								rows={3}
							/>
							<ImageUpload
								key={isEditing ? (modal as TeamMember)._id : "new-member"}
								onUpload={(result) => setForm({ ...form, image: result.url })}
								currentImage={form.image}
								label="Photo"
							/>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={form.active}
									onChange={(e) => setForm({ ...form, active: e.target.checked })}
								/>
								Active (show on site)
							</label>
							<div className="flex gap-3">
								<button
									type="submit"
									className="flex-1 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark"
								>
									Save
								</button>
								<button
									type="button"
									onClick={() => setModal(null)}
									className="flex-1 py-2 bg-gray-200 rounded-lg"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Members list */}
				<div className="space-y-3">
					{sorted.map((m, idx) => (
						<div
							key={m._id}
							className={`bg-white rounded-xl shadow-sm overflow-hidden flex items-center gap-4 p-4 ${
								!m.active ? "opacity-60" : ""
							}`}
						>
							{/* Photo */}
							<div className="shrink-0">
								{m.image ? (
									<img
										src={m.image}
										alt={m.name}
										className="w-14 h-14 rounded-full object-cover object-top"
									/>
								) : (
									<div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
										<svg className="w-7 h-7 text-brand/50" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
										</svg>
									</div>
								)}
							</div>

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<p className="font-semibold text-dark truncate">{m.name}</p>
									{m.isDefault && (
										<span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">
											Default
										</span>
									)}
									{!m.active && (
										<span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
											Disabled
										</span>
									)}
								</div>
								<p className="text-sm text-gray-500 truncate">{m.role}</p>
							</div>

							{/* Order controls */}
							<div className="flex flex-col gap-0.5 shrink-0">
								<button
									onClick={() => reorder(m, -1)}
									disabled={idx === 0}
									className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default"
									aria-label="Move up"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
										<polyline points="18 15 12 9 6 15" />
									</svg>
								</button>
								<button
									onClick={() => reorder(m, 1)}
									disabled={idx === sorted.length - 1}
									className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default"
									aria-label="Move down"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</button>
							</div>

							{/* Actions */}
							<div className="flex gap-2 shrink-0">
								<button
									onClick={() => toggleActive(m)}
									className={`px-3 py-1 text-sm rounded-lg border font-medium transition-colors ${
										m.active
											? "border-gray-200 text-gray-600 hover:bg-gray-50"
											: "border-green-200 text-green-600 hover:bg-green-50"
									}`}
								>
									{m.active ? "Disable" : "Enable"}
								</button>
								<button
									onClick={() => openEdit(m)}
									className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
								>
									Edit
								</button>
								{!m.isDefault && (
									<button
										onClick={() => promptDelete(m)}
										className="px-3 py-1 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
									>
										Delete
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
