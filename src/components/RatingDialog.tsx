import { useState } from "react";
import { Star } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GenerateResponse } from "@/services/api";

interface RatingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movie: GenerateResponse | null;
    onConfirm: (rating: number) => void;
    isSubmitting: boolean;
}

const RatingDialog = ({ open, onOpenChange, movie, onConfirm, isSubmitting }: RatingDialogProps) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    const handleOpen = (isOpen: boolean) => {
        if (!isOpen) {
            setSelectedRating(0);
            setHoverRating(0);
        }
        onOpenChange(isOpen);
    };

    const displayRating = hoverRating || selectedRating;

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogContent className="sm:max-w-md glass border-border">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl tracking-wider text-foreground">
                        RATE THIS {movie ? "" : "MOVIE"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {movie ? (
                            <>How would you rate <span className="text-foreground font-medium">{movie.title}</span>?</>
                        ) : (
                            "Select a rating"
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Star Rating */}
                <div className="flex flex-col items-center gap-4 py-6">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setSelectedRating(star)}
                                className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                            >
                                <Star
                                    className={`w-7 h-7 transition-colors duration-150 ${star <= displayRating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-muted-foreground/30"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <span className="font-display text-3xl tracking-wider text-theme-accent">
                        {displayRating > 0 ? `${displayRating}/10` : "—"}
                    </span>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => handleOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(selectedRating)}
                        disabled={selectedRating === 0 || isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting ? "Saving..." : "Mark as Watched"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RatingDialog;
