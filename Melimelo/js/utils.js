

function lerp(v0, v1, t) {
	return v0*(1-t)+v1*t;
}

function closestPowerOfTwo (num) {
	return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
}

function distance (ax,ay,bx,by) {
	return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
}

function direction (ax,ay,bx,by) {
	return [bx-ax, by-ay];
}

function directionNorm (ax,ay,bx,by) {
	return [bx-ax/Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by)), by-ay/Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by))];
}