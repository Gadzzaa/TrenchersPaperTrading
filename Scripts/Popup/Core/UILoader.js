import {UIHelper} from "../Helpers/UIHelper.js";
import {setDebugMode} from "../../../config";

export class UILoader {
    static updateUsername(newUsername) {
        let usernameText = document.getElementById("usernameText");
        let accountUser = document.getElementById("username");

        usernameText.textContent = newUsername;
        accountUser.textContent = newUsername;
    }

    static updateTheme(newTheme) {
        const button = document.getElementById(newTheme + "Theme");

        button?.classList.add("active");

        document.documentElement.setAttribute("data-theme", newTheme);
    }

    static applyVolumeUI(volume) {
        const slider = document.getElementById("volumeSlider");

        slider.value = volume * 100;
    }

    static applyQualityUI(animationTime) {
        const slider = document.getElementById("animationSlider");

        slider.value = animationTime;
        document.documentElement.style.setProperty(
            "--anim-time",
            `${animationTime / 10}s`,
        );
        UIHelper.setQualityPreset(animationTime);
    }

    static applyDebugModeUI(enabled) {
        const button = document.getElementById("debugButton");
        button?.classList.toggle("active", enabled);
        setDebugMode(enabled);
    }
}
