export function Load(url, type, callback) {
    const head = document.getElementsByTagName('head')[0]
    if (type === "css") {
        const link = document.createElement('link')
        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.href = url
        head.appendChild(link)
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    if (typeof (callback) == 'function') {
        script.onload = script.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                callback()
                script.onload = script.onreadystatechange = null
            }
        }
    }
    head.appendChild(script)
}
