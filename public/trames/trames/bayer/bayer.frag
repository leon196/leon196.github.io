#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution, format;
uniform float r_lineature, matrice, steps;

in vec2 uv;
out vec4 fragColor;

#define MAX_LEVEL 4
#define inch_to_mm 25.4

float bayer(vec2 pixelpos)
{
    ivec2 ppos = ivec2(pixelpos);
    int sum = 0;
    for(int i = 0; i<int(matrice); i++)
    {
         ivec2 t = ppos & 1;
         sum = sum * 4 | (t.x ^ t.y) * 2 | t.x;
         ppos /= 2;
    }    
    return float(sum) / float(1 << (2 * int(matrice)));
}

void main()
{
    vec2 lod = format/inch_to_mm*r_lineature;
	vec2 p = uv*lod;
	float gray = texture(image, floor(uv*lod)/lod).r;

    gray = floor(gray*steps)/steps;

    if (matrice > 0.)
    {
        // gray = gray*(matrice+1.)/matrice-.5/matrice;
        if (matrice > 1.) gray = gray*1.01-0.01;
        else gray = gray*.9-0.01;
    	fragColor = vec4(step(bayer(p), gray));
    }
    else
    {
        p = floor(uv*lod);///lod;
        float checker = mod(p.x + p.y, 2.)/2.;
        fragColor = vec4(step(checker, gray - .2));
    }
}