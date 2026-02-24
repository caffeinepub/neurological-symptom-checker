import { Link } from '@tanstack/react-router';
import { CalendarDays, Pill, History, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/', label: 'Today', icon: CalendarDays, exact: true },
  { to: '/medications', label: 'Medications', icon: Pill, exact: false },
  { to: '/history', label: 'History', icon: History, exact: false },
];

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/pill-logo.dim_128x128.png"
              alt="PillPal logo"
              className="h-9 w-9 rounded-xl object-contain"
            />
            <span className="font-serif text-xl font-semibold text-foreground tracking-tight">
              PillPal
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                activeProps={{
                  className: 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary/10 text-primary',
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 animate-fade-in">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors text-muted-foreground"
              activeProps={{
                className: 'flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors text-primary',
              }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden sm:block border-t border-border bg-card mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} PillPal. Built with</span>
          <Heart className="h-3 w-3 fill-primary text-primary mx-0.5" />
          <span>using</span>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'pill-reminder-app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      {/* Mobile bottom padding */}
      <div className="sm:hidden h-16" />
    </div>
  );
}
