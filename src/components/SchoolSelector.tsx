import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Button } from '@/components/ui/button';
import { useSchools } from '@/hooks/useSchools';

interface SchoolSelectorProps {
  value?: string;
  onChange: (value: string, schoolDetails?: any) => void;
  className?: string;
  placeholder?: string;
}

export const SchoolSelector = ({
  value,
  onChange,
  className,
  placeholder = "Select school..."
}: SchoolSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { data: schoolsData, isLoading, isError } = useSchools();

  // Map backend schools to selection format
  const schools = useMemo(() => {
    return (schoolsData || []).map((school) => ({
      value: school.id,
      label: `${school.school_name} (${school.school_code})`,
      original_name: school.school_name,
      code: school.school_code,
      ...school
    }));
  }, [schoolsData]);

  // Find the selected school object
  const selectedSchool = useMemo(() => {
    return schools.find((school) => school.value === value);
  }, [value, schools]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal h-12 text-base rounded-xl border-slate-200 bg-background dark:bg-slate-900 dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm",
            className
          )}
          disabled={isLoading}
        >
          <span className={cn("truncate flex items-center gap-2", !value && "text-muted-foreground font-medium italic")}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                "Syncing Network..." 📡
              </>
            ) : value ? (
              <>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedSchool?.original_name}</span>
                {selectedSchool?.code && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono border border-primary/20 tracking-tighter uppercase">
                    {selectedSchool.code}
                  </span>
                )}
              </>
            ) : (
                placeholder
            )}
          </span>
          {!isLoading && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />}
        </Button>
      </PopoverTrigger>
      {!isLoading && (
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 shadow-2xl border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden z-[200]" align="start">
          <Command className="bg-white dark:bg-slate-950">
            <div className="flex items-center p-2 border-b border-slate-100 dark:border-slate-800">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-4 z-10" />
              <CommandPrimitive.Input
                placeholder="Search name or ID code..."
                className="flex h-10 w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
              <CommandEmpty className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl m-2 border border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No school found</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">Check name or try manual entry</p>
                </div>
              </CommandEmpty>
              {isError ? (
                <div className="p-4 text-center text-xs text-destructive font-bold uppercase tracking-widest">
                    ⚠️ Network Sync Error
                </div>
              ) : (
                <CommandGroup heading="Verified Partner Network" className="px-1 text-slate-500 font-black uppercase text-[9px] tracking-[0.2em] mb-2 pt-2">
                  {schools.map((school) => (
                    <CommandItem
                      key={school.value}
                      value={school.label} // Command internal search matches label
                      onSelect={() => {
                        onChange(school.value, school);
                        setOpen(false);
                      }}
                      className="rounded-xl aria-selected:bg-primary/5 dark:aria-selected:bg-primary/10 my-1 py-3 px-4 cursor-pointer transition-all border border-transparent aria-selected:border-primary/20"
                    >
                      <Check
                        className={cn(
                          "mr-3 h-4 w-4 text-primary transition-opacity shrink-0",
                          value === school.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate uppercase tracking-tight">
                          {school.original_name}
                        </span>
                        {school.code && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                              ID: {school.code}
                            </span>
                            {school.place && (
                                <span className="text-[10px] text-slate-400 italic truncate">• {school.place}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
};
