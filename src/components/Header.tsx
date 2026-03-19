import { useState } from "react";
import { Popcorn, Film, Gamepad2, Compass, Eye, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface HeaderProps {
  onWatchedToggle?: () => void;
}

const Header = ({ onWatchedToggle }: HeaderProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: Film, label: "Discover", to: "/", isLink: true },
    { icon: Compass, label: "Explore", to: "/explore", isLink: true },
    { icon: Eye, label: "Watched", to: "#", isLink: false },
    { icon: Gamepad2, label: "Game", to: "/game", isLink: true },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (!item.isLink && item.label === "Watched") {
      onWatchedToggle?.();
    }
    setSidebarOpen(false);
  };

  return (
    <header className="text-center py-8 md:py-12">
      {/* Top bar: Hamburger + Logo */}
      <div className="flex items-center justify-center gap-3 mb-3 relative">
        {/* Hamburger button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-all duration-300"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Popcorn className="w-8 h-8 md:w-10 md:h-10 text-theme-accent" />
        <h1 className="font-display text-4xl md:text-6xl tracking-widest text-foreground">
          FLICKPICK
        </h1>
      </div>
      <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-6">
        Discover your next binge-worthy movie or TV show with a single click
      </p>

      {/* Inline Navigation (always visible) */}
      <nav className="flex items-center justify-center gap-2">
        <Link
          to="/"
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === "/"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-surface"
            }`}
        >
          <Film className="w-4 h-4" />
          Discover
        </Link>
        <Link
          to="/explore"
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === "/explore"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-surface"
            }`}
        >
          <Compass className="w-4 h-4" />
          Explore
        </Link>
        {onWatchedToggle && (
          <button
            onClick={onWatchedToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-surface"
          >
            <Eye className="w-4 h-4" />
            Watched
          </button>
        )}
        <Link
          to="/game"
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === "/game"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-surface"
            }`}
        >
          <Gamepad2 className="w-4 h-4" />
          Game
        </Link>
      </nav>

      {/* YouTube-style Left Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[280px] sm:w-[300px] bg-[hsl(230_14%_10%)] border-r border-border p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>

          {/* Sidebar Header */}
          <div className="flex items-center gap-3 p-5 border-b border-border">
            <Popcorn className="w-6 h-6 text-theme-accent" />
            <span className="font-display text-2xl tracking-widest text-foreground">
              FLICKPICK
            </span>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.isLink && location.pathname === item.to;

              if (item.isLink) {
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => handleNavClick(item)}
                    className={`flex items-center gap-4 px-6 py-3.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[hsl(230_12%_18%)] text-theme-accent border-r-2 border-[hsl(var(--theme-accent))]"
                        : "text-muted-foreground hover:text-foreground hover:bg-[hsl(230_12%_16%)]"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-theme-accent" : ""
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className="flex items-center gap-4 px-6 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(230_12%_16%)] transition-all duration-200 text-left"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Separator */}
          <div className="mx-4 my-2 border-t border-border" />

          {/* Subscriptions placeholder */}
          <div className="px-6 py-3">
            <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">
              Subscriptions
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
