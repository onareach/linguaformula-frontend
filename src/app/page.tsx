import Image from "next/image";
import Link from "next/link";
import HomeNav from "./components/HomeNav";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="mb-[5px] block">
        <Image
          src="/logo.png"
          alt="Lingua Formula Logo"
          width={360}
          height={360}
          className="block max-w-full h-auto"
          priority
        />
      </div>
      <nav className="flex flex-col items-center space-y-4">
        <Link className="text-copy hover:text-nav-hover text-lg" href="/welcome">
          welcome
        </Link>
        <Link className="text-nav hover:text-nav-hover text-lg" href="/terms">
          terms
        </Link>
        <Link className="text-nav hover:text-nav-hover text-lg" href="/formulas">
          formulas
        </Link>
        <HomeNav />
      </nav>
    </div>
  );
}
