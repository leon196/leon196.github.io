
void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution;
    fragColor = vec4(uv, 0, 1);
}