
uniform sampler2D image;
uniform vec2 resolution, format;
uniform float r_lineature, r_angle, shape;

in vec2 vUv;

#define MAX_LEVEL 4
#define inch_to_mm 25.4

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
    vec2 lod = format/inch_to_mm*r_lineature;
	vec2 p = vUv*lod;
	float gray = texture(image, floor(vUv*lod)/lod).r;

	vec3 color = vec3(step(bayer(p), gray));

	gl_FragColor = vec4(color, 1);
}