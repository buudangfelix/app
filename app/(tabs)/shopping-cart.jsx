import CustomButton from "@/components/CustomButton";
import {
  addToOrder,
  clearCartItems,
  getAllCartItems,
  modifyCartItem,
} from "@/lib/appwrite";
import useAppWrite from "@/lib/useAppWrite";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import LoadingIndicator from "@/components/LoadingIndicator";

const ShoppingCart = () => {
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const { data, refetch } = useAppWrite(getAllCartItems);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const calTotalPrice = () => {
    const total =
      data?.reduce((total, item) => {
        return total + item.quantity * item.weapons.price;
      }, 0) || 0;
    setTotalPrice(Number(total.toFixed(2)));
  };

  const modifyItemQuantity = async (weaponId, quantity) => {
    setIsLoading(true);
    try {
      await modifyCartItem(weaponId, quantity);
      await refetch();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      if (!data.length) throw new Error("No items can be checked out");
      const weaponIds = data.map((item) => item.weapons.$id);
      const quantities = data.map((item) => item.quantity);

      await addToOrder(weaponIds, quantities, totalPrice);
      await clearCartItems();
      await refetch();

      setIsSuccessModalVisible(true);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllItems = async () => {
    setIsLoading(true);
    try {
      await clearCartItems();
      await refetch();
      Alert.alert("Success", "All items removed successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    calTotalPrice();
  }, [data]);

  return (
    <View className="bg-primary h-full px-4">
      <LoadingIndicator isLoading={isLoading} />
      <View className="mt-20 flex-1 space-y-6">
        <View className="w-full flex-row justify-between items-center pb-10">
          <Text className="absolute left-1/2 -translate-x-1/2 text-2xl text-gray font-psemibold flex-1 text-center">
            My cart
          </Text>
          <TouchableOpacity
            className="absolute right-0 top-0"
            onPress={deleteAllItems}
            disabled={isLoading}
          >
            <Text className="border rounded-full text-md text-gray font-pregular py-2 px-2 mb-2 bg-gray-300">
              Remove All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          {data &&
            data.map((item) => (
              <View
                key={item.$id}
                className="bg-primary-100 w-full h-[124px] p-4 my-1 rounded-xl flex-row items-center gap-2"
              >
                <Image
                  source={{ uri: item.weapons.photo_url }}
                  className="w-[96px] h-[96px] rounded-xl border border-gray-300"
                  resizeMode="contain"
                />
                <View className="h-full flex-col justify-between flex-1 ml-4">
                  <Text
                    className="text-lg text-gray font-pregular "
                    numberOfLines={2}
                  >
                    {item.weapons.weapon_name}
                  </Text>
                  <Text className="absolute bottom-9 left-2 text-sm text-green-600 font-pregular">
                    A$ {item.weapons.price}
                  </Text>
                  <View className="flex-row items-center bg-primary rounded-full border border-gray-300 w-[90px] justify-between">
                    <TouchableOpacity
                      className="w-8 h-8 justify-center items-center"
                      onPress={() =>
                        modifyItemQuantity(item.weapons.$id, item.quantity - 1)
                      }
                      disabled={isLoading}
                    >
                      <Text className="text-lg text-black-100 font-pregular">
                        -
                      </Text>
                    </TouchableOpacity>

                    <Text className="text-lg text-black-100 font-pregular">
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      className="w-8 h-8 justify-center items-center"
                      onPress={() =>
                        modifyItemQuantity(item.weapons.$id, item.quantity + 1)
                      }
                      disabled={isLoading}
                    >
                      <Text className="text-lg text-black-100 font-pregular">
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  className="w-6 h-6 ml-4 justify-center items-center rounded-md"
                  onPress={() => modifyItemQuantity(item.weapons.$id, 0)}
                  disabled={isLoading}
                >
                  <Feather name="trash-2" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      </View>

      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/30">
          <View className="bg-white p-6 rounded-lg items-center w-80">
            <Feather name="check-circle" size={50} color="green" />
            <Text className="text-lg font-semibold mt-3 text-black">
              Thanks for shopping with us!
            </Text>

            <TouchableOpacity
              className="mt-4  bg-secondary rounded-full p-3"
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.push("/(tabs)/home");
              }}
            >
              <Text className="text-white font-semibold">Back to shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View className="bottom-0 w-full bg-primary-100 rounded-xl p-4 space-y-2 shadow-lg shadow-gray-40">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg text-gray font-psemibold">Subtotal:</Text>
          <Text className="text-lg text-secondary font-bold">
            $AUD {totalPrice}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-lg text-gray font-psemibold">
            Shipping Fee:
          </Text>
          <Text className="text-lg text-secondary font-bold">$AUD 5.00</Text>
        </View>
        <View className="border-t border-gray-300 my-2" />
        <View className="flex-row justify-between items-center">
          <Text className="text-xl text-gray font-psemibold">Total:</Text>
          <Text className="text-xl text-secondary font-bold">
            $AUD {(totalPrice + 5).toFixed(2)}
          </Text>
        </View>
        <CustomButton
          title={`Check Out (${data ? data.length : 0})`}
          containerStyles="bg-secondary rounded-full w-full mt-2"
          handlePress={handleCheckout}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

export default ShoppingCart;
