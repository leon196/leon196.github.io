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

// Fork of "noisenoisenoise" by leon. https://shadertoy.com/view/l3GXzh
// 2024-07-01 22:54:53

// Fork of "2qwfe" by leon. https://shadertoy.com/view/M3cSDl
// 2024-07-01 22:29:58


#define R iResolution.xy
#define N(v) normalize(v)
#define T(u) noise(vec3(q+u,time*.1))
#define P(u) vec3(uv+u, T(u))
float gyroid (vec3 p) { return dot(sin(p),cos(p.yzx)); }
float noise (vec3 p)
{
    float result = 0., a = .5;
    for (float i = 0.; i < 4.; ++i, a/=2.)
    {
        //p.z += result*.1;
        result += ((gyroid(p/a)))*a;
    }
    return result;
    //return abs(result-.7);
}

vec3 render (in vec2 fragCoord, in float time)
{

    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = (2.*fragCoord-R.xy)/R.y;
    vec2 q = vec2(log(length(p)), atan(p.y,p.x));
    vec2 aspect = vec2(R.x/R.y, 1.);
    
    q.x += -time*6.2835/10.;
    
    vec2 range = 100./R;
    vec3 e = vec3(range,0);
    //p.x += iTime;
    
    float a = 1.;
    vec3 color = vec3(1.);
    
    for (float i = 0.; i < 5.; ++i)
    {
        vec3 z = P(0.);
        vec3 normal = vec3(cross(N(z-P(e.xz)), N(z-P(e.zy))));
        normal = normalize(normal);

        q += vec2(normal.y, -normal.x) * .1 * a;
        a /= .65;
        //p += normal.xy * .2;
        //color -= normal/3.;
        
        //color = 1.-normal;
    }
    
    float shape = abs(length(q)-.5)-.1;
    shape = abs(cos(q.y+time))-.2;
    //shape = max(shape, abs(fract(q.x * .3)-.5)-.2);
    //shape = abs(fract(p.y+iTime)-.5)-.2;
    float shade = smoothstep(.1,.0,shape);
    //float shade = (1./abs(p.y));// * abs(fract(p.x*20.)-.5) * 2.;
    //color = normal;
    color *= shade;
    //color *= abs(p.y)*2.;
    //color *= smoothstep(.1,.0,fract(p.x/5.+iTime/10.)-.5);
    //color = vec3(fract(abs(p)), 0.);
    return color;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    fragColor = vec4(render(fragCoord, iTime), 1.);
    return;
    
    float timeA = iTime;
    float timeB = iTime-10.;
    float blend = smoothstep(.0,10.,iTime);
    vec3 color = render(fragCoord, timeA);
    color = mix(color, render(fragCoord, timeB), blend);
    fragColor = vec4(color, 1.);
}