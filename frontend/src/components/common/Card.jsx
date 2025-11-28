import { cn } from '../../utils/cn';

export const Card = ({
    children,
    glow = false,
    className = '',
    ...props
}) => {
    return (
        <div
            className={cn(
                glow ? 'card-glow' : 'card',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
