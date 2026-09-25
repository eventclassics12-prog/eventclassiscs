import Image from "next/image";
import { asMediaObject, mediaUrl, type HomeBrandsData } from "@/lib/cms";
import "./Brands.css";

const FALLBACK_BRANDS = [
  { src: "/brands/brand1.png", name: "IQVIA", width: 2172, height: 724 },
  {
    src: "/brands/brand2.png",
    name: "Manipal Hospitals",
    width: 2167,
    height: 725,
  },
  {
    src: "/brands/brand3.png",
    name: "Redmonk Wellness",
    width: 1536,
    height: 1024,
  },
  {
    src: "/brands/brand4.png",
    name: "Team Taurus",
    width: 2109,
    height: 745,
  },
] as const;

const FALLBACK_LABEL = "Trusted by";

interface BrandEntry {
  src: string;
  name: string;
  width: number;
  height: number;
  alt: string;
}

interface BrandsProps {
  /** CMS `home-brands` global. Falls back to the hardcoded list. */
  data?: HomeBrandsData | null;
}

export function Brands({ data }: BrandsProps) {
  const label = data?.label ?? FALLBACK_LABEL;

  /* CMS brands drive the grid when present; otherwise the full hardcoded
   * list is used so the section never renders empty. Per-brand, each CMS
   * field falls back to the matching hardcoded brand by position. */
  const brands: BrandEntry[] =
    data?.brands && data.brands.length > 0
      ? data.brands.map((entry, i) => {
          const fallback = FALLBACK_BRANDS[i % FALLBACK_BRANDS.length];
          const media = asMediaObject(entry.logo);
          const name = entry.name ?? fallback.name;
          return {
            src: mediaUrl(entry.logo) ?? fallback.src,
            name,
            width: media?.width ?? fallback.width,
            height: media?.height ?? fallback.height,
            alt: media?.alt ?? entry.name ?? fallback.name,
          };
        })
      : FALLBACK_BRANDS.map((b) => ({
          src: b.src,
          name: b.name,
          width: b.width,
          height: b.height,
          alt: b.name,
        }));

  return (
    <section className="brands" id="work">
      <div className="brands__layout">
        <header className="brands__header">
          <span className="brands__dot" aria-hidden="true" />
          <span className="brands__label">{label}</span>
        </header>

        <div className="brands__grid">
          {brands.map((brand, i) => (
            <div className="brands__cell" key={`${brand.src}-${i}`}>
              <Image
                className="brands__image"
                src={brand.src}
                alt={brand.alt}
                width={brand.width}
                height={brand.height}
                sizes="(max-width: 767px) 45vw, 35vw"
              />
              <span className="brands__name">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Brands;
