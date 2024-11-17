

function lerp (start, end, amt){
	return (1-amt)*start+amt*end
}
function clamp (x, a, b){
	return Math.max(a, Math.min(x, b));
}
function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

const anim = {
    duration: 80,
    duration2: 40,
    scale1: 10,
    target1: [0,0],
    elapsed: 0,
}

anim.zoom1 = (dt) => {
    anim.elapsed += dt;
    let time = clamp(anim.elapsed/anim.duration, 0, 1);
    let t = easeInOutSine(time);
    zoom = lerp(1, anim.scale1, t);
    offset[0] = lerp(0, anim.target1[0], t);
    offset[1] = lerp(0, anim.target1[1], t);
}

anim.zoom2 = (dt) => {
    anim.elapsed += dt;
    let time = clamp(anim.elapsed/anim.duration2, 0, 1);
    let t = easeInOutSine(time);
    zoom = lerp(anim.scale1, 1, t);
    offset[0] = lerp(anim.target1[0], 0, t);
    offset[1] = lerp(anim.target1[1], 0, t);
}

anim.zoom3 = (dt) => {
    // anim.elapsed += dt;
    // let time = clamp(anim.elapsed/anim.duration, 0, 1);
    // zoom = lerp(1, 1, time);
}

anim.current = undefined;

anim.start = () => {
    anim.elapsed = 0;
    anim.current = anim.zoom1;
    anim.target1 = [(Math.random()*2-1), (Math.random()*2-1)*0.5];
    setTimeout(() => {
        anim.elapsed = 0;
        anim.current = anim.zoom2;
        setTimeout(() => {
            anim.elapsed = 0;
            anim.current = anim.zoom3;
            setTimeout(() => {
                anim.elapsed = 0;
                anim.current = undefined;
            }, anim.duration2 * 1000);

        }, anim.duration2 * 1000);

    }, anim.duration * 1000);
}
