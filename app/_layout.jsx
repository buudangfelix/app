import React, { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";
import GlobalProvider from "@/context/GlobalProvider";
import { useFonts } from "expo-font";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw new Error(error.message);
    if (loaded) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && error) return null;

  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[query]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
        <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
        <Stack.Screen
          name="searchPage/[searchPage]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="order/[order-history]"
          options={{ headerShown: false }}
        />
      </Stack>
    </GlobalProvider>
  );
};

export default RootLayout;
