"use client";

import { useEffect, useState } from "react";

interface DonationRecord {
	_id: string;
	orderTrackingId: string;
	merchantReference: string;
	amount: number;
	currency: string;
	status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
	description: string;
	donorName?: string;
	donorEmail?: string;
	donorPhone?: string;
	paymentMethod?: string;
	confirmationCode?: string;
	statusDescription?: string;
	createdAt: string;
	updatedAt: string;
}

const statusBadge: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	COMPLETED: "bg-green-100 text-green-800",
	FAILED: "bg-red-100 text-red-800",
	CANCELLED: "bg-gray-100 text-gray-600",
};

export default function AdminDonations() {
	const [donations, setDonations] = useState<DonationRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		total: 0,
		pages: 0,
	});
	const [statusFilter, setStatusFilter] = useState("");
	const [search, setSearch] = useState("");
	const [selectedDonation, setSelectedDonation] =
		useState<DonationRecord | null>(null);

	async function fetchDonations(p: number = page) {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.set("page", String(p));
			params.set("limit", "20");
			if (statusFilter) params.set("status", statusFilter);
			if (search) params.set("search", search);

			const res = await fetch(`/api/donations?${params.toString()}`);
			if (!res.ok) throw new Error("Failed to load donations");

			const data = await res.json();
			setDonations(data.donations);
			setPagination(data.pagination);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to load donations");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchDonations(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusFilter]);

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		setPage(1);
		fetchDonations(1);
	}

	return (
		<div className='p-6 md:p-10'>
			<div className='max-w-6xl mx-auto'>
				<h1 className='text-2xl font-bold text-dark mb-6'>Donations</h1>

				{/* Summary stats */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
					{[
						{ label: "Total Donations", value: pagination.total },
						{
							label: "Completed",
							value: donations.filter((d) => d.status === "COMPLETED").length,
						},
						{
							label: "Pending",
							value: donations.filter((d) => d.status === "PENDING").length,
						},
						{
							label: "Failed",
							value: donations.filter((d) => d.status === "FAILED").length,
						},
					].map((stat) => (
						<div
							key={stat.label}
							className='bg-white rounded-xl p-5 shadow-sm border border-gray-100'
						>
							<p className='text-2xl font-bold text-dark'>{stat.value}</p>
							<p className='text-sm text-gray-500 mt-1'>{stat.label}</p>
						</div>
					))}
				</div>

				{/* Filters */}
				<div className='flex flex-col sm:flex-row gap-4 mb-6'>
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value);
							setPage(1);
						}}
						className='px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/30'
					>
						<option value=''>All Statuses</option>
						<option value='PENDING'>Pending</option>
						<option value='COMPLETED'>Completed</option>
						<option value='FAILED'>Failed</option>
						<option value='CANCELLED'>Cancelled</option>
					</select>

					<form onSubmit={handleSearch} className='flex gap-2 flex-1'>
						<input
							type='text'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder='Search by name, email, reference...'
							className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/30'
						/>
						<button
							type='submit'
							className='px-5 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-dark'
						>
							Search
						</button>
					</form>
				</div>

				{error && (
					<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
						{error}
					</div>
				)}

				{/* Table */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full text-sm'>
							<thead>
								<tr className='border-b bg-gray-50'>
									<th className='text-left px-4 py-3 font-semibold text-gray-600'>
										Reference
									</th>
									<th className='text-left px-4 py-3 font-semibold text-gray-600'>
										Donor
									</th>
									<th className='text-left px-4 py-3 font-semibold text-gray-600'>
										Amount
									</th>
									<th className='text-left px-4 py-3 font-semibold text-gray-600'>
										Status
									</th>
									<th className='text-left px-4 py-3 font-semibold text-gray-600'>
										Date
									</th>
									<th className='text-left px-4 py-3 font-semibold text-gray-600'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={6} className='text-center py-12 text-gray-400'>
											Loading...
										</td>
									</tr>
								) : donations.length === 0 ? (
									<tr>
										<td colSpan={6} className='text-center py-12 text-gray-400'>
											No donations found.
										</td>
									</tr>
								) : (
									donations.map((d) => (
										<tr key={d._id} className='border-b hover:bg-gray-50'>
											<td className='px-4 py-3 font-mono text-xs text-gray-500'>
												{d.merchantReference}
											</td>
											<td className='px-4 py-3'>
												<p className='font-medium text-dark'>
													{d.donorName || "Anonymous"}
												</p>
												{d.donorEmail && (
													<p className='text-xs text-gray-400'>
														{d.donorEmail}
													</p>
												)}
											</td>
											<td className='px-4 py-3 font-semibold text-dark'>
												${d.amount.toFixed(2)} {d.currency}
											</td>
											<td className='px-4 py-3'>
												<span
													className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
														statusBadge[d.status] || "bg-gray-100 text-gray-600"
													}`}
												>
													{d.status}
												</span>
											</td>
											<td className='px-4 py-3 text-gray-500 text-xs'>
												{new Date(d.createdAt).toLocaleDateString()}
											</td>
											<td className='px-4 py-3'>
												<button
													onClick={() => setSelectedDonation(d)}
													className='text-brand text-xs font-semibold hover:underline'
												>
													View
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{pagination.pages > 1 && (
						<div className='flex items-center justify-between px-4 py-3 border-t bg-gray-50'>
							<button
								onClick={() => {
									setPage(page - 1);
									fetchDonations(page - 1);
								}}
								disabled={page <= 1}
								className='px-4 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white'
							>
								Previous
							</button>
							<span className='text-sm text-gray-500'>
								Page {pagination.page} of {pagination.pages}
							</span>
							<button
								onClick={() => {
									setPage(page + 1);
									fetchDonations(page + 1);
								}}
								disabled={page >= pagination.pages}
								className='px-4 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white'
							>
								Next
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Detail modal */}
			{selectedDonation && (
				<div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4'>
					<div className='bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-lg font-bold text-dark'>Donation Details</h3>
							<button
								onClick={() => setSelectedDonation(null)}
								className='p-1.5 rounded-lg hover:bg-gray-100 text-gray-400'
							>
								<svg
									className='w-5 h-5'
									fill='none'
									stroke='currentColor'
									strokeWidth={2}
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4 text-sm'>
								<div>
									<p className='text-gray-400 mb-1'>Reference</p>
									<p className='font-mono font-semibold text-dark'>
										{selectedDonation.merchantReference}
									</p>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>Status</p>
									<span
										className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
											statusBadge[selectedDonation.status] ||
											"bg-gray-100 text-gray-600"
										}`}
									>
										{selectedDonation.status}
									</span>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>Amount</p>
									<p className='font-bold text-dark text-lg'>
										${selectedDonation.amount.toFixed(2)}{" "}
										{selectedDonation.currency}
									</p>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>Date</p>
									<p className='text-dark'>
										{new Date(selectedDonation.createdAt).toLocaleString()}
									</p>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>Donor Name</p>
									<p className='text-dark'>
										{selectedDonation.donorName || "—"}
									</p>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>Donor Email</p>
									<p className='text-dark break-all'>
										{selectedDonation.donorEmail || "—"}
									</p>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>Donor Phone</p>
									<p className='text-dark'>
										{selectedDonation.donorPhone || "—"}
									</p>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>Payment Method</p>
									<p className='text-dark'>
										{selectedDonation.paymentMethod || "—"}
									</p>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>PesaPal Tracking ID</p>
									<p className='font-mono text-xs text-dark break-all'>
										{selectedDonation.orderTrackingId}
									</p>
								</div>
								<div>
									<p className='text-gray-400 mb-1'>Confirmation Code</p>
									<p className='font-mono text-dark'>
										{selectedDonation.confirmationCode || "—"}
									</p>
								</div>
							</div>

							<div>
								<p className='text-gray-400 mb-1 text-sm'>Description</p>
								<p className='text-dark text-sm'>
									{selectedDonation.description}
								</p>
							</div>

							{selectedDonation.statusDescription && (
								<div>
									<p className='text-gray-400 mb-1 text-sm'>
										Status Description
									</p>
									<p className='text-dark text-sm'>
										{selectedDonation.statusDescription}
									</p>
								</div>
							)}
						</div>

						<div className='mt-6 pt-4 border-t'>
							<button
								onClick={() => setSelectedDonation(null)}
								className='w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200'
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
