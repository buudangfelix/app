import { useGlobalContext } from "@/context/GlobalProvider";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import FormField from "@/components/FormField";
import { modifyProfile } from "@/lib/appwrite";
import LoadingIndicator from "@/components/LoadingIndicator";
import BackButton from "@/components/BackButton";

const Edit = () => {
  const { setIsLoggedIn, user, setUser } = useGlobalContext();
  const [form, setForm] = useState({
    username: user?.username || "",
    oldPassword: "",
    newPassword: "",
    avatar: null,
  });
  const [isNewAvatarPicked, setIsNewAvatarPicked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openPicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setForm({ ...form, avatar: result.assets[0] });
      setIsNewAvatarPicked(true);
    }
  };

  const onUpdate = async () => {
    setIsSubmitting(true);
    try {
      if (form.newPassword !== "" && form.oldPassword === "") {
        throw new Error("Current password is required to set the new password");
      }
      const result = await modifyProfile(
        form.username,
        form.oldPassword,
        form.newPassword,
        form.avatar,
        isNewAvatarPicked
      );
      setUser(result);
      Alert.alert("Success", "Profile modified successfully");
      router.replace("/(tabs)/profile");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        username: user?.username || "",
        oldPassword: "",
        newPassword: "",
        avatar: null,
      });
      setIsNewAvatarPicked(false);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <LoadingIndicator isLoading={isSubmitting} />

      <ScrollView>
        <View className="w-full items-left px-4">
          <View className="flex-row justify-between w-full">
            <BackButton />
          </View>
          <View className="flex-col items-center justify-center">
            <TouchableOpacity
              className="w-64 h-64 border border-secondary rounded-full justify-center items-center"
              onPress={openPicker}
            >
              <Image
                source={{ uri: form.avatar ? form.avatar.uri : user?.avatar }}
                className="w-[90%] h-[90%] rounded-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          <FormField
            title="User Name"
            placeholder={user.username}
            otherStyles="mt-7"
            handleTextChange={(e) => setForm({ ...form, username: e })}
          />

          <FormField
            title="Current Password"
            otherStyles="mt-7"
            handleTextChange={(e) => setForm({ ...form, oldPassword: e })}
          />

          <FormField
            title="New Password"
            otherStyles="mt-7"
            handleTextChange={(e) => setForm({ ...form, newPassword: e })}
          />

          <CustomButton
            title="Update"
            handlePress={onUpdate}
            containerStyles="w-full mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Edit;
