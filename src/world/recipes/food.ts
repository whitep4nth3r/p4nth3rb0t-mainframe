import { Vegetables } from "../items/vegetables";
import { Herbs } from "../items/herbs";
import { Recipe } from "../api/types";

export const FoodRecipes: Record<string, Recipe> = {
  "Marinated green olives": {
    title: "Marinated green olives",
    description: "Combine green olive with fresh herbs, garlic and chilli",
    names: [
      "mix",
      "medley",
      "tapenade",
      "fusion",
      "combo",
      "blend",
      "concoction",
    ],
    ingredients: {
      primary: Vegetables.find((item) => item.name === "green olive"),
      secondary: [
        Herbs.find((item) => item.name === "fresh thyme"),
        Herbs.find((item) => item.name === "fresh basil"),
        Herbs.find((item) => item.name === "fresh parsley"),
        Herbs.find((item) => item.name === "fresh coriander"),
        Herbs.find((item) => item.name === "fresh rosemary"),
        Herbs.find((item) => item.name === "garlic bulb"),
        Herbs.find((item) => item.name === "fresh green chilli"),
        Herbs.find((item) => item.name === "fresh red chilli"),
      ],
    },
  },
};
