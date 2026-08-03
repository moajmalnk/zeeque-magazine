import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useSchools } from '@/hooks/useSchools';

interface SchoolSelectorProps {
  value?: string;
  onChange: (value: string, schoolDetails?: any) => void;
  className?: string;
  placeholder?: string;
}

type SchoolOption = {
  id: string;
  value: string;
  label: string;
  original_name: string;
  code: string;
  place?: string;
  district?: string;
  username?: string;
  school_name?: string;
  school_code?: string;
};

function schoolDisplayName(school: {
  school_name?: string | null;
  username?: string | null;
  school_code?: string | null;
}) {
  return (school.school_name || school.username || school.school_code || '').trim();
}

export const SchoolSelector = ({
  value,
  onChange,
  className,
  placeholder = "Search name or ID code..."
}: SchoolSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Local label so the field updates instantly on select (does not wait for parent form round-trip)
  const [selectedLabel, setSelectedLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: schoolsData, isLoading, isError } = useSchools();

  const schools: SchoolOption[] = useMemo(() => {
    return (schoolsData || []).map((school) => {
      const name = schoolDisplayName(school);
      const code = (school.school_code || '').trim();
      return {
        ...school,
        value: school.id,
        label: code ? `${name} (${code})` : name,
        original_name: name,
        code,
      };
    });
  }, [schoolsData]);

  const selectedSchool = useMemo(() => {
    if (!value?.trim()) return undefined;
    const needle = value.trim().toLowerCase();
    return schools.find((school) => {
      const candidates = [
        school.value,
        school.code,
        school.original_name,
        school.school_code,
        school.school_name,
        school.username,
      ]
        .filter(Boolean)
        .map((v) => String(v).trim().toLowerCase());
      return candidates.includes(needle);
    });
  }, [value, schools]);

  // Keep local label in sync with resolved selection / cleared value
  useEffect(() => {
    if (selectedSchool?.original_name) {
      setSelectedLabel(selectedSchool.original_name);
      return;
    }
    if (!value?.trim()) {
      setSelectedLabel('');
      return;
    }
    // Value exists but not in network list yet — still show the raw value (name or code)
    setSelectedLabel((prev) => prev || value.trim());
  }, [selectedSchool, value]);

  const filteredSchools = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((school) => {
      const haystack = [
        school.original_name,
        school.code,
        school.label,
        school.place,
        school.district,
        school.username,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [schools, search]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setSearch('');
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setSearch('');
    }
  };

  const selectSchool = (school: SchoolOption) => {
    const name = school.original_name || school.code || school.value;
    setSelectedLabel(name);
    setSearch('');
    setOpen(false);
    // Pass code when available (forms store institution code); always include display name on details
    onChange(school.code || school.value, {
      ...school,
      original_name: name,
      code: school.code,
    });
  };

  const clearSelection = () => {
    setSelectedLabel('');
    setSearch('');
    onChange('', undefined);
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Closed → show selected name. Open + typing → show search. Open + empty search → keep showing selection as placeholder feel via value ''
  const inputValue = open ? search : selectedLabel;

  const hasSelection = !!selectedLabel || !!selectedSchool || !!value?.trim();

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
        <PopoverAnchor asChild>
          <div
            className={cn(
              "relative w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-background dark:bg-slate-900 shadow-sm transition-colors",
              "focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/60",
              open && "ring-2 ring-primary/30 border-primary/60",
              isLoading && "opacity-70 pointer-events-none",
              className
            )}
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              disabled={isLoading}
              value={inputValue}
              placeholder={
                isLoading
                  ? "Syncing Network..."
                  : open && selectedLabel
                    ? selectedLabel
                    : placeholder
              }
              onChange={(e) => {
                setSearch(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setOpen(false);
                  inputRef.current?.blur();
                }
                if (e.key === 'ArrowDown' && !open) {
                  e.preventDefault();
                  setOpen(true);
                }
                if (e.key === 'Enter' && open && filteredSchools.length === 1) {
                  e.preventDefault();
                  selectSchool(filteredSchools[0]);
                }
              }}
              className={cn(
                "w-full h-full bg-transparent rounded-xl pl-10 pr-16 text-sm font-medium outline-none",
                "placeholder:text-muted-foreground placeholder:font-medium",
                "dark:text-white"
              )}
              aria-expanded={open}
              aria-autocomplete="list"
              aria-label="Search schools"
              role="combobox"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <>
                  {(open ? !!search : hasSelection) && (
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      aria-label="Clear"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearSelection();
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={open ? "Close school list" : "Open school list"}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOpen((prev) => !prev);
                      if (!open) inputRef.current?.focus();
                    }}
                  >
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </>
              )}
            </div>
          </div>
        </PopoverAnchor>

        <PopoverContent
          className="p-0 shadow-2xl border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden z-[300]"
          align="start"
          sideOffset={6}
          style={{ width: 'var(--radix-popover-anchor-width, var(--radix-popover-trigger-width, 100%))' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="px-3 pt-2.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              Verified Partner Network
              {!isLoading && (
                <span className="ml-2 text-primary/70 normal-case tracking-normal font-bold">
                  {filteredSchools.length}
                </span>
              )}
            </p>
          </div>

          <div className="max-h-[min(280px,40vh)] overflow-y-auto scrollbar-modal p-1.5">
            {isError ? (
              <div className="p-4 text-center text-xs text-destructive font-bold uppercase tracking-widest">
                Network Sync Error
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="py-8 text-center m-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No school found</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  Try another name / ID, or type manually
                </p>
              </div>
            ) : (
              <ul className="py-1" role="listbox">
                {filteredSchools.map((school) => {
                  const isSelected =
                    !!value &&
                    [
                      school.value,
                      school.code,
                      school.original_name,
                    ].some((v) => v && v.toLowerCase() === value.trim().toLowerCase());
                  return (
                    <li key={school.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "w-full flex items-start rounded-xl my-0.5 py-3 px-3 text-left transition-all border border-transparent",
                          "hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20",
                          isSelected && "bg-primary/5 dark:bg-primary/10 border-primary/20"
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSchool(school)}
                      >
                        <Check
                          className={cn(
                            "mr-3 mt-0.5 h-4 w-4 text-primary shrink-0 transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col gap-1 overflow-hidden min-w-0 flex-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug break-words">
                            {school.original_name || 'Unnamed school'}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                            {school.code && (
                              <span className="text-[11px] text-muted-foreground font-mono tracking-tight shrink-0">
                                ID: {school.code}
                              </span>
                            )}
                            {school.place && (
                              <span className="text-[11px] text-slate-400 truncate">
                                · {school.place}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Always-visible confirmation of current selection */}
      {hasSelection && !open && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15">
          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{selectedLabel}</p>
            {selectedSchool?.code && (
              <p className="text-[10px] font-mono text-muted-foreground">ID: {selectedSchool.code}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
