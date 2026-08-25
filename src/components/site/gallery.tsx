import Image from "next/image";

export function Gallery({
  images,
}: {
  images: { url: string; altText?: string | null }[];
}) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
      {images.map((img, i) => (
        <div
          key={img.url + i}
          className={`relative overflow-hidden rounded-xl bg-neutral-100 ${
            i === 0 ? "col-span-2 aspect-[16/10] sm:col-span-2 sm:row-span-2 sm:aspect-square" : "aspect-square"
          }`}
        >
          <Image
            src={img.url}
            alt={img.altText ?? ""}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
