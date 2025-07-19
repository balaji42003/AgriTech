import { Stack } from "expo-router";
import { LanguageProvider } from "./context/LanguageContext";
import useFCM from "./modules/useFCM";

export default function Layout() {
  useFCM((msg) => {
    // Optionally handle FCM messages here, but do NOT show notifications manually!
    // Just log if you want:
    console.log("Received FCM:", msg);
  });

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
