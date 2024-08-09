
class Fullscreen extends HTMLElement
{    
    constructor()
    {
        super();
    }

    connectedCallback()
    {
        // this.classList.add("fade");

        // const dom = document.getElementsByTagName("gallery-view")[0];

        // this.addEventListener("click", (e) =>
        // {
        //     this.classList.remove("fade-in");
        //     dom.classList.add("fade-in");
        // });
    }
}

customElements.define("fullscreen-view", Fullscreen);