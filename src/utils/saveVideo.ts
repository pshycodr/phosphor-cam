import { Directory, Filesystem } from "@capacitor/filesystem";

import { isNative } from "./isNative";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Failed to convert blob to base64"));
        return;
      }

      resolve(result.split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function saveVideo(blob: Blob, fileName: string) {
  if (isNative()) {
    const base64 = await blobToBase64(blob);

    await Filesystem.writeFile({
      path: `PhosphorCam/${fileName}`,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });

    return;
  }

  // Web
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}
