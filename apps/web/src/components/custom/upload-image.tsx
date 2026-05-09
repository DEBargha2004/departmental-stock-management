import { getImageUrl } from "@/lib/utils";
import { PlusCircle, Loader2 } from "lucide-react";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

export default function UploadImage({
  value,
  onValueChange,
  uploader,
  isUploading,
}: {
  value?: string;
  onValueChange: (val: string) => void;
  uploader: (file: File) => Promise<string>;
  isUploading?: boolean;
}) {
  const imageUrl = useMemo(() => getImageUrl(value ?? ""), [value]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  useEffect(() => {
    const controller = new AbortController();

    inputRef.current?.addEventListener("change", async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const path = await uploader(file);
          onValueChange(path);
        } catch (error) {
          toast.error("Failed to upload image. Please try again.", {
            description: (error as Error).message,
          });
        }
      }
    });

    return () => controller.abort();
  }, []);

  return (
    <>
      <input type="file" hidden ref={inputRef} />
      <div
        className={`size-20 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-border/60 hover:border-primary/50 transition-all relative group ${
          isUploading ? "opacity-50 pointer-events-none" : ""
        }`}
        onClick={handleClick}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Uploaded"
              className="size-full object-cover transition-transform group-hover:scale-110"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <PlusCircle className="size-5 text-white" />
            </div>
          </>
        ) : (
          <div className="size-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors">
            {isUploading ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : (
              <PlusCircle className="size-5 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
    </>
  );
}
