import React from "react";
import { Image, View } from "react-native";
import badge from "@/assets/images/bookwormia_logo.png";

const Logo = ({ containerStyles }) => {
  return (
    <View className={`justify-center items-center ${containerStyles}`}>
      <Image
        source={badge}
        className="w-[400%] h-[400%]"
        resizeMode="contain"
      />
    </View>
  );
};

export default Logo;
