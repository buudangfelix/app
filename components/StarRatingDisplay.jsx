import React from "react";
import { StarRatingDisplay } from "react-native-star-rating-widget";

export default function StarRatingShowing({ rating }) {
  return <StarRatingDisplay starSize={18} rating={rating} />;
}
