"use client";

import { EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Step = "credentials" | "otp" | "forgot" | "reset-otp" | "new-password";

export default function LoginForm() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("credentials");

	// credentials
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// otp (login)
	const [loginOtp, setLoginOtp] = useState("");
	const [loginTempToken, setLoginTempToken] = useState("");

	// forgot / reset
	const [forgotEmail, setForgotEmail] = useState("");
	const [resetOtp, setResetOtp] = useState("");
	const [resetTempToken, setResetTempToken] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [resetDone, setResetDone] = useState(false);

	const [error, setError] = useState("");
	const [info, setInfo] = useState("");
	const [loading, setLoading] = useState(false);

	const otpRef = useRef<HTMLInputElement>(null);
	const resetOtpRef = useRef<HTMLInputElement>(null);

	function clearError() { setError(""); setInfo(""); }

	function goTo(s: Step) { clearError(); setStep(s); }

	// ---- Step 1: email + password ----
	async function handleCredentials(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true); clearError();
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) { setError(data.error || "Invalid credentials"); return; }
			if (data.requiresOtp) {
				setLoginTempToken(data.tempToken);
				setLoginOtp("");
				setStep("otp");
				setTimeout(() => otpRef.current?.focus(), 50);
			}
		} catch { setError("Connection error. Please try again."); }
		finally { setLoading(false); }
	}

	// ---- Step 2: login OTP ----
	async function handleLoginOtp(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true); clearError();
		try {
			const res = await fetch("/api/auth/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tempToken: loginTempToken, otp: loginOtp }),
			});
			const data = await res.json();
			if (res.ok && data.success) { router.push("/admin/dashboard"); return; }
			setError(data.error || "Incorrect code");
			setLoginOtp("");
			otpRef.current?.focus();
		} catch { setError("Connection error. Please try again."); }
		finally { setLoading(false); }
	}

	// ---- Forgot: send OTP ----
	async function handleForgot(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true); clearError();
		try {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: forgotEmail }),
			});
			const data = await res.json();
			if (!res.ok) { setError(data.error || "Failed to send code"); return; }
			setResetTempToken(data.tempToken || "");
			setResetOtp("");
			setStep("reset-otp");
			setTimeout(() => resetOtpRef.current?.focus(), 50);
		} catch { setError("Connection error. Please try again."); }
		finally { setLoading(false); }
	}

	// ---- Reset: verify OTP ----
	async function handleResetOtp(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true); clearError();
		// Pre-validate before showing password step
		// We'll actually verify in the final step with the new password
		setStep("new-password");
		setLoading(false);
	}

	// ---- Reset: new password ----
	async function handleNewPassword(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true); clearError();
		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tempToken: resetTempToken, otp: resetOtp, newPassword }),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to reset password");
				if (data.error?.includes("expired") || data.error?.includes("start over")) {
					goTo("forgot");
				}
				return;
			}
			setResetDone(true);
		} catch { setError("Connection error. Please try again."); }
		finally { setLoading(false); }
	}

	// ---- Shared UI ----
	const backBtn = (label: string, onClick: () => void) => (
		<button type="button" onClick={onClick} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
			<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="15 18 9 12 15 6" />
			</svg>
			{label}
		</button>
	);

	const otpInput = (value: string, onChange: (v: string) => void, ref?: React.RefObject<HTMLInputElement | null>) => (
		<input
			ref={ref}
			type="text"
			inputMode="numeric"
			pattern="\d{6}"
			maxLength={6}
			required
			value={value}
			onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
			className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand text-center text-2xl font-mono tracking-widest"
			placeholder="000000"
			autoComplete="one-time-code"
		/>
	);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-dark">
						{step === "credentials" && "Admin Login"}
						{step === "otp" && "Check Your Email"}
						{step === "forgot" && "Forgot Password"}
						{step === "reset-otp" && "Enter Reset Code"}
						{step === "new-password" && "Set New Password"}
					</h1>
					<p className="text-gray-500 text-sm mt-1">Mother of Orphans</p>
				</div>

				{/* Step: credentials */}
				{step === "credentials" && (
					<>
						<a href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
							Back to site
						</a>
						{resetDone && (
							<div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
								Password reset successfully. You can now log in.
							</div>
						)}
						<form onSubmit={handleCredentials} className="space-y-5">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
								<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
									className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
									placeholder="admin@motheroforphans.org" />
							</div>
							<div>
								<div className="flex justify-between items-center mb-1">
									<label className="block text-sm font-medium text-gray-700">Password</label>
									<button type="button" onClick={() => { setForgotEmail(email); goTo("forgot"); }}
										className="text-xs text-brand hover:underline">
										Forgot password?
									</button>
								</div>
								<div className="relative">
									<input type={showPassword ? "text" : "password"} required value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
										placeholder="Enter password" />
									<button type="button" onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
										aria-label={showPassword ? "Hide" : "Show"}>
										{showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
									</button>
								</div>
							</div>
							{error && <p className="text-red-500 text-sm">{error}</p>}
							<button type="submit" disabled={loading}
								className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50">
								{loading ? "Sending code..." : "Continue"}
							</button>
						</form>
					</>
				)}

				{/* Step: login OTP */}
				{step === "otp" && (
					<form onSubmit={handleLoginOtp} className="space-y-5">
						{backBtn("Back", () => goTo("credentials"))}
						<div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-sm text-gray-600">
							A 6-digit code has been sent to <strong>{email}</strong>. Enter it below.
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">One-Time Code</label>
							{otpInput(loginOtp, setLoginOtp, otpRef)}
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<button type="submit" disabled={loading || loginOtp.length !== 6}
							className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50">
							{loading ? "Verifying..." : "Sign In"}
						</button>
					</form>
				)}

				{/* Step: forgot - enter email */}
				{step === "forgot" && (
					<form onSubmit={handleForgot} className="space-y-5">
						{backBtn("Back to login", () => goTo("credentials"))}
						<p className="text-sm text-gray-500">
							Enter your account email and we will send you a reset code.
						</p>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
							<input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
								className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
								placeholder="your@email.com" />
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<button type="submit" disabled={loading}
							className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50">
							{loading ? "Sending..." : "Send Reset Code"}
						</button>
					</form>
				)}

				{/* Step: reset OTP */}
				{step === "reset-otp" && (
					<form onSubmit={handleResetOtp} className="space-y-5">
						{backBtn("Back", () => goTo("forgot"))}
						<div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-sm text-gray-600">
							A reset code has been sent to <strong>{forgotEmail}</strong>.
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Reset Code</label>
							{otpInput(resetOtp, setResetOtp, resetOtpRef)}
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<button type="submit" disabled={loading || resetOtp.length !== 6}
							className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50">
							{loading ? "Checking..." : "Continue"}
						</button>
					</form>
				)}

				{/* Step: new password */}
				{step === "new-password" && (
					<form onSubmit={handleNewPassword} className="space-y-5">
						{backBtn("Back", () => goTo("reset-otp"))}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
							<div className="relative">
								<input type={showNewPassword ? "text" : "password"} required minLength={8}
									value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
									className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
									placeholder="At least 8 characters" />
								<button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									aria-label={showNewPassword ? "Hide" : "Show"}>
									{showNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
								</button>
							</div>
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<button type="submit" disabled={loading || newPassword.length < 8}
							className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50">
							{loading ? "Resetting..." : "Reset Password"}
						</button>
					</form>
				)}

			</div>
		</div>
	);
}
