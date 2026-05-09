import { useMutation } from "@tanstack/react-query";
import { getPresignedUrlRequest, uploadToPresignedUrlRequest } from "./api";
import { catchError } from "@/lib/catch-error";

export function useUploadMutation() {
  return useMutation({
    mutationFn: async ({
      endpoint,
      file,
    }: {
      endpoint: string;
      file: File;
    }) => {
      const [err, res] = await catchError(getPresignedUrlRequest(endpoint));
      if (err) throw err;

      const data = res.data.data;
      if (!data) throw new Error("Invalid response from server");

      const [uploadErr] = await catchError(
        uploadToPresignedUrlRequest(data.url, file),
      );
      if (uploadErr) throw uploadErr;

      return data.path;
    },
  });
}

export function useProductImageUpload() {
  const upload = useUploadMutation();

  return {
    ...upload,
    uploadProductImage: (file: File) =>
      upload.mutateAsync({
        endpoint: "/upload/product-image",
        file,
      }),
  };
}
