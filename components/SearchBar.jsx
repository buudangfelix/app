import { TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import Fontisto from "@expo/vector-icons/Fontisto";

const SearchBar = () => {
  const onPress = async () => {
    try {
      router.push(`/searchPage/}`);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center h-14 w-full px-4 border-2 bg-primary-100 rounded-full border-secondary-200"
      onPress={onPress}
    >
      <Fontisto name="search" size={16} color="gray" />
      <Text className="text-base text-gray-400 ml-4 font-pregular">
        Looking for books?
      </Text>
    </TouchableOpacity>
  );
};

export default SearchBar;
