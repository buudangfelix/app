import StarRating from "react-native-star-rating-widget";

const WeaponRating = ({ rating, setRating }) => {
  return (
    <StarRating rating={rating} onChange={setRating} enableHalfStar={false} />
  );
};

export default WeaponRating;
