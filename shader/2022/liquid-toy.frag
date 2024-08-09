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

// Liquid toy by Leon Denise 2022-05-18
// Playing with shading with a fake fluid heightmap

// 2023-01-20 update:
// fix scalars to be resolution independant
// (samed speed and look at different frame size)

// shortcut to sample texture
#define TEX(uv) texture(iChannel0, uv).r
#define TEX1(uv) texture(iChannel1, uv).r
#define TEX2(uv) texture(iChannel2, uv).r
#define TEX3(uv) texture(iChannel3, uv).r

// shorcut for smoothstep uses
#define trace(edge, thin) smoothstep(thin,.0,edge)
#define ss(a,b,t) smoothstep(a,b,t)

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    
    // coordinates
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec3 dither = texture(iChannel1, fragCoord.xy / 1024.).rgb;
    
    // value from buffer A
    vec4 data =  texture(iChannel0, uv);
    float gray = data.x;
    
    // gradient normal from gray value
    float range = 3.;
    vec2 aspect = vec2(iResolution.x/iResolution.y, 1);
    vec3 unit = vec3(range/472./aspect,0);
    vec3 normal = normalize(vec3(
        TEX(uv + unit.xz)-TEX(uv - unit.xz),
        TEX(uv - unit.zy)-TEX(uv + unit.zy),
        gray*gray*gray));
        
    // backlight
    vec3 color = vec3(.3)*(1.-abs(dot(normal, vec3(0,0,1))));
    
    // specular light
    vec3 dir = normalize(vec3(0,1,2));
    float specular = pow(dot(normal, dir)*.5+.5,20.);
    color += vec3(.5)*ss(.2,1.,specular);
    
    // rainbow
    vec3 tint = .5+.5*cos(vec3(1,2,3)*1.+dot(normal, dir)*4.-uv.y*3.-3.);
    color += tint * smoothstep(.15,.0,gray);

    // dither
    color -= dither.x*.1;
    
    // background blend
    vec3 background = vec3(1);
    background *= smoothstep(1.5,-.5,length(uv-.5));
    color = mix(background, clamp(color, 0., 1.), ss(.01,.1,gray));
    
    // display layers when clic
    // if (iMouse.z > 0.5 && iMouse.x/iResolution.x < .1)
    // {
    //     if (uv.x < .33) color = vec3(gray);
    //     else if (uv.x < .66) color = normal*.5+.5;
    //     else color = vec3(tint);
    // }

    fragColor = vec4(color, 1);
}