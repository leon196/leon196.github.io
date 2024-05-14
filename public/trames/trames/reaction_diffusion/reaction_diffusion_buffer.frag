#version 300 es
precision mediump float;

uniform sampler2D framebuffer, image, lut;
uniform vec2 resolution;
uniform float scale, size, edge, time, tick, nearest, farest;

in vec2 uv, view;
out vec4 fragColor;

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// by polyrhythm
// https://www.shadertoy.com/view/MssyDf
#define TIMESTEP 1.
// #define F 0.0545
// #define K 0.062
// #define Da 1.0
// #define Db 0.5

void getVal(vec2 p, out vec2 val, out vec2 laplacian) {
  vec2 r = resolution;
  vec2 uv = p / r;
  vec2 n = p + vec2(0.0, 1.0);
  vec2 ne = p + vec2(1.0, 1.0);
  vec2 nw = p + vec2(-1.0, 1.0);
  vec2 e = p + vec2(1.0, 0.0);
  vec2 s = p + vec2(0.0, -1.0);
  vec2 se = p + vec2(1.0, -1.0);
  vec2 sw = p + vec2(-1.0, -1.0);
  vec2 w = p + vec2(-1.0, 0.0);

  val = texture(framebuffer, uv).xy;
  laplacian = texture(framebuffer, n / r).xy * 0.2;
  laplacian += texture(framebuffer, e / r).xy * 0.2;
  laplacian += texture(framebuffer, s / r).xy * 0.2;
  laplacian += texture(framebuffer, w / r).xy * 0.2;
  laplacian += texture(framebuffer, nw / r).xy * 0.05;
  laplacian += texture(framebuffer, ne / r).xy * 0.05;
  laplacian += texture(framebuffer, sw / r).xy * 0.05;
  laplacian += texture(framebuffer, se / r).xy * 0.05;
  laplacian += -1.0 * val;   
}

void main()
{
    vec4 map = texture(framebuffer, uv);
    float gray = texture(image, uv).r;

    vec3 color = vec3(0.0);
    if (tick < 1.) {
        // if (uv.x > 0.45 && uv.x < 0.55 && uv.y > 0.45 && uv.y < 0.55)
        // {
        //     color = vec3(1.);
        // }
        float a = 1.;
        float b = step(.9, hash22(gl_FragCoord.xy).r);
        // float b = step(0.5, gray);// smoothstep(.01,0.,length(uv-.5)-.1);
        color = vec3(a,b,0);
        // color = vec3(smoothstep(.5,0.,length(uv-.5)-.1));
        // color = vec3();
    } else {
     	vec2 val, laplacian;
        getVal(gl_FragCoord.xy, val, laplacian);
        
        vec2 delta;
        // float F = .0367;//.055;//mix(0.04, 0.06, gray);
        // float K = .0649;//.062;//mix(.05, 0.07, gray);
        float F = 0.07;// mix(.045, .07, gray);
        float K = mix(.05, .1, gray);
        float Da = 1.;// - .1 * gray;
        float Db = 0.2;// - 0.1 * gray;
        // val.x = min(val.x, 1.);
        // val.y = max(val.y, 0.);
        // val.xy = clamp(val.xy, 0., 1.);
 		delta.x = Da * laplacian.x - val.x * val.y * val.y + F * (1.0 - val.x);
  		delta.y = Db * laplacian.y + val.x * val.y * val.y - (K + F) * val.y;
        
        color = vec3(clamp(val + delta , 0., 1.), 0.0);
    }

    fragColor = vec4(color, 1);
}