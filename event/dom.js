import {Config} from "../config/config"

export const UpdateHandles = [eventDebug]

function eventDebug(e) {
    if (!Config.debugMode) return
    console.debug(e)
}
