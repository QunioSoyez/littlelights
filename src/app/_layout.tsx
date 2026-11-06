import { Image, type ImageSource } from "expo-image";
import { Tabs } from "expo-router/js-tabs";
import { StatusBar } from "expo-status-bar";
import { homeIcon, sections } from "@/constants/sections";
import { colors } from "@/constants/theme";

// Round tab icon: full color when selected, faded when not.
function tabIcon(source: ImageSource) {
  return ({ focused }: { focused: boolean }) => (
    <Image source={source} style={{ width: 36, height: 36, opacity: focused ? 1 : 0.45 }} />
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.blue },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
          sceneStyle: { backgroundColor: colors.cream },
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.textLight,
          tabBarLabelStyle: { fontSize: 13, fontWeight: "bold" },
          tabBarStyle: { height: 76, paddingTop: 6, backgroundColor: colors.white },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "Home", headerShown: false, tabBarIcon: tabIcon(homeIcon) }}
        />
        {sections.map((s) => (
          <Tabs.Screen
            key={s.name}
            name={s.name}
            options={{
              title: s.title,
              tabBarLabel: s.tabLabel,
              tabBarIcon: tabIcon(s.icon),
              // The Bible tab shows its own headers (story list -> story reader)
              headerShown: s.name !== "bible",
            }}
          />
        ))}
      </Tabs>
    </>
  );
}
