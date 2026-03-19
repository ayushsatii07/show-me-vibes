import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onChangeFilters?: () => void;
}

const ErrorState = ({ message, onRetry, onChangeFilters }: ErrorStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-8 text-center space-y-4"
    >
      <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
      <h3 className="font-display text-xl tracking-wider text-foreground">
        SOMETHING WENT WRONG
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {message}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        {onChangeFilters && (
          <Button onClick={onChangeFilters} variant="default" className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Change Rating
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorState;
