#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform vec4 iDate;
uniform sampler2D iChannel0, iChannel1, iChannel2, iChannel3;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

mat2 rot (float a) { float c=cos(a),s=sin(a);return mat2(c,-s,s,c); }

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec4 hash41(float p)
{
	vec4 p4 = fract(vec4(p) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+33.33);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec2 aspect = vec2(iResolution.x/iResolution.y,1);
    vec4 frame = texture(iChannel0, uv);
    
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
        vec4 rng = hash41(tick+iDate.w+iDate.z+iDate.y+iDate.x);
        
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