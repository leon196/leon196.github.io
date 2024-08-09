#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D iChannel0, iChannel1, iChannel2, iChannel3;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Fork of "noisey123" by leon. https://shadertoy.com/view/X3cXDs
// 2024-07-01 16:56:21

// Fork of "blue noise range normal gradient" by leon. https://shadertoy.com/view/mt2GWd
// 2024-04-15 12:16:24


#define R iResolution.xy
#define N(v) normalize(v)
#define T(u) texture(iChannel0, uv+u).r
#define P(u) vec3(uv+u, T(u))

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/R.xy;
    vec2 aspect = vec2(R.x/R.y, 1.);
    vec3 frame = texture(iChannel0, uv).rgb;
    vec3 blu = texture(iChannel1, fragCoord/1024.).rgb;
    
    
    vec2 range = 1./R.xy;
    vec3 e = vec3(range,0.);
    //vec3 normal = vec3(T(0.)-vec3(T(e.xz),T(e.zy), 0.));
    //normal.z *= .05;
    vec3 z = P(0.);
    vec3 normal = N(cross(N(z-P(e.xz)), N(z-P(e.zy))));
    
    
    float dt = dot(normal, N(vec3(0,1,1)));// + blu.x*.2;
    float light = pow(dt*.5+.5, .5);
    //float mask = clamp(frame.r/iTime/iFrameRate, 0., 1.);
    
    dt = dot(normal, N(vec3(0,-1,2)));// + blu.x*.2;
    float shadow = smoothstep(.0,.5,(dt)-.5);
    
    //vec3 color = 1.-abs(fract(frame/100.)-.5)*2.;
    vec3 color = vec3(1.);
    //color = mix(color, .5+.5*cos(vec3(1,2,3)*4.+frame.r*4.+4.+uv.y*10.), shadow);
    
    color *= light;
    //color = texture(iChannel2, normal, 0.).rgb;
    //color = vec3(normal.x+normal.y)/2.;
    color = normal;
    //color *= 1.-shadow;
    //color *= pow(light*.5+.5, .5);
    //color *= smoothstep(.0,.1,abs(fract(mask)-.5)-.25);
    float border = 1.-max(
                    max(step(fragCoord.y, 1.), step(R.y-1.,fragCoord.y)),
                    max(step(fragCoord.x, 1.), step(R.x-1.,fragCoord.x)));
    vec3 back = vec3(.25);
    back *= 1.-clamp(texture(iChannel0, uv, 6.).r, 0., 1.);
    color = mix(back, color, smoothstep(.0,.01,frame.r)*border);
    fragColor = vec4(color, 1.);
}


