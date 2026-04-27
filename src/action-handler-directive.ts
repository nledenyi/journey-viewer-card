/** Lit directive that wraps an element with HA's `action-handler` web
 *  component, so a single pointer interaction can be classified as
 *  tap / hold / double-tap and dispatched as an `@action` CustomEvent.
 *
 *  Vendored from `lovelace-mushroom/src/utils/directives/action-handler-directive.ts`
 *  (Apache-2.0). Kept local to avoid pulling mushroom's full util tree. */

import { noChange } from "lit";
import {
  AttributePart,
  Directive,
  DirectiveParameters,
  directive,
} from "lit/directive.js";

interface ActionHandler extends HTMLElement {
  holdTime: number;
  bind(element: Element, options?: ActionHandlerOptions): void;
}
interface ActionHandlerElement extends HTMLElement {
  actionHandler?: {
    options: ActionHandlerOptions;
    start?: (ev: Event) => void;
    end?: (ev: Event) => void;
    handleEnter?: (ev: KeyboardEvent) => void;
  };
}

export interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
  disabled?: boolean;
}

class ActionHandlerDirective extends Directive {
  override update(part: AttributePart, [options]: DirectiveParameters<this>) {
    // Used as `.actionHandler=${actionHandler({...})}` (property binding).
    // Mushroom's pattern: don't gate on PartType — Lit allows directives on
    // property parts too, and the part still exposes `.element` either way.
    const handler = ensureActionHandlerEl();
    handler.bind(part.element, options);
    return noChange;
  }

  render(_options?: ActionHandlerOptions): unknown {
    return noChange;
  }
}

function ensureActionHandlerEl(): ActionHandler {
  const existing = document.body.querySelector("action-handler") as ActionHandler | null;
  if (existing) return existing;
  // HA registers `action-handler` lazily when any built-in card with action
  // bindings renders. If it isn't present yet, create the element and append
  // it; HA's class will upgrade it on next event-loop tick. Until then,
  // bind() is a no-op (the upgrade will replay any pending bind() calls).
  const el = document.createElement("action-handler") as ActionHandler;
  document.body.appendChild(el);
  return el;
}

export const actionHandler = directive(
  class extends ActionHandlerDirective {
    override update(
      part: AttributePart,
      params: [ActionHandlerOptions?],
    ) {
      const [options] = params;
      const el = part.element as ActionHandlerElement;
      el.actionHandler = el.actionHandler ?? { options: {} };
      el.actionHandler.options = options ?? {};
      // Lit's typed Directive plumbing wants Parameters<this["render"]> here;
      // the inner class's render and the base's render are equivalent at
      // runtime, so the cast is a noop in practice.
      return super.update(part, params as Parameters<this["render"]>);
    }
  },
);
