// http://www.html5canvastutorials.com/advanced/html5-canvas-animation-stage/
window.requestAnimFrame = (function(callback) { 
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60);};})();

//
function animationRatio(start, delay, time) { return clamp((time - start) / delay, 0.0, 1.0); }

// 
var PI = 3.14159265358979;
var PI2 = 6.28318530717958;
function vec2(xx, yy) { return { x: xx, y: yy }; }
function vec3(xx, yy, zz) { return { x: xx, y: yy, z: zz }; }
function rect(ww, hh) { return { width: ww, height: hh }; }

//
function clamp(value, mini, maxi) { return Math.max(mini, Math.min(maxi, value)); }
function pixelate(value, details) { return Math.floor( value * details ) / details ; };

function distance(v1, v2) { return Math.sqrt((v2.x - v1.x) * (v2.x - v1.x) + (v2.y - v1.y) * (v2.y - v1.y)); };

function length (v) { return Math.sqrt(v.x * v.x + v.y * v.y); };
function normalize(v) { var dist = length(v); return vec2(v.x / dist, v.y / dist ); }
function fract(x) { return x % 1; }
function fractVec3(v) { return vec3(v.x % 1, v.y % 1 , v.z % 1); }
function mix(a, b, ratio) { return a * (1 - ratio) + b * ratio };

// https://github.com/gre/smoothstep
function smoothstep (min, max, value) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
  return x*x*(3 - 2*x);
}

////////////////////////////////////
// From -> http://www.actionscript.org/forums/showthread.php3?t=176052
// By abeall
// dot product of two vectors 
function dot (v1,v2) { return (v1.x*v2.x) + (v1.y*v2.y); } ;
// reflect vector 'v' against normalized vector 'n' 
function reflect (v, n) {     
	// R = V - 2 * (V · N)     
	var d = dot(v,n);  
	return { x: v.x -2 * d * n.x, y: v.y -2 * d * n.y } 
};
////////////////////////////////////

////////////////////////////////////
// hash based 3d value noise
// function taken from [url]https://www.shadertoy.com/view/XslGRr[/url]
// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// ported from HLSL to js
function hash( n ) {
	return fract(Math.sin(n)*43758.5453);
}

function noise( seed ) {
    // The noise function returns a value in the range -1.0f -> 1.0f
    var p = vec3(Math.floor(seed.x), Math.floor(seed.y), Math.floor(seed.z));
    var f = fractVec3(seed);
    f.x = f.x*f.x*(3.0-2.0*f.x);
    f.y = f.y*f.y*(3.0-2.0*f.y);
    f.z = f.z*f.z*(3.0-2.0*f.z);
    var n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix( hash(n+0.0), hash(n+1.0),f.x),
                   mix( hash(n+57.0), hash(n+58.0),f.x),f.y),
               mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                   mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
}

var Color = {};

Color.Red = '#F26C4F';   
Color.RedOrange = '#F68E55';   
Color.YellowOrange = '#FBAF5C';    
Color.Yellow = '#FFF467';    
Color.PeaGreen = '#ACD372';    
Color.YellowGreen = '#7CC576';   
Color.Green = '#3BB878';   
Color.GreenCyan = '#1ABBB4';   
Color.Cyan = '#00BFF3';    
Color.CyanBlue = '#438CCA';    
Color.Blue = '#5574B9';    
Color.BlueViolet = '#605CA8';    
Color.Violet = '#855FA8';    
Color.VioletMagenta = '#A763A8';   
Color.Magenta = '#F06EA9';   
Color.MagentaRed = '#F26D7D';
Color.White = '#ffffff';
Color.Gray05 = '#CACACA';
Color.Gray10 = '#EBEBEB';
Color.Gray15 = '#E1E1E1';
Color.Gray20 = '#D7D7D7';
Color.Gray25 = '#D7D7D7';
Color.Gray30 = '#C2C2C2';
Color.Gray35 = '#B7B7B7';
Color.Gray40 = '#ACACAC';
Color.Gray45 = '#A0A0A0';
Color.Gray50 = '#959595';
Color.Gray55 = '#898989';
Color.Gray60 = '#7D7D7D';
Color.Gray65 = '#707070';
Color.Gray70 = '#626262';
Color.Gray75 = '#555555';
Color.Gray80 = '#464646';
Color.Gray85 = '#363636';
Color.Gray90 = '#262626';
Color.Gray95 = '#111111';
Color.Black = '#000000';

Color.colors = [Color.Red, Color.RedOrange, Color.YellowOrange, Color.Yellow, Color.PeaGreen, Color.YellowGreen, 
Color.Green, Color.GreenCyan, Color.Cyan, Color.CyanBlue, Color.Blue, Color.BlueViolet, Color.Violet, 
Color.VioletMagenta, Color.Magenta, Color.MagentaRed];

Color.colorsMountain = [Color.White, Color.Gray15, Color.Gray30, Color.PeaGreen, Color.YellowGreen, Color.Green, Color.GreenCyan];
Color.colorsGreen = ['#00ff00', '#00e500', '#00cc00', '#00b200', '#009900', '#007f00', '#006600', '#004c00', '#003300', '#001900', '#000000'];

var rainbowColorCurrentIndex = 0;

Color.GetGray = function(ratio) {
  var index = Math.floor(ratio * Color.grays.length);
  return Color.grays[index % Color.grays.length];
}

Color.GetRainbow = function(ratio) {
  var index = Math.floor(ratio * Color.colors.length);
  return Color.colors[index % Color.colors.length];
}

Color.GetMountain = function(ratio) {
  var index =Math.floor( ratio * Color.colorsMountain.length);
  return Color.colorsMountain[index % Color.colorsMountain.length];
}

Color.GetGreen = function(ratio) {
  var index =Math.floor( ratio * Color.colorsGreen.length);
  return Color.colorsGreen[index % Color.colorsGreen.length];
}

Color.GetRainbowHSL = function (n) 
{
    n = n * 240 / 255;
    return 'hsl(' + n + ',100%,50%)';
};

// Auto iterate each call
Color.Rainbow = function () {
  rainbowColorCurrentIndex = (rainbowColorCurrentIndex + 1) % Color.colors.length;
  return Color.colors[rainbowColorCurrentIndex];
};

// Direct access
Color.Get = function(index) {
  return Color.colors[index % Color.colors.length];
}

Color.grays = [Color.White, Color.Gray05, Color.Gray10, Color.Gray15, Color.Gray20, Color.Gray25, Color.Gray30, 
Color.Gray35, Color.Gray40, Color.Gray45, Color.Gray50, Color.Gray55, Color.Gray60, 
Color.Gray65, Color.Gray70, Color.Gray75, Color.Gray80, Color.Gray85, Color.Gray90, Color.Gray95];
