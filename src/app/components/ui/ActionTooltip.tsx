import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type ActionTooltipProps = {
  label: string;
  children: React.ReactElement;
};

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label,
  children,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
};
