import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="Lingua Formula Logo"
          width={360}
          height={360}
          className="inline-block max-w-full h-auto"
          priority
        />
      </div>
      <nav className="flex flex-col items-center space-y-4">
        <Link className="text-copy hover:text-nav-hover text-lg" href="/welcome">
          welcome
        </Link>
        <Link className="text-nav hover:text-nav-hover text-lg" href="/formulas">
          formulas
        </Link>
      </nav>
    </div>
  );
}
