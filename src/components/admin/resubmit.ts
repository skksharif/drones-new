import type { SaveState } from "@/lib/admin/actions";

/**
 * Re-seeds a form from the values a rejected submit echoed back.
 *
 * React resets a form once its action resolves, so uncontrolled inputs would
 * otherwise snap back to the original record and throw away everything the
 * editor had typed. Paired with `key={state.attempt}` on the `<form>`, this
 * puts every field back exactly as it was submitted.
 */
export function resubmitted(state: SaveState) {
  const values = state.values;

  return {
    /** The value for a text field, falling back to the stored record. */
    text(name: string, fallback: string): string {
      return values?.[name] ?? fallback;
    },
    /**
     * The state of a checkbox. An unticked box sends nothing at all, so its
     * absence from a submitted form means "off" rather than "unknown".
     */
    checked(name: string, fallback: boolean): boolean {
      return values ? name in values : fallback;
    },
    /** A newline-joined field back as a list. */
    lines(name: string, fallback: string[]): string[] {
      const raw = values?.[name];
      if (raw === undefined) return fallback;
      return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    },
  };
}
