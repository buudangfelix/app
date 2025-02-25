import { useState, useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import {
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Text,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { saveSearchQuery, getCurrentUser } from "@/lib/appwrite";
import SearchHistory from "@/components/SearchHistory";
import LoadingIndicator from "@/components/LoadingIndicator";
import AntDesign from "@expo/vector-icons/AntDesign";
import BackButton from "@/components/BackButton";
import Trending from "@/components/Trending";

const SearchPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  const handleSearch = async () => {
    if (!query?.trim()) {
      Alert.alert("Error", "Please type something to search for");
      return;
    }

    setIsSubmitting(true);
    try {
      router.push(`/search/${query.trim()}`);
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert("Error", "User not found");
        return;
      }

      await saveSearchQuery(query.trim());
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <LoadingIndicator isLoading={isSubmitting} />
      <View className="flex-row items-center justify-between mb-2 px-4">
        <BackButton />
        <View className="absolute left-1/2 -translate-x-1/2 flex-1 items-center px-4">
          <Text className="text-2xl text-gray font-semibold p-4 text-center">
            Search
          </Text>
        </View>
      </View>
      <View className=" flex-row items-center h-14 w-full p-4 border-2 bg-primary-100 rounded-full border-secondary">
        <TouchableOpacity className="absolute left-4" onPress={handleSearch}>
          <Fontisto name="search" size={16} color="gray" />
        </TouchableOpacity>
        <TextInput
          className="ml-8 font-pregular"
          value={query}
          placeholder="Search Your Books"
          placeholderTextColor="tex-secondary"
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      <SearchHistory />
    </SafeAreaView>
  );
};

export default SearchPage;
