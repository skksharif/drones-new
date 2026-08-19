"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Combobox, type ComboOption } from "./Combobox";
import { Checkbox, Field, Fieldset, Row, Select, TextArea, TextInput } from "./Fields";
import { ImageManager } from "./ImageManager";
import { resubmitted } from "./resubmit";
import { TagEditor } from "./TagEditor";
import { saveProductAction, type SaveState } from "@/lib/admin/actions";
import {
  AVAILABILITY,
  AVAILABILITY_LABELS,
  GROUPS,
  parseTags,
  serialiseSpecs,
  slugify,
} from "@/lib/admin/validate";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatPrice } from "@/lib/format";
import type { CategoryDef, Product } from "@/lib/types";

function SaveBar({ product }: { product?: Product }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 z-30 -mx-4 flex items-center justify-between gap-3 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-b-[var(--radius-card)]">
      <Link href="/admin/products" className="text-sm text-ink-500 hover:text-ink-900">
        Cancel
      </Link>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </Button>
    </div>
  );
}

/** Mirrors the badge the storefront renders, so the discount is visible while typing. */
function DiscountPreview({ price, compareAt }: { price: string; compareAt: string }) {
  const p = Number(price.replace(/[,\s₹]/g, ""));
  const c = Number(compareAt.replace(/[,\s₹]/g, ""));
  if (!Number.isFinite(p) || !Number.isFinite(c) || !price || !compareAt || c <= p) return null;

  return (
    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold text-ink-900">{formatPrice(p)}</span>
      <s className="text-ink-400">{formatPrice(c)}</s>
      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">
        {Math.round(((c - p) / c) * 100)}% off
      </span>
    </p>
  );
}

