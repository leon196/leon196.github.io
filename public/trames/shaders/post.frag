#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution;
uniform int blur_size;
uniform float blur_threshold;

in vec2 uv;
out vec4 fragColor;

// mrharicot
// https://www.shadertoy.com/view/XdfGDH

float normpdf(in float x, in float sigma)
{
	return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
}

void main()
{

    if (blur_size > 1)
    {
        // blur
            
        //declare stuff
        // const int mSize = 1;
        int kSize = (blur_size-1)/2;
        float kernel[11];
        vec3 final_colour = vec3(0.0);
        
        //create the 1-D kernel
        float sigma = 7.0;
        float Z = 0.0;
        for (int j = 0; j <= kSize; ++j)
        {
            kernel[kSize+j] = kernel[kSize-j] = normpdf(float(j), sigma);
        }
        
        //get the normalization factor (as the gaussian has been clamped)
        for (int j = 0; j < blur_size; ++j)
        {
            Z += kernel[j];
        }
        
        //read out the texels
        for (int i=-kSize; i <= kSize; ++i)
        {
            for (int j=-kSize; j <= kSize; ++j)
            {
                final_colour += kernel[kSize+j]*kernel[kSize+i]*texture(image, uv+vec2(float(i),float(j)) / resolution).rgb;
            }
        }
        
        // gl_FragColor = texture(image, uv);
        // float threshold = 0.5;
        fragColor = vec4(step(blur_threshold, final_colour/(Z*Z)), 1.0);
        // fragColor = vec4((final_colour/(Z*Z)*255.);
        // gl_FragColor = vec4(pow(final_colour/(Z*Z), vec3(1./2.2)), 1.0);
        // gl_FragColor = sRGBTransferOETF(gl_FragColor);
    }
    else
    {
        fragColor = texture(image, uv);
    }
}