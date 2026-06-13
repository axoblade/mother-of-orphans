"use client";

export default function NewsletterForm() {
	return (
		<form className='flex flex-col gap-2' onSubmit={(e) => e.preventDefault()}>
			<input
				type='email'
				placeholder='Email Address...'
				className='px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-brand text-sm'
			/>
			<button
				type='submit'
				className='px-4 py-2.5 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors'
			>
				Subscribe
			</button>
		</form>
	);
}
