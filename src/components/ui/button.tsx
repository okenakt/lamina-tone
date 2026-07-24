import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const BASE_STYLE =
  "inline-flex touch-manipulation items-center justify-center rounded-lg transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

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
