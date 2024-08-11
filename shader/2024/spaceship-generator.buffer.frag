#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform sampler2D framebuffer, bluenoise;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

mat2 rot (float a) { float c=cos(a),s=sin(a);return mat2(c,-s,s,c); }

mat3 look(vec3 z)
{
    vec3 x = normalize(cross(z, vec3(0,1,0)));
    vec3 y = normalize(cross(x, z));
    return mat3(x,y,z);
}

float gyroid (vec3 p) { return dot(cos(p),sin(p.yzx)); }

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec4 hash41(float p)
{
	vec4 p4 = fract(vec4(p) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+33.33);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}
vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

// Inigo Quilez https://iquilezles.org/articles/distfunctions/
float sdBox( vec3 p, vec3 b )
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}


// Spaceship Generator
// 2024-07-15 Leon Denise

// space ship seed
const float seed = 196.;
#define animate

// globals
vec3 coord, dither;
float disp, glitch;
float mat;

// noise
float fbm(vec3 p) {
    float result = 0., a = .5;
    for (float i = 0.; i < 5.; ++i) {
        p += result*.1;
        result += abs(atan(gyroid(p/a))*a);
        a /= 2.;
    }
    return result;
}

// sky
vec3 get_sky(vec3 p) {

    // cosmic dust
    vec2 e = vec2(0.5,0)+.1*dither.y;
    #define T(u) fbm(p+u)
    vec3 normal = normalize(T(0.)-vec3(T(e.xyy),T(e.xyx),T(e.xxy)));
    vec3 color = .5 + .5 * cos(vec3(1,2,3)*5.5+normal.x*.7+4.);
    color *= smoothstep(-2.0,2.0,-abs(normal.z)+.5+dither.x);
    normal.yz *= rot(.5);
    color += (normal.y)*.2;
    
    // stars
    for (float i = 1.; i < 8.; ++i) {
        vec3 q = p*10.*i;
        vec3 rng = hash33(floor(q)+196.);
        float dist = length(fract(q)-.5)*2.;
        float threshold = step(.95,rng.x);
        float light = (1.-sqrt(dist))*.1/dist;
        color += vec3(threshold*clamp(light,0.,1.)/2.);
    }
    
    return color;
}

// spaceship sdf
float map (vec3 p)
{
    float dist = 100.;
    vec3 pos = p;
    
    // animate seed
    float t = seed;
    #ifdef animate
    t += floor(iTime/5.+glitch*.1)*32.;
    #endif
    
    // pattern details
    vec3 q = p;
    q.xy *= rot(.9);
    q.xz *= rot(.5);
    q = (abs(fract(q*2.)-.5))*2.;
    float s = max(q.x,max(q.y,q.z));
    
    // kaleidoscopic space folding
    float a = 1.;
    vec3 e = vec3(.5,.1,.1);
    for (float i = 0.; i < 4.; ++i)
    {
        p = p-clamp(p,-e*a,e*a);
        p.xz = abs(p.xz)-.5*a;
        p.xz *= rot(t*a);
        p.yz *= rot(t*a);
        a /= 1.8;
    }
    
    // spaceship
    dist = sdBox(p,vec3(.065));
    
    // details displace
    dist += abs(fract(abs(s)*10.)-.5)*.01;
    
    // joints
    dist = min(dist, length(p.xz)-.005);
    dist = min(dist, length(p.yz)-.005);
    dist = min(dist, length(p.yx)-.005);
    
    coord = p;
    disp = s;
    
    return dist;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 color = vec3(0.25);
    
    // coordinages
    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = (2.*fragCoord-iResolution.xy)/iResolution.y;
    vec3 cam = vec3(0,1,-3.);
    vec3 ray = normalize(vec3(p,1.));
    
    // blue noise scroll https://www.shadertoy.com/view/tlySzR
    ivec2 pp = ivec2(fragCoord);
    pp = (pp+(int(iFrame))*ivec2(113,127)) & 1023;
    dither = texelFetch(bluenoise,pp,0).xyz;
    
    // glitch
    vec4 rng = hash41(floor(iTime*10.));
    glitch = hash33(vec3(floor(uv*40.*rng.xy*vec2(1.,3.)), 0.)).x;
    
    if (iMouse.z > 0.)
    {
        // mouse control
        vec2 mouse = (2.*iMouse.xy-iResolution.xy)/iResolution.y;
        cam.yz *= rot(-mouse.y);
        cam.xz *= rot(mouse.x);
    }
    else
    {
        // turn table animation
        cam.xz *= rot(iTime/16.);
        cam.y += sin(iTime/10.)*.5;
    }
    
    
    // camera rotation
    ray = look(normalize(-cam)) * ray;
    vec3 pos = cam + ray * dither.z * .1;
    
    // raymarch
    float ratio = 1.;
    float total = 0.;
    for (ratio = 1.; ratio > 0.; ratio -= 1./200.)
    {
        float dist = map(pos);
        if (dist < 0.001 * total || total > 10.) break;
        dist *= 0.9 + 0.1 * dither.z;
        pos += ray * dist;
        total += dist;
    }
    
    if (total < 10.)
    {
        vec3 c = coord;
        float d = disp;
        float m = mat;
        
        // lighting 
        vec2 e = vec2(.001,0);
        vec3 normal = normalize(map(pos)-vec3(map(pos+e.xyy),map(pos+e.yxy),map(pos+e.yyx)));
        vec3 rf = reflect(ray, normal);
        float light = clamp(dot(rf, normalize(vec3(0,.1,-1)))*.5+.5,0.,1.);
        
        // patterns
        vec3 q = (abs(fract(c*20.)-.5))*2.;
        float s = max(q.x,max(q.y,q.z));
        vec3 tint = .5+.5*cos(vec3(1,2,3)*5.+floor(s*8.)/3.+5.);
        float pattern = smoothstep(.01,.0,abs(fract(abs(d)*2.)-.5)-.2);

        // coloring
        color = tint*pattern;
        color += pow(light, 4.);
        color += get_sky(rf)*(1.-pattern);
        color *= ratio;
    }
    else
    {
        // background
        color = get_sky(ray);
    }
    
    if (fragCoord.y < 1.)
    {
        if (fragCoord.x < 1.) color = cam;
    }
    else if (fragCoord.y < 2.)
    {
        if (fragCoord.x < 1.) color = texelFetch(framebuffer, ivec2(0,0), 0).xyz;
    }
    
    fragColor = vec4(color, total);
}