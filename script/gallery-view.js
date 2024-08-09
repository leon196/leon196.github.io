
class GalleryView extends HTMLElement
{    
    constructor()
    {
        super();
    }

    connectedCallback()
    {
        // this.classList.add("fade");
        this.classList.add("fade-in");
        // setTimeout(() => this.classList.add("fade-in"), 1000);
        // this.classList.add("fade-in");

        const shaders = document.getElementsByTagName("shader-view");
        const thumbnails = document.getElementsByTagName("thumbnail-view");
        for (let node of shaders) {
            node.addEventListener("open", e => {
                this.classList.remove("fade-in")
                console.log("sup?")
            });
        }
        for (let node of thumbnails) {
            node.addEventListener("open", e => this.classList.remove("fade-in"));
        }
    }
}

customElements.define("gallery-view", GalleryView);