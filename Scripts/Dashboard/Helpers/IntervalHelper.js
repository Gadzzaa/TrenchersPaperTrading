import {updateBalanceUI} from "./BalanceUpdater.js";
import {MessageHandlers} from "./MessageHandlers.js";
import {ErrorHandler} from "../../ErrorHandling/Core/ErrorHandler.js";
import {AppError} from "../../ErrorHandling/Helpers/AppError.js";
import {PresetManager} from "../Core/PresetManager.js";
import {StateManager} from "../Services/StateManager.js";

/**
 * Starts dashboard refresh interval loop.
 * @param {StateManager} stateManager
 * @returns {number}
 */
export function startInterval(stateManager) {
    stateManager.currentPreset = document.querySelector(".activePreset")?.id;

    return setInterval(async () => {
        if (stateManager.fetchingBalance) return;
        stateManager.fetchingBalance = true;
        try {
            checkPendingPresets(stateManager);
            updateCurrentPreset(stateManager);
            await updateCurrentContract(stateManager);
            await updateBalanceUI(false, stateManager);
        } catch (err) {
            ErrorHandler.log(err);
        } finally {
            stateManager.fetchingBalance = false;
        }
    }, 1000);
}

/**
 * Applies pending preset changes from storage.
 * @param {StateManager} stateManager
 */
function checkPendingPresets(stateManager) {
    const pendingPresets = localStorage.getItem("pendingPresets");
    if (pendingPresets) {
        PresetManager.applyPreset(stateManager.currentPreset, stateManager);
        localStorage.setItem("pendingPresets", false);
    }
}

/**
 * Syncs stateManager preset with currently active preset id.
 * @param {StateManager} stateManager
 */
function updateCurrentPreset(stateManager) {
    const newPreset = PresetManager.getUsingPreset();
    PresetManager.applyPreset(newPreset, stateManager);
}

/**
 * Detects contract changes and refreshes active position.
 * @param {StateManager} stateManager
 * @returns {Promise<void>}
 */
async function updateCurrentContract(stateManager) {
    const newContract = await MessageHandlers.requestCurrentContract();
    if (stateManager.currentContract !== newContract) {
        stateManager.currentContract = newContract;
        await searchPosition(stateManager);
    }
}

/**
 * Syncs positions and sets active token for current contract.
 * @param {StateManager} stateManager
 * @returns {Promise<void>}
 */
async function searchPosition(stateManager) {
    await stateManager.pnlService.syncTradeLog(stateManager.variables);

    const storedPositions = localStorage.getItem("openPositions");
    if (!storedPositions) {
        console.warn("No open positions found in localStorage.");
        return;
    }

    const parsed = JSON.parse(storedPositions);
    if (!Array.isArray(parsed) || parsed.length < 1)
        throw new AppError("Parsing positions failed.", {
            code: "PARSE_ERROR",
            meta: {
                parsed,
                storedPositions,
            },
        });

    const match = parsed.find((p) => p.pool === stateManager.currentContract);
    if (match) {
        console.log("Setting active token to:", match.pool);
        stateManager.pnlService.setActiveToken(match.pool);
        stateManager.pnlService.update(true);
    }
}
