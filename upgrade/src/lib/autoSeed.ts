// Auto-seed on first app boot -- idempotent, safe to call repeatedly
// Each collection is checked independently using isDefault markers

import { Cause } from "./models/Cause";
import { Event } from "./models/Event";
import { GalleryImage } from "./models/Gallery";
import { SiteSettings } from "./models/SiteSettings";
import { Slider } from "./models/Slider";
import { User } from "./models/User";
import { connectDB } from "./mongodb";

let seeded = false;

export async function autoSeed(): Promise<void> {
	if (seeded) return;

	try {
		await connectDB();

		// Admin user
		const adminExists = await User.findOne({
			email: "admin@motheroforphans.org",
		});
		if (!adminExists) {
			await User.create({
				email: "admin@motheroforphans.org",
				password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
				name: "Admin",
				role: "admin",
			});
			console.log("Admin user created");
		}

		// Site settings (logo, favicon, about, mission, vision, core values, team)
		const settingsExist = await SiteSettings.findOne().lean() as Record<string, unknown> | null;
		if (!settingsExist) {
			await SiteSettings.create({
				logo: "/images/logo.png",
				logoWhite: "/images/logo-white.png",
				favicon: "/images/favicon.png",
				aboutTitle: "A small charity has a big impact",
				aboutText:
					"Mother of Orphans is a fully incorporated community-based charity organization founded in 2016 by Ms. Nalumansi Sania. We are dedicated to transforming the lives of orphans, widows, single mothers, elderly persons, and persons with disabilities across Uganda.",
				missionText:
					"To transform and improve the quality of life of vulnerable and marginalized groups including widowed and single mothers, elderly persons, persons with disabilities, orphaned and abandoned children through education support, healthcare, water and sanitation, and economic empowerment.",
				visionText:
					"Mother of Orphans envisions a society that is God-fearing, educated, healthy, and economically empowered with the ability to sustain itself.",
				stats: [
					{ label: "Volunteers", value: "400+" },
					{ label: "Years Experience", value: "8+" },
					{ label: "Active Causes", value: "15+" },
					{ label: "Lives Impacted", value: "5000+" },
				],
				coreValues: [
					{ title: "Compassion", description: "We care and act to alleviate suffering and improve lives." },
					{ title: "Integrity", description: "We are transparent, honest, and accountable in all we do." },
					{ title: "Inclusivity", description: "We serve all people regardless of background or belief." },
					{ title: "Sustainability", description: "We create lasting change through empowerment and education." },
				],
				teamMembers: [
					{ name: "Ms Nalumansi Sania", role: "Founder and Director", image: "" },
					{ name: "Nalumansi Faridah Kirabo", role: "Treasurer", image: "" },
					{ name: "Nalumansi Hamidah Kirabo", role: "Programs Manager", image: "" },
				],
				ctaTitle: "Together We Can Make a Difference",
				ctaText:
					"Your generosity can change lives. Join us in supporting orphans and vulnerable communities across Uganda.",
			});
			console.log("Site settings created");
		} else {
			// Backfill new fields on existing settings document
			const patch: Record<string, unknown> = {};
			if (!settingsExist.coreValues) {
				patch.coreValues = [
					{ title: "Compassion", description: "We care and act to alleviate suffering and improve lives." },
					{ title: "Integrity", description: "We are transparent, honest, and accountable in all we do." },
					{ title: "Inclusivity", description: "We serve all people regardless of background or belief." },
					{ title: "Sustainability", description: "We create lasting change through empowerment and education." },
				];
			}
			if (!settingsExist.teamMembers) {
				patch.teamMembers = [
					{ name: "Ms Nalumansi Sania", role: "Founder and Director", image: "" },
					{ name: "Nalumansi Faridah Kirabo", role: "Treasurer", image: "" },
					{ name: "Nalumansi Hamidah Kirabo", role: "Programs Manager", image: "" },
				];
			}
			if (Object.keys(patch).length > 0) {
				await SiteSettings.updateOne({}, { $set: patch });
			}
		}

		// Hero Sliders -- seed from root site slider images
		const anySliderExists = await Slider.findOne({ image: "/images/slider/slider-1.jpg" }).lean();
		if (anySliderExists && !(anySliderExists as { isDefault?: boolean }).isDefault) {
			await Slider.updateMany(
				{ image: { $in: ["/images/slider/slider-1.jpg","/images/slider/slider-2.jpg","/images/slider/slider-3.jpg","/images/slider/image-4.jpg"] } },
				{ $set: { isDefault: true } },
			);
		}
		const defaultSlidersExist = await Slider.findOne({ isDefault: true }).lean();
		if (!defaultSlidersExist) {
			await Slider.insertMany([
				{
					title: "Supporting Orphans and the Needy",
					subtitle: "Giving hope by",
					text: "We reach out to them because they need our help more",
					image: "/images/slider/slider-1.jpg",
					active: true,
					order: 1,
					isDefault: true,
				},
				{
					title: "Together We Can Make a Difference",
					subtitle: "To change lives",
					text: "",
					image: "/images/slider/slider-2.jpg",
					active: true,
					order: 2,
					isDefault: true,
				},
				{
					title: "Giving Smiles",
					subtitle: "",
					text: "To improve the lives of orphans across the country.",
					image: "/images/slider/slider-3.jpg",
					active: true,
					order: 3,
					isDefault: true,
				},
				{
					title: "We Are Their Hope",
					subtitle: "",
					text: "To improve the lives of orphans across the country.",
					image: "/images/slider/image-4.jpg",
					active: true,
					order: 4,
					isDefault: true,
				},
			]);
			console.log("Hero sliders seeded");
		}

		// Causes -- from the existing site (causes.php)
		// Check by slug to handle DBs seeded before isDefault was added
		const anyCauseExists = await Cause.findOne({ slug: "dawah-activities" }).lean();
		if (anyCauseExists && !(anyCauseExists as { isDefault?: boolean }).isDefault) {
			// Backfill isDefault on existing seeded causes
			await Cause.updateMany(
				{ slug: { $in: ["dawah-activities","care-for-the-orphans","relief-for-refugees","shelter-provision","clean-water-for-communities","medical-assistance"] } },
				{ $set: { isDefault: true } },
			);
		}
		const defaultCausesExist = await Cause.findOne({ isDefault: true }).lean();
		if (!defaultCausesExist) {
			await Cause.insertMany([
				{
					title: "Dawah Activities",
					slug: "dawah-activities",
					summary: "Struggling in the Path of Allah is our major target",
					description:
						"We conduct regular Dawah activities to spread awareness and provide spiritual support to communities in need across Uganda.",
					image: "/images/causes/education.jpg",
					goal: 100000,
					raised: 12000,
					featured: true,
					active: true,
					isDefault: true,
				},
				{
					title: "Care for the Orphans",
					slug: "care-for-the-orphans",
					summary: "Extending relief to the orphans in the needy areas",
					description:
						"We provide comprehensive care for orphaned children including shelter, food, education support, and emotional counseling to help them build a better future.",
					image: "/images/causes/healthcare.jpg",
					goal: 200000,
					raised: 7800,
					featured: true,
					active: true,
					isDefault: true,
				},
				{
					title: "Relief for Refugees",
					slug: "relief-for-refugees",
					summary:
						"We reach out to refugees in the different concentration camps",
					description:
						"Our refugee relief program delivers food, clothing, medical supplies, and psychosocial support to displaced families living in refugee camps across Uganda.",
					image: "/images/causes/relief-1.jpg",
					goal: 120000,
					raised: 9000,
					featured: false,
					active: true,
					isDefault: true,
				},
				{
					title: "Shelter Provision",
					slug: "shelter-provision",
					summary:
						"We provide housing to the people affected by poverty, floods and other natural disasters",
					description:
						"We construct and rehabilitate shelters for families displaced by poverty, floods, and other natural disasters, ensuring they have safe and dignified living conditions.",
					image: "/images/causes/relief-2.jpg",
					goal: 150000,
					raised: 6000,
					featured: false,
					active: true,
					isDefault: true,
				},
				{
					title: "Clean Water for Communities",
					slug: "clean-water-for-communities",
					summary: "We build boreholes for water-deprived communities",
					description:
						"Access to clean water saves lives. We construct boreholes and water purification systems in communities that lack safe drinking water, reducing waterborne diseases.",
					image: "/images/causes/water.jpg",
					goal: 100000,
					raised: 4000,
					featured: true,
					active: true,
					isDefault: true,
				},
				{
					title: "Medical Assistance",
					slug: "medical-assistance",
					summary:
						"We extend relief to vulnerable people who need medical services",
					description:
						"We organize medical camps and outreaches providing free check-ups, treatment, medicine, and health education to communities with limited access to healthcare.",
					image: "/images/causes/relief-3.jpg",
					goal: 100000,
					raised: 7000,
					featured: false,
					active: true,
					isDefault: true,
				},
			]);
			console.log("Causes seeded");
		}

		// Events -- from the existing site (events.php)
		const anyEventExists = await Event.findOne({ slug: "kids-day-out" }).lean();
		if (anyEventExists && !(anyEventExists as { isDefault?: boolean }).isDefault) {
			await Event.updateMany(
				{ slug: { $in: ["kids-day-out","refugee-relief-flag-off","food-relief-flag-off","vulnerable-groups-outreach","clean-water-initiative-launch"] } },
				{ $set: { isDefault: true } },
			);
		}
		const defaultEventsExist = await Event.findOne({ isDefault: true }).lean();
		if (!defaultEventsExist) {
			await Event.insertMany([
				{
					title: "Kids Day Out",
					slug: "kids-day-out",
					summary:
						"Preparing children for a future community with values of charity",
					description:
						"We organized a fun and educational day out for orphaned children, instilling values of sharing, gratitude, and community service in the next generation.",
					image: "/images/events/event-7-1.jpg",
					location: "Kampala, Uganda",
					eventDate: new Date("2024-06-15"),
					featured: false,
					active: true,
					isDefault: true,
				},
				{
					title: "Refugee Relief Flag Off",
					slug: "refugee-relief-flag-off",
					summary: "We flagged off a campaign to provide relief to refugees",
					description:
						"A major campaign launching relief distributions to refugee settlements across Uganda, delivering food, medical supplies, and household essentials to thousands of families.",
					image: "/images/events/event-7-2.jpg",
					location: "Nakivale Refugee Settlement, Uganda",
					eventDate: new Date("2024-03-20"),
					featured: true,
					active: true,
					isDefault: true,
				},
				{
					title: "Food Relief Flag Off",
					slug: "food-relief-flag-off",
					summary:
						"We distributed food to the people affected by hunger in Buvuma Island",
					description:
						"A food distribution drive delivering essential food supplies including rice, beans, cooking oil, and maize flour to families on Buvuma Island who were severely affected by hunger.",
					image: "/images/events/event-7-3.jpg",
					location: "Buvuma Island, Uganda",
					eventDate: new Date("2024-01-10"),
					featured: false,
					active: true,
					isDefault: true,
				},
				{
					title: "Vulnerable Groups Outreach",
					slug: "vulnerable-groups-outreach",
					summary:
						"We gave out wheelchairs, food and household supplies to vulnerable people",
					description:
						"A comprehensive outreach program providing wheelchairs, food packages, and essential household supplies to persons with disabilities, elderly individuals, and other vulnerable groups.",
					image: "/images/events/gala.jpg",
					location: "Kampala, Uganda",
					eventDate: new Date("2023-11-25"),
					featured: true,
					active: true,
					isDefault: true,
				},
				{
					title: "Clean Water Initiative Launch",
					slug: "clean-water-initiative-launch",
					summary:
						"Provided clean water boreholes to remote villages in Northern Uganda",
					description:
						"We completed and commissioned multiple boreholes in remote villages in Northern Uganda, providing sustainable access to clean water for thousands of community members.",
					image: "/images/causes/water.jpg",
					location: "Northern Uganda",
					eventDate: new Date("2023-09-05"),
					featured: false,
					active: true,
					isDefault: true,
				},
			]);
			console.log("Events seeded");
		}

		// Gallery -- from upgrade public images
		const anyGalleryExists = await GalleryImage.findOne({ image: "/images/gallery/image-1.jpg" }).lean();
		if (anyGalleryExists && !(anyGalleryExists as { isDefault?: boolean }).isDefault) {
			await GalleryImage.updateMany(
				{ image: { $in: ["/images/gallery/image-1.jpg","/images/gallery/image-2.jpg","/images/gallery/image-3.jpg","/images/gallery/image-15.jpg","/images/gallery/image-16.jpg","/images/gallery/image-17.jpg"] } },
				{ $set: { isDefault: true, active: true } },
			);
		}
		const defaultGalleryExist = await GalleryImage.findOne({
			isDefault: true,
		}).lean();
		if (!defaultGalleryExist) {
			await GalleryImage.insertMany([
				{
					title: "Children Receiving School Supplies",
					image: "/images/gallery/image-1.jpg",
					category: "Education",
					featured: true,
					active: true,
					order: 1,
					isDefault: true,
				},
				{
					title: "Children Learning Together",
					image: "/images/gallery/image-2.jpg",
					category: "Education",
					featured: true,
					active: true,
					order: 2,
					isDefault: true,
				},
				{
					title: "Community Outreach Program",
					image: "/images/gallery/image-3.jpg",
					category: "Community",
					featured: false,
					active: true,
					order: 3,
					isDefault: true,
				},
				{
					title: "Healthcare Services",
					image: "/images/gallery/image-15.jpg",
					category: "Healthcare",
					featured: true,
					active: true,
					order: 4,
					isDefault: true,
				},
				{
					title: "Water Project Completion",
					image: "/images/gallery/image-16.jpg",
					category: "Water",
					featured: false,
					active: true,
					order: 5,
					isDefault: true,
				},
				{
					title: "Food Distribution",
					image: "/images/gallery/image-17.jpg",
					category: "Food",
					featured: false,
					active: true,
					order: 6,
					isDefault: true,
				},
			]);
			console.log("Gallery seeded");
		}

		console.log("Auto-seed complete");
		seeded = true;
	} catch (err) {
		console.warn(
			"Auto-seed skipped (DB unavailable):",
			(err as Error).message,
		);
	}
}
