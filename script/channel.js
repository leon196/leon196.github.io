
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
var current = 0;
var video = document.getElementById("channel");

function zap ()
{
    video.src = 'media/video/tv/'+array[current]+'.webm';
    video.play();
}

video.addEventListener('ended', (event) => {
    current = current + 1;
    if (current >= array.length)
    {
        current = 0;
        array = shuffle(numbers);
    }
    zap();
})

// setInterval(() => {
//     current = current + 1;
//     if (current >= array.length)
//     {
//         current = 0;
//         array = shuffle(numbers);
//     }
//     zap();
// }, 6000);

zap();