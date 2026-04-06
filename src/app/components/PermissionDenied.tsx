import React from "react";
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";

type PermissionDeniedProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  title = "Access Restricted",
  description = "You do not have permission to view this feature. Please contact an administrator if you need access.",
  actionLabel,
  onAction,
}) => {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-80 w-80 rounded-full bg-primary/10 blur-[100px] opacity-50" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lock className="h-5 w-5 text-amber-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        {actionLabel && onAction && (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
