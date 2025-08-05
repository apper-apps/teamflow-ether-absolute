import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Avatar = forwardRef(({ 
  className, 
  src, 
  alt, 
  size = "md", 
  fallback,
  ...props 
}, ref) => {
  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
    "2xl": "h-20 w-20 text-2xl"
  };

  const baseStyles = "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 font-medium text-gray-600 overflow-hidden";

  if (src) {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(baseStyles, sizes[size], className)}
        {...props}
      />
    );
  }

  return (
    <div
      ref={ref}
      className={cn(baseStyles, sizes[size], className)}
      {...props}
    >
      {fallback}
    </div>
  );
});

Avatar.displayName = "Avatar";

export default Avatar;