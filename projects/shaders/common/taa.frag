#version 300 es
precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D framebuffer, taa_buffer, bluenoise;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}


// Minimal Temporal Anti Aliasing
// https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/

mat3 look(vec3 z)
{
    vec3 x = normalize(cross(z, vec3(0,1,0)));
    vec3 y = normalize(cross(x, z));
    return mat3(x,y,z);
}

// from P_Malin https://www.shadertoy.com/view/4dlyWX
vec2 world_to_uv(vec3 world, vec3 cam_pos, vec3 cam_target, vec2 aspect)
{
    vec3 z = world - cam_pos;
    vec3 cam = z * look(normalize(cam_target-cam_pos));
    vec2 screen = cam.xy / cam.z;
    return (screen/aspect)*.5+.5;
}

vec2 reproject_uv(vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 p = (2.*fragCoord-iResolution.xy)/iResolution.y;
    vec2 aspect = vec2(iResolution.x/iResolution.y, 1);
    vec4 frame = texture(framebuffer, uv);
    
    // camera positions between frames
    vec3 cam_pos_now = texelFetch(framebuffer, ivec2(0,0), 0).xyz;
    vec3 cam_pos_prev = texelFetch(framebuffer, ivec2(0,1), 0).xyz;
    
    // camera constants
    vec3 cam_target = vec3(0);
    vec3 cam_ray_now = normalize(vec3(p,1.));
    cam_ray_now = look(normalize(-cam_pos_now)) * cam_ray_now;
    
    // reproject depth to get world pos
    vec3 world_now = cam_pos_now + cam_ray_now * frame.a;
    
    // world pos to previous camera screen space
    return world_to_uv(world_now, cam_pos_prev, cam_target, aspect);
}

void post_process( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    
    // blue noise scroll https://www.shadertoy.com/view/tlySzR
    ivec2 pp = ivec2(fragCoord);
    pp = (pp+(int(iFrame))*ivec2(113,127)) & 1023;
    vec3 dither = texelFetch(bluenoise,pp,0).xyz;
    uv += 1.*(dither.xy-.5)/iResolution.xy;
    
    // reprojected previous frame
    vec2 uv_prev = reproject_uv(fragCoord.xy);
    vec3 temporal = texture(taa_buffer, uv_prev).rgb;
    
    vec3 color = texture(framebuffer, uv).rgb;
    vec3 minColor = vec3(9999.), maxColor = vec3(-9999.);
    for(int x = -1; x <= 1; ++x){
        for(int y = -1; y <= 1; ++y){
            vec3 c = texture(framebuffer, uv + vec2(x, y) / iResolution.xy).rgb;
            minColor = min(minColor, c);
            maxColor = max(maxColor, c);
        }
    }
    temporal = clamp(temporal, minColor, maxColor);
    fragColor.rgb = mix(color, temporal, 0.9);
    fragColor.a = 1.0;
    
    //fragColor = vec4(screen, 1.);
}