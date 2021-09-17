export function SitesHandle() {
    const url = document.querySelectorAll("body #header #blogTitle h1 a")[0].href
    const title = document.querySelectorAll("body #header #blogTitle h1")[0].innerText.trim()
    const subtitle = document.querySelectorAll("body #header #blogTitle h2")[0].innerText.trim()
    return {title, subtitle, url}
}