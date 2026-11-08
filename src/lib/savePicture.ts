import { Asset, requestPermissionsAsync } from "expo-media-library";
import type { ComponentRef, RefObject } from "react";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import type { ColoringPage } from "@/content/coloringPages";

// Phones: take a picture of the (hidden, un-zoomed) finished page and save it to Photos.
// The first time, the phone asks permission to save to Photos.
export async function savePicture(
  page: ColoringPage,
  _fills: Record<number, string>,
  exportView?: RefObject<ComponentRef<typeof View> | null>
): Promise<"saved" | "denied" | "failed"> {
  try {
    const permission = await requestPermissionsAsync(true); // true = save only, no reading the photo library
    if (!permission.granted) return "denied";
    if (!exportView?.current) return "failed";
    const uri = await captureRef(exportView, {
      format: "jpg",
      quality: 0.92,
      width: page.data.width,
      height: page.data.height,
      result: "tmpfile",
    });
    await Asset.create(uri);
    return "saved";
  } catch {
    return "failed";
  }
}

export const saveMessage = "Saved to your Photos!";
export const needsExportView = true;
