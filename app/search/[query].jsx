import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList, SafeAreaView } from "react-native";
import useAppWrite from "@/lib/useAppWrite";
import { searchWeapon } from "@/lib/appwrite";
import WeaponCard from "@/components/WeaponCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import BackButton from "@/components/BackButton";

const Search = () => {
  const { query } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [weapons, setWeapons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const result = await searchWeapon(query);
        setWeapons(Array.isArray(result) ? result : []);
      } catch (error) {
        setWeapons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query]);

  return (
    <SafeAreaView className="bg-primary h-full px-4">
      <LoadingIndicator isLoading={isLoading} />

      <View className="flex-row px-4 items-center justify-between">
        <BackButton />
        <View className="flex-1 items-center">
          <Text className="font-pmedium text-gray text-xl">Search for</Text>
          <Text className="text-2xl font-psemibold text-secondary opacity-100 mt-2">
            {query}
          </Text>
        </View>
      </View>

      {isLoading ? null : weapons.length === 0 ? (
        <Text className="text-center text-gray mt-10 text-2xl">
          No book matches your search!
        </Text>
      ) : (
        <FlatList
          data={weapons}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <WeaponCard item={item} />}
          className="px-4 mt-4"
        />
      )}
    </SafeAreaView>
  );
};

export default Search;
