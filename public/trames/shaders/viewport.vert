#version 300 es
precision mediump float;

in vec2 position, coord;
out vec2 uv;

void main()
{
    uv = coord;
    vec2 p = position.xy;
    gl_Position = vec4(p, 0, 1.0 );
}