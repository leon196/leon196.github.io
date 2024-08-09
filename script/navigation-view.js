
class Navigation extends HTMLElement
{    
    constructor()
    {
        super();
    }

    connectedCallback()
    {
        /*
        const p = document.createElement("p");
        let pathname = window.location.pathname;
        pathname = pathname.replace("/page", "");
        let columns = pathname.split('/');

        columns.shift();
        columns.pop();
        columns.unshift("home");

        const map = {
            "home": "/",
            "shader": "/page/shader/"
        };
        
        columns.forEach(column => {
            
            // const span = document.createElement("span");
            // span.textContent = "/";
            // p.appendChild(span);

            let href = map[column];
            // if (href != undefined)
            {
                const a = document.createElement("a");
                a.setAttribute("href", href != undefined ? href : window.location.pathname);
                a.textContent = column;
                p.appendChild(a);
            }
            // else
            // {
            //     const div = document.createElement("span");
            //     div.textContent = column;
            //     p.appendChild(div);
            // }
        })
        // pathname = columns.join('/');
        
        // p.textContent = pathname;
        this.appendChild(p);
        */
        
    }
}

customElements.define("navigation-view", Navigation);