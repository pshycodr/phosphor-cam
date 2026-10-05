export const SAVED_FOLDER = "Phosphor-cam";

export const getSavePath = (filename: string, type: "image" | "video") => {
  switch (type) {
    case "image":
      return `${SAVED_FOLDER}/images/${filename}`;

    case "video":
      return `${SAVED_FOLDER}/videos/${filename}`;
  }
};
export const VERSION = "v1.1.1";
