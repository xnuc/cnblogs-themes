export function Timeout(timeout, ret) {
    return new Promise(r => {
        setTimeout(_ => {
            r(ret)
        }, timeout)
    })
}
