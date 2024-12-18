#version 300 es

precision mediump float;

out vec4 fragColor;

uniform bool final_pass;
uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D framebuffer, bluenoise;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}
vec3 hash31(float p)
{
   vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
   p3 += dot(p3, p3.yzx+33.33);
   return fract((p3.xxy+p3.yzz)*p3.zyx); 
}

// rotation matrix
mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

float gyroid (vec3 p) { return dot(cos(p),sin(p.yzx)); }

float jump(float time, float curve)
{
    return pow(fract(time), curve) + floor(time);
}

#define repeat(p,r) (mod(p,r)-r/2.)

// Subatomics
// 2024-07-16 Leon Denise

// Revisiting "Taste of Noise 12"
// https://shadertoy.com/view/7sGSW3

// global variable
float delay = 6.;
float bounces;
vec3 rng;

float fbm(vec3 p) {
    float result = 0., a = .5;
    for (float i = 0.; i < 3.; ++i) {
        p += result*.5;
        result += ((gyroid(p/a))*a);
        a /= 2.;
    }
    return result;
}

float fbm2(vec3 p) {
    float result = 0., a = .5;
    for (float i = 0.; i < 3.; ++i) {
        p += result*.5;
        result += ((gyroid(p/a))*a);
        a /= 2.;
    }
    return result;
}

// geometry
float map (vec3 p)
{
    float scene = 1000.;
    float shape = 1000.;
    vec3 q = p;
    
    // times
    float t = floor(iTime/delay)*78.;
    float j = t+rng.x*.002;
    
    vec3 rngt = hash31(t);
    
    // parameters
    vec3 angle = vec3(1,2,3)+j;
    float range = .5;
    float size = .2;
    
    // random falloffs
    float var = mix(1.2, 1.5, rngt.x);
    float vaa = 1.7;
    float vas = mix(1.3, 1.5, rngt.z);
    
    // kaleidoscopic iterated function
    const float count = 8.;
    float ar = 1., aa = 1., as = 1.0;
    for (float index = 0.; index < count; ++index)
    {
        
        // rotate
        p.xz *= rot(angle.y/aa);
        p.yz *= rot(angle.x/aa);
        p.xy *= rot(angle.z/aa);
        // fold
        p.x = abs(p.x)-range*ar;
        
        // combine
        scene = min(scene, length(p)-size*as);
        
        // falloff
        ar /= var;
        aa /= vaa;
        as /= vas;
    }
    
    vec3 qq = abs(fract(q*10.)-.5)*2.;
    float s = length(qq)+fbm(q*8.);
    scene += abs(fract(abs(s)*2.)-.5)*.01;
    
    // lines
    p += fbm(q*4.)*.05;
    shape = min(length(p.xy), length(p.xz));
    shape = min(shape, length(p.zy));
    shape -= .002;
    scene = min(shape, scene);
    return scene;
}

vec3 color (vec3 pos, vec3 ray, vec3 normal)
{    
    // lighting
    vec3 rf = reflect(ray, normal);
    vec3 backlight = vec3(0.1) * sqrt(dot(rf, vec3(0,0,1))*0.5+0.5);
    vec3 specular = vec3(1) * pow(dot(rf, normalize(vec3(0,1,0)))*0.5+0.5,10.);
    vec3 color = backlight + specular*.5;

    // brighten up reflections
    color *= 2.+bounces*1.;

    return color;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // pixel coordinates
    vec2 uv = (fragCoord.xy - iResolution.xy * 0.5) / iResolution.y;
    
    // reset color
    fragColor = vec4(0,0,0,1);
    
    // white noise
    vec3 seed = vec3(gl_FragCoord.xy, iTime);
    
    // blue noise scroll https://www.shadertoy.com/view/tlySzR
    ivec2 pp = ivec2(fragCoord);
    pp = (pp+(int(iFrame)+196)*ivec2(113,127)) & 1023;
    rng = texelFetch(bluenoise,pp,0).xyz;
    
    // blur edges
    vec3 rng3 = rng;//hash33(seed+78.);
    vec2 dof = vec2(cos(rng3.x*6.28),sin(rng3.x*6.28))*rng3.y;
    uv += dof*pow(length(uv), 8.0)*rng3.z*.2;
    
    // camera coordinates
    vec3 eye = vec3(.5,1,-3.);
    vec3 at = vec3(0);
    vec3 z = normalize(at-eye);
    vec3 x = normalize(cross(z, vec3(0,1,0)));
    vec3 y = cross(x, z);
    vec3 ray = normalize(z * 1.5 + uv.x * x + uv.y * y);
    vec3 pos = eye + ray * (rng3.z*2.);
    
    // normalized random direction by Blackle (https://suricrasia.online/demoscene/functions/)
    rng3 = normalize(tan(rng3*2.-1.));
    
    // raymarching
    const float count = 30.;
    float total = 0.;
    bounces = 0.;
    for (float index = 0.; index < count; ++index)
    {
        // volume estimation
        float dist = map(pos);
        if (dist < 0.001)
        {
            // compute normal by NuSan (https://www.shadertoy.com/view/3sBGzV)
            vec2 off=vec2(0.001,0);
            vec3 normal = normalize(map(pos)-vec3(map(pos-off.xyy), map(pos-off.yxy), map(pos-off.yyx)));

            // coloring
            float shade = 1.-index/count;
            fragColor.rgb += color(pos, ray, normal) * shade / (1.+bounces);
            
            // reflection
            if (++bounces > 1.) break;
            ray = reflect(ray, normal);
            ray = normalize(ray + rng3);
            dist = 0.01;
            total = 0.;
        }
        
        // dithering
        dist *= 0.9 + .1 * rng.z;
        
        // depth of field
        total += dist;
        ray += 0.03*smoothstep(2.,6.,total) * rng3;
        
        // ray march
        pos += ray * dist;
    }
    
    // temporal fade
    vec4 frame = texture(framebuffer, gl_FragCoord.xy/iResolution.xy);
    fragColor.rgb = max(fragColor.rgb, frame.rgb);
    
    // animation fade
    fragColor.rgb *= smoothstep(1., .95, fract(iTime/delay));
}





