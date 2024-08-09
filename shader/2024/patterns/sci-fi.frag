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

// Sci Fi Pattern
// 2024/07/13 Leon Denise

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec4 frame = texture(iChannel0, uv);
    
    // coordinates distance
    #define T(u) texture(iChannel0, uv+u/iResolution.xy).x
    float z = T(0.);
    
    float edge = 0.;
    float ao = 0.;
    
    const float count = 9.;
    for (float a = 0.; a < count; ++a)
    {
        // blue noise scroll https://www.shadertoy.com/view/tlySzR
        ivec2 pp = ivec2(fragCoord);
        pp = (pp+(int(a))*ivec2(113,127)) & 1023;
        vec3 blu = texelFetch(iChannel1,pp,0).xyz;
        
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