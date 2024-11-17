#version 300 es
precision mediump float;

in vec2 uv;
out vec4 fragColor;

uniform sampler2D image, position;
uniform vec2 grid_dimension, resolution;
uniform float tick, last_tick, crop, speed;

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

void main()
{
    float rng = hash22(gl_FragCoord.xy).x;
    vec2 aspect = vec2(resolution.x/resolution.y, 1);

    if (tick == 0.)
    {
        vec2 pos = uv + (hash22(gl_FragCoord.xy)-.5)/50. / aspect;
        pos.xy = clamp(pos.xy, vec2(0), vec2(1));
        float gray = 1.-texture(image, pos).r;
        fragColor = vec4(pos, gray, 1);
    }
    // else if (tick < last_tick)
    else
    {
        vec4 data = texture(position, uv);

        float closest = 1000.;
        vec3 neighbor = vec3(0);
        int w = int(grid_dimension.x);
        int h = int(grid_dimension.y);
        const int neighbors = 10;
        for (int x = -neighbors; x <= neighbors; ++x)
        {
            for (int y = -neighbors; y <= neighbors; ++y)
            {
                if (x == 0 && y == 0) continue;
                ivec2 p = ivec2(gl_FragCoord.xy+vec2(x,y));
                // if (p.x < 0 || p.y < 0 || p.x >= w || p.y >= h) continue;
                vec4 other = texelFetch(position, p, 0);
                float dist = distance(other.xy, data.xy);
                if (dist < closest)
                {
                    closest = dist;
                    neighbor = vec3(other.xyz);
                }
            }
        }

        if (closest < 1000. && closest > 0.)
        {
            float near = smoothstep(.05,.0,closest);
            data.xy += speed * normalize(data.xy - neighbor.xy) / 10000. * (1.+neighbor.z) * near;// / max(.001, closest);
        }

        data.xy = clamp(data.xy, vec2(0), vec2(1));

        float gray = 1.-texture(image, data.xy).r;

        fragColor = vec4(data.xy, gray, 1);
    }
    // else
    // {
    //     vec4 data = texture(position, uv);
    //     float gray = texture(image, data.xy).r;

    //     float closest = 1000.;
    //     vec2 neighbor = vec2(0);
    //     const int neighbors = 10;
    //     for (int x = -neighbors; x <= neighbors; ++x)
    //     {
    //         for (int y = -neighbors; y <= neighbors; ++y)
    //         {
    //             if (x == y) continue;
    //             vec4 other = texelFetch(position, ivec2(gl_FragCoord.xy+vec2(x,y)), 0);
    //             float dist = distance(other.xy, data.xy);
    //             if (dist < closest)
    //             {
    //                 closest = dist;
    //                 neighbor = vec2(other.xy);
    //             }
    //         }
    //     }

    //     if (closest < gray / grid_dimension.y)
    //     {
    //         gray *= .5;
    //     }

    //     fragColor = vec4(data.xy, gray, 1);
    // }
}