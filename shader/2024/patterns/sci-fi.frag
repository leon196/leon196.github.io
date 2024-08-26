#version 300 es

precision mediump float;

out vec4 fragColor;

uniform bool final_pass;
uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform vec4 iDate;
uniform sampler2D framebuffer, bluenoise, iChannel2, iChannel3;

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

mat2 rot (float a) { float c=cos(a),s=sin(a);return mat2(c,-s,s,c); }

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec4 hash41(float p)
{
	vec4 p4 = fract(vec4(p) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+33.33);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}
vec4 hash44(vec4 p4)
{
	p4 = fract(p4  * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+33.33);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec2 aspect = vec2(iResolution.x/iResolution.y,1);
    vec4 frame = texture(framebuffer, uv);
    
    // timeline
    float tick = mod(float(iFrame), 200.);
    
    // init
    if (tick < 1.)
    {
        vec2 p = (2.*fragCoord-iResolution.xy)/iResolution.y;
        frame = vec4(p, max(abs(p.x),abs(p.y)), 0);
    }
    // iterate
    else if (tick < 20.)
    {
        // previous coordinates
        vec2 p = frame.xy;
        
        // seed
        vec4 rng = hash44(vec4(tick, iDate.z, iDate.y, iDate.x+iDate.w));
        
        // rotate
        p.xy *= rot(3.1415/2.);
        
        // translate
        p.xy += (rng.xy-.5)*50./tick*max(0.1,rng.w);
        
        // keep result if closer
        float dist = max(abs(p.x),abs(p.y));
        if (dist < frame.z)
        {
            frame.xy = p.xy;
            frame.z = dist;
            frame.w = tick;
        }
    }
    
    fragColor = frame;
}

// Sci Fi Pattern
// 2024/07/13 Leon Denise

void post_process( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec4 frame = texture(framebuffer, uv);
    
    // coordinates distance
    #define T(u) texture(framebuffer, uv+u/iResolution.xy).x
    float z = T(0.);
    
    float edge = 0.;
    float ao = 0.;
    
    const float count = 9.;
    for (float a = 0.; a < count; ++a)
    {
        // blue noise scroll https://www.shadertoy.com/view/tlySzR
        ivec2 pp = ivec2(fragCoord);
        pp = (pp+(int(a))*ivec2(113,127)) & 1023;
        vec3 blu = texelFetch(bluenoise,pp,0).xyz;
        
        // edge detection
        float f = a/count;
        float aa = 6.283*f;
        vec2 xy = vec2(cos(aa),sin(aa));
        edge += abs(T(xy)-T(-xy));
        
        // sort of ambient occlusion
        float r = (.5+blu.z) * 10.;
        xy = normalize(vec2(blu.xy-.5))*r;
        ao += abs(z-T(xy))/r;
    }
    
    vec3 color = vec3(edge+ao);
    
    // dots
    //float screen = iResolution.x/1200.;
    //color += smoothstep(.05,-.05,abs(length(frame.xy*20.*screen)-.2)-.05);
    
    fragColor = vec4(1.-color, 1.);
}