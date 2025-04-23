import Link from 'next/link';
import { DropletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="w-full py-4 px-6 bg-card shadow-sm z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <DropletIcon size={28} className="text-primary" />
          <span className="text-xl font-bold text-primary">Fadmoore</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="#" className="text-foreground hover:text-primary transition-colors hidden md:block">
            Sign In
          </Link>
          <Button className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}