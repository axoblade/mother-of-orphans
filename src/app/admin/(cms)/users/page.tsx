"use client";

import AdminDialog from "@/components/admin/AdminDialog";
import { useEffect, useState } from "react";

interface User {
	_id: string;
	name: string;
	email: string;
	role: "admin" | "content_manager";
	createdAt: string;
}

type ModalMode = "new" | User | null;

const ROLE_LABELS: Record<string, string> = {
	admin: "Administrator",
	content_manager: "Content Manager",
};

function generatePassword(len = 14): string {
	const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
	return Array.from(crypto.getRandomValues(new Uint8Array(len)))
		.map((b) => chars[b % chars.length])
		.join("");
}

function Initials({ name }: { name: string }) {
	const parts = name.trim().split(" ");
	const text = (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
	return (
		<div className="w-9 h-9 rounded-full bg-brand/20 text-brand font-bold text-sm flex items-center justify-center shrink-0">
			{text}
		</div>
	);
}

export default function AdminUsers() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [modal, setModal] = useState<ModalMode>(null);
	const [dialog, setDialog] = useState<{
		message: string; detail?: string; confirmLabel?: string; danger?: boolean; onConfirm?: () => void;
	} | null>(null);
	const [form, setForm] = useState({ name: "", email: "", role: "content_manager", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [saving, setSaving] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	async function fetchUsers() {
		const res = await fetch("/api/users");
		const data = await res.json();
		setUsers(Array.isArray(data) ? data : []);
		setLoading(false);
	}

	useEffect(() => {
		fetchUsers();
		fetch("/api/auth/me")
			.then((r) => r.json())
			.then((data) => { if (data.authenticated) setCurrentUserId(data.user?.id ?? null); })
			.catch(() => {});
	}, []);

	function openNew() {
		const pw = generatePassword();
		setForm({ name: "", email: "", role: "content_manager", password: pw });
		setShowPassword(true);
		setEmailSent(false);
		setModal("new");
	}

	function openEdit(u: User) {
		setForm({ name: u.name, email: u.email, role: u.role, password: "" });
		setShowPassword(false);
		setEmailSent(false);
		setModal(u);
	}

	async function save(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		try {
			if (typeof modal === "string") {
				const res = await fetch("/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(form),
				});
				const data = await res.json();
				if (!res.ok) {
					setDialog({ message: "Could not create user", detail: data.error });
					return;
				}
				setEmailSent(true);
			} else if (modal && typeof modal !== "string") {
				const body: Record<string, string> = { name: form.name, role: form.role };
				if (form.password) body.password = form.password;
				const res = await fetch(`/api/users/${modal._id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});
				if (!res.ok) {
					const data = await res.json();
					setDialog({ message: "Could not update user", detail: data.error });
					return;
				}
				setModal(null);
			}
			await fetchUsers();
		} finally {
			setSaving(false);
		}
	}

	function promptDelete(u: User) {
		setDialog({
			message: `Delete ${u.name}?`,
			detail: "This action cannot be undone.",
			confirmLabel: "Delete",
			danger: true,
			onConfirm: () => doDelete(u),
		});
	}

	async function doDelete(u: User) {
		const res = await fetch(`/api/users/${u._id}`, { method: "DELETE" });
		if (!res.ok) {
			const data = await res.json();
			setDialog({ message: "Cannot delete user", detail: data.error });
			return;
		}
		await fetchUsers();
	}

	const isEditing = modal !== null && typeof modal !== "string";

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
						<h1 className="text-2xl font-bold text-dark">Users</h1>
						<p className="text-sm text-gray-500 mt-1">Manage admin panel access.</p>
					</div>
					<button
						onClick={openNew}
						className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-dark"
					>
						+ Invite User
					</button>
				</div>

				{/* Modal */}
				{modal !== null && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
							{emailSent ? (
								<>
									<div className="text-center py-4">
										<div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
												<polyline points="20 6 9 17 4 12" />
											</svg>
										</div>
										<h2 className="text-lg font-bold text-dark mb-1">User Created!</h2>
										<p className="text-sm text-gray-500">
											A welcome email with login credentials has been sent to <strong>{form.email}</strong>.
										</p>
									</div>
									<button
										onClick={() => setModal(null)}
										className="w-full py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark"
									>
										Done
									</button>
								</>
							) : (
								<form onSubmit={save} className="space-y-4">
									<h2 className="text-lg font-bold">{isEditing ? "Edit User" : "Invite User"}</h2>

									<div>
										<label className="block text-xs text-gray-500 mb-1">Full Name</label>
										<input
											placeholder="Jane Doe"
											value={form.name}
											onChange={(e) => setForm({ ...form, name: e.target.value })}
											className="w-full px-3 py-2 border rounded-lg text-sm"
											required
										/>
									</div>

									{!isEditing && (
										<div>
											<label className="block text-xs text-gray-500 mb-1">Email</label>
											<input
												type="email"
												placeholder="jane@example.com"
												value={form.email}
												onChange={(e) => setForm({ ...form, email: e.target.value })}
												className="w-full px-3 py-2 border rounded-lg text-sm"
												required
											/>
										</div>
									)}

									<div>
										<label className="block text-xs text-gray-500 mb-1">Role</label>
										<select
											value={form.role}
											onChange={(e) => setForm({ ...form, role: e.target.value })}
											className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
										>
											<option value="content_manager">Content Manager</option>
											<option value="admin">Administrator</option>
										</select>
									</div>

									<div>
										<label className="block text-xs text-gray-500 mb-1">
											{isEditing ? "New Password (leave blank to keep current)" : "Initial Password"}
										</label>
										<div className="relative">
											<input
												type={showPassword ? "text" : "password"}
												value={form.password}
												onChange={(e) => setForm({ ...form, password: e.target.value })}
												className="w-full px-3 py-2 pr-20 border rounded-lg text-sm font-mono"
												{...(!isEditing ? { required: true } : {})}
											/>
											<div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="text-xs text-gray-400 hover:text-gray-600 px-1"
												>
													{showPassword ? "Hide" : "Show"}
												</button>
												<button
													type="button"
													onClick={() => setForm({ ...form, password: generatePassword() })}
													className="text-xs text-brand hover:text-brand-dark px-1"
												>
													Gen
												</button>
											</div>
										</div>
									</div>

									{!isEditing && (
										<p className="text-xs text-gray-400">
											A welcome email with these credentials will be sent to the user.
										</p>
									)}

									<div className="flex gap-3 pt-2">
										<button
											type="submit"
											disabled={saving}
											className="flex-1 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50"
										>
											{saving ? "Saving..." : isEditing ? "Save" : "Create & Send Invite"}
										</button>
										<button
											type="button"
											onClick={() => setModal(null)}
											className="flex-1 py-2 bg-gray-100 rounded-lg text-sm"
										>
											Cancel
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}

				{/* User list */}
				<div className="space-y-3">
					{users.map((u) => (
						<div key={u._id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
							<Initials name={u.name} />
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<p className="font-semibold text-dark text-sm truncate">{u.name}</p>
									<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
										u.role === "admin"
											? "bg-indigo-100 text-indigo-700"
											: "bg-orange-100 text-brand"
									}`}>
										{ROLE_LABELS[u.role] ?? u.role}
									</span>
								</div>
								<p className="text-xs text-gray-400 truncate">{u.email}</p>
							</div>
							<div className="flex gap-2 shrink-0">
								<button
									onClick={() => openEdit(u)}
									className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
								>
									Edit
								</button>
								{u._id !== currentUserId && (
									<button
										onClick={() => promptDelete(u)}
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
