import { Recipe } from "./all";
import { Vegetables } from "../items/vegetables";
import { Herbs } from "../items/herbs";

export const FoodRecipes: Recipe[] = [
  {
    ingredients: {
      primary: Vegetables.find((item) => item.name === "green olive"),
      secondary: [
        Herbs.find((item) => item.name === "fresh thyme"),
        Herbs.find((item) => item.name === "fresh basil"),
        Herbs.find((item) => item.name === "fresh parsley"),
        Herbs.find((item) => item.name === "garlic bulb"),
        Herbs.find((item) => item.name === "garlic fresh green chilli"),
        Herbs.find((item) => item.name === "garlic fresh red chilli"),
      ],
    },
  },
];