export function ProductForm({
  product,
  categories,
  subTypes,
  productCounts,
  uploadsEnabled,
}: {
  product?: Product;
  categories: CategoryDef[];
  /** Sub-type suggestions per category slug — declared plus in use. */
  subTypes: Record<string, string[]>;
  /** How many products sit in each category, shown beside the option. */
  productCounts: Record<string, number>;
  /** False when Cloudinary is unconfigured; the form falls back to pasting paths. */
  uploadsEnabled: boolean;
}) {
  const [state, formAction] = useActionState<SaveState, FormData>(saveProductAction, {});
  const errors = state.errors ?? {};
  const was = resubmitted(state);

  const [name, setName] = useState(was.text("name", product?.name ?? ""));
  const [slug, setSlug] = useState(was.text("slug", product?.slug ?? ""));
  const [price, setPrice] = useState(
    was.text("price", product?.price != null ? String(product.price) : ""),
  );
  const [compareAt, setCompareAt] = useState(
    was.text(
      "compareAtPrice",
      product?.compareAtPrice != null ? String(product.compareAtPrice) : "",
    ),
  );
  const [category, setCategory] = useState(
    was.text("category", product?.category ?? categories[0]?.slug ?? ""),
  );
  const [type, setType] = useState(was.text("type", product?.type ?? ""));
  const [group, setGroup] = useState(
    was.text(
      "group",
      product?.group ??
        categories.find((c) => c.slug === (product?.category ?? categories[0]?.slug))?.group ??
        "part",
    ),
  );

  const categoryOptions: ComboOption[] = categories.map((c) => {
    const count = productCounts[c.slug] ?? 0;
    return {
      value: c.slug,
      label: c.name,
      hint: `${count}`,
      icon: <CategoryIcon slug={c.slug} className="size-4" />,
    };
  });

  const typeOptions: ComboOption[] = (subTypes[category] ?? []).map((t) => ({
    value: t,
    label: t,
  }));

  /**
   * A sub-type belongs to its category, so moving the product has to clear one
   * that no longer applies — otherwise a frame keeps "Spraying Drone" and lands
   * in a filter facet nothing else shares. The group follows the category too,
   * and stays overridable afterwards.
   */
  function changeCategory(next: string) {
    setCategory(next);
    if (type && !(subTypes[next] ?? []).includes(type)) setType("");
    const nextGroup = categories.find((c) => c.slug === next)?.group;
    if (nextGroup) setGroup(nextGroup);
  }

  // Only auto-fill the slug while creating: changing it on an existing product
  // breaks its URL, so that has to be a deliberate edit.
  const slugPlaceholder = product ? product.slug : slugify(name);

  return (
    // Remounting on a rejected submit is what puts the typed values back; see
    // `resubmit.ts`.
    <form action={formAction} key={state.attempt ?? 0} className="space-y-4">
      {product ? <input type="hidden" name="previousSlug" value={product.slug} /> : null}

      {state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-brand-700/20 bg-brand-50 px-4 py-3 text-sm text-brand-800"
        >
          {state.message}
        </p>
      ) : null}

      <Fieldset legend="Identity" hint="What the product is called, and where it lives.">
        <Row>
          <Field label="Name" htmlFor="name" error={errors.name}>
            <TextInput
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field
            label="Short name"
            htmlFor="shortName"
            hint="Used in breadcrumbs and cart rows. Defaults to the name."
          >
            <TextInput
              id="shortName"
              name="shortName"
              defaultValue={was.text("shortName", product?.shortName ?? "")}
            />
          </Field>
        </Row>

        <Row>
          <Field
            label="URL slug"
            htmlFor="slug"
            error={errors.slug}
            hint={
              product
                ? "Changing this changes the product’s public URL."
                : "Generated from the name."
            }
          >
            <TextInput
              id="slug"
              name="slug"
              value={slug}
              placeholder={slugPlaceholder}
              onChange={(event) => setSlug(event.target.value)}
            />
          </Field>
          <Field label="Brand" htmlFor="brand">
            <TextInput
              id="brand"
              name="brand"
              defaultValue={was.text("brand", product?.brand ?? "AgroSky")}
            />
          </Field>
        </Row>

        <Row>
          <Field
            label="Category"
            htmlFor="category"
            error={errors.category}
            hint="Where the product is filed. The number is how many it already holds."
          >
            <Combobox
              id="category"
              name="category"
              value={category}
              onChange={changeCategory}
              options={categoryOptions}
              placeholder="Search categories…"
              emptyLabel="No category matches"
              invalid={Boolean(errors.category)}
            />
          </Field>
          <Field
            label="Sub-type"
            htmlFor="type"
            hint={
              typeOptions.length > 0
                ? "Narrows the category in the filters. Pick one or type a new one."
                : "This category has no sub-types yet — type one to start it off."
            }
          >
            <Combobox
              id="type"
              name="type"
              value={type}
              onChange={setType}
              options={typeOptions}
              allowCustom
              placeholder={typeOptions[0]?.label ?? "e.g. Folding Propeller"}
              emptyLabel="No suggestion matches — it will be added as typed"
            />
          </Field>
        </Row>

        <Row>
          <Field label="Group" htmlFor="group" hint="Drones sort ahead of parts on the home page.">
            <Select
              id="group"
              name="group"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
            >
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g === "drone" ? "Drone" : "Part"}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Added on"
            htmlFor="addedAt"
            error={errors.addedAt}
            hint="Drives the “Newest” sort and the New badge."
          >
            <TextInput
              id="addedAt"
              name="addedAt"
              type="date"
              defaultValue={was.text("addedAt", product?.addedAt ?? "")}
            />
          </Field>
        </Row>
      </Fieldset>

      <Fieldset
        legend="Pricing"
        hint="Leave the price blank for “Price on request”. There is no checkout — every price is an enquiry starting point."
      >
        <Row>
          <Field label="Price (₹)" htmlFor="price" error={errors.price}>
            <TextInput
              id="price"
              name="price"
              inputMode="numeric"
              value={price}
              placeholder="Blank = price on request"
              onChange={(event) => setPrice(event.target.value)}
            />
          </Field>
          <Field
            label="Strike-through price (₹)"
            htmlFor="compareAtPrice"
            error={errors.compareAtPrice}
            hint="The original price, shown crossed out. Must be higher than the selling price."
          >
            <TextInput
              id="compareAtPrice"
              name="compareAtPrice"
              inputMode="numeric"
              value={compareAt}
              onChange={(event) => setCompareAt(event.target.value)}
            />
          </Field>
        </Row>
        <DiscountPreview price={price} compareAt={compareAt} />

        <Field label="Availability" htmlFor="availability">
          <Select
            id="availability"
            name="availability"
            defaultValue={was.text("availability", product?.availability ?? "in-stock")}
          >
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {AVAILABILITY_LABELS[a]}
              </option>
            ))}
          </Select>
        </Field>

        <Row>
          <Checkbox
            name="featured"
            label="Featured"
            hint="Appears in the featured rail on the home page."
            defaultChecked={was.checked("featured", product?.featured ?? false)}
          />
          <Checkbox
            name="bestseller"
            label="Bestseller"
            hint="Carries a badge and is preferred in Hot Deals."
            defaultChecked={was.checked("bestseller", product?.bestseller ?? false)}
          />
        </Row>
      </Fieldset>

      <Fieldset
        legend="Imagery"
        hint="Upload as many as you like. The first image is the card, the hero and the Open Graph preview; the rest become the gallery."
      >
        <ImageManager
          initialImage={was.text("image", product?.image ?? "")}
          initialGallery={was.lines("gallery", product?.gallery ?? [])}
          uploadsEnabled={uploadsEnabled}
        />
        {errors.image ? <p className="text-xs font-medium text-brand-700">{errors.image}</p> : null}
        <Field
          label="Alt text"
          htmlFor="alt"
          hint="Describes the photos for screen readers and search."
        >
          <TextInput id="alt" name="alt" defaultValue={was.text("alt", product?.alt ?? "")} />
        </Field>
      </Fieldset>

      <Fieldset legend="Copy" hint="What the card, the listing and the product page say.">
        <Field
          label="Summary"
          htmlFor="summary"
          error={errors.summary}
          hint="One or two lines. Shown on cards and used as the meta description."
        >
          <TextArea
            id="summary"
            name="summary"
            defaultValue={was.text("summary", product?.summary ?? "")}
            required
          />
        </Field>
        <Field
          label="Description"
          htmlFor="description"
          hint="Long-form copy for the product page."
        >
          <TextArea
            id="description"
            name="description"
            className="min-h-40"
            defaultValue={was.text("description", product?.description ?? "")}
          />
        </Field>
        <Field label="Highlights" htmlFor="highlights" hint="One bullet per line.">
          <TextArea
            id="highlights"
            name="highlights"
            defaultValue={was.lines("highlights", product?.highlights ?? []).join("\n")}
          />
        </Field>
        <Field label="Specifications" htmlFor="specs" hint="One row per line, as “Label | Value”.">
          <TextArea
            id="specs"
            name="specs"
            className="min-h-32 font-mono text-xs"
            defaultValue={was.text("specs", serialiseSpecs(product?.specs ?? []))}
          />
        </Field>
        <TagEditor
          initial={state.values ? parseTags(state.values.tags ?? "") : (product?.tags ?? [])}
        />
      </Fieldset>

      <SaveBar product={product} />
    </form>
  );
}
