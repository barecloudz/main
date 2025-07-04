import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/ThemeProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logoPath from '@/assets/logo.png';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  
  // Add scroll event listener to change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isHome = location === '/';
  
  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user) return '?';
    
    const firstName = (user as any)?.firstName || '';
    const lastName = (user as any)?.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if ((user as any)?.email) {
      return (user as any).email[0].toUpperCase();
    }
    
    return '?';
  };

  return (
    <header className={`sticky-header ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 logo-container">
              <img src={logoPath} alt="BareCloudz Logo" />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {isHome && (
              <>
                <a href="#services" className="text-base font-medium text-white hover:text-[#35c677] transition">Services</a>
                <a href="#about" className="text-base font-medium text-white hover:text-[#35c677] transition">About</a>
                <a href="#growth" className="text-base font-medium text-white hover:text-[#35c677] transition">Growth</a>
                <Link href="/blog" className="text-base font-medium text-white hover:text-[#35c677] transition">Blog</Link>
                <a href="#contact" className="text-base font-medium text-white hover:text-[#35c677] transition">Contact</a>
              </>
            )}
            
            {!isHome && isAuthenticated && (user as any)?.role === 'admin' && (
              <>
                <Link href="/admin/dashboard" className="text-base font-medium text-white hover:text-[#35c677] transition">Dashboard</Link>
                <Link href="/admin/clients" className="text-base font-medium text-white hover:text-[#35c677] transition">Clients</Link>
                <Link href="/admin/forms" className="text-base font-medium text-white hover:text-[#35c677] transition">Forms</Link>
                <Link href="/admin/invoices" className="text-base font-medium text-white hover:text-[#35c677] transition">Invoices</Link>
              </>
            )}
            
            {!isHome && isAuthenticated && (user as any)?.role === 'client' && (
              <>
                <Link href="/client/dashboard" className="text-base font-medium text-white hover:text-[#35c677] transition">Dashboard</Link>
                <Link href="/client/marketing-plan" className="text-base font-medium text-white hover:text-[#35c677] transition">Marketing Plan</Link>
                <Link href="/client/invoices" className="text-base font-medium text-white hover:text-[#35c677] transition">Invoices</Link>
              </>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={(user as any)?.profileImageUrl} alt={(user as any)?.firstName || ''} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {(user as any)?.firstName && (user as any)?.lastName && (
                        <p className="font-medium">{(user as any).firstName} {(user as any).lastName}</p>
                      )}
                      {(user as any)?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {(user as any).email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={(user as any)?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} className="cursor-pointer w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="cursor-pointer w-full flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/client-portal" className="text-sm font-medium text-[#35c677] hover:text-white transition">
                  Client Portal
                </Link>
                <a href="/api/login" className="hidden md:inline-flex items-center px-4 py-2 border border-[#35c677] rounded-md shadow-sm text-sm font-medium text-white bg-[#35c677] hover:bg-[#2daa65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#35c677] transition">
                  Get Started
                </a>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu} 
              aria-expanded={mobileMenuOpen}
              className="text-gray-600 dark:text-gray-300"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#191919] shadow-lg rounded-b-lg">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {isHome && (
              <>
                <a 
                  href="#services" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a 
                  href="#about" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <a 
                  href="#growth" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Growth
                </a>
                <Link 
                  href="/blog" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <a 
                  href="#contact" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
              </>
            )}
            
            {!isHome && isAuthenticated && user?.role === 'admin' && (
              <>
                <Link 
                  href="/admin/dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/clients" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Clients
                </Link>
                <Link 
                  href="/admin/forms" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Forms
                </Link>
                <Link 
                  href="/admin/invoices" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Invoices
                </Link>
              </>
            )}
            
            {!isHome && isAuthenticated && user?.role === 'client' && (
              <>
                <Link 
                  href="/client/dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/client/marketing-plan" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Marketing Plan
                </Link>
                <Link 
                  href="/client/invoices" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Invoices
                </Link>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Link 
                  href="/client-portal" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-blue-50 dark:hover:bg-blue-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Client Portal
                </Link>
                <div className="px-3 py-2">
                  <a 
                    href="/api/login" 
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </div>
              </>
            )}
            
            {isAuthenticated && (
              <div className="px-3 py-2">
                <a 
                  href="/api/logout" 
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
