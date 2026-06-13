"use client";

import { useEffect } from "react";

interface AdminDialogProps {
	message: string;
	detail?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	danger?: boolean;
	onConfirm?: () => void;
	onClose: () => void;
}

export default function AdminDialog({
	message,
	detail,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	danger = false,
	onConfirm,
	onClose,
}: AdminDialogProps) {
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'
			onClick={onClose}
		>
			<div
				className='bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6'
				onClick={(e) => e.stopPropagation()}
			>
				<p className='font-semibold text-dark text-base leading-snug'>{message}</p>
				{detail && <p className='text-sm text-gray-500 mt-1'>{detail}</p>}

				<div className='mt-5 flex gap-3 justify-end'>
					{onConfirm ? (
						<>
							<button
								onClick={onClose}
								className='px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors'
							>
								{cancelLabel}
							</button>
							<button
								onClick={() => { onConfirm(); onClose(); }}
								className={`px-4 py-2 text-sm rounded-lg font-semibold transition-colors text-white ${
									danger
										? "bg-red-500 hover:bg-red-600"
										: "bg-brand hover:bg-brand-dark"
								}`}
							>
								{confirmLabel}
							</button>
						</>
					) : (
						<button
							onClick={onClose}
							className='px-4 py-2 text-sm rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors'
						>
							OK
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
