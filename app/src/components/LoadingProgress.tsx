import { cn } from "@/lib/utils";

const LoadingProgress = ({ className = "" }: { className?: string }) => {
  return (
    <div className={cn("flex flex-row items-center justify-center", className)}>
      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      <div className="ml-4">Loading...</div>
    </div>
  );
};

export default LoadingProgress;
