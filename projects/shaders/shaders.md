---
title: Shader Gallery
date: 2024-01-01
year: 2024
tags: 
    - post
thumbnail: cover3.png
layout: layout.njk
---
<style>
    body {
        overflow: hidden;
    }
    .grid {
        flex-wrap: wrap;
    }
    .grid > * {
        display: flex;
        height: 20vh;
        flex-grow: 1;
        overflow: hidden;
    }
    .grid img {
        object-fit: cover;
        transition: transform 0.2s;
    }
    #overlay {
        position: absolute;
        z-index: 100;
        pointer-events: none;
        width: 400px;
        height: 400px;
    }
    .text {
        flex: 0.3;
    }
    .comment {
        max-width: 300px;
        padding: 20px;
        height: calc(20vh - 40px);
        display: inline-block;
    }
    .comment > * {
        margin: 0;
    }

    @media screen and (max-width: 800px) {  
        .row {
            flex-direction: column;
        }
        .comment {
            max-width: 100%;
        }
    }
</style>
<script src="script/lib/twgl-full.min.js"></script>
<script src="script/lib/virtual-webgl2.js"></script>
<script src="script/lib/load.js"></script>
<script src="script/shaderview.js"></script>
<script>
    window.addEventListener("load", function(){
        // var result = "";
        // for (var i = 1; i <= 309; ++i) {
        //     result += "<img src=\"image/"+i+".jpg\">"
        // }
        // console.log(result)
        var overlay = document.getElementById("overlay")
        var shaderview = new ShaderView(overlay);
        document.addEventListener("mousemove", function(e){
            var offsetX = Math.max(0, e.pageX+overlay.width-window.innerWidth)
            var offsetY = Math.max(0, e.pageY+overlay.height-window.innerHeight-window.scrollY)
            overlay.style.left = (e.pageX-offsetX)+"px"
            overlay.style.top = (e.pageY-offsetY)+"px"
        })
        var images = document.getElementsByTagName("img")
        for (var i = 0; i < images.length; ++i) {
            if (images[i].src.includes("media")) {
                images[i].addEventListener("mouseover", function(e){
                    // overlay.src = "gif/"+this.src.split("image/")[1].split(".")[0]+".gif";
                    var label = this.src.split("media/")[1].split(".")[0];
                    shaderview.load(label+".frag")
                })
                images[i].addEventListener("mouseleave", function(e){
                    // overlay.src = "";
                })
            }
        }
    })
</script>
<canvas id="overlay">shader/city-1.frag</canvas>
<div class="column">
    <div class="row grid">
        <div class="comment">
            <h1>Shader Gallery</h1>
            <p>Welcome to the shader archives gallery. This is a work in progress, soon to be updated!</p>
        </div>
        {%- for shade in shader.list -%}
        <div>
        <img src="media/{{ shade }}.png">
        </div>
        {%- endfor -%}
    </div>
</div>