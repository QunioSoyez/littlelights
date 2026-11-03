import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.blue },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: "Little Lights" }} />
        <Stack.Screen name="bible" options={{ title: "Bible Stories" }} />
        <Stack.Screen name="games" options={{ title: "Games" }} />
        <Stack.Screen name="songs" options={{ title: "Sing-Along" }} />
        <Stack.Screen name="prayer" options={{ title: "Family Prayer" }} />
        <Stack.Screen name="journal" options={{ title: "Thank-You Journal" }} />
      </Stack>
    </>
  );
}
