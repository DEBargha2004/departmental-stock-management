import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover as PopoverPrimitive } from "radix-ui";

type SearchableSelectContextType<T> = {
  list: T[];
  loading: boolean;
  query: string;
  handleQueryChange: (query: string) => void;
  onValueChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
const SearchableSelectContext =
  createContext<SearchableSelectContextType<unknown> | null>(null);

const useSearchableSelectContext = <T,>() => {
  const context = useContext(SearchableSelectContext);
  if (!context) {
    throw new Error(
      "useSearchableSelectContext must be used within a SearchableSelect",
    );
  }
  return context as SearchableSelectContextType<T>;
};

export default function SearchableSelect<T>({
  list,
  query: initialQuery,
  onQueryChange,
  onValueChange,
  children,
  isLoading,
}: {
  list: T[];
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
        list,
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
}: {
  children: React.ReactNode;
}) {
  return (
    <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
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
    <Input
      value={query}
      onChange={(e) => {
        handleQueryChange(e.target.value);
        onChange?.(e);
      }}
      className={cn("rounded-b-none", className)}
      {...props}
    />
  );
}

export function SearchableSelectVacuum() {
  const { list, loading } = useSearchableSelectContext();

  if (loading) {
    return <Loader2 className="animate-spin" size={16} />;
  }

  if (!list.length)
    return <p className="text-sm text-muted-foreground">List is Empty</p>;
}

export function SearchableSelectList({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn("max-h-60 overflow-y-auto p-2", "flex justify-center")}>
      {children}
    </div>
  );
}

export function SearchableSelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { onValueChange, onOpenChange } = useSearchableSelectContext();

  return (
    <div
      className="cursor-pointer rounded-sm px-2 py-1 hover:bg-accent w-full"
      onClick={() => {
        onValueChange(value);
        onOpenChange?.(false);
      }}
    >
      {children}
    </div>
  );
}
