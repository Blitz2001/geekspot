import { Star } from 'lucide-react';
import { useState } from 'react';

export const StarRating = ({
    rating = 0,
    onChange,
    size = 'md',
    interactive = false,
    showCount = false,
    count = 0
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    };

    const sizeClass = sizes[size] || sizes.md;

    const handleClick = (value) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= Math.floor(displayRating);
                const isHalf = star === Math.ceil(displayRating) && displayRating % 1 !== 0;

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        disabled={!interactive}
                        className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
                    >
                        {isHalf ? (
                            <div className="relative">
                                <Star className={`${sizeClass} text-gray-600`} />
                                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                                    <Star className={`${sizeClass} text-lime-400 fill-lime-400`} />
                                </div>
                            </div>
                        ) : (
                            <Star
                                className={`${sizeClass} ${isFilled
                                        ? 'text-lime-400 fill-lime-400'
                                        : 'text-gray-600'
                                    }`}
                            />
                        )}
                    </button>
                );
            })}
            {showCount && count > 0 && (
                <span className="text-sm text-gray-400 ml-1">
                    ({count} {count === 1 ? 'review' : 'reviews'})
                </span>
            )}
        </div>
    );
};
