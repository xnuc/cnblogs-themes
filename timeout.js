export function Timeout(timeout, res) {
    return new Promise(r => {
        setTimeout(_ => {
            r(res)
        }, timeout)
    })
}
