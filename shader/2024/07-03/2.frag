#version 300 es

precision mediump float;

out vec4 fragColor;

uniform bool final_pass;
uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D framebuffer;

void mainImage(out vec4 fragColor, in vec2 fragCoord);
void post_process(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    if (final_pass)
    {
        post_process(fragColor, gl_FragCoord.xy);
    }
    else
    {
        mainImage(fragColor, gl_FragCoord.xy);
    }
}


// Fork of "noisenoisenoise" by leon. https://shadertoy.com/view/l3GXzh
// 2024-07-01 22:54:53

// Fork of "2qwfe" by leon. https://shadertoy.com/view/M3cSDl
// 2024-07-01 22:29:58


#define R iResolution.xy
#define N(v) normalize(v)
#define T(u) noise(vec3(q+u,.0))
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

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = (2.*fragCoord-R.xy)/R.y;
    float dist = length(p);
    vec2 q = vec2(log(dist), atan(p.y,p.x));
    vec2 aspect = vec2(R.x/R.y, 1.);
    
    q.x += -iTime*.1;
    
    vec2 range = 0.1*aspect;
    vec3 e = vec3(range,0);
    //p.x += iTime;
    
    float a = 1.;
    vec3 color = vec3(1.);
    
    for (float i = 0.; i < 5.; ++i)
    {
        vec3 z = P(0.);
        vec3 normal = normalize(cross(N(z-P(e.xz)), N(z-P(e.zy))));

        q += vec2(normal.y, -normal.x) * .1 * a;// * pow(dist, .2);
        a /= .65;
        //p += normal.xy * .2;
        //color -= normal/3.;
        
        //color = 1.-normal;
    }
    
    float shape = abs(length(q)-.5)-.1;
    shape = abs(cos(q.x));
    //shape = max(shape, abs(fract(q.x * .3)-.5)-.2);
    //shape = abs(fract(p.y+iTime)-.5)-.2;
    float shade = smoothstep(1.,0.,shape);
    //float shade = (1./abs(p.y));// * abs(fract(p.x*20.)-.5) * 2.;
    //color = normal;
    color *= shade;
    //color *= abs(p.y)*2.;
    //color *= smoothstep(.1,.0,fract(p.x/5.+iTime/10.)-.5);
    //color = vec3(fract(abs(p)), 0.);
    fragColor = vec4(color, 1);
}

#define R iResolution.xy
#define N(v) normalize(v)
#define TT(u) texture(framebuffer, uv+u).r
#define PP(u) vec3(uv+u, TT(u))

void post_process( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/R;

    vec3 e = vec3(1./R,0);
    vec3 z = PP(0.);
    vec3 x = PP(e.xz);
    vec3 y = PP(e.zy);
    vec3 normal = N(cross(N(z-x), N(z-y)));
    
    float light = dot(normal, N(vec3(0,1,1)))*.5+.5;
    vec3 color = vec3(1);
    //color = 0.5 + 0.5 * cos(vec3(1,2,3) * 44. + normal.z * 3.);
    color *= pow((light), .4);
    color *= smoothstep(.5,.0,normal.z);
    //color *= z.z;
    
    fragColor = vec4(color, 1.);
    //fragColor = texture(iChannel1, normal);
}