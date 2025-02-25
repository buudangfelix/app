import React, { useState } from "react";
import { TextInput, View } from "react-native";

const WriteComments = ({ comment, setComment }) => {
  return (
    <View className="w-full px-4 flex-col gap-2 items-center">
      <View className="w-full border border-gray-100 rounded-lg flex-col">
        <TextInput
          value={comment}
          placeholder="Share something ..."
          placeholderTextColor="orange"
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          className="w-full text-lg text-gray-100 font-psemibold p-2 h-[80px]"
        />
      </View>
    </View>
  );
};

export default WriteComments;
