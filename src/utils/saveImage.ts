import { Directory, Filesystem } from "@capacitor/filesystem";

import { isNative } from "./isNative";

function saveImageWeb(dataUrl: string, filename: string) {
  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = filename;
  link.click();
}

async function saveImageNative(dataUrl: string, filename: string) {
  const base64 = dataUrl.split(",")[1];

  if (!base64) {
    throw new Error("Invalid image data URL");
  }

  await Filesystem.writeFile({
    path: `Phosphor-Cam/${filename}`,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });
}

export async function saveImage(dataUrl: string, filename: string) {
  if (isNative()) {
    await saveImageNative(dataUrl, filename);
  } else {
    saveImageWeb(dataUrl, filename);
  }
}
