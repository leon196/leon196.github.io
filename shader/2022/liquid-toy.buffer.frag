#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform sampler2D framebuffer;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Liquid toy by Leon Denise 2022-05-18
// Playing with shading with a fake fluid heightmap

// shortcut to sample texture
#define TEX(uv) texture(framebuffer, uv).r

// shorcut for smoothstep uses
#define trace(edge, thin) smoothstep(thin,.0,edge)
#define ss(a,b,t) smoothstep(a,b,t)

const float speed = .1;
const float scale = 2.;
const float falloff = 2.;
const float fade = .3;
const float strength = 1.;
const float range = 5.;

// fractal brownian motion (layers of multi scale noise)
float gyroid (vec3 p) { return dot(sin(p),cos(p.yzx)); }
float fbm(vec3 p)
{
    float result = 0., amplitude = 0.5;
    for (float index = 0.; index < 5.; ++index)
    {
        // result += texture(framebuffer, p/amplitude).xyz * amplitude;
        result += gyroid(p/amplitude) * amplitude;
        amplitude /= falloff;
    }
    return result;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    // coordinates
    vec2 uv = (fragCoord.xy - iResolution.xy / 2.)/iResolution.y;
    vec2 aspect = vec2(iResolution.x/iResolution.y, 1);
    
    // draw circle at mouse or in motion
    float t = iTime*2.;
    vec2 mouse = (iMouse.xy - iResolution.xy / 2.)/iResolution.y;
    if (iMouse.z > .5) uv -= mouse;
    else uv -= vec2(cos(t),sin(t))*.3;
    // uv -= vec2(cos(t),sin(t))*.3;
    float paint = trace(length(uv),.1);
    
    // expansion
    vec2 offset = vec2(0);
    uv = fragCoord.xy / iResolution.xy;
    vec4 data = texture(framebuffer, uv);
    vec3 unit = vec3(range/472./aspect,0);
    vec3 normal = normalize(vec3(
        TEX(uv - unit.xz)-TEX(uv + unit.xz),
        TEX(uv - unit.zy)-TEX(uv + unit.zy),
        data.x*data.x)+.001);
    offset -= normal.xy;
    
    // turbulence
    // spice *= 6.28;
    // spice += iTime;
    // offset += vec2(cos(spice),sin(spice));
    
    // noise
    vec3 e = vec3(vec2(.001), 0.);
    #define F(u) fbm(vec3(uv*scale+u,iTime*speed))
    #define P(u) vec3(uv+u, F(u))
    vec3 spice = cross(normalize(P(e.xz)-P(-e.xz)), normalize(P(e.zy)-P(-e.zy)));
    offset -= vec2(spice.y, -spice.x) / 2.;
    // spice.z *= 2.1;
    // spice = normalize(spice);
    // offset -= spice.xy;
    
    uv += strength * offset / aspect / 472.;
    
    // sample buffer
    vec4 frame = texture(framebuffer, uv);
    
    // temporal fading buffer
    paint = max(paint, frame.x - iTimeDelta * fade);
    
    // print result
    fragColor = vec4(clamp(paint, 0., 1.));
}