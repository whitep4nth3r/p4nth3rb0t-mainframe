import { Vegetables } from "./../items/vegetables";
import { Natural } from "./../items/natural";
import { UniversalItems } from "./../items/universal";
import { Herbs } from "../items/herbs";
import { Recipe } from "../api/types";
import { Fruits } from "../items/fruits";

export const FoodRecipes: Record<string, Recipe> = {
  "Marinated green olives": {
    title: "Marinated green olives",
    description: "Combine green olive with fresh herbs, garlic and chilli.",
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
  "Nut butter": {
    title: "Nut butter",
    description: "Combine butter with nuts for a tasty treat.",
    names: ["spread", "nut butter", "paste", "smör", "smør", "medley"],
    ingredients: {
      primary: UniversalItems.find((item) => item.name === "stick of butter"),
      secondary: [
        Natural.find((item) => item.name === "peanut"),
        Natural.find((item) => item.name === "almond"),
        Natural.find((item) => item.name === "pistachio"),
        Natural.find((item) => item.name === "hazelnut"),
        Natural.find((item) => item.name === "chestnut"),
        Natural.find((item) => item.name === "walnut"),
        Natural.find((item) => item.name === "pecan nut"),
      ],
    },
  },
  "Pasta and sauce": {
    title: "Pasta and sauce",
    description:
      "Cook up a tasty Italian-inspired dish with fresh pasta, vegetables, herbs and spices.",
    names: [
      "arrabiata",
      "bolognese",
      "spaghetti",
      "fusilli",
      "conchiglie",
      "farfalle",
      "ravioli",
      "tortellini",
    ],
    ingredients: {
      primary: UniversalItems.find((item) => item.name === "fresh pasta"),
      secondary: [
        Herbs.find((item) => item.name === "fresh basil"),
        Fruits.find((item) => item.name === "tomato"),
        Vegetables.find((item) => item.name === "carrot"),
        Herbs.find((item) => item.name === "fresh parsley"),
        Herbs.find((item) => item.name === "garlic bulb"),
        Vegetables.find((item) => item.name === "generic mushroom"),
        Vegetables.find((item) => item.name === "chestnut mushroom"),
        Vegetables.find((item) => item.name === "celery stick"),
        Vegetables.find((item) => item.name === "white onion"),
        Vegetables.find((item) => item.name === "red onion"),
        Vegetables.find((item) => item.name === "shallot"),
        Herbs.find((item) => item.name === "fresh green chilli"),
        Herbs.find((item) => item.name === "fresh red chilli"),
      ],
    },
  },
};
