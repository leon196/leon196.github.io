
const dom = document.querySelector("#container")
document.addEventListener('wheel', (e) => {
    // e.preventDefault()
    dom.scrollBy({
        // left: Math.sign(e.deltaY)*300+Math.sign(e.deltaX)*300,
        left: e.deltaY*2,
        behavior: "smooth",
    });
    // dom.scrollLeft -= e.deltaY*2
})