import * as LucideIcons from "lucide-react";

export default function Icon({ name, size = 20, className = "" }) {
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} className={className} aria-hidden="true" />;
}
