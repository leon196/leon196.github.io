#version 300 es
precision mediump float;

uniform float clic, time, tick;
uniform vec2 resolution, mouse;
uniform sampler2D framebuffer, bluenoise;

in vec2 uv;
out vec4 fragColor;

#define T(uv) texture(framebuffer, uv).r
#define ss(a,b,t) smoothstep(a,b,t)

void main()
{
  vec3 dither = texture(bluenoise, gl_FragCoord.xy / 1024.).rgb;
  
  // value from buffer A
  vec4 data =  texture(framebuffer, uv);
  float gray = data.x;
  
  // gradient normal from gray value
  float range = 3.;
  vec2 aspect = vec2(resolution.x/resolution.y, 1);
  vec3 unit = vec3(range/472./aspect,0);
  vec3 normal = (vec3(
      T(uv + unit.xz)-T(uv - unit.xz),
      T(uv - unit.zy)-T(uv + unit.zy),
      gray*gray*gray));
  float d = length(normal);
  if (d > 0.001) normal = normalize(normal);
      
  // backlight
  vec3 color = vec3(.3)*(1.-abs(dot(normal, vec3(0,0,1))));
  
  // specular light
  vec3 dir = normalize(vec3(0,1,2));
  float specular = pow(dot(normal, dir)*.5+.5,20.);
  color += vec3(.5)*ss(.2,1.,specular);
  
  // rainbow
  vec3 tint = .5+.5*cos(vec3(1,2,3)*1.+dot(normal, dir)*4.-uv.y*3.-3.);
  color += tint * smoothstep(.15,.0,gray);

  // dither
  color -= dither.x*.1;
  
  // background blend
  vec3 background = vec3(1);
  background *= smoothstep(1.5,-.5,length(uv-.5));
  color = mix(background, clamp(color, 0., 1.), ss(.01,.1,gray));

  fragColor = vec4(color, 1);
}