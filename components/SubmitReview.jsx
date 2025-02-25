import React, { useState, useEffect, useRef } from "react";
import { Alert, View, TouchableOpacity, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  addComments,
  addStarRating,
  editComment,
  editStarRating,
} from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import WeaponRatingInput from "./WeaponRating";
import WriteComments from "./WriteComments";

const SubmitReview = ({
  weaponId,
  containerStyles,
  editData,
  onEditComplete,
  onCancelEdit,
}) => {
  const { setIsUpdated } = useGlobalContext();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const reviewRef = useRef(null);

  useEffect(() => {
    // Only set editing mode if editData actually contains comment and rating
    if (editData && editData.commentId) {
      setComment(editData.comment || "");
      setRating(editData.rating || 0);
      setIsEditing(true);

      // Scroll to review section when edit is clicked
      if (reviewRef.current) {
        reviewRef.current.measure((x, y, width, height, pageX, pageY) => {
          // You'll need to use a scrollable container's ref to scroll to this position
          // If using ScrollView, you can use scrollTo({y: pageY})
        });
      }
    } else {
      // Reset to defaults if not editing
      setIsEditing(false);
    }
  }, [editData]);

  const handleCancel = () => {
    setComment("");
    setRating(0);
    setIsEditing(false);
    onCancelEdit?.();
  };

  const submitReview = async () => {
    setIsSubmitting(true);
    try {
      if (rating === 0) throw new Error("Please select a rating");
      if (comment.trim() === "")
        throw new Error("Please write a comment before submitting");

      if (isEditing && editData?.commentId && editData?.ratingId) {
        await editStarRating(editData.ratingId, rating);
        await editComment(editData.commentId, comment);
        Alert.alert("Success", "Review updated successfully");
        onEditComplete?.();
      } else {
        await addStarRating(weaponId, rating);
        await addComments(weaponId, comment);
        Alert.alert("Success", "Review submitted successfully");
      }

      setIsUpdated(true);
      setComment("");
      setRating(0);
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      ref={reviewRef}
      className={`w-full px-4 flex-col gap-4 items-center ${containerStyles}`}
    >
      <Text className="text-xl text-gray-300 font-psemibold w-full text-start">
        {isEditing ? "Edit your review" : "How was this product?"}
      </Text>
      <WeaponRatingInput rating={rating} setRating={setRating} />
      <Text className="text-xl text-gray-300 font-psemibold w-full text-start">
        {isEditing ? "Edit your comment" : "Leave a comment"}
      </Text>

      <WriteComments comment={comment} setComment={setComment} />
      <View className="w-full flex-row justify-end gap-2">
        {isEditing && (
          <TouchableOpacity
            className="w-9 h-9 justify-center items-center bg-gray-500 rounded-lg"
            activeOpacity={0.7}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <FontAwesome name="times" size={20} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="w-9 h-9 justify-center items-center bg-secondary rounded-lg"
          activeOpacity={0.7}
          onPress={submitReview}
          disabled={isSubmitting}
        >
          <FontAwesome name="paper-plane" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SubmitReview;
