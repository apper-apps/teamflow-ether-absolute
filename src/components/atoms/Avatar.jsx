import React, { forwardRef, useState } from "react";
import { cn } from "@/utils/cn";

const Avatar = forwardRef(({ src, alt = "Avatar", fallback, size = "md", className, ...props }, ref) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
    "2xl": "h-20 w-20 text-2xl"
  };

  const baseStyles = "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 font-medium text-gray-600 overflow-hidden";

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Show image if src exists, hasn't errored, and either loaded or still loading
  if (src && !imageError) {
    return (
      <>
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={cn(baseStyles, sizes[size], className)}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
        {/* Show fallback while loading if image hasn't loaded yet */}
        {!imageLoaded && (
          <div
            className={cn(baseStyles, sizes[size], className, "absolute")}
            style={{ zIndex: -1 }}
          >
            {fallback}
          </div>
        )}
      </>
    );
  }

  // Show fallback when no src or image failed to load
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