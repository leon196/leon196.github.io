class ComposeShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;

				uniform sampler2D leniaTex1;
				uniform sampler2D leniaTex2;
				uniform sampler2D leniaTex3;
                uniform float time;
                uniform float zoom;
                uniform bool multiLayers;
                uniform vec2 offset;

				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.GAMMA}
				${SHADER_FUNCS.HASH}

				void main(){
                    vec2 p = pos;
                    p = (p)/zoom-offset;
					vec2 uv=(p+1.)*.5;
					if (multiLayers) {
						// outColor = vec4(
						// 	texture(leniaTex1, uv).r,
						// 	texture(leniaTex2, uv).g,
						// 	texture(leniaTex3, uv).b,
						// 	1
						// );
						outColor = (texture(leniaTex1, uv)+texture(leniaTex2, uv))/2.;
					} else {
						outColor = texture(leniaTex1, uv);
					}
					// outColor.rgb -= vec3(hash12(gl_FragCoord.xy))*.2;
					// outColor = texture(leniaTex2, uv);
                    // outColor = mix(
                    //     texture(leniaTex1, uv),
                    //     texture(leniaTex2, uv),
                    //     0.5*(1.-multiLayers));
                    // outColor = texture(leniaTex1, uv);
				}
			`,
		);
	}
	run(cam,imgSize,canvasSize,zoom,offset,leniaLayers,settings){
		this.uniforms={
			camZoom:cam.zoom,
			camPos:cam.pos,
			imgSize,
			canvasSize,
			zoom,
			offset,
			time:time/60.,
			multiLayers:settings.multiLayers,
		};
		for (let i = 0; i < leniaLayers.length; ++i)
		{
			this.uniforms["leniaTex"+(i+1)] = leniaLayers[i].renderTex;
		}
		super.run();
	}
}