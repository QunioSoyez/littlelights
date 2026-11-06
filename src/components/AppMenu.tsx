import { Image, type ImageSource } from "expo-image";
import { router, usePathname, type Href } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { homeIcon, sections } from "@/constants/sections";
import { colors } from "@/constants/theme";

const PANEL_WIDTH = 300;

type MenuItem = { href: Href; label: string; icon?: ImageSource };

const items: MenuItem[] = [
  { href: "/", label: "Home", icon: homeIcon },
  ...sections.map((s) => ({ href: s.href, label: s.title, icon: s.icon })),
  { href: "/about", label: "About" }, // no picture icon yet - drawn as an "i" circle
];

// Hamburger button for the top-right of every header. Opens a panel that slides in from the right.
export default function MenuButton() {
  const [open, setOpen] = useState(false);
  const slide = useRef(new Animated.Value(PANEL_WIDTH)).current; // PANEL_WIDTH = hidden, 0 = shown
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  function show() {
    setOpen(true);
    Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: false }).start();
  }

  function hide(then?: () => void) {
    Animated.timing(slide, { toValue: PANEL_WIDTH, duration: 180, useNativeDriver: false }).start(() => {
      setOpen(false);
      then?.();
    });
  }

  function go(href: Href) {
    hide(() => router.navigate(href));
  }

  return (
    <>
      <Pressable
        onPress={show}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        hitSlop={10}
        style={({ pressed }) => [styles.burger, { opacity: pressed ? 0.6 : 1 }]}
      >
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => hide()}>
        {/* Dark backdrop: tap it to close */}
        <Pressable style={styles.backdrop} onPress={() => hide()} accessibilityLabel="Close menu" />

        <Animated.View
          style={[styles.panel, { paddingTop: insets.top + 12, transform: [{ translateX: slide }] }]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Menu</Text>
            <Pressable onPress={() => hide()} accessibilityRole="button" accessibilityLabel="Close menu" hitSlop={10}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {items.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Pressable
                  key={item.label}
                  onPress={() => go(item.href)}
                  accessibilityRole="link"
                  accessibilityLabel={item.label}
                  style={({ pressed }) => [
                    styles.item,
                    active && styles.itemActive,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  {item.icon ? (
                    <Image source={item.icon} style={styles.icon} />
                  ) : (
                    <View style={[styles.icon, styles.infoIcon]}>
                      <Text style={styles.infoText}>i</Text>
                    </View>
                  )}
                  <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  burger: { width: 44, height: 44, justifyContent: "center", alignItems: "center", gap: 5, marginRight: 8 },
  bar: { width: 26, height: 3, borderRadius: 2, backgroundColor: colors.white },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0, 0, 0, 0.35)" },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  panelTitle: { fontSize: 24, fontWeight: "bold", color: colors.blue },
  close: { fontSize: 24, color: colors.textLight },
  list: { paddingHorizontal: 12, paddingBottom: 24, gap: 6 },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 16 },
  itemActive: { backgroundColor: colors.goldLight },
  icon: { width: 48, height: 48, borderRadius: 24 },
  infoIcon: { backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" },
  infoText: { color: colors.white, fontSize: 26, fontWeight: "bold", fontStyle: "italic" },
  label: { fontSize: 20, fontWeight: "bold", color: colors.text, flexShrink: 1 },
  labelActive: { color: colors.blue },
});
