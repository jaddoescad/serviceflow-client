export function LoadingSpinner({
  size = "default",
  className = ""
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-accent border-t-transparent`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export function LoadingPage({ message }: { message?: string }) {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-sm font-medium text-slate-600">{message}</p>
      )}
    </div>
  );
}
