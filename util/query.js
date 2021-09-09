export function Query(name, val) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
    const r = window.location.search.substr(1).match(reg)
    if (!r) return val
    return decodeURIComponent(r[2])
}