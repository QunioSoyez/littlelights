import { Image } from "expo-image";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GatedLink as A, ParentGateProvider } from "@/components/ParentGate";
import PatternBackground from "@/components/PatternBackground";
import { colors, sectionColors } from "@/constants/theme";

const CONTACT_EMAIL = "help@littlelights.live";
const YEAR = 2026;

// About: what Little Lights is, how to reach us, privacy, and credits/licenses.
// The Mission CTRL website and the contact email are tappable links. The GitHub
// address stays plain text (not useful for kids).
// Links ask a grown-ups-only question first (parent gate, required by Apple Kids / Google Families).
export default function About() {
  return (
    <ParentGateProvider>
      <PatternBackground>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.page}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Little Lights logo"
            />

            <Section title="About Little Lights">
              <P>
                Little Lights helps children enjoy the Bible with illustrated stories they can read along with, games,
                songs, family prayer and a thank-you journal.
              </P>
              <P>
                Little Lights is made by Mission CTRL, a North Carolina nonprofit (
                <A url="https://missionctrl.team">missionctrl.team</A>).
              </P>
            </Section>

            <Section title="Contact">
              <P>Questions, ideas or found a problem? Ask a grown-up to email us at:</P>
              <A url={`mailto:${CONTACT_EMAIL}`} style={styles.email}>
                {CONTACT_EMAIL}
              </A>
            </Section>

            <Section title="Privacy">
              <P>Little Lights is made for children, and we keep it simple and safe:</P>
              <Bullet>No sign-up or account is needed.</Bullet>
              <Bullet>We do not ask for names, emails, photos or any other personal information.</Bullet>
              <Bullet>Anything you save in the app (like journal entries) stays on your device.</Bullet>
              <Bullet>We do not use tracking or analytics.</Bullet>
              <P>
                Ads: to help keep Little Lights free, the app will show kid-safe ads when the device is online. They
                will come only from ad services approved for children's apps, will not be personalized, and will be
                rated for general audiences. The ad service may receive basic technical information needed to show an ad
                (such as the device type), but not personal information about your child. When offline, no ads are
                shown.
              </P>
              <P>Little Lights is designed to follow the Children's Online Privacy Protection Act (COPPA).</P>
              <P>
                Questions about privacy? Email <A url={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.
              </P>
            </Section>

            <Section title="Credits and License">
              <P>
                Bible stories and many illustrations: "Child's Story of the Bible" by Mary A. Lathbury (1898). Public
                domain.
              </P>
              <P>Additional illustrations were created for Little Lights.</P>
              <P>Scripture on the home screen: King James Version (public domain).</P>
              <P>
                The Little Lights name and logo © {YEAR} Mission CTRL. The app's source code is released under the MIT
                License: github.com/QunioSoyez/littlelights
              </P>
            </Section>
          </View>
        </ScrollView>
      </PatternBackground>
    </ParentGateProvider>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={[styles.paragraph, styles.bulletText]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  page: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    gap: 22,
    borderWidth: 2,
    borderColor: "#E8DDC4",
  },
  logo: { width: 140, height: 140, alignSelf: "center" },
  section: { gap: 10 },
  heading: { fontSize: 26, fontWeight: "bold", color: sectionColors.bible },
  paragraph: { fontSize: 18, lineHeight: 28, color: colors.text },
  email: { fontSize: 20, fontWeight: "bold" },
  bulletRow: { flexDirection: "row", gap: 10, paddingLeft: 4 },
  bulletDot: { fontSize: 18, lineHeight: 28, color: colors.blue },
  bulletText: { flex: 1 },
});
