import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

const zoomIn = {
  0: { scale: 0.9 },
  1: { scale: 1.1 },
};

const zoomOut = {
  0: { scale: 1.1 },
  1: { scale: 0.9 },
};

const TrendingItem = ({ activeItem, item }) => {
  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      <TouchableOpacity
        className="w-[150px] h-[150px] rounded-xl justify-center items-center"
        activeOpacity={0.7}
        onPress={() => router.push(`item/${item.weapons.$id}`)}
      >
        <Image
          source={{ uri: item.weapons.photo_url }}
          className="w-[90%] h-[90%] rounded-xl border border-gray-300"
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animatable.View>
  );
};

const Trending = ({ items }) => {
  const [activeItem, setActiveItem] = useState(items[0]);
  const viewableItemsChange = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChange}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      horizontal
      ListEmptyComponent={() => <Text>Empty</Text>}
      ListFooterComponent={() => <View className="w-48" />}
    />
  );
};

export default Trending;
