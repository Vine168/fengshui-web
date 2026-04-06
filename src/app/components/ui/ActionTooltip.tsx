import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type ActionTooltipProps = {
  label: string;
  children: React.ReactElement;
} & React.HTMLAttributes<HTMLElement>;

function composeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      (ref as React.MutableRefObject<T | null>).current = node;
    });
  };
}

export const ActionTooltip = React.forwardRef<HTMLElement, ActionTooltipProps>(
  ({ label, children, ...triggerProps }, ref) => {
    const child = React.Children.only(children) as React.ReactElement & {
      ref?: React.Ref<HTMLElement>;
    };

    const mergedRef = composeRefs<HTMLElement>(ref, child.ref);

    const triggerChild = React.cloneElement(child, {
      ...triggerProps,
      ...child.props,
      ref: mergedRef,
    });

    return (
      <Tooltip>
        <TooltipTrigger asChild>{triggerChild}</TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  },
);

ActionTooltip.displayName = "ActionTooltip";
