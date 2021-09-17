const locked = "locked"
const loaded = "loaded"
export const EmptyFunc = () => {
}

function lock(_lock) {
    document.querySelector("head").setAttribute(_lock, locked)
}

function unlock(lock) {
    document.querySelector("head").removeAttribute(lock)
}

function sign(_sign) {
    document.querySelector("head").setAttribute(_sign, loaded)
}

export async function Sync(obj, before = EmptyFunc, func = EmptyFunc, after = EmptyFunc) {
    before()
    lock(`_${obj}`)
    const r = await func()
    sign(obj)
    unlock(`_${obj}`)
    after()
    return r
}

export async function SyncFunc(obj, func = EmptyFunc) {
    lock(`_${obj}`)
    const r = await func()
    sign(obj)
    unlock(`_${obj}`)
    return r
}

export function Done(flag) {
    return document.querySelector("head").getAttribute('_' + flag) === locked
        || document.querySelector("head").getAttribute(flag) === loaded
}