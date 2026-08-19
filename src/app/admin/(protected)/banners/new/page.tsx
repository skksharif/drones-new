import Link from "next/link";
import { BannerForm } from "@/components/admin/BannerForm";
import { getCatalogue } from "@/lib/catalogue";
import { cloudinaryConfigured } from "@/lib/cloudinary";

export const metadata = { title: "New banner" };

export default async function NewBannerPage() {
  const { categories } = await getCatalogue();

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/banners" className="text-sm text-ink-500 hover:text-ink-900">
          ← Banners
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-ink-900">New banner</h1>
      </div>
      <BannerForm categories={categories} uploadsEnabled={cloudinaryConfigured()} />
    </div>
  );
}
