precision mediump float;

// common
uniform vec2 resolution;
uniform float time;

// images
uniform sampler2D bitmap;
uniform sampler2D custom_mask;
uniform sampler2D gradient;
uniform vec2 bitmap_grid;

// options
uniform bool use_aspect_ratio;
uniform bool use_custom_mask;

// settings
uniform float salt;
uniform float treshold;
uniform float start_size;
uniform float subdivide;
uniform float dither;
uniform float padding;

// mask
uniform float level_min;
uniform float level_max;
uniform float level_black;
uniform float level_white;

vec3 hash33(vec3 p3)
{
    // Dave Hoskins
    // https://www.shadertoy.com/view/4djSRW
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

float remap(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution;
	vec2 ratio = vec2(resolution.x/resolution.y,1);
    vec2 p = 2.*(uv-.5)*ratio;
    vec2 q = p;

    // layers
    float pattern = 0.;
	float scaling = 1.;
    const float count = 4.;
    for (float i = 0.; i < count; ++i) {
        float factor = i/count;
        float scale = floor(4.+start_size*64.)/pow(2., i);
        vec2 cell = floor(p*scale);
        float seed = i+floor(floor(salt*10000.0)*hash33(vec3(cell,0)).x)*196.;
        vec3 rng = hash33(vec3(cell, seed));
        float blend = step(factor*2.*subdivide, rng.y);
        pattern = mix(pattern, rng.x, blend);
        q = mix(q, p*scale, blend);
		scaling = mix(scaling, scale, blend);
    }

    // background
    vec2 cell = floor(q);
    vec2 atlas = fract(q);
    vec3 rng = hash33(vec3(cell,floor(pattern*100.)));
	
	// padding
	atlas -= .5;
	atlas *= 1.+padding;
	atlas += .5;
	float crop = step(0., atlas.x) * step(atlas.x, 1.0);
	crop *= step(0., atlas.y) * step(atlas.y, 1.0);
	
	// random cell
	atlas += floor(rng.xy*bitmap_grid);
	
	// pattern mask
    vec2 aspect = ratio;
    if (use_aspect_ratio) aspect = vec2(1);
    vec2 cell_uv = (cell/scaling/aspect+1.)/2. + 0.25/scaling;
    float mask = smoothstep(level_white, level_black, length(cell_uv-.5));
    if (use_custom_mask)
    {
        vec4 map = texture2D(custom_mask, cell_uv);
        mask = smoothstep(level_black, level_white, (map.r + map.g + map.b) / 3.0);
    }
    mask = remap(mask, 0.0, 1.0, level_min, level_max);

	vec3 noise = hash33(vec3(cell,0))-.5;
	atlas /= bitmap_grid;
    vec4 map = texture2D(bitmap, atlas);
    // vec3 tint = .5+.5*cos(vec3(1,2,3)*4.5+floor(rng.x*5.));
    vec3 tint = texture2D(gradient, vec2(rng.x, 0.5)).rgb;
	
	map.rgb *= crop;

    // style
	vec3 black = map.rgb*map.a;
	vec3 tinted = tint * (1.-map.r*map.a);
    vec4 color = vec4(tinted, 1.0);
	color = mix(color, vec4(map.r), step(mask, treshold+noise.x*dither));
	color = mix(color, vec4(0), step(mask, 0.1-noise.y*dither));

	gl_FragColor = vec4(color.rgb,1);
}