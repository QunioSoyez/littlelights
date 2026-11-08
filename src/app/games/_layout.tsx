import { Stack } from "expo-router";
import { headerOptions } from "@/constants/headerOptions";

// Keep the games list underneath, so a game opened directly still has a back arrow.
export const unstable_settings = { initialRouteName: "index" };

// Games: games list -> Build a Scene (pick a scene -> builder) / Puzzles (pick a puzzle -> puzzle)
export default function GamesLayout() {
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: "Games" }} />
      <Stack.Screen name="scenes/index" options={{ title: "Build a Scene" }} />
      <Stack.Screen name="scenes/[id]" options={{ title: "Build a Scene" }} />
      <Stack.Screen name="puzzles/index" options={{ title: "Puzzles" }} />
      <Stack.Screen name="puzzles/[id]" options={{ title: "Puzzle" }} />
    </Stack>
  );
}
