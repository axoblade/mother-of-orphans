import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/ui/Icons";
import { getBannerImage } from "@/lib/getBannerImage";
import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
	const bannerImage = await getBannerImage("contact");

	return (
		<>
			<section className='relative py-24 bg-dark'>
				<img
					src={bannerImage}
					alt=''
					className='absolute inset-0 w-full h-full object-cover opacity-20'
				/>
				<div className='relative z-10 max-w-7xl mx-auto px-4 text-center text-white'>
					<h1 className='text-4xl md:text-5xl font-bold mb-3'>Contact Us</h1>
					<p className='text-white/60 text-sm'>Home / Contact Us</p>
				</div>
			</section>

			<section className='py-20'>
				<div className='max-w-5xl mx-auto px-4'>
					<div className='grid md:grid-cols-3 gap-8 mb-16'>
						{[
							{
								Icon: MapPinIcon,
								title: "Address",
								detail: "Makindye Luwafu, Kampala (U)",
							},
							{
								Icon: MailIcon,
								title: "Email",
								detail: "info@motheroforphans.org",
							},
							{ Icon: PhoneIcon, title: "Phone", detail: "+256 786 224 398" },
						].map((item) => (
							<div
								key={item.title}
								className='text-center p-6 bg-gray-50 rounded-xl'
							>
								<item.Icon className='w-8 h-8 mx-auto mb-3 text-[#ed6221]' />
								<h4 className='font-semibold text-[#302c51] mb-1'>
									{item.title}
								</h4>
								<p className='text-gray-500 text-sm'>{item.detail}</p>
							</div>
						))}
					</div>

					<div className='max-w-2xl mx-auto'>
						<h2 className='text-2xl font-bold text-[#302c51] mb-6 text-center'>
							Send us a Message
						</h2>
						<ContactForm />
					</div>
				</div>
			</section>
		</>
	);
}
