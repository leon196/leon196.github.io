#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D framebuffer, bluenoise;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Cloudy Blue Sky
// by Leon Denise
// 05/08/2023

// Guess who is in vacation in the country side.
// Another layers of noise that look like something.
// Trying to push noise patterns farer to create complex shapes with simple code.

// Could be very golfed and textureless,
// but the blue noise scrolling is really adding to the picture,
// and would be hard to golf.


// Gyroid pattern
// Explained by Martijn Steinrucken at:
// https://www.youtube.com/watch?v=b0AayhCO7s8
float gyroid (vec3 p) { return dot(sin(p),cos(p.yzx)); }

// FBM type of noise with gyroid pattern
float noise (vec3 p, float t, float w, float aa)
{
    float result = 0., a = .5;
    for (float i = 0.; i < 4.; ++i, a/=aa)
    {
        p.z += t+result*w; // distortion
        result += abs(gyroid(p/a))*a; // noise pattern
    }
    return result;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 color = vec3(0);
    
    // coordinates
    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = 2.*(fragCoord-iResolution.xy/2.)/iResolution.y;
    
    // blue noise scroll
    // by Inigo Quilez from:
    // https://www.shadertoy.com/view/tlySzR
    ivec2 pp = ivec2(fragCoord);
    pp = (pp+int(iFrame*196.)*ivec2(113,127)) & 1023;
    vec3 blu = texelFetch(bluenoise,pp,0).xyz;
    
    // shape from noise
    vec3 q = vec3(p, 0.);
    float t = iTime*.05-.2/(uv.y); // animation and perspective
    q.y += noise(q*10., -t*4., 0., 1.9)*.1; // small details
    color += noise(q, t, .3, 1.7)*.5-.5; // overall shape
    color += blu.x*0.4; // extra shape reveal with blue noise
    color *= smoothstep(.05,.4,uv.y); // fade out horizon
    
    // color
    vec3 sky = mix(vec3(1), vec3(.4,.8,1), smoothstep(-.4, .4, uv.y));
    color = mix(sky, vec3(1), smoothstep(.0,.2,color.r));
    
    fragColor = vec4(color,1.0);
}