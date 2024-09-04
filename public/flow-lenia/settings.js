//----------------------------------
// MODIFY THESE VARIABLES AS NEEDED
//----------------------------------

let imageSrc="./img/prendre-vie-sd.png";
let imageScale=1.;

//creates a border on the image of random mutations, set to 0 to turn off
let mutationBorderWidth=16.;
//how much mass to add at the border
let mutationBorderStrength=1.;
//how much time between each mutation
let mutationBorderDelay=100;

//----------------------------------

const settings = {
	velocitySpeed: 1,
	gradientSpeed: 0.25,
	colorDNA: 0.,
	colorVariation: 0.,
	hd: false,
	secondLayer: true,
	spawnEdge: true,
	blendImageInGradient: true,
	blendImageInLenia: false,
	zooming: false,
}