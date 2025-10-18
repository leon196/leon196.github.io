/*
	Copyright (c) 2024, Adrian Margel All Rights Reserved.
	see: https://github.com/AdrianMargel/cimexis-elements for details
*/

class Control{
	constructor(){
		this.pressedKeys={};
		this.mPos=Vec(0,0);
		this.mRDown=false;
		this.mMDown=false;
		this.mLDown=false;
		this.mWheel=0;
		this.touchMode=false;

		this.rightClickTime=0;

		this.callbacks = {};

		this.mWheelOrigin;
		this.mPosOrigin;
		this.resetDelta();
	}
	connect(element){
		window.onkeyup=(e)=>{
			this.pressedKeys[
			e.charCode==0?
				e.keyCode
				:e.key.toUpperCase().charCodeAt(0)
		]=false;
	}
		window.onkeydown = (e) =>
		{
			const k = e.charCode == 0 ? e.keyCode : e.key.toUpperCase().charCodeAt(0);
			if (!this.pressedKeys[k] && this.callbacks[k] !== undefined) this.callbacks[k]();
			this.pressedKeys[k] = true;
		}

		element.onwheel=(e)=>this.mWheel+=sign(e.deltaY);

		element.oncontextmenu=
		element.onmousedown=(e)=>{
			e.preventDefault();//TODO: make this optional
			this.touchMode=false;
			if(e.button==0){
				this.mLDown=true;
			}else if(e.button==1){
				this.mMDown=true;
			}else if(e.button==2){
				if(this.rightClickTime!=e.timeStamp){
					//TODO
					//The oncontextmenu event can fire on mouse up.
					//to avoid treating it as a key process the first event if two occur at the same time
					this.mRDown=true;
					this.rightClickTime=e.timeStamp;
				}
			}
		};
		document.body.onmouseup=(e)=>{
			this.touchMode=false;
			if(e.button==0){
				if (this.callbacks['clic'] !== undefined)
				{
					if (this.mLDown) this.callbacks['clic']();
				}
				this.mLDown=false;
			}else if(e.button==1){
				this.mMDown=false;
			}else if(e.button==2){
				this.mRDown=false;
				this.rightClickTime=e.timeStamp;
			}
		}

		element.onmousemove=(e)=>this.mPos=new Vector(e.offsetX,e.offsetY);

		element.ontouchstart=
		element.ontouchmove=(e)=>{
			this.touchMode=true;
			this.mLDown=true;
			if(e.changedTouches.length>0){
				this.mPos=Vec(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
			}
		};
		document.body.ontouchend=(e)=>{
			this.touchMode=true;
			this.mLDown=false;
		};
	}

	resetDelta(){
		this.mWheelOrigin=this.mWheel;
		this.mPosOrigin=this.mPos.cln();
	}

	mouseWheel(){
		return this.mWheel;
	}
	mouseWheelDelta(){
		return this.mWheel-this.mWheelOrigin;
	}

	mousePos(){
		return this.mPos.cln();
	}
	mousePosDelta(){
		return this.mPos.cln().sub(this.mPosOrigin);
	}
	
	mouseDown(button=""){
		switch(button.toUpperCase()){
			case "L":return this.mLDown;
			case "R": return this.mRDown;
			case "M": return this.mMDown;
			default: return this.mLDown||this.mRDown||this.mMDown;
		}
	}
	keyDown(key){
		return this.keyCodeDown(key.toUpperCase().charCodeAt(0));
	}
	keyCodeDown(keyCode){
		return !!this.pressedKeys[keyCode];
	}
}