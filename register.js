export function Lock(lock) {
    document.querySelector("body").setAttribute(lock, "locked")
}

export function Unlock(lock) {
    document.querySelector("body").removeAttribute(lock)
}

export function IsLock(lock) {
    return document.querySelector("body").getAttribute(lock) === "locked"
}

export function Sign(sign) {
    document.querySelector("body").setAttribute(sign, "loaded")
}

export function IsSign(sign) {
    return document.querySelector("body").getAttribute(sign) === "loaded"
}
