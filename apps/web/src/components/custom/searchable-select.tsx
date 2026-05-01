import { createContext, useContext, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
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
      className={cn("p-0 w-(--radix-popover-trigger-width)", className)}
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

export function SearchableSelectVacuum({ listLength }: { listLength: number }) {
  const { loading } = useSearchableSelectContext();

  if (loading) {
    return <Loader2 className="animate-spin" size={16} />;
  }

  if (!listLength)
    return <p className="text-sm text-muted-foreground">List is Empty</p>;
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
        "max-h-60 overflow-y-auto p-2",
        "flex justify-center",
        className,
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
        "cursor-pointer rounded-sm px-2 py-1 hover:bg-accent w-full",
        className,
      )}
      onClick={() => {
        onValueChange(value);
        onOpenChange?.(false);
      }}
    >
      {children}
    </div>
  );
}
