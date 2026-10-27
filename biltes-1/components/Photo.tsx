import { cn } from "@/lib/utils";

/** Görsel yoksa marka renklerinde, dekoratif geometrik bir yer tutucu çizer (sahte fotoğraf kullanılmaz). */
export function Photo({ src, alt = "", className, priority, ratio, sizes }: { src?: string | null; alt?: string; className?: string; priority?: boolean; ratio?: string; sizes?: string }) {
  if (!src) {
    return (
      <div aria-hidden className={cn("relative overflow-hidden bg-navy", className)} style={ratio ? { aspectRatio: ratio } : undefined}>
        <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#00A5B5" strokeWidth=".6" /></pattern></defs>
          <rect width="400" height="300" fill="url(#g)" />
          <circle cx="310" cy="80" r="70" fill="none" stroke="#F2A444" strokeWidth="1.2" />
          <circle cx="90" cy="230" r="46" fill="#00A5B5" fillOpacity=".25" />
        </svg>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} sizes={sizes} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async"
      className={cn("object-cover", className)} style={ratio ? { aspectRatio: ratio } : undefined} />
  );
}
