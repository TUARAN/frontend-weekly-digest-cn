import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
}

export default function BrandLogo({ href = '/' }: BrandLogoProps) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5 py-1 leading-none">
      <span className="bg-[linear-gradient(135deg,#020617_0%,#1d4ed8_58%,#38bdf8_100%)] bg-clip-text text-[20px] font-black tracking-[-0.08em] text-transparent md:text-[22px]">
        前端下一步
      </span>
      <span
        className="relative hidden md:block shrink-0"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      >
        <Image
          src="/frontend-next-logo.png"
          alt="frontend next"
          width={2996}
          height={614}
          className="h-6 w-auto opacity-80 transition-all duration-300 group-hover:scale-[1.02] group-hover:opacity-95 md:h-7"
          priority
        />
      </span>
    </Link>
  );
}
