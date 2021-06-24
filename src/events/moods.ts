import {
  MoodChangePacket,
  MainframeEvent,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";

function getRandomInt(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

export function getRandomEntry(array: string[]): string {
  return array[getRandomInt(0, array.length - 1)];
}

export const sendMoodChangeEvent = async (mood: string, id: string) => {
  try {
    const moodChangeEvent: MoodChangePacket = {
      event: MainframeEvent.moodChange,
      id: id,
      data: {
        mood,
      },
    };

    WebSocketServer.sendData(moodChangeEvent);
    Moods.setCurrentMood(mood);
  } catch (error) {
    console.log(error);
  }
};

const currentMoods = [
  "coffee",
  "cool",
  "dolla",
  "fire",
  "heart",
  "majick",
  "pewpew",
  "rap",
  "star",
  "tattoo",
  "troll",
];

export default class Moods {
  static currentMood: string;

  static setCurrentMood = (mood: string): void => {
    Moods.currentMood = mood;
  };

  static getCurrentMood = (): string => {
    return Moods.currentMood;
  };

  static getRandomNewMood = (): string => {
    return getRandomEntry(
      currentMoods.filter((mood) => mood !== Moods.currentMood),
    );
  };
}
