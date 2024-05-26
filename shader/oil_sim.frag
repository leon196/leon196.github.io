#version 300 es
precision mediump float;

uniform float desktop, clic, time, timeDelta, tick;
uniform vec2 mouse, resolution;
uniform sampler2D framebuffer;

in vec2 uv;
out vec4 fragColor;

const float speed = .01;
const float scale = 2.;
const float falloff = 3.;
const float fade = .4;
const float strength = 1.;
const float range = 5.;

#define trace(edge, thin) smoothstep(thin,.0,edge)
#define T(uv) texture(framebuffer, uv).r

float gyroid (vec3 p) { return dot(cos(p),sin(p.yzx)); }

float fbm(vec3 p)
{
    float r = 0.;
    float a = 0.5;
    for (float i = 0.; i < 4.; ++i)
    {
        // p.z += r;
        r += atan(gyroid(p/a)) * a;
        a /= 3.;
    }
    return r;
}

void main()
{
    // coordinates
    vec2 p = uv;
    vec2 aspect = vec2(resolution.x/resolution.y, 1);
    
    // noise
    float spice = fbm(vec3((uv-.5)*aspect*scale,time*speed));
    
    // draw circle at mouse or in motion
    float t = time;
    if (desktop > .5) p = (uv-mouse)*aspect;
    else p = (uv-.5)*aspect+vec2(cos(t),sin(t))*.3;
    float paint = trace(length(p),.1);
    
    // expansion
    vec2 offset = vec2(0);
    vec4 data = texture(framebuffer, uv);
    vec3 unit = vec3(range/472./aspect,0);
    vec3 normal = (vec3(
        T(uv - unit.xz)-T(uv + unit.xz),
        T(uv - unit.zy)-T(uv + unit.zy),
        data.x*data.x));
    float d = length(normal);
    if (d > .0) normal = normalize(normal);
    offset -= normal.xy;
    
    // turbulence
    spice *= 6.28*2.;
    spice += time;
    offset += vec2(cos(spice),sin(spice));
    
    offset = strength * offset / aspect / 472.;
    
    // sample buffer
    vec4 frame = texture(framebuffer, uv+offset);
    
    // temporal fading buffer
    paint = max(paint, frame.x - timeDelta * fade);

    // vec2 p = (mouse-uv)*vec2(resolution.x/resolution.y,1);
    // float shape = smoothstep(.01,0.,length(p)-.1);
    // vec3 color = vec3(1);
    // color *= shape;
    fragColor = vec4(clamp(paint, 0., 1.));
}