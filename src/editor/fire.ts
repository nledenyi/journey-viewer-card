/** Dispatch a Lovelace config-changed event. The card editor host listens
 *  for this and writes the updated config back to the dashboard. */
export function fireConfigChanged(node: HTMLElement, config: unknown): void {
  node.dispatchEvent(
    new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
    }),
  );
}
