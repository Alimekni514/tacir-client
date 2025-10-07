import SlideItem from "./slide-item"

export default function HeroSectionSlide() {
  const slides = [
    {
      src: "/images/slide/art.jpg",
      alt: "Arts",
      title: "Arts",
    },
    {
      src: "/images/slide/talents.jpg",
      alt: "Talents",
      title: "Talents",
    },
    {
      src: "/images/slide/creation.jpg",
      alt: "Créations",
      title: "Créations",
    },
    {
      src: "/images/slide/inclusion.jpg",
      alt: "Inclusion",
      title: "Inclusion",
    },
    {
      src: "/images/slide/recherche.jpg",
      alt: "Recherche",
      title: "Recherche",
    },
  ]

  return (
    <div className="z-30 flex w-full overflow-hidden bg-tacir-orange group">
      {[0, 1].map((_, index) => (
        <div
          key={index}
          aria-hidden={index === 1}
          className="flex shrink-0 animate-[scroll_20s_linear_infinite] whitespace-nowrap group-hover:[animation-play-state:paused]"
        >
          {slides.map((slide, i) => (
            <SlideItem key={i} {...slide} />
          ))}
        </div>
      ))}
    </div>
  )
}
