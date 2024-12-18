#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4

in vec2 uv;
out vec4 fragColor;

uniform float r_lineature, size, edge;

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// Inigo Quilez
// https://www.shadertoy.com/view/ldl3W8
vec3 voronoi( in vec2 x )
{
    vec2 ip = floor(x);
    vec2 fp = fract(x);

    //----------------------------------
    // first pass: regular voronoi
    //----------------------------------
	vec2 mg, mr;

    float md = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        vec2 g = vec2(float(i),float(j));
		vec2 o = hash22( ip + g );
        vec2 r = g + o - fp;
        float d = dot(r,r);

        if( d<md )
        {
            md = d;
            mr = r;
            mg = g;
        }
    }

    //----------------------------------
    // second pass: distance to borders
    //----------------------------------
    md = 8.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = mg + vec2(float(i),float(j));
		vec2 o = hash22( ip + g );
        vec2 r = g + o - fp;

        if( dot(mr-r,mr-r)>0.00001 )
        md = min( md, dot( 0.5*(mr+r), normalize(r-mr) ) );
    }

    return vec3( md, mr );
}


void main()
{
	float gray = 1.-texture(image, uv).r;
	vec2 p = uv*format/inch_to_mm;
    vec3 vor = voronoi(p*r_lineature);
    // float value = smoothstep(.01,.0,length(vor.yz)-(gray)*size + .01);
    // if (edge > 0.5)
    // {
    //     value = smoothstep(0.0,.01,vor.x-(1.-gray)*.7 + .01);
    // }
    float value = smoothstep(0.01,.0,vor.x-(1.-gray)*.55 + .01);
	fragColor = vec4(value);
}