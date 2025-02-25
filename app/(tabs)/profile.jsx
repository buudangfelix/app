import { useGlobalContext } from "@/context/GlobalProvider";
import { getAllOrders, signOut } from "@/lib/appwrite";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import useAppWrite from "@/lib/useAppWrite";
import LoadingIndicator from "@/components/LoadingIndicator";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";

const Profile = () => {
  const { setIsLoggedIn, user, setUser } = useGlobalContext();
  const { data: orders, refetch } = useAppWrite(getAllOrders);
  const [isLoading, setIsLoading] = useState(false);

  const logOut = async () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await signOut();
              setUser(null);
              setIsLoggedIn(false);
              router.replace("/(auth)/sign-in");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await refetch();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  useEffect(() => {
    refreshData();
  }, []);

  const onPress = async () => {
    try {
      router.push(`/order/}`);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View className="bg-primary h-full px-4 ">
      <LoadingIndicator isLoading={isLoading} />
      <ScrollView>
        <View className="w-full justify-center items-center px-4 mt-20 mb-10">
          <View className="flex-col items-center justify-center">
            <View className="w-48 h-48 border border-secondary rounded-full justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-full"
                resizeMode="contain"
              />
            </View>
            <Text className="font-semibold text-4xl text-secondary pt-4">
              {user?.username}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-full py-2 border-t border-b border-gray-300"
          onPress={() => {
            router.push("/profile/edit");
          }}
        >
          <View className="h-10 flex-row justify-between items-center space-x-3 ">
            <MaterialIcons name="account-circle" size={20} color="grey" />
            <Text className="text-lg text-gray-700 font-pregular  ml-4 flex-1 ">
              Profile Edit
            </Text>
            <AntDesign name="right" size={20} color="grey" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full py-2 border-b border-gray-300"
          onPress={onPress}
        >
          <View className="h-10 flex-row items-center space-x-3">
            <FontAwesome5 name="clipboard-list" size={20} color="grey" />
            <Text className="text-lg text-gray-700 font-pregular ml-4 flex-1">
              Your Orders
            </Text>
            <AntDesign name="right" size={20} color="grey" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="w-full py-2 border-b border-gray-300">
          <View className="h-10 flex-row justify-between items-center space-x-3">
            <MaterialIcons name="local-shipping" size={20} color="grey" />
            <Text className="text-lg text-gray-700 font-pregular ml-4 flex-1">
              Shipping Address
            </Text>
            <AntDesign name="right" size={20} color="grey" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="w-full py-2 border-b border-gray-300">
          <View className="h-10 flex-row justify-between items-center space-x-3">
            <MaterialIcons name="payment" size={20} color="grey" />
            <Text className="text-lg text-gray-700 font-pregular  ml-4 flex-1">
              Payment Info
            </Text>
            <AntDesign name="right" size={20} color="grey" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full py-2 border-b border-gray-300"
          onPress={logOut}
        >
          <View className="h-10 flex-row justify-between items-center space-x-3">
            <Ionicons name="log-out" size={20} color="grey" />
            <Text className="text-lg text-gray-700 font-pregular  ml-4 flex-1">
              Sign Out
            </Text>
            <AntDesign name="right" size={20} color="grey" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Profile;
