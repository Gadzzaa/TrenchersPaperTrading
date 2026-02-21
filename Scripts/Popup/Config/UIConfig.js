import { UILoader } from "../Core/UILoader.js";
export class UIConfig {
  static settings = [
    {
      key: "username",
      default: "Guest",
      apply: (value) => {
        UILoader.updateUsername(value);
      },
    },
    {
      key: "theme",
      default: "dark",
      apply: (value) => {
        UILoader.updateTheme(value);
      },
    },
    {
      key: "volume",
      default: 1.0,
      apply: (value) => {
        UILoader.applyVolumeUI(value);
      },
    },
    {
      key: "animation",
      default: 3,
      apply: (value) => {
        UILoader.applyQualityUI(value);
      },
    },
    {
      key: "debugMode",
      default: false,
      apply: (value) => {
        UILoader.applyDebugModeUI(value);
      },
    },
  ];
}
