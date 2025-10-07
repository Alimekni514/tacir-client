import Image from "next/image";

export default function SlideItem({ alt, src, title }) {
  return (
    <div className="relative w-1/4">
      <Image
        alt={alt}
        className="brightness-50"
        height={350}
        src={src}
        width={350}
      />

      <h2 className="absolute left-20  top-40 text-3xl font-bold uppercase text-white">
        {title}
      </h2>
    </div>
  );
}
