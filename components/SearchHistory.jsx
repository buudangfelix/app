import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import {
  getSearchHistory,
  getCurrentUser,
  saveSearchQuery,
  deleteSearchQuery,
} from "@/lib/appwrite";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const SearchHistory = ({}) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSearches = async () => {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();
        if (user) {
          const searches = await getSearchHistory(user.$id);
          setRecentSearches(searches);
        }
      } catch (error) {
        Alert.alert("Error", "There was an error fetching your search history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearches();
  }, []);

  const handleSearchAgain = async (query) => {
    try {
      router.push(`/search/${query}`);
      await saveSearchQuery(query);
    } catch (error) {
      Alert.alert("Error", "There was an error saving your search query");
    }
  };

  const handleDelete = async (queryId) => {
    try {
      const success = await deleteSearchQuery(queryId);
      if (success) {
        setRecentSearches((prevSearches) =>
          prevSearches.filter((search) => search.$id !== queryId)
        );
      }
    } catch (error) {
      Alert.alert("Error", "There was an error deleting the search history");
    }
  };

  return (
    <View className="p-4">
      <Text className="text-gray text-xl font-semibold mb-2">
        Recent Searches
      </Text>

      {isLoading ? (
        <Text className="text-gray-400">Loading...</Text>
      ) : recentSearches.length === 0 ? (
        <Text className="text-gray-400">No recent searches</Text>
      ) : (
        recentSearches.map((search) => (
          <View
            key={search.$id}
            className="flex-row justify-between items-center py-2 mb-2"
          >
            <AntDesign name="clockcircleo" size={20} color="grey" />
            <TouchableOpacity
              className="flex-1 flex-row justify-between items-center ml-2"
              onPress={() => handleSearchAgain(search.query)}
            >
              <Text className="text-xl">{search.query}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(search.$id)}>
              <AntDesign name="close" size={20} color="grey" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

export default SearchHistory;
