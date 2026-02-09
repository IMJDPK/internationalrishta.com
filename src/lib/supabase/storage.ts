import { createClient } from "./client";

export async function uploadProfilePhoto(
  userId: string,
  file: File,
  isPrimary: boolean = false
): Promise<{ url: string; error: any }> {
  const supabase = createClient();

  // Create unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { url: "", error: uploadError };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

  // Save to photos table
  const { error: dbError } = await supabase.from("photos").insert({
    user_id: userId,
    url: publicUrl,
    is_primary: isPrimary,
    order_index: 0,
  });

  if (dbError) {
    // Cleanup uploaded file if database insert fails
    await supabase.storage.from("profile-photos").remove([fileName]);
    return { url: "", error: dbError };
  }

  // If this is primary, unset other primary photos
  if (isPrimary) {
    await supabase
      .from("photos")
      .update({ is_primary: false })
      .eq("user_id", userId)
      .neq("url", publicUrl);
  }

  return { url: publicUrl, error: null };
}

export async function getUserPhotos(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("order_index", { ascending: true });

  return { photos: data || [], error };
}

export async function deletePhoto(userId: string, photoUrl: string) {
  const supabase = createClient();

  // Extract file path from URL
  const urlParts = photoUrl.split("/profile-photos/");
  if (urlParts.length < 2) {
    return { error: new Error("Invalid photo URL") };
  }
  const filePath = urlParts[1];

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("profile-photos")
    .remove([filePath]);

  if (storageError) {
    return { error: storageError };
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("photos")
    .delete()
    .eq("user_id", userId)
    .eq("url", photoUrl);

  return { error: dbError };
}

export async function setPrimaryPhoto(userId: string, photoUrl: string) {
  const supabase = createClient();

  // Unset all primary photos
  await supabase
    .from("photos")
    .update({ is_primary: false })
    .eq("user_id", userId);

  // Set new primary
  const { error } = await supabase
    .from("photos")
    .update({ is_primary: true })
    .eq("user_id", userId)
    .eq("url", photoUrl);

  return { error };
}
