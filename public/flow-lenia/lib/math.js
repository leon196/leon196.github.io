/*
	Copyright (c) 2024, Adrian Margel All Rights Reserved.
	see: https://github.com/AdrianMargel/cimexis-elements for details
*/

function mod(a,n){
	return ((a%n)+n)%n;
}
function mix(a,b,m){
	return a*(1-m)+b*m;
}
function clamp(a,min,max){
	return Math.max(Math.min(a,max),min);
}
function random(min,max){
	if(arguments.length==0)
		return Math.random();
	if(arguments.length==1)
		return Math.random()*min;
	let diff=max-min;
	return min+Math.random()*diff;
}
function sigmoid(x){
	return 1/(1+Math.pow(Math.E,-x));
}

let PI=Math.PI;
let TAU=Math.PI*2;
let ISO_ANG=Math.atan(1/Math.sqrt(2));

function nrmAngTAU(ang){
	return mod(ang,TAU);
}
function nrmAngPI(ang){
	return mod(ang+PI,TAU)-PI;
}

// Put some of the most commonly used Math variables into global scope
const pow=Math.pow;
const sqrt=Math.sqrt;

const min=Math.min;
const max=Math.max;

const round=Math.round;
const ceil=Math.ceil;
const flr=Math.floor;
const abs=Math.abs;
const sign=Math.sign;

const sin=Math.sin;
const cos=Math.cos;
const tan=Math.tan;

const rand=random;