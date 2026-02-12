"use server";

export async function uploadChallengeImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Dynamic import to avoid early client-side evaluation of storage.ts
    const { uploadChallengeImage } = await import("@/lib/storage");
    const publicUrl = await uploadChallengeImage(file);
    return { publicUrl };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload image" };
  }
}
