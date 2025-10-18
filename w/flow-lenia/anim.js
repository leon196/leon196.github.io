

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
    duration:80,
    duration2: 80,
    scale1: 2,
    target1: [0,0],
    elapsed: 0,
    last_time: 0,
    delay: 10,
}

anim.zoomIN = (dt) => {
    anim.elapsed += dt;
    let tt = clamp(anim.elapsed/anim.duration, 0, 1);
    let t = easeInOutSine(tt);
    zoom = lerp(1, anim.scale1, t);
    offset[0] = lerp(0, anim.target1[0], t);
    offset[1] = lerp(0, anim.target1[1], t);
}

anim.zoomOUT = (dt) => {
    anim.elapsed += dt;
    let tt = clamp(anim.elapsed/anim.duration2, 0, 1);
    let t = easeInOutSine(tt);
    zoom = lerp(anim.scale1, 1, t);
    offset[0] = lerp(anim.target1[0], 0, t);
    offset[1] = lerp(anim.target1[1], 0, t);
}

anim.idle = (dt) => {
    // anim.elapsed += dt;
    // let tt = clamp(anim.elapsed/anim.duration, 0, 1);
    // zoom = lerp(1, 1, tt);
}

anim.current = undefined;

anim.start = () => {
    anim.elapsed = 0;
    anim.current = anim.zoomIN;
    anim.target1 = [(Math.random()*2-1), (Math.random()*2-1)*.5];
    setTimeout(() => {
        anim.elapsed = 0;
        anim.current = anim.zoomOUT;
        setTimeout(() => {
            anim.elapsed = 0;
            anim.current = anim.idle;
            setTimeout(() => {
                anim.elapsed = 0;
                anim.current = undefined;
            }, anim.duration2 * 1000);

        }, anim.duration2 * 1000);

    }, anim.duration * 1000);
}

anim.update = (dt) => {
	anim.last_time += dt;
	if (anim.last_time > anim.delay)
	{
		anim.last_time = 0;
		anim.delay = 100 + Math.random() * 100
		if (anim.current == undefined) anim.start();
	}
	if (anim.current != undefined) anim.current(dt);
}