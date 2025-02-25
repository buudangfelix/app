import BackButton from "@/components/BackButton";
import React from "react";
import { View, Text, FlatList, ScrollView } from "react-native";
import { getAllOrders } from "@/lib/appwrite";
import useAppWrite from "@/lib/useAppWrite";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import LoadingIndicator from "@/components/LoadingIndicator";

const OrderHistory = ({}) => {
  const { data: orders, refetch } = useAppWrite(getAllOrders);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <View className="bg-primary w-full h-full px-4">
      <LoadingIndicator isLoading={isLoading} />
      <View className="mt-20 flex-row bg-primary pb-2">
        <BackButton />
        <Text className="absolute left-1/2 -translate-x-1/2 flex-1 text-center text-2xl text-gray-700 font-psemibold ">
          Orders
        </Text>
      </View>
      <ScrollView>
        {orders &&
          orders.map((order) => (
            <View
              key={order.$id}
              className="bg-primary-100 w-full rounded-lg p-4 my-2 border border-gray-300"
            >
              <View className="w-full flex-row items-center justify-between mb-3">
                <Text className="text-base text-gray-500 font-psemibold">
                  {new Date(order.$createdAt).toLocaleDateString()}
                </Text>
                <Text className="text-xl text-green-600 font-semibold">
                  $AUD {order.amount}
                </Text>
              </View>
              <View className="w-full flex-row items-center justify-between">
                <Text className="w-[40%] text-lg text-secondary font-psemibold">
                  Product
                </Text>
                <Text className="w-[30%] text-lg text-secondary font-psemibold">
                  Price
                </Text>
                <Text className="w-[30%] text-lg text-secondary font-psemibold">
                  Quantity
                </Text>
              </View>
              {order.weapons.map((weapon, index) => (
                <View
                  key={index}
                  className="w-full flex-row items-center justify-between"
                >
                  <Text className="w-[40%] text-base font-psemibold">
                    {weapon.weapon_name}
                  </Text>
                  <Text className="w-[30%] text-base font-pregular">
                    $ {weapon.price}
                  </Text>
                  <Text className="w-[30%] text-base font-pregular">
                    x {order.quantities[index]}
                  </Text>
                </View>
              ))}
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

export default OrderHistory;
