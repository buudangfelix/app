import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { LogBox, ScrollView, View } from "react-native";
import Logo from "@/components/Logo";
import CustomButton from "@/components/CustomButton";

LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreAllLogs();

function App() {
  const { isLoading, isLoggedIn } = useGlobalContext();

  if (!isLoading && isLoggedIn) return <Redirect href="/home" />;

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full min-h-[85vh] items-center justify-center px-6">
          <Logo containerStyles="w-96 h-96" />
          <CustomButton
            title="Continue with Email"
            containerStyles="w-full mt-7"
            handlePress={() => {
              router.push("/(auth)/sign-in");
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
