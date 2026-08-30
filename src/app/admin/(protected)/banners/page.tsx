import Image from "next/image";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { ButtonLink } from "@/components/ui/Button";
import { getCatalogue } from "@/lib/catalogue";

export const metadata = { title: "Banners" };

export default async function AdminBannersPage({ searchParams }: PageProps<"/admin/banners">) {
  const { banners } = await getCatalogue();
  const params = await searchParams;
  const active = banners.filter((banner) => banner.active).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Home banners</h1>
          <p className="mt-1 text-sm text-ink-500">
            {active > 0
              ? `${active} slide${active === 1 ? "" : "s"} on the home page — one per live banner, replacing the automatic offer carousel.`
              : "No live banners, so the home page is showing the automatic offer carousel."}
          </p>
        </div>
        <ButtonLink href="/admin/banners/new">New banner</ButtonLink>
      </div>

      {typeof params.saved === "string" ? (
        <AdminNotice tone="success">Saved &ldquo;{params.saved}&rdquo;.</AdminNotice>
      ) : null}
      {typeof params.deleted === "string" ? (
        <AdminNotice tone="success">Deleted &ldquo;{params.deleted}&rdquo;.</AdminNotice>
      ) : null}
      {banners.length === 0 ? (
        <div className="rounded-[var(--radius-card)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm text-ink-600">No banners yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            Until you add one, the home page builds its own carousel from whatever is currently
            discounted — so it can never advertise an offer you do not have. Adding a banner takes
            that slot over.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
          <ul className="divide-y divide-ink-100">
            {banners.map((banner, index) => (
              <li key={banner.slug} className="flex items-center gap-2 pl-2">
                <MoveButtons
                  kind="banners"
                  slug={banner.slug}
                  first={index === 0}
                  last={index === banners.length - 1}
                />
                <Link
                  href={`/admin/banners/${banner.slug}`}
                  className="-ml-1 flex flex-1 items-center gap-3 p-3 transition-colors hover:bg-ink-50"
                >
                  {banner.background === "color" || !banner.image ? (
                    <span
                      aria-hidden
                      style={{ backgroundColor: banner.backgroundColor }}
                      className="h-14 w-32 shrink-0 rounded-lg border border-ink-200"
                    />
                  ) : (
                    <Image
                      src={banner.image}
                      alt=""
                      width={160}
                      height={65}
                      className="h-14 w-32 shrink-0 rounded-lg bg-ink-50 object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {banner.headline || banner.slug}
                    </p>
                    <p className="truncate font-mono text-xs text-ink-400">
                      {banner.background === "color"
                        ? (banner.backgroundColor ?? "colour")
                        : "image"}{" "}
                      · {banner.href ?? "not linked"}
                    </p>
                  </div>
                  <span
                    className={
                      banner.active
                        ? "shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900"
                        : "shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500"
                    }
                  >
                    {banner.active ? "Live" : "Off"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
