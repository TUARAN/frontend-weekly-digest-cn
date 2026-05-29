import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
}

export default function BrandLogo({ href = '/' }: BrandLogoProps) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5 py-1 leading-none">
      <span className="bg-[linear-gradient(135deg,#020617_0%,#1d4ed8_58%,#38bdf8_100%)] bg-clip-text text-[20px] font-black tracking-[-0.08em] text-transparent md:text-[22px]">
        前端周看
      </span>
    </Link>
  );
}
