import { cn } from "@/lib/utils";

/** Logo rozeti: beyaz yuvarlak plaka üzerinde kurumsal logo. Logo yoksa hiçbir şey çizmez. */
export function LogoBadge({ src, className, size = "md" }: { src?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  if (!src) return null;
  const dim = { sm: "h-16 w-16 p-2.5", md: "h-28 w-28 p-4", lg: "h-40 w-40 p-5" }[size];
  return (
    <span aria-hidden className={cn("grid place-items-center rounded-full bg-white shadow-[0_12px_40px_rgba(16,43,70,.25)] ring-4 ring-white/40", dim, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" />
    </span>
  );
}
