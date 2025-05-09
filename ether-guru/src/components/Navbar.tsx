import Link from 'next/link';
import UserProfile from './auth/UserProfile';

const Navbar = () => {
  return (
    <nav className="bg-background border-b sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          EtherGuru
        </Link>
        
        {/* Middle navigation links */}
        <div className="hidden md:flex space-x-4 sm:space-x-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Ethernaut Challenges
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Damn Vulnerable DeFi (Soon)
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            About (Soon)
          </Link>
        </div>
        
        {/* User profile in top-right */}
        <div className="flex items-center">
          <UserProfile />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
