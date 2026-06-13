"use client";

import { EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (res.ok && data.success) {
				router.push("/admin/dashboard");
			} else {
				setError(data.error || "Invalid credentials");
			}
		} catch {
			setError("Connection error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-[#302c51]">Admin Login</h1>
					<p className="text-gray-500 text-sm mt-1">Mother of Orphans</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ed6221]"
							placeholder="admin@motheroforphans.org"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ed6221]"
								placeholder="Enter password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? (
									<EyeOffIcon className="w-4 h-4" />
								) : (
									<EyeIcon className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>
					{error && <p className="text-red-500 text-sm">{error}</p>}
					<button
						type="submit"
						disabled={loading}
						className="w-full py-2.5 bg-[#ed6221] text-white rounded-lg font-semibold hover:bg-[#d45518] transition-colors disabled:opacity-50"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	);
}
