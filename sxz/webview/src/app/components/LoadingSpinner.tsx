import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = '加载中...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}
