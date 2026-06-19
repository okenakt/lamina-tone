import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const BASE_STYLE =
  "inline-flex touch-manipulation items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors";

export const Button = ({
  className = "",
  children,
  disabled = false,
  ...props
}: ButtonProps) => {
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${BASE_STYLE} ${disabledStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
