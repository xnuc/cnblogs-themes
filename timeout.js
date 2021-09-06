export const TimeoutStatus = "Timeout Status"

export function Timeout(timeout, rsp) {
    return new Promise(r => {
        setTimeout(_ => {
            r(rsp)
        }, timeout)
    })
}
