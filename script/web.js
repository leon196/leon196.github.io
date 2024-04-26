
window.addEventListener("load", (e) =>
{
    const card = document.getElementById("card");
    const block = document.getElementById("block");
    const leon = document.getElementById("leon");
    let swap = false;
    let swapping = (e) => {
        swap = !swap;
        card.style.visibility = swap ? "hidden" : "visible";
        block.style.visibility = swap ? "visible" : "hidden";
    }

    leon.addEventListener("click", swapping);
    block.addEventListener("click", swapping);

    const email = document.getElementById("email");
    email.addEventListener("mouseover", (e) => {
        email.style.fill = "#333";
    })

    const left = document.getElementById("left");
    const title = document.getElementById("title");
    const right = document.getElementById("right");
    let cursor = 0;
    const catalog = 
    {
        "Oil": ["oil_sim", "oil_render"],
        "Smoke": ["smoke_sim", "smoke_render"],
        "Cloud": ["none", "cloud"],
    }
    const count = Object.keys(catalog).length;
    let select = (i) => {
        const keys = Object.keys(catalog);
        const effect = catalog[keys[i]];
        engine.select(effect[0], effect[1]);
        title.textContent = keys[i];
    }
    left.addEventListener("click", (e) => {
        cursor = (cursor-1+count)%count;
        select(cursor);
    })
    right.addEventListener("click", (e) => {
        cursor = (cursor+1)%count;
        select(cursor);
    })
    
    select(cursor);
});