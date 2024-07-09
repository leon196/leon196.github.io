#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution, format;
uniform float r_lineature, steps;

in vec2 uv;
out uint fragColor;

#define MAX_LEVEL 4
#define inch_to_mm 25.4

float bayer(vec2 pixelpos)
{
    ivec2 ppos = ivec2(pixelpos);
    int sum = 0;
    for(int i = 0; i<int(steps); i++)
    {
         ivec2 t = ppos & 1;
         sum = sum * 4 | (t.x ^ t.y) * 2 | t.x;
         ppos /= 2;
    }    
    return float(sum) / float(1 << (2 * int(steps)));
}

void main()
{
    vec2 lod = format/inch_to_mm*r_lineature;
	vec2 p = uv*lod;
	float gray = texture(image, floor(uv*lod)/lod).r;
	// vec3 color = vec3(step(bayer(p), gray));
	fragColor = uint(step(bayer(p), gray)*255.);
}