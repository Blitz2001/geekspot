import { cn } from '../../utils/cn';

export const Button = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
    };

    return (
        <button
            className={cn(variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};
