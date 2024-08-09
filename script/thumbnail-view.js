
export default class Thumbnail extends HTMLElement
{    
    constructor()
    {
        super();
    }

    connectedCallback()
    {
        const src = this.getAttribute("src");
        const type = src.split('.').pop();

        // video
        if (type == "mp4" || type == "webm")
        {
            // video component
            const video = document.createElement("video");
            video.setAttribute("loop", "");

            // source file
            const source = document.createElement("source");
            source.setAttribute("src", src);

            // codec
            source.setAttribute("type", "video/"+type);

            // dom
            video.appendChild(source);
            this.appendChild(video);

            // autoplay
            video.muted = true;
            // video.play();

            // effects
            if (this.getAttribute("blur") != null)
            {
                video.classList.add("blur");
            }
            // video.classList.add("desaturate");
            
            this.addEventListener("mouseover", e => video.play());
            this.addEventListener("mouseleave", e => video.pause());
        }

        // image
        else
        {
            const img = document.createElement("img");
            img.setAttribute("src", src);
            this.appendChild(img);

            // effects
            if (this.getAttribute("blur") != null)
            {
                img.classList.add("blur");
            }
        }

        // this.links();
    }

    links()
    {
        // // link
        // const href = this.getAttribute("href");
        // if (href != null)
        // {
        //     this.addEventListener("click", (e) => this.open(href));
        // }

        // // title center
        // const h2 = this.getAttribute("h2");
        // if (h2 != null)
        // {
        //     const node = document.createElement("h2");
        //     node.textContent = h2;
        //     this.appendChild(node);
        // }

        // // title top left
        // const h3 = this.getAttribute("h3");
        // if (h3 != null)
        // {
        //     const node = document.createElement("h3");
        //     node.textContent = h3;
        //     this.appendChild(node);
        // }
    }

    open(href)
    {
        this.dispatchEvent(new Event("open"));
        setTimeout(() => window.open(href, "_self"), 500);
    }
}

customElements.define("thumbnail-view", Thumbnail);