import { Stack } from "expo-router";
import { LanguageProvider } from "./context/LanguageContext";

export default function Layout() {
  return (
    <LanguageProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </LanguageProvider>
  );
}
