import { Star } from "lucide-react";
import type { Testimonial } from "@prisma/client";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="rounded-2xl border site-border site-surface p-6">
      <div className="flex gap-0.5 site-accent-text">
        {Array.from({ length: testimonial.rating ?? 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 text-base leading-relaxed">“{testimonial.quote}”</blockquote>
      <figcaption className="mt-4 text-sm font-semibold site-muted">
        {testimonial.authorName}
      </figcaption>
    </figure>
  );
}
