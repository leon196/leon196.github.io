
uniform sampler2D image, lut;
uniform vec2 resolution;

in vec2 vUv;

float luminance(vec3 color)
{
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

void main()
{
    // lut
    vec3 color = texture(image, vUv).rgb;
    // float gray = luminance(color);
    float gray = color.r;
    gray = texture(lut, vec2(gray, 0)).r;
    
    gl_FragColor = vec4(vec3(gray), 1.0);
    // gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = texture(lut, vUv);
    // gl_FragColor = sRGBTransferOETF(gl_FragColor);
}