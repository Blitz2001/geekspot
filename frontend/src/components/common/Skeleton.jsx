import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ variant = 'rect', className, ...props }) => {
    const baseClasses = "animate-pulse bg-navy-800 rounded";

    const variants = {
        text: "h-4 w-full",
        rect: "h-full w-full",
        circle: "rounded-full",
        "product-card": "h-[400px] w-full rounded-xl"
    };

    const classes = twMerge(baseClasses, variants[variant], className);

    return (
        <div className={classes} {...props}>
            <div className="h-full w-full bg-gradient-to-r from-transparent via-navy-700/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
    );
};
