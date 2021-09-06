export const TimeoutStatus = "Timeout Status"

export function Timeout(timeout) {
    return new Promise(r => {
        setTimeout(_ => {
            r(TimeoutStatus)
        }, timeout)
    })
}