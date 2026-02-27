import { Popcorn } from "lucide-react";

const Header = () => {
  return (
    <header className="text-center py-8 md:py-12">
      <div className="flex items-center justify-center gap-3 mb-3">
        <Popcorn className="w-8 h-8 md:w-10 md:h-10 text-gold" />
        <h1 className="font-display text-4xl md:text-6xl tracking-widest text-foreground">
          FLICKPICK
        </h1>
      </div>
      <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
        Discover your next binge-worthy movie or TV show with a single click
      </p>
    </header>
  );
};

export default Header;
