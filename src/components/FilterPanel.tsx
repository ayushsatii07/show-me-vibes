import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Tv, Clapperboard, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { GenerateRequest } from "@/services/api";

interface FilterPanelProps {
  onGenerate: (filters: GenerateRequest) => void;
  isLoading: boolean;
  onTypeChange: (type: "movie" | "tv") => void;
}

const FilterPanel = ({ onGenerate, isLoading, onTypeChange }: FilterPanelProps) => {
  const [rating, setRating] = useState(7);
  const [industry, setIndustry] = useState<"bollywood" | "hollywood">("hollywood");
  const [type, setType] = useState<"movie" | "tv">("movie");

  const handleTypeChange = (newType: "movie" | "tv") => {
    setType(newType);
    onTypeChange(newType);
  };
  const [isAdult, setIsAdult] = useState(false);

  const handleGenerate = () => {
    onGenerate({ rating, industry, type, isAdult });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30, scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="glass rounded-xl p-6 md:p-8 space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <Clapperboard className="w-6 h-6 text-theme-accent" />
        <h2 className="font-display text-2xl tracking-wider text-foreground">
          PICK YOUR VIBE
        </h2>
      </div>

      {/* Rating Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-muted-foreground">
            Minimum Rating
          </Label>
          <span className="text-theme-accent font-display text-2xl">{rating}</span>
        </div>
        <Slider
          value={[rating]}
          onValueChange={([v]) => setRating(v)}
          min={6}
          max={10}
          step={0.5}
          className="w-full"
        />
        <div className="relative w-full h-5">
          {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((val) => (
            <span
              key={val}
              className={`absolute text-xs -translate-x-1/2 transition-colors duration-300 ${val === rating ? "text-theme-accent font-semibold" : "text-muted-foreground"
                }`}
              style={{ left: `${((val - 6) / 4) * 100}%` }}
            >
              {val % 1 === 0 ? val : "·"}
            </span>
          ))}
        </div>
      </div>

      {/* Industry & Type Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Industry
          </Label>
          <Select value={industry} onValueChange={(v: "bollywood" | "hollywood") => setIndustry(v)}>
            <SelectTrigger className="bg-surface border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hollywood">🎬 Hollywood</SelectItem>
              <SelectItem value="bollywood">🎭 Bollywood</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Type
          </Label>
          <div className="flex gap-2">
            <Button
              variant={type === "movie" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => handleTypeChange("movie")}
            >
              <Film className="w-4 h-4" />
              Movie
            </Button>
            <Button
              variant={type === "tv" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => handleTypeChange("tv")}
            >
              <Tv className="w-4 h-4" />
              TV Show
            </Button>
          </div>
        </div>
      </div>

      {/* 18+ Toggle */}
      <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-surface">
        <Label className="text-sm text-muted-foreground cursor-pointer">
          Include 18+ Content
        </Label>
        <Switch checked={isAdult} onCheckedChange={setIsAdult} />
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        size="lg"
        className="w-full gap-2 font-display text-lg tracking-wider animate-pulse-accent"
      >
        <Sparkles className="w-5 h-5" />
        {isLoading ? "FINDING..." : "GENERATE"}
      </Button>
    </motion.div>
  );
};

export default FilterPanel;
