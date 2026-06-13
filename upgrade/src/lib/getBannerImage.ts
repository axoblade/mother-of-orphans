import { SiteSettings } from "./models/SiteSettings";
import { connectDB } from "./mongodb";

type PageKey = "causes" | "events" | "gallery" | "contact";

const FIELD: Record<PageKey, string> = {
	causes: "causesBannerImage",
	events: "eventsBannerImage",
	gallery: "galleryBannerImage",
	contact: "contactBannerImage",
};

const DEFAULT = "/images/page-banner.jpg";

export async function getBannerImage(page: PageKey): Promise<string> {
	try {
		await connectDB();
		const field = FIELD[page];
		const s = await SiteSettings.findOne({}, { [field]: 1 }).lean() as Record<string, string> | null;
		return s?.[field] || DEFAULT;
	} catch {
		return DEFAULT;
	}
}
