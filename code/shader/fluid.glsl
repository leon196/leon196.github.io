/*
{
  "PASSES": [
    { "TARGET": "buffer", "FLOAT": true, },
    { "TARGET": "render" },
    { "TARGET": "taa" },
  ],
}
*/

#include "header.glsl"

uniform sampler2D buffer;
uniform sampler2D render;
uniform sampler2D taa;
uniform vec2 mouse;
uniform vec2 mouse_delta;

float noise (vec3 p)
{
    float result = 0., a = .5;
    for (float i = 0.; i < 4.0; ++i)
    {
        // p.z += time*.1;//+result*.5;
        p.z += result*.1;
        p.xy *= rot(.5/a);
        result += (gyroid(p/a))*a;
        a /= 1.7;
    }
    return result;
}

void main ()
{
  vec3 color = vec3(0);
  vec2 uv = gl_FragCoord.xy/resolution;
	//gl_FragColor = vec4(uv, 0.5, 1.0);
	//return;
  vec2 p = (2.0*gl_FragCoord.xy-resolution)/resolution.y;
  vec2 pp = gl_FragCoord.xy;
  // pp = mod(pp+(floor(time*60.))*vec2(113,127), 1023.);
  // pp = mod(pp + floor(time*60.) * vec2(113.0, 127.0), 1024.0);
  // float dither = texture2D(bluenoisemap, (pp + 0.5) / 1024.0).x;
  // float dither = blue(gl_FragCoord.xy);
  // float dither = texture2D(bluenoisemap,fract(pp/1024.)).x;
  float dither = hash13(vec3(gl_FragCoord.xy, floor(time*60.)));
  // dither = abs(fract(dither+time*1000.)-0.5)*2.0;
  // vec3 dither = blueNoise(gl_FragColor.xy);
  #define T(u) luminance(texture2D(buffer, uv+u).rgb)
  // #define T(u) (abs(fract(time+luminance(texture2D(buffer, uv+u).rgb)*3.)-.5)*2.)
  float value = T(0.);

  if (PASSINDEX == 0) {
    vec2 offset = vec2(0);

    // curl
    vec2 e = vec2(.001,0);
    vec3 pos = vec3(p*.5, time*.5);
    // pos *= 1.+.5*sin(time*1.);
    // pos.yz *= rot(time*.5);
    // pos.xz *= rot(time*1.5);
    // pos.xy /= pos.z+1.;
    float x = (noise(pos+e.yxy)-noise(pos-e.yxy))/(2.*e.x);
    float y = (noise(pos+e.xyy)-noise(pos-e.xyy))/(2.*e.x);
    vec2 curl = vec2(x,-y);
    // curl *= sign(fract(value*2.)-0.5);

    vec2 ne = vec2(0.01*dither+0.001,0);
    vec3 normal = normalize(vec3(
        T(ne.xy)-T(-ne.xy),
        T(ne.yx)-T(-ne.yx),
        value));

    // input motion
    // float t = time * 1. + dither * .1;
    // float ti = floor(t);
    // vec2 anim = vec2(fract(t),floor(t));
    // vec2 move = hash21(anim.y);
    // move = mix(move, hash21(anim.y+1.), easeInOut(anim.x));
    // p += (move-.5)*2.;
    // p.x += sin(t*10.)*.05;
    // p.y += cos(t*5.)*.2;

    vec2 m = 2.0 * (mouse-0.5) * vec2(resolution.x/resolution.y, 1);
    vec2 user = mouse_delta * smoothstep(0.1, 0.0, length(m - p)-.1);

    // input shape
    // float circle = smoothstep(0.1,0.0,length(p)-.01);
    // color = vec3(circle);
    float lign = smoothstep(0.1, 0.0, abs(abs(p.y)-1.)-0.01);
    color = vec3(lign);
    color += vec3(smoothstep(0.1, 0.0, length(m - p)));
    // color = 0.5+0.5*cos(vec3(1,2,3)*5.5+p.y*10.+time);
    // color = normal;
    // color *= circle * 2.;

    // feedback
    offset += curl * 2.;// * value;/// * normal.z;
    // offset.y += (value-0.5)*4.;
    // offset -= user * 1000.;
    // offset += normal.xy * 10. * abs(value-0.5);
    offset += normal.xy * 1.;// * (1.0-value);
    // offset *= (fract(noise(pos*.5+time*.01)+time*.2)-0.4)*4.;
    // offset *= pow(noise(pos*.5+time*.01), 3.0);
    // offset *= (noise(pos*1.5+time*.2)+.1)*2.;
    offset *= 2.0;
    offset *= 0.1+0.9*dither;
    offset /= resolution;
    vec3 feedback = texture2D(buffer, uv+offset).rgb;
    color = max(color, feedback - 0.005);
    // color += feedback * 0.99;
  }
  else if (PASSINDEX == 1)
  {
    vec2 ne = vec2(0.1*dither+0.001,0);
    vec2 dir = normalize(hash22(gl_FragCoord.xy)-.5)*.005;
    vec3 normal = normalize(value-vec3(
        T(ne.xy+dir), T(ne.yx+dir),
        // T(ne.x*dir), T(ne.x*vec2(dir.y,-dir.x)),
        0.2));
      ne = vec2(0.01*dither+0.001,0);
      vec3 nn = -normalize(vec3(
          T(ne.xy)-T(-ne.xy),
          T(ne.yx)-T(-ne.yx),
          value));
    // color = vec3(value);
    color = texture2D(buffer, uv).rgb;
    // color = vec3(normal.y*.5+.5);
    vec3 feedback = texture2D(render, uv).rgb;
    // color = mix(color, feedback, 0.9);
    color = 0.5+0.5*cos(vec3(1,2,3)*5.5+normal.x*10.-dither*.5+5.);
    color *= vec3(max(0.,-normal.y));
    color += pow(max(0.,dot(nn,normalize(vec3(0,1,-1.5)))), 20.)*2.;
    color *= smoothstep(0.0, 0.1, value);
    // color = mix(color, feedback, 0.9);
    // color = normal;
  }
  else if (PASSINDEX == 2)
  {
    vec2 offset = (hash23(vec3(gl_FragCoord.xy, floor(time)))-0.5)/resolution;
    vec3 feedback = texture2D(taa, uv+offset).rgb;
    vec3 minColor = vec3(9999.), maxColor = vec3(-9999.);
    for(int x = -1; x <= 1; ++x){
        for(int y = -1; y <= 1; ++y){
            vec3 c = texture2D(render, uv + vec2(x, y) / resolution.xy).rgb;
            minColor = min(minColor, c);
            maxColor = max(maxColor, c);
        }
    }
    feedback = clamp(feedback, minColor, maxColor);
    color = texture2D(render, uv).rgb;
    color = mix(color, feedback, 0.9);
}

  gl_FragColor = vec4(color, 1);
}