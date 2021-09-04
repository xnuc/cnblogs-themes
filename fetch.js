async function fetch(url) {
    const req = new XMLHttpRequest()
    req.open("GET", url, false)
    req.send(null)
    return req.responseText;
}

(async _ => {
    const _fetch = fetch("/")
    console.log(1)
    let rsp = await _fetch
    console.log(rsp)
})()