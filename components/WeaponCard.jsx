import React from "react";
import { Image, TouchableOpacity, View, Text, Alert } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { addItemsToCart, modifyViews, saveViewHistory } from "@/lib/appwrite";

const WeaponCard = ({
  item: { $id, weapon_name, photo_url, price },
  isSubmitting,
  setIsSubmitting,
}) => {
  const onPress = async () => {
    try {
      router.push(`/item/${$id}`);
      await saveViewHistory($id);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const addToCart = async () => {
    setIsSubmitting(true);
    try {
      await addItemsToCart($id);
      await modifyViews($id);
      Alert.alert("Success", "Item added successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableOpacity
      className="w-full h-[128px] bg-primary-100 px-4 mb-7 rounded-lg"
      onPress={onPress}
      disabled={isSubmitting}
    >
      <View className="flex-row py-4 gap-3 items-center">
        <View className="w-[96px] h-[96px] rounded-lg">
          <Image
            source={{ uri: photo_url }}
            className="w-full h-full rounded-lg border border-gray-300"
            resizeMode="contain"
          />
        </View>

        <View className="flex-1 flex-col">
          <Text
            className=" text-lg font-psemibold text-gray-500 mb-1"
            numberOfLines={2}
          >
            {weapon_name}
          </Text>

          <Text className="text-lg font-psemibold text-green-600">
            A$ {price}
          </Text>
        </View>

        <TouchableOpacity
          className="flex-col h-full justify-end"
          onPress={addToCart}
          disabled={isSubmitting}
        >
          <MaterialCommunityIcons name="cart-plus" size={30} color="#5b9ee2" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default WeaponCard;
