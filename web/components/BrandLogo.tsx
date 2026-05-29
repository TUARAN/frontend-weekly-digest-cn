import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
}

export default function BrandLogo({ href = '/' }: BrandLogoProps) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 py-1 leading-none">
      <svg
        viewBox="0 0 32 32"
        className="h-[22px] w-[22px] shrink-0 transition-transform duration-300 group-hover:scale-[1.05] md:h-6 md:w-6"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="brandLogoMark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#020617" />
            <stop offset="0.58" stopColor="#1d4ed8" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#brandLogoMark)" />
        <circle cx="16" cy="16" r="7.6" stroke="#ffffff" strokeWidth="2.2" />
        <circle cx="16" cy="16" r="2.7" fill="#ffffff" />
      </svg>
      <span className="bg-[linear-gradient(135deg,#020617_0%,#1d4ed8_58%,#38bdf8_100%)] bg-clip-text text-[20px] font-black tracking-[-0.08em] text-transparent md:text-[22px]">
        前端周看
      </span>
    </Link>
  );
}
