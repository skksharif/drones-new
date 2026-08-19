import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { BannerForm } from "@/components/admin/BannerForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteBannerAction } from "@/lib/admin/actions";
import { getCatalogue } from "@/lib/catalogue";
import { cloudinaryConfigured } from "@/lib/cloudinary";

export async function generateMetadata({ params }: PageProps<"/admin/banners/[slug]">) {
  const { slug } = await params;
  return { title: `Edit ${slug}` };
}

export default async function EditBannerPage({
  params,
  searchParams,
}: PageProps<"/admin/banners/[slug]">) {
  const { slug } = await params;
  const { error } = await searchParams;
  const { banners, categories } = await getCatalogue();

  const banner = banners.find((b) => b.slug === slug);
  if (!banner) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/banners" className="text-sm text-ink-500 hover:text-ink-900">
            ← Banners
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-ink-900">{banner.headline || banner.slug}</h1>
          <p className="font-mono text-xs text-ink-400">
            {banner.active ? "live on the home page" : "not shown"}
          </p>
        </div>
        <DeleteButton
          action={deleteBannerAction}
          slug={banner.slug}
          label="Delete banner"
          confirm={`Delete this banner? To hide it instead, untick “Show on the home page”.`}
        />
      </div>

      {typeof error === "string" ? <AdminNotice tone="danger">{error}</AdminNotice> : null}

      <BannerForm banner={banner} categories={categories} uploadsEnabled={cloudinaryConfigured()} />
    </div>
  );
}
