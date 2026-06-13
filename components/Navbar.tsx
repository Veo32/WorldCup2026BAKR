import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo Section */}
        <Link href="/" className="text-2xl font-bold tracking-wider flex items-center gap-3">
          {/* صورة الشعار */}
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="BAKR Logo" 
              fill
              sizes="40px"
              className="object-contain rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
            />
          </div>
          <span className="text-white">BAKR</span>
          <span className="text-emerald-400">DASH</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/" className="text-slate-300 hover:text-emerald-400 transition-colors duration-300">
            الرئيسية
          </Link>
          <Link href="/matches" className="text-slate-300 hover:text-emerald-400 transition-colors duration-300">
            المباريات
          </Link>
          <Link href="/standings" className="text-slate-300 hover:text-emerald-400 transition-colors duration-300">
            الترتيب
          </Link>
        </div>
        
      </div>
    </nav>
  );
}