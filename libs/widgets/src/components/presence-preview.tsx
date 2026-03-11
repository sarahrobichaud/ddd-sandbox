import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@cavok/ui/components/shad/card";
import { Badge } from "@cavok/ui/components/shad/badge";
import { MapPin, User } from "lucide-react";
import { cn } from "@cavok/widgets/lib/utils";
import type {Username}from '@cavok/core/contracts/auth.contracts'

export type PresencePreviewData = {
  displayName: string;
  pronouns?: string;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  homeAirport?: string;
  username: Username
};

export interface PresencePreviewProps {
  data: PresencePreviewData;
  className?: string;
}

const experienceLevelConfig = {
  BEGINNER: { label: "Beginner", variant: "secondary" as const },
  INTERMEDIATE: { label: "Intermediate", variant: "info" as const },
  ADVANCED: { label: "Advanced", variant: "warning" as const },
  EXPERT: { label: "Expert", variant: "success" as const },
};

function getInitials(data: PresencePreviewData): string {

  // Fallback to displayName
  if (data.displayName && data.displayName.length > 0) {
    const parts = data.displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return data.displayName[0].toUpperCase();
  }

  // Ultimate fallback
  return "?";
}

function getAvatarColor(data: PresencePreviewData): string {
  // Generate a consistent color based on name
  const name = data.displayName;

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function PresencePreview({ data, className }: PresencePreviewProps) {
  // Memoize values that depend on data to avoid unnecessary recalculations
  const initials = useMemo(() => getInitials(data), [data.displayName]);

  const avatarColor = useMemo(() => getAvatarColor(data), []);

  const displayName = data.displayName || "Pilot";
  const experienceConfig = experienceLevelConfig[data.experienceLevel || "BEGINNER"];
  const fullUsername =
    data.username && data.username.discriminator ? `${data.username.value}#${data.username.discriminator}` : null;

  return (
    <Card className={cn("w-full lg:w-auto border-2", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Name Section */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl font-bold shrink-0 shadow-md",
              avatarColor
            )}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-bold text-xl truncate leading-tight mb-1">{displayName}</h3>
            {fullUsername && <p className="text-xs font-mono text-muted-foreground/80 mb-1">{fullUsername}</p>}
            {data.pronouns &&  (
              <p className="text-sm text-muted-foreground">{data.pronouns}</p>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-3.5 pt-4 border-t">
          {/* Experience Level */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground font-medium">Experience</span>
            <Badge variant={experienceConfig.variant} className="font-medium">
              {experienceConfig.label}
            </Badge>
          </div>

          {/* Home Airport */}
          {data.homeAirport && (

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Home Base
            </span>
              <span className="text-sm font-mono font-bold tracking-wider">{data.homeAirport}</span>
          </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
