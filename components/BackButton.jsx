import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const BackButton = ({ onPress }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="w-10 h-10 justify-center items-center bg-primary-100 rounded-full"
      onPress={onPress ? onPress : () => router.back()}
    >
      <AntDesign name="left" size={14} color="gray-100" />
    </TouchableOpacity>
  );
};

export default BackButton;
