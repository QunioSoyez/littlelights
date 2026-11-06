import { Stack } from "expo-router";
import { colors } from "@/constants/theme";

// Always keep the story list underneath a story, so a story opened directly
// (from a link or a page reload) still has a back arrow to the list.
export const unstable_settings = { initialRouteName: "index" };

// The Bible tab has its own stack: story list -> story reader (with a back button).
export default function BibleLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.blue },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
        contentStyle: { backgroundColor: colors.cream },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Bible Read-Along" }} />
      <Stack.Screen name="[id]" options={{ title: "Story" }} />
    </Stack>
  );
}
