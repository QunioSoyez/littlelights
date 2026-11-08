import { Stack } from "expo-router";
import { headerOptions } from "@/constants/headerOptions";

// Keep the topic list underneath, so a topic opened directly still has a back arrow.
export const unstable_settings = { initialRouteName: "index" };

// Family Prayer: topics -> prayers for that topic
export default function PrayerLayout() {
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: "Family Prayer" }} />
      <Stack.Screen name="[topic]" options={{ title: "Family Prayer" }} />
    </Stack>
  );
}
