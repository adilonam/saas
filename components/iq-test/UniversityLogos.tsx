import Image from "next/image";
import { IQ_UNIVERSITY_LOGOS } from "@/lib/iq-test/images";

export default function UniversityLogos({ className }: { className?: string }) {
  const logos = [
    { src: IQ_UNIVERSITY_LOGOS.harvard, alt: "Harvard University" },
    { src: IQ_UNIVERSITY_LOGOS.berkeley, alt: "UC Berkeley" },
    { src: IQ_UNIVERSITY_LOGOS.oxford, alt: "University of Oxford" },
  ];

  return (
    <div className={className}>
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
        Research-backed methodology
      </p>
      <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-6 rounded-xl border border-slate-200/80 bg-white px-6 py-3 shadow-sm dark:border-slate-200 dark:bg-slate-100">
        {logos.map((logo) => (
          <div key={logo.alt} className="relative h-8 w-24">
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              sizes="96px"
              className="object-contain grayscale"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
