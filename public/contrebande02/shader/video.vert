
precision mediump float;

attribute vec4 position;
uniform vec2 resolution;
varying vec2 uv;

void main()
{
    gl_Position = position;
    uv = gl_Position.xy*0.5+0.5;
    if (resolution.x / resolution.y < 16./9.)
    {
        gl_Position.y *= resolution.x/resolution.y;
        gl_Position.y *= 9./16.;
    }
    else
    {
        gl_Position.x *= resolution.y/resolution.x;
        gl_Position.x *= 16./9.;
    }
}