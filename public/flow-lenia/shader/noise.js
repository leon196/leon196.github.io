class NoiseShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				#define PI ${PI}
				precision highp float;
				precision highp sampler2D;

				uniform vec2 size;
				uniform float rand;
				uniform bool isHorizontal;
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*size);

					float d=0.;
					if(isHorizontal){
						d=pos2.x;
					}else{
						d=pos2.y;
					}
					outColor=vec4(hash12(vec2(coord2)),0.,0.,0.);
					// outColor=vec4(hash12(vec2(coord2))*d*2.,0.,0.,0.);
					// outColor=vec4(length(pos*vec2(size.x/size.y,1.))<.5);
				}
			`,
		);
	}
	run(targetTex,isHorizontal=true){
		this.uniforms={
			size:targetTex.size,
			rand:rand(),
			isHorizontal,
		};
		this.attachments=[
			{
				attachment:targetTex.flip().tex,
				...sizeObj(targetTex.size)
			}
		];
		super.run();
		this.time++;
	}
}