import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { sections } from "@/constants/sections";
import { headerOptions } from "@/constants/headerOptions";

// Keep Home underneath any screen opened directly (link or page reload), so there's a back arrow.
export const unstable_settings = { initialRouteName: "index" };

// Sections with their own inner stack (and their own headers)
const nestedSections = ["bible", "games"];

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={headerOptions}>
        {/* Home: no logo button on the left (you're already home) */}
        <Stack.Screen name="index" options={{ title: "Little Lights", headerLeft: () => null }} />
        {sections.map((s) => (
          <Stack.Screen
            key={s.name}
            name={s.name}
            options={{ title: s.title, headerShown: !nestedSections.includes(s.name) }}
          />
        ))}
        <Stack.Screen name="about" options={{ title: "About" }} />
      </Stack>
    </>
  );
}
