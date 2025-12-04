'use client';

import { Button } from '@/components/ui/button';
import { DIETARY_INDICATORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Static mapping for Tailwind classes to avoid runtime class generation
const dotBg: Record<'green' | 'red', string> = {
  green: 'bg-green-500',
  red: 'bg-red-500',
};

interface VegNonVegFilterProps {
  value: 'all' | 'veg' | 'nonveg';
  onChange: (value: 'all' | 'veg' | 'nonveg') => void;
}

export default function VegNonVegFilter({ value, onChange }: VegNonVegFilterProps) {
  const options = [
    { value: 'all' as const, label: 'All', color: null },
    { value: 'veg' as const, label: `${DIETARY_INDICATORS.veg.label} Only`, color: DIETARY_INDICATORS.veg.color },
    { value: 'nonveg' as const, label: DIETARY_INDICATORS.nonveg.label, color: DIETARY_INDICATORS.nonveg.color },
  ];

  return (
    <div className="flex gap-2 w-full lg:w-auto">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center gap-2 flex-1 lg:flex-none rounded-full px-4 transition-all",
            value === option.value 
              ? "bg-[#3D3D3D] hover:bg-[#2D2D2D] text-white border-[#3D3D3D]" 
              : "bg-white hover:bg-[#F5F1EA] text-[#4A4A4A] border-[#E8E4DC]"
          )}
        >
          {option.color && (
            <div 
              className={cn(
                "w-2 h-2 rounded-full",
                dotBg[option.color as 'green' | 'red']
              )} 
            />
          )}
          {option.label}
        </Button>
      ))}
    </div>
  );
}
