#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 sizeOutput;
uniform float r_lineature, r_angle, shape;

in vec2 uv;
out vec4 fragColor;

#define MAX_LEVEL 4

float luminance(vec3 color)
{
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

float bayer(vec2 pixelpos)
{
    ivec2 ppos = ivec2(pixelpos);
    int sum = 0;
    for(int i = 0; i<MAX_LEVEL; i++)
    {
         ivec2 t = ppos & 1;
         sum = sum * 4 | (t.x ^ t.y) * 2 | t.x;
         ppos /= 2;
    }    
    return float(sum) / float(1 << (2 * MAX_LEVEL));
}

void main()
{

	vec2 p = uv*sizeOutput;
	vec2 lod = vec2(pow(2., r_lineature)+1.);
	p = floor(p/lod)*lod;
	// p /= sizeOutput;
	
	vec3 color = texture(image, p/sizeOutput).rgb;
	float gray = luminance(color);

	color = vec3(step(bayer(p), gray));

	fragColor = vec4(color, 1);
}