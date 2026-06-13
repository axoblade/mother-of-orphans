"use client";

import { EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Step = "credentials" | "otp";

export default function LoginForm() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("credentials");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [otp, setOtp] = useState("");
	const [tempToken, setTempToken] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const otpRef = useRef<HTMLInputElement>(null);

	async function handleCredentials(e: React.FormEvent) {
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
			if (!res.ok) {
				setError(data.error || "Invalid credentials");
				return;
			}
			if (data.requiresOtp) {
				setTempToken(data.tempToken);
				setStep("otp");
				setTimeout(() => otpRef.current?.focus(), 50);
			}
		} catch {
			setError("Connection error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	async function handleOtp(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/auth/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tempToken, otp }),
			});
			const data = await res.json();
			if (res.ok && data.success) {
				router.push("/admin/dashboard");
			} else {
				setError(data.error || "Incorrect code");
				setOtp("");
				otpRef.current?.focus();
			}
		} catch {
			setError("Connection error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	function handleBack() {
		setStep("credentials");
		setOtp("");
		setTempToken("");
		setError("");
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-dark">
						{step === "credentials" ? "Admin Login" : "Verify Your Identity"}
					</h1>
					<p className="text-gray-500 text-sm mt-1">Mother of Orphans</p>
				</div>

				{step === "credentials" && (
					<>
						<a
							href="/"
							className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="15 18 9 12 15 6" />
							</svg>
							Back to site
						</a>
						<form onSubmit={handleCredentials} className="space-y-5">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
								<input
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
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
										className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
										placeholder="Enter password"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
									</button>
								</div>
							</div>
							{error && <p className="text-red-500 text-sm">{error}</p>}
							<button
								type="submit"
								disabled={loading}
								className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
							>
								{loading ? "Sending code..." : "Continue"}
							</button>
						</form>
					</>
				)}

				{step === "otp" && (
					<form onSubmit={handleOtp} className="space-y-5">
						<div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-sm text-gray-600">
							A 6-digit code has been sent to <strong>{email}</strong>. Enter it below.
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								One-Time Code
							</label>
							<input
								ref={otpRef}
								type="text"
								inputMode="numeric"
								pattern="\d{6}"
								maxLength={6}
								required
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
								className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand text-center text-2xl font-mono tracking-widest"
								placeholder="000000"
								autoComplete="one-time-code"
							/>
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<button
							type="submit"
							disabled={loading || otp.length !== 6}
							className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
						>
							{loading ? "Verifying..." : "Sign In"}
						</button>
						<button
							type="button"
							onClick={handleBack}
							className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
						>
							Back
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
