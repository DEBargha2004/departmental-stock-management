import { createContext, useContext, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Loader2, Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover as PopoverPrimitive } from "radix-ui";

type SearchableSelectContextType = {
  loading: boolean;
  query: string;
  handleQueryChange: (query: string) => void;
  onValueChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
const SearchableSelectContext =
  createContext<SearchableSelectContextType | null>(null);

const useSearchableSelectContext = () => {
  const context = useContext(SearchableSelectContext);
  if (!context) {
    throw new Error(
      "useSearchableSelectContext must be used within a SearchableSelect",
    );
  }
  return context as SearchableSelectContextType;
};

export default function SearchableSelect({
  query: initialQuery,
  onQueryChange,
  onValueChange,
  children,
  isLoading,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  isLoading: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setQuery("");
      onQueryChange("");
    }
  };

  const handleQueryChange = async (query: string) => {
    setQuery(query);
    onQueryChange(query);
  };

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <SearchableSelectContext.Provider
      value={{
        loading: isLoading,
        query,
        handleQueryChange,
        onValueChange,
        onOpenChange,
      }}
    >
      <Popover open={open} onOpenChange={onOpenChange}>
        {children}
      </Popover>
    </SearchableSelectContext.Provider>
  );
}

export function SearchableSelectTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverTrigger className={cn("", className)} {...props}>
      {children}
    </PopoverTrigger>
  );
}

export function SearchableSelectContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PopoverContent
      className={cn(
        "p-0 w-(--radix-popover-trigger-width) overflow-hidden border-input/40 shadow-xl animate-in fade-in zoom-in-95 duration-200",
        className
      )}
    >
      {children}
    </PopoverContent>
  );
}

export function SearchableSelectInput({
  value,
  onChange,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input">) {
  const { query, handleQueryChange } = useSearchableSelectContext();

  return (
    <div className="relative border-b border-input/40">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
      <Input
        value={query}
        onChange={(e) => {
          handleQueryChange(e.target.value);
          onChange?.(e);
        }}
        className={cn(
          "rounded-none border-0 h-11 pl-9 pr-4 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-muted-foreground/50 text-sm",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function SearchableSelectVacuum({ listLength }: { listLength: number }) {
  const { loading } = useSearchableSelectContext();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 animate-in fade-in duration-300">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <Loader2 className="h-4 w-4 text-primary animate-pulse" />
        </div>
        <p className="mt-3 text-xs font-medium text-muted-foreground animate-pulse">Searching...</p>
      </div>
    );
  }

  if (!listLength) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in duration-300">
        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Info className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">No matches found</p>
        <p className="text-[11px] text-muted-foreground mt-1 px-4">
          Try a different keyword or refine your search
        </p>
      </div>
    );
  }

  return null;
}

export function SearchableSelectList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-h-64 overflow-y-auto p-1.5 custom-scrollbar",
        "flex flex-col gap-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SearchableSelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { onValueChange, onOpenChange } = useSearchableSelectContext();

  return (
    <div
      className={cn(
        "group cursor-pointer rounded-md px-3 py-2.5 hover:bg-primary/5 active:bg-primary/10 transition-all duration-200 outline-none",
        "border border-transparent hover:border-primary/10",
        className
      )}
      onClick={() => {
        onValueChange(value);
        onOpenChange?.(false);
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
