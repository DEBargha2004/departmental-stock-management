import { getImageUrl } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

export default function UploadImage({
  value,
  onValueChange,
  uploader,
}: {
  value?: string;
  onValueChange: (val: string) => void;
  uploader: (file: File) => Promise<string>;
}) {
  const imageUrl = useMemo(() => getImageUrl(value ?? ""), [value]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
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
          console.log("Upload error:", error);
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
      <div className="size-20 rounded overflow-hidden" onClick={handleClick}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="size-full object-cover rounded-md"
          />
        ) : (
          <div className="size-full bg-accent grid place-content-center">
            <PlusCircle className="size-5" />
          </div>
        )}
      </div>
    </>
  );
}
