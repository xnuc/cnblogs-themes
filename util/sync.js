const locked = "locked"
const loaded = "loaded"

export function Lock(lock) {
    document.querySelector("head").setAttribute(lock, locked)
}

export function Unlock(lock) {
    document.querySelector("head").removeAttribute(lock)
}

export function IsLock(lock) {
    return document.querySelector("head").getAttribute(lock) === locked
}

export function Sign(sign) {
    document.querySelector("head").setAttribute(sign, loaded)
}

export function IsSign(sign) {
    return document.querySelector("head").getAttribute(sign) === loaded
}

export async function Sync(obj, func) {
    Lock(`_${obj}`)
    const r = await func()
    Sign(obj)
    Unlock(`_${obj}`)
    return r
}
