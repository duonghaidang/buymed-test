import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider as ReduxProvider } from "react-redux";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/stores/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ToastManager from "toastify-react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ReduxProvider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
          <ToastManager />
        </SafeAreaProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
