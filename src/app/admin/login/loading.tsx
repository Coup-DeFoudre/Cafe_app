import { SimpleSpinner } from '@/components/ui/loading-animation';

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <SimpleSpinner text="Loading..." />
    </div>
  );
}

