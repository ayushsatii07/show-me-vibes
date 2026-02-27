import { motion } from "framer-motion";
import { Film } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Film className="w-12 h-12 text-theme-accent" />
      </motion.div>
      <p className="text-muted-foreground font-display text-xl tracking-wider">
        ROLLING THE REEL...
      </p>
    </motion.div>
  );
};

export default LoadingSpinner;
