import React from "react";
import { ActivityIndicator, View } from "react-native";

const LoadingIndicator = ({ isLoading }) => {
  return (
    <>
      {isLoading && (
        <View className="absolute w-[100vw] h-[100vh] z-10 bg-primary/50 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </>
  );
};

export default LoadingIndicator;
