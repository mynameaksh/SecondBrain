import { type ReactElement } from "react";

interface ButtonProps {
  variant: "primary" | "secondary";
  text: string;
  startIcon?: ReactElement;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: "bg-[#7164c0] text-white hover:bg-[#6256aa]",
  secondary: "bg-[#e6e9fb] text-[#4d4699] hover:bg-[#d9def7]",
};

const defaultStyles =
  "cursor-pointer px-4 py-2 rounded-md font-medium flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

function Button({
  variant,
  text,
  startIcon,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variantClasses[variant]} ${defaultStyles} ${widthClass}`}
    >
      {startIcon ? <span className="pr-2">{startIcon}</span> : null}
      {text}
    </button>
  );
}

export default Button;
