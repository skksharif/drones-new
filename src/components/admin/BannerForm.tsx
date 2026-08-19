"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Checkbox, Field, Fieldset, Row, TextArea, TextInput } from "./Fields";
import { ImageManager } from "./ImageManager";
import { resubmitted } from "./resubmit";
import { saveBannerAction, type SaveState } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/validate";
import { Button } from "@/components/ui/Button";
import type { BannerDef, CategoryDef } from "@/lib/types";

function SaveBar({ existing }: { existing?: BannerDef }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 z-30 -mx-4 flex items-center justify-between gap-3 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0">
      <Link href="/admin/banners" className="text-sm text-ink-500 hover:text-ink-900">
        Cancel
      </Link>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : existing ? "Save changes" : "Create banner"}
      </Button>
    </div>
  );
}

export function BannerForm({
  banner,
  categories,
  uploadsEnabled,
}: {
  banner?: BannerDef;
  /** Only used to offer sensible link targets. */
  categories: CategoryDef[];
  uploadsEnabled: boolean;
}) {
  const [state, formAction] = useActionState<SaveState, FormData>(saveBannerAction, {});
  const errors = state.errors ?? {};
  const was = resubmitted(state);

  const [headline, setHeadline] = useState(was.text("headline", banner?.headline ?? ""));

  return (
    // Remounting on a rejected submit is what puts the typed values back; see
    // `resubmit.ts`.
    <form action={formAction} key={state.attempt ?? 0} className="space-y-4">
      {banner ? <input type="hidden" name="previousSlug" value={banner.slug} /> : null}

      {state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-brand-700/20 bg-brand-50 px-4 py-3 text-sm text-brand-800"
        >
          {state.message}
        </p>
      ) : null}

      <Fieldset
        legend="Image"
        hint="A wide banner reads best — roughly 1920×780. Only the first image is used."
      >
        <ImageManager
          initialImage={was.text("image", banner?.image ?? "")}
          initialGallery={[]}
          uploadsEnabled={uploadsEnabled}
          hint="To swap the banner, add the new image and remove the old one."
        />
        {errors.image ? <p className="text-xs font-medium text-brand-700">{errors.image}</p> : null}

        <Field
          label="Alt text"
          htmlFor="alt"
          error={errors.alt}
          hint="What a screen reader announces. Describe the offer, not the picture."
        >
          <TextInput
            id="alt"
            name="alt"
            defaultValue={was.text("alt", banner?.alt ?? "")}
            required
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Overlay" hint="Optional. Leave every field blank for a plain image banner.">
        <Row>
          <Field label="Headline" htmlFor="headline">
            <TextInput
              id="headline"
              name="headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </Field>
          <Field
            label="Internal name"
            htmlFor="slug"
            error={errors.slug}
            hint="Identifies this banner in the admin only. Generated from the headline."
          >
            <TextInput
              id="slug"
              name="slug"
              defaultValue={was.text("slug", banner?.slug ?? "")}
              placeholder={slugify(headline) || "banner"}
            />
          </Field>
        </Row>

        <Field label="Sub-line" htmlFor="subline">
          <TextArea
            id="subline"
            name="subline"
            className="min-h-16"
            defaultValue={was.text("subline", banner?.subline ?? "")}
          />
        </Field>

        <Row>
          <Field
            label="Links to"
            htmlFor="href"
            error={errors.href}
            hint="A path on this site, e.g. /category/drones. External links are rejected."
          >
            <TextInput
              id="href"
              name="href"
              defaultValue={was.text("href", banner?.href ?? "")}
              list="banner-targets"
              placeholder="/products"
            />
            <datalist id="banner-targets">
              <option value="/products" />
              <option value="/categories" />
              <option value="/contact" />
              {categories.map((category) => (
                <option key={category.slug} value={`/category/${category.slug}`} />
              ))}
            </datalist>
          </Field>
          <Field
            label="Button label"
            htmlFor="ctaLabel"
            hint="Leave blank to make the whole banner the link."
          >
            <TextInput
              id="ctaLabel"
              name="ctaLabel"
              defaultValue={was.text("ctaLabel", banner?.ctaLabel ?? "")}
            />
          </Field>
        </Row>
      </Fieldset>

      <Fieldset
        legend="Visibility"
        hint="While no banner is active the home page falls back to the automatic offer carousel."
      >
        <Checkbox
          name="active"
          label="Show on the home page"
          hint="Turn this off to park a banner without deleting it."
          defaultChecked={was.checked("active", banner ? banner.active : true)}
        />
      </Fieldset>

      <SaveBar existing={banner} />
    </form>
  );
}
