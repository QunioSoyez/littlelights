import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import MenuButton from "@/components/AppMenu";
import { sections } from "@/constants/sections";
import { colors } from "@/constants/theme";

// Keep Home underneath any screen opened directly (link or page reload), so there's a back arrow.
export const unstable_settings = { initialRouteName: "index" };

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.blue },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
          headerRight: () => <MenuButton />, // hamburger menu on every screen
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Little Lights" }} />
        {sections.map((s) => (
          <Stack.Screen
            key={s.name}
            name={s.name}
            // The Bible section has its own headers (story list -> story reader)
            options={{ title: s.title, headerShown: s.name !== "bible" }}
          />
        ))}
        <Stack.Screen name="about" options={{ title: "About" }} />
      </Stack>
    </>
  );
}
