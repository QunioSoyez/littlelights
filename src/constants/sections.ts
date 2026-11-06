import type { ImageSource } from "expo-image";
import { sectionColors } from "@/constants/theme";

// One place to define each section of the app.
// Used by the home screen cards, the bottom tab bar and the placeholder screens.
export type Section = {
  name: "bible" | "games" | "songs" | "prayer" | "journal"; // file name in src/app
  href: "/bible" | "/games" | "/songs" | "/prayer" | "/journal";
  title: string; // full name (home card + screen header)
  tabLabel: string; // short name for the bottom tab bar
  color: string;
  picture: ImageSource; // big scene picture for the home card
  icon: ImageSource; // small blue round icon
};

export const homeIcon: ImageSource = require("../../assets/images/icons/home.png");

export const sections: Section[] = [
  {
    name: "bible",
    href: "/bible",
    title: "Bible Read-Along",
    tabLabel: "Read",
    color: sectionColors.bible,
    picture: require("../../assets/images/home/bible.jpg"),
    icon: require("../../assets/images/icons/bible.png"),
  },
  {
    name: "games",
    href: "/games",
    title: "Games",
    tabLabel: "Games",
    color: sectionColors.games,
    picture: require("../../assets/images/home/games.jpg"),
    icon: require("../../assets/images/icons/games.png"),
  },
  {
    name: "songs",
    href: "/songs",
    title: "Sing-Along",
    tabLabel: "Sing",
    color: sectionColors.songs,
    picture: require("../../assets/images/home/songs.jpg"),
    icon: require("../../assets/images/icons/songs.png"),
  },
  {
    name: "prayer",
    href: "/prayer",
    title: "Family Prayer",
    tabLabel: "Pray",
    color: sectionColors.prayer,
    picture: require("../../assets/images/home/prayer.jpg"),
    icon: require("../../assets/images/icons/prayer.png"),
  },
  {
    name: "journal",
    href: "/journal",
    title: "Thank-You Journal",
    tabLabel: "Journal",
    color: sectionColors.journal,
    picture: require("../../assets/images/home/journal.jpg"),
    icon: require("../../assets/images/icons/journal.png"),
  },
];

export function getSection(name: Section["name"]): Section {
  return sections.find((s) => s.name === name)!;
}
