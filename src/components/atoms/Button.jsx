import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 focus:ring-gray-500 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] active:scale-[0.98]",
    accent: "bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 focus:ring-accent-500 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:ring-gray-500 transform hover:scale-[1.02] active:scale-[0.98]",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
    xl: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ApperIcon name="Loader2" className="animate-spin" size={16} />}
      {!loading && icon && iconPosition === "left" && <ApperIcon name={icon} size={16} />}
      {children}
      {!loading && icon && iconPosition === "right" && <ApperIcon name={icon} size={16} />}
    </button>
  );
});

Button.displayName = "Button";

export default Button;