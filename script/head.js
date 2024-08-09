
// const title = document.createElement("title");
// title.textContent = "Leon Denise";
// document.head.appendChild(title);

// const charset = document.createElement("meta");
// charset.setAttribute("charset", "utf-8");
// document.head.appendChild(charset);

// const viewport = document.createElement("meta");
// viewport.setAttribute("name", "viewport");
// viewport.setAttribute("content", "width=device-width, initial-scale=1");
// document.head.appendChild(viewport);

// const styles = ["common", "gallery"];

// styles.forEach(style => {
//     const node = document.createElement("link");
//     node.setAttribute("rel", "stylesheet");
//     node.setAttribute("href", "/style/"+style+".css");
//     document.head.appendChild(node);
// })

// const lib = document.createElement("script");
// lib.setAttribute("type", "text/javascript");
// lib.setAttribute("src", "/script/lib/twgl-full.min.js");
// document.head.appendChild(lib);

// window.onload = () => {

    const scripts = [
        "gallery-view.js",
        "fullscreen-view.js",
        "navigation-view.js",
        "thumbnail-view.js",
        "shader-view.js",
    ];
    
    scripts.forEach(script => {
        const node = document.createElement("script");
        node.setAttribute("type", "module");
        node.setAttribute("src", "/script/"+script);
        node.setAttribute("defer", "");
        document.head.appendChild(node);
    })
// }