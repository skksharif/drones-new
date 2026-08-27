"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Checkbox, Field, Fieldset, Row, Select, TextArea, TextInput } from "./Fields";
import { ImageManager } from "./ImageManager";
import { resubmitted } from "./resubmit";
import { saveBannerAction, type SaveState } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/validate";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { BannerDef, CategoryDef } from "@/lib/types";

/** Brand-consistent starting points, so a slide never lands on an arbitrary colour. */
const SWATCHES = [
  { value: "#a12d33", label: "Brand red" },
  { value: "#86262c", label: "Deep red" },
  { value: "#16171d", label: "Ink" },
  { value: "#fbbf4d", label: "Gold" },
  { value: "#f7f7f8", label: "Off-white" },
];

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
  const [background, setBackground] = useState(
    was.text("background", banner?.background ?? "image"),
  );
  const [color, setColor] = useState(
    was.text("backgroundColor", banner?.backgroundColor ?? "#a12d33"),
  );
  const [theme, setTheme] = useState(was.text("theme", banner?.theme ?? "light"));

  const isImage = background === "image";
  const validHex = /^#[0-9a-f]{6}$/i.test(color);

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
        legend="Background"
        hint="A photograph, or a flat colour with the copy sitting on top."
      >
        {/* Radios rather than a select: the choice swaps the fields below it,
            so it should be visible at a glance rather than folded away. */}
        <div className="flex gap-2">
          {(
            [
              { value: "image", label: "Image" },
              { value: "color", label: "Solid colour" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                background === option.value
                  ? "border-brand-700/50 bg-brand-50 text-brand-800"
                  : "border-ink-200 text-ink-600 hover:border-brand-700/30",
              )}
            >
              <input
                type="radio"
                name="background"
                value={option.value}
                checked={background === option.value}
                onChange={() => setBackground(option.value)}
                className="size-4 accent-[var(--color-brand-700)]"
              />
              {option.label}
            </label>
          ))}
        </div>

        {isImage ? (
          <>
            <ImageManager
              initialImage={was.text("image", banner?.image ?? "")}
              initialGallery={[]}
              uploadsEnabled={uploadsEnabled}
              hint="To swap the banner, add the new image and remove the old one."
            />
            {errors.image ? (
              <p className="text-xs font-medium text-brand-700">{errors.image}</p>
            ) : null}

            <Field
              label="Alt text"
              htmlFor="alt"
              error={errors.alt}
              hint="What a screen reader announces. Describe the offer, not the picture."
            >
              <TextInput id="alt" name="alt" defaultValue={was.text("alt", banner?.alt ?? "")} />
            </Field>
          </>
        ) : (
          <Field
            label="Colour"
            htmlFor="backgroundColor"
            error={errors.backgroundColor}
            hint="Pick one, or paste a hex value."
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick a colour"
                value={validHex ? color : "#a12d33"}
                onChange={(event) => setColor(event.target.value)}
                className="size-10 shrink-0 cursor-pointer rounded-lg border border-ink-200 bg-white p-1"
              />
              <TextInput
                id="backgroundColor"
                name="backgroundColor"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                spellCheck={false}
                className="font-mono"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  title={swatch.label}
                  aria-label={swatch.label}
                  onClick={() => setColor(swatch.value)}
                  style={{ backgroundColor: swatch.value }}
                  className={cn(
                    "size-7 rounded-lg border transition-transform hover:scale-110",
                    color.toLowerCase() === swatch.value
                      ? "border-brand-700 ring-2 ring-brand-700/25"
                      : "border-ink-200",
                  )}
                />
              ))}
            </div>
          </Field>
        )}

        <Field
          label="Copy colour"
          htmlFor="theme"
          hint="Light for dark backgrounds, dark for pale ones."
        >
          <Select
            id="theme"
            name="theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="light">Light text</option>
            <option value="dark">Dark text</option>
          </Select>
        </Field>
      </Fieldset>

      <Fieldset
        legend="Copy"
        hint={
          isImage
            ? "Optional. Leave every field blank for a plain image banner."
            : "A colour slide is only its copy, so give it at least a headline."
        }
      >
        <Row>
          <Field
            label="Eyebrow"
            htmlFor="eyebrow"
            hint="The small pill above the headline, e.g. “Limited time”."
          >
            <TextInput
              id="eyebrow"
              name="eyebrow"
              defaultValue={was.text("eyebrow", banner?.eyebrow ?? "")}
            />
          </Field>
          <Field label="Headline" htmlFor="headline" error={errors.headline}>
            <TextInput
              id="headline"
              name="headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </Field>
        </Row>

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
        hint="Each live banner is one slide. With none live the home page falls back to the automatic offer carousel."
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
