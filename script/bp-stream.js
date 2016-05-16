"use strict";
(function (){
	let BpStream = function (){
		let audio = this.audio;

		let context = new AudioContext();
		let analyser = context.createAnalyser();

		let source = context.createMediaElementSource(audio);
		source.connect(analyser);
		analyser.connect(context.destination);

		/* frequencyBinCount */
		let getFBC = () => {
			return new Uint8Array(analyser.frequencyBinCount);
		};

		let getByteFBC = function (){
			let fbc = getFBC();
			analyser.getByteFrequencyData( fbc );
			return fbc;
		};

		let streamPause = 1;

		let func = function (){};

		let requestAnimationFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame);
		let stream = function (){
			streamPause || requestAnimationFrame(stream);
			func(getByteFBC());
		};

		/* 定义属性 */

		this.setStream = function (setfunc){
			func = setfunc;
		};

		this.getFBC = getFBC;
		this.getByteFBC = getByteFBC;
		Object.defineProperty(this, 'streamPause', {
			get(){
				return streamPause;
			},
			set(set){
				streamPause = Boolean(set);

				streamPause || window.requestAnimationFrame(stream);
			}
		});

		console.log("bp plugin(bp-stream) was applied.");
	};

	BP.prototype.coreEvent.construct.push(function (){
		BpStream.apply(this);
	});
})();
