
const onmouseenter = "this.play()";
const ontouchstart = onmouseenter;
const onmouseleave = "this.pause()";
const onclick = "";//"if (this.paused) this.play(); else this.pause();";

function buildColumn(array)
{
    var result = "<ul>\n";
    array.forEach(file => {
        result += "<li>\n";
        result += "<video muted loop onmouseenter=\"" + onmouseenter + "\" onclick=\"" + onclick + "\" ontouchstart=\"" + ontouchstart + "\" onmouseleave=\"" + onmouseleave + "\" ><source src=\"media/" + file + ".webm\" type=\"video/webm\"></video>\n";
        result += "</li>\n";
    });
    result += "</ul>";
    return result;
}

function shuffle(array)
{
    let curId = array.length;
    while (0 !== curId)
    {
        let randId = Math.floor(Math.random() * curId);
        curId -= 1;
        let tmp = array[curId];
        array[curId] = array[randId];
        array[randId] = tmp;
    }
    return array;
}

var numbers = [];
for (var i = 0; i < 88; ++i) numbers.push(i);
var array = shuffle(numbers);
var count = Math.floor(array.length / 3);

document.getElementById("content").innerHTML = 
  buildColumn(array.slice(0, count))
  + buildColumn(array.slice(count, count * 2))
    + buildColumn(array.slice(count * 2));
