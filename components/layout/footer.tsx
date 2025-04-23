import Link from 'next/link';
import { DropletIcon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-8 px-6 bg-card border-t">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-8">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center space-x-2">
              <DropletIcon size={24} className="text-primary" />
              <span className="text-xl font-bold text-primary">Fadmoore</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-md ">
              Analyze business agreements and get valuable insights about client relationships and retention likelihood.
            </p>
          </div>
          <p className="self-end mt-2 text-sm text-muted-foreground max-w-md ">
            © 2025 Fadmoore. All rights reserved.
          </p>

          {/*           
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">API</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
          </div> */}
        </div>

        {/* <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2025 InsightDrop. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
          </div>
        </div> */}
      </div>
    </footer>
  );
}