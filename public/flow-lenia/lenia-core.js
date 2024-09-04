class LeniaMaterial{
	constructor(){
		this.leniaTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.affinityTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.veloTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		
		this.geneMaxLength=100000;
		this.geneGroupLength=3+1;//leave the first pixel open as a meta pixel for list control
		this.geneTexPP=new TexturePingPong({
			...sizeObj(boxSize(this.geneMaxLength*this.geneGroupLength,{},this.geneGroupLength)),
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
	}
	*[Symbol.iterator]() {
		yield this.leniaTexPP;
		yield this.affinityTexPP;
		yield this.veloTexPP;
	}
}
class Lenia{
	constructor(){
		this.materials=[
			new LeniaMaterial(),
			// new LeniaMaterial(),
			// new LeniaMaterial(),
		];
		this.gradientTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.motionTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});

		this.dnaTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});

		this.imgTex=new Texture({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.imgGradientTex=new Texture({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.renderTex=new Texture({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});

		this.geneInitShader=new GeneInitShader();
		this.dnaInitShader=new DnaInitShader();
		this.noiseShader=new NoiseShader();
		this.leniaShader=new LeniaShader();
		this.gradientShader=new GradientShader();
		this.motionCapacityShader=new MotionCapacityShader(2);
		this.motionShader=new MotionShader(2);
		this.viscosityShader=new ViscosityShader(2);
		this.veloShader=new VeloShader();
		this.flowShader=new FlowShader();
		this.renderShader=new RenderShader();

		this.mixShader=new MixShader();
		this.copyShader=new CopyShader();
		this.addShader=new AddShader();
		this.subShader=new SubShader();
		this.zoomShader=new ZoomShader();
		
		this.balanceMotion=false;

		this.materials.forEach((m,i,arr)=>{
			this.geneInitShader.run(m.geneTexPP, m.imgTex, m.geneGroupLength);
			// console.log("gene",m.geneTexPP.read(4,gl.RGBA,gl.FLOAT,Float32Array));
		});

		const img=new Image();
		img.src=imageSrc;

		this.size=Vec(1,1);

		this.dnaSelect = [0,0,0,0];
		this.imageSource = {};

		this.settings = {}

		img.onload=()=>{
			this.size=Vec(img.width,img.height).scl(imageScale).flr();
			[
				this.gradientTexPP,
				this.motionTexPP,
				this.dnaTexPP,
				this.imgTex,
				this.imgGradientTex,
				this.renderTex,
				...this.materials.flatMap(x=>[...x])
			].forEach(t=>t.resize(this.size.x,this.size.y));
			this.materials.forEach((m,i,arr)=>{
				this.noiseShader.run(m.leniaTexPP);
			});

			this.imageSource = twgl.createTexture(gl, { src: img });
			this.dnaInitShader.run(this.dnaTexPP,this.imageSource,this.materials[0].geneMaxLength);
			// console.log("img.onload")
		};
		// console.log("dna",this.materials[0].read(4,gl.RGBA,gl.FLOAT,Float32Array));
	}
	resize(img)
	{
		this.size=Vec(img.width,img.height).flr();
		[
			this.gradientTexPP,
			this.motionTexPP,
			this.dnaTexPP,
			this.imgTex,
			this.imgGradientTex,
			this.renderTex,
			...this.materials.flatMap(x=>[...x])
		].forEach(t=>t.resize(this.size.x,this.size.y));
		this.materials.forEach((m,i,arr)=>{
			this.noiseShader.run(m.leniaTexPP);
		});

		this.imageSource = twgl.createTexture(gl, { src: img });
		this.dnaInitShader.run(this.dnaTexPP,this.imageSource,this.materials[0].geneMaxLength);
	}
	reset()
	{
		this.materials.forEach((m,i,arr)=>{
			this.noiseShader.run(m.leniaTexPP);
		});
		this.dnaInitShader.run(this.dnaTexPP,this.imageSource,this.materials[0].geneMaxLength);
	}
	run(update,display,drawTex,imageTex){
		shaderManager.resizeToDisplay();

		if (update)
		{
			this.copyShader.run(imageTex,this.imgTex);
			// const set = this.settings;
			// this.zoomShader.run(set.zoomScale, set.zoomAt, imageTex, this.imgTex);
			// console.log("copyShader")
			this.gradientShader.run(this.imgTex,this.imgGradientTex);

			this.materials.forEach((m,i,arr)=>{
				let nextM=this.materials[(i+1)%this.materials.length];
				this.leniaShader.run(
					m.geneGroupLength,
					m.geneTexPP,
					this.dnaTexPP,
					m.leniaTexPP,
					nextM.affinityTexPP,
				);
				this.gradientShader.run(m.affinityTexPP,this.gradientTexPP);

				if (this.settings.blendImageInGradient)
				{
					this.subShader.run(this.imgGradientTex,this.gradientTexPP);
				}
				// this.mixShader.run(.9,this.imgGradientTex,this.gradientTexPP);
				
				//These lines make it so that for every action there must be an equal and opposite reaction
				if(this.balanceMotion){
					this.motionCapacityShader.run(m.leniaTexPP,this.motionTexPP);
					this.motionShader.run(this.gradientTexPP,this.motionTexPP);
				}
				this.viscosityShader.run(m.leniaTexPP,m.veloTexPP);
				this.veloShader.run(this.gradientTexPP,m.veloTexPP,this.settings);

				if (this.settings.blendImageInLenia)
				{
					this.mixShader.run(.99,this.imgTex,m.leniaTexPP);
				}
			});
			this.materials.forEach((m,i,arr)=>{
				// this.flowShader.run(i==0,this.materials[0].geneMaxLength,display.view,this.size,display.size,m.leniaTexPP,m.veloTexPP,this.dnaTexPP,drawTex,imageTex);
				this.flowShader.run(i==0,this.materials[0].geneMaxLength,display.view,this.size,display.size,m.leniaTexPP,m.veloTexPP,this.dnaTexPP,drawTex,imageTex,this.settings);
			});
		}
		
		if(this.size.x>1.||this.size.y>1.){
			this.renderShader.run(display.view,this.size,display.size,this.materials,this.dnaTexPP,this.gradientTexPP,imageTex,this.dnaSelect,this.settings,this.renderTex);
		}
	}
}