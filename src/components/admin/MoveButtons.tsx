import { moveAction, type Reorderable } from "@/lib/admin/actions";
import { ChevronDown, ChevronUp } from "@/components/ui/Icons";

/**
 * Order controls, as two tiny forms.
 *
 * Deliberately not drag-and-drop: the whole panel is meant to work one-handed
 * on a phone, and a plain button beats a drag target on a touch screen.
 */
export function MoveButtons({
  kind,
  slug,
  first,
  last,
}: {
  kind: Reorderable;
  slug: string;
  first: boolean;
  last: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col">
      {(["up", "down"] as const).map((direction) => (
        <form key={direction} action={moveAction}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="direction" value={direction} />
          <button
            type="submit"
            aria-label={direction === "up" ? "Move up" : "Move down"}
            disabled={direction === "up" ? first : last}
            className="flex size-6 items-center justify-center rounded-md text-xs text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-25 disabled:hover:bg-transparent"
          >
            {direction === "up" ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        </form>
      ))}
    </div>
  );
}
