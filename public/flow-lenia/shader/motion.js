class MotionCapacityShader extends FragShader{
	constructor(kSize=10){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;

				uniform sampler2D leniaTex;
				uniform vec2 size;
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}
				
				ivec2 loopCoord(ivec2 coord){
					return ivec2(mod(vec2(coord),size));
				}
				float smallerDivide(float a,float b){
					return (a<b)?a/b:1.;
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*size);
					
					float weight=texelFetch(leniaTex,coord2,0).r;
					float weightTotal;
					int kSize=${kSize};
					for(int x=-kSize;x<=kSize;x++){
						for(int y=-kSize;y<=kSize;y++){
							ivec2 offset=ivec2(x,y);
							float l=length(vec2(offset));
							if(l<=float(kSize)&&offset!=ivec2(0,0)){
								ivec2 coordOff=loopCoord(coord2+offset);
								weightTotal+=texelFetch(leniaTex,coordOff,0).r;
							}
						}
					}
					float effect=smallerDivide(weightTotal,weight);
					float outflow=smallerDivide(weight,weightTotal);

					outColor=vec4(effect,outflow,weightTotal,0.);
				}
			`,
		);
	}
	run(leniaTex,motionTex){
		this.uniforms={
			leniaTex:leniaTex.tex,
			size:leniaTex.size,
		};
		this.attachments=[
			{
				attachment:motionTex.tex,
				...sizeObj(motionTex.size)
			}
		];
		super.run();
	}
}

class MotionShader extends FragShader{
	constructor(kSize=10){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;

				uniform sampler2D gradientTex;
				uniform sampler2D motionTex;
				uniform vec2 size;
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}
				
				ivec2 loopCoord(ivec2 coord){
					return ivec2(mod(vec2(coord),size));
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*size);
					//local effect
					float effect=texelFetch(motionTex,coord2,0).x;
					vec2 gradient=texelFetch(gradientTex,coord2,0).xy;
					gradient*=effect;
					
					//shared effect
					int kSize=${kSize};
					for(int x=-kSize;x<=kSize;x++){
						for(int y=-kSize;y<=kSize;y++){
							ivec2 offset=ivec2(x,y);
							float l=length(vec2(offset));
							if(l<=float(kSize)&&offset!=ivec2(0,0)){
								ivec2 coordOff=loopCoord(coord2+offset);
								vec4 t=texelFetch(motionTex,coordOff,0);
								float tOutflow=t.y;
								float tTotal=t.z;
								vec2 tGrad=texelFetch(gradientTex,coordOff,0).xy;

								gradient-=tGrad*tOutflow;
							}
						}
					}

					outColor=vec4(gradient,0.,0.);
				}
			`,
		);
	}
	run(gradientTexPP,motionTex){
		this.uniforms={
			gradientTex:gradientTexPP.tex,
			motionTex:motionTex.tex,
			size:gradientTexPP.size,
		};
		this.attachments=[
			{
				attachment:gradientTexPP.flip().tex,
				...sizeObj(gradientTexPP.size)
			}
		];
		super.run();
	}
}