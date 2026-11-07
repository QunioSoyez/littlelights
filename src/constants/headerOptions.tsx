import MenuButton from "@/components/AppMenu";
import HeaderLeft from "@/components/HeaderLeft";
import { colors } from "@/constants/theme";

// Shared look for every blue header: logo + back arrow on the left, hamburger on the right.
// Used by the main stack and by the Bible and Games stacks.
export const headerOptions = {
  headerStyle: { backgroundColor: colors.blue },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: "bold" as const, fontSize: 22 },
  headerLeft: ({ canGoBack }: { canGoBack?: boolean }) => <HeaderLeft canGoBack={canGoBack} />,
  headerRight: () => <MenuButton />,
  contentStyle: { backgroundColor: colors.cream },
};
