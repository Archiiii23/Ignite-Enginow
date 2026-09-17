import React from "react";

interface UserAvatarProps {
  name?: string;
  email?: string;
  className?: string;
}

export function UserAvatar({ name, email, className = "size-8 rounded-xl text-xs" }: UserAvatarProps) {
  const raw = name?.trim() || email?.trim() || "U";
  const initial = raw.charAt(0).toUpperCase();

  return (
    <div
      className={`bg-gradient-to-br from-primary/20 via-primary/10 to-primary-glow/20 text-primary border border-primary/30 font-display font-bold flex items-center justify-center select-none uppercase shadow-sm shrink-0 ${className}`}
      aria-label={raw}
    >
      {initial}
    </div>
  );
}
