import LoadingIndicator from "@/components/LoadingIndicator";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import Trending from "@/components/Trending";
import WeaponCard from "@/components/WeaponCard";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getAllWeapons, getTrendingItems } from "@/lib/appwrite";
import useAppWrite from "@/lib/useAppWrite";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

const Home = () => {
  const { user } = useGlobalContext();
  const { data: trendingItems, refetch: refetchTrending } =
    useAppWrite(getTrendingItems);
  const { data: weaponData, refetch: refetchWeapons } =
    useAppWrite(getAllWeapons);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchTrending();
    await refetchWeapons();
    setRefreshing(false);
  };
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  return (
    <View className="bg-primary h-full flex-1 px-4">
      <LoadingIndicator isLoading={refreshing || isSubmitting} />

      <FlatList
        data={weaponData}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <WeaponCard
            item={item}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        )}
        ListHeaderComponent={() => (
          <View className="mt-12 mb-4 space-y-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-psemibold text-base text-gray-700">
                  Welcome back,
                </Text>
                <Text className="font-semibold text-4xl text-secondary">
                  {user?.username}
                </Text>
              </View>
              <Logo containerStyles="w-36 h-36" />
            </View>
            <SearchBar />

            <View className="w-full flex-1 pt-4 pb-8">
              <Text className="text-xl text-gray-500 font-pregular">
                Popular Books
              </Text>
              <Trending items={trendingItems ?? []} />
            </View>

            <Text className="text-xl text-gray-500 font-pregular">
              All Books
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default Home;
