import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteSettings extends Document {
	logo: string;
	logoWhite: string;
	favicon: string;
	aboutTitle: string;
	aboutText: string;
	aboutImage: string;
	causesBannerImage: string;
	eventsBannerImage: string;
	galleryBannerImage: string;
	contactBannerImage: string;
	missionText: string;
	visionText: string;
	stats: { label: string; value: string }[];
	coreValues: { title: string; description: string }[];
	teamMembers: { name: string; role: string; image: string }[];
	ctaTitle: string;
	ctaText: string;
	socialFacebook: string;
	socialInstagram: string;
	socialTwitter: string;
	socialYoutube: string;
	socialWhatsapp: string;
	plugins: { pesapal: boolean };
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
	{
		logo: { type: String, default: "/images/logo.png" },
		logoWhite: { type: String, default: "/images/logo-white.png" },
		favicon: { type: String, default: "/images/favicon.png" },
		aboutTitle: { type: String, default: "A small charity has a big impact" },
		aboutText: {
			type: String,
			default:
				"Mother of Orphans is a fully incorporated community-based charity organization founded in 2016 by Ms. Nalumansi Sania. We are dedicated to transforming the lives of orphans, widows, single mothers, elderly persons, and persons with disabilities across Uganda.",
		},
		aboutImage: { type: String, default: "" },
		causesBannerImage: { type: String, default: "/images/page-banner.jpg" },
		eventsBannerImage: { type: String, default: "/images/page-banner.jpg" },
		galleryBannerImage: { type: String, default: "/images/page-banner.jpg" },
		contactBannerImage: { type: String, default: "/images/page-banner.jpg" },
		missionText: {
			type: String,
			default:
				"To transform and improve the quality of life of vulnerable and marginalized groups including widowed and single mothers, elderly persons, persons with disabilities, orphaned and abandoned children through education support, healthcare, water and sanitation, and economic empowerment.",
		},
		visionText: {
			type: String,
			default:
				"Mother of Orphans envisions a society that is God-fearing, educated, healthy, and economically empowered with the ability to sustain itself.",
		},
		stats: {
			type: [{ label: { type: String }, value: { type: String } }],
			default: [
				{ label: "Volunteers", value: "400+" },
				{ label: "Years Experience", value: "8+" },
				{ label: "Active Causes", value: "15+" },
				{ label: "Lives Impacted", value: "5000+" },
			],
		},
		coreValues: {
			type: [{ title: { type: String }, description: { type: String } }],
			default: [
				{
					title: "Compassion",
					description:
						"We care and act to alleviate suffering and improve lives.",
				},
				{
					title: "Integrity",
					description:
						"We are transparent, honest, and accountable in all we do.",
				},
				{
					title: "Inclusivity",
					description:
						"We serve all people regardless of background or belief.",
				},
				{
					title: "Sustainability",
					description:
						"We create lasting change through empowerment and education.",
				},
			],
		},
		teamMembers: {
			type: [
				{
					name: { type: String },
					role: { type: String },
					image: { type: String },
				},
			],
			default: [
				{ name: "Ms Nalumansi Sania", role: "Founder and Director", image: "" },
				{ name: "Nalumansi Faridah Kirabo", role: "Treasurer", image: "" },
				{
					name: "Nalumansi Hamidah Kirabo",
					role: "Programs Manager",
					image: "",
				},
			],
		},
		ctaTitle: { type: String, default: "Together We Can Make a Difference" },
		ctaText: {
			type: String,
			default:
				"Your generosity can change lives. Join us in supporting orphans and vulnerable communities across Uganda.",
		},
		socialFacebook: { type: String, default: "" },
		socialInstagram: { type: String, default: "" },
		socialTwitter: { type: String, default: "" },
		socialYoutube: { type: String, default: "" },
		socialWhatsapp: { type: String, default: "" },
		plugins: {
			type: { pesapal: { type: Boolean, default: false } },
			default: { pesapal: false },
		},
	},
	{ timestamps: true },
);

export const SiteSettings: Model<ISiteSettings> =
	mongoose.models.SiteSettings ||
	mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
