import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

const FormField = ({
  title,
  value,
  placeholder,
  handleTextChange,
  otherStyles,
  ...props
}) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray font-pmedium mb-2">{title}</Text>
      <View
        className="border-2 border-primary w-full h-16 px-6 bg-primary-100 rounded-full
      focus:border-secondary items-center flex-row"
      >
        <TextInput
          className="flex-1 text-gray font-pregular text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#000"
          onChangeText={handleTextChange}
          secureTextEntry={
            title.toLowerCase().includes("password") && !isShowPassword
          }
          autoCapitalize="none"
          {...props}
        />
        {title.toLowerCase().includes("password") && (
          <TouchableOpacity onPress={() => setIsShowPassword(!isShowPassword)}>
            {!isShowPassword ? (
              <Feather name="eye-off" size={24} color="#ddd" />
            ) : (
              <Feather name="eye" size={24} color="#ddd" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
