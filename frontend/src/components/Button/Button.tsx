import { type ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import s from "./Button.module.css";

type ButtonVariant = "primary" | "secondary";

type ButtonSize = "sm" | "md" | "lg";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

interface ButtonProps extends NativeButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    type = "button",
    className,
    disabled,
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={clsx(
                s.button,
                s[variant],
                s[size],
                disabled && s.disabled,
                className
            )}
            {...rest}
        >
            {children}
        </button>
    );
}
