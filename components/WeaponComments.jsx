import { useGlobalContext } from "@/context/GlobalProvider";
import {
  getAllCommentsAndRatings,
  getCurrentUser,
  deleteReview,
} from "@/lib/appwrite";
import useAppWrite from "@/lib/useAppWrite";
import React, { useEffect, useState, useCallback } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { formatDistanceToNow } from "date-fns";
import StarRatingShowing from "./StarRatingDisplay";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const WeaponComments = ({ weaponId, isReviewedToggle, onEditStart }) => {
  const { isUpdated, setIsUpdated } = useGlobalContext();
  const {
    data,
    refetch,
    isLoading: isDataLoading,
    error,
  } = useAppWrite(() => getAllCommentsAndRatings(weaponId));

  const [currentUserId, setCurrentUserId] = useState(null);
  const [localComments, setLocalComments] = useState([]);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (data) {
      setLocalComments(data);
    }
  }, [data]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) setCurrentUserId(user.$id);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (isUpdated) {
      refetch();
      setIsUpdated(false);
    }
  }, [isUpdated, refetch]);

  const handleDelete = async (commentId) => {
    if (!weaponId) return;

    try {
      setIsDeleting(true);
      setDeletingCommentId(commentId);

      await deleteReview(weaponId);

      // Optimistic update after successful deletion
      setLocalComments((prev) =>
        prev.filter((comment) => comment.$id !== commentId)
      );
      isReviewedToggle();

      Alert.alert("Success", "Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      Alert.alert("Error", "Failed to delete review. Please try again.");
      // Revert optimistic update on error
      refetch();
    } finally {
      setIsDeleting(false);
      setDeletingCommentId(null);
    }
  };

  const handleEdit = (comment) => {
    if (!comment?.$id) return;
    // Scroll to the review section will be handled by SubmitReview component
    onEditStart({
      comment: comment.comment,
      rating: comment.rating,
      commentId: comment.$id,
      ratingId: comment.ratingId,
    });
  };

  const renderCommentBox = useCallback(
    (item) => {
      if (!item?.$id) return null;

      const isCurrentUserComment = item.users?.$id === currentUserId;
      const isThisCommentDeleting = deletingCommentId === item.$id;

      return (
        //     <>
        //       <View className="w-full px-4 ">
        //         <Text className="w-full text-start text-xl text-gray-500 font-psemibold mb-2 ">
        //           Comments
        //         </Text>
        //         {data.length > 0 ? (
        //           data.map((item) => (
        //             <View
        //               key={item.$id}
        //               className="w-full bg-primary-100 rounded-xl p-4 my-2 shadow-sm shadow-gray-40"
        //             >
        //               <View className="flex-row items-center mb-2 gap-2">
        //                 <Image
        //                   source={{ uri: item.users.avatar }}
        //                   className="w-8 h-8 justify-center items-center rounded-full"
        //                   resizeMode="contain"
        //                 />
        //                 <Text className="text-lg text-gray-700 font-psemibold">
        //                   {item.users.username}
        //                 </Text>
        //                 <Text className="absolute right-0 text-sm text-gray-500 font-pregular">
        //                   {formatDistanceToNow(new Date(item.$updatedAt), {
        //                     addSuffix: true,
        //                   })}
        //                 </Text>
        //               </View>
        //               <Text className="text-md text-gray-700 font-pregular">
        //                 {item.comment}
        //               </Text>
        //             </View>
        //           ))
        //         ) : (
        //           <View className="w-full justify-center items-center">
        //             <Text className="text-xl text-gray-100 font-pbold">
        //               No Comments Yet
        //             </Text>
        //           </View>
        //         )}
        //       </View>
        //     </>
        //   );
        // };

        <View
          key={item.$id}
          className={`w-full bg-primary-100 rounded-xl p-4 my-2 w-full bg-primary-100 rounded-xl p-4 my-2 shadow-sm shadow-gray-30  ${
            isCurrentUserComment ? "bg-blue-500/50" : "bg-blue-400/50"
          } ${isThisCommentDeleting ? "opacity-50" : "opacity-100"}`}
        >
          <View className="flex-row items-center mb-2 gap-2">
            <Image
              source={{
                uri: item.users?.avatar || "https://via.placeholder.com/40",
              }}
              className="w-8 h-8 justify-center items-center rounded-full"
              resizeMode="contain"
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg text-gray-700 font-psemibold">
                  {item.users?.username || "Deleted User"}
                </Text>
                {isCurrentUserComment && (
                  <Text className="text-xs text-gray-300">(You)</Text>
                )}
              </View>
              <Text className="text-xs text-gray-500 font-pregular">
                {formatDistanceToNow(new Date(item.$updatedAt), {
                  addSuffix: true,
                })}
              </Text>
            </View>
          </View>

          {item.rating !== null && <StarRatingShowing rating={item.rating} />}

          <Text className="text-lg text-gray-50 font-pregular">
            {item.comment}
          </Text>

          {isCurrentUserComment && (
            <View className="flex-row gap-4 mt-2">
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                disabled={isDeleting || isThisCommentDeleting}
              >
                <FontAwesome
                  name="edit"
                  size={20}
                  color={isDeleting || isThisCommentDeleting ? "gray" : "grey"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete Review",
                    "Are you sure you want to delete this review?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        onPress: () => handleDelete(item.$id),
                        style: "destructive",
                      },
                    ]
                  );
                }}
                disabled={isDeleting || isThisCommentDeleting}
              >
                {isThisCommentDeleting ? (
                  <ActivityIndicator size="small" color="grey" />
                ) : (
                  <FontAwesome
                    name="trash"
                    size={20}
                    color={
                      isDeleting || isThisCommentDeleting ? "gray" : "grey"
                    }
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
    [currentUserId, deletingCommentId, isDeleting, handleDelete, handleEdit]
  );

  if (error) {
    return (
      <View className="w-full px-4 py-8 items-center">
        <Text className="text-red-500">Failed to load comments</Text>
        <TouchableOpacity
          onPress={refetch}
          className="mt-2 bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isDataLoading || isDeleting) {
    return (
      <View className="w-full px-4 py-8 items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-2 text-gray-300">
          {isDeleting ? "Deleting review..." : "Loading comments..."}
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full px-4">
      <Text className="w-full text-start text-xl text-gray-300 font-psemibold mb-2">
        Comments
      </Text>

      {localComments.length > 0 ? (
        localComments.map(renderCommentBox)
      ) : (
        <View className="w-full justify-center items-center">
          <Text className="text-xl text-gray-100 font-pbold">
            No Comments Yet
          </Text>
        </View>
      )}
    </View>
  );
};
export default WeaponComments;
