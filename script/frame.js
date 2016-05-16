"use strict";
let bp = new BP($('#audio')[0]);

class intro{
	constructor(){
		this.initCurrent();

		this.initTotalBeats();

		this.initProgress();
	}
}
let globalColor = 'darkred';
globalColor = '#AA3300'
let max = 0;
class TotalBeats extends intro{
	fresh(fbc){
		let averageArr = function (arr, start, limit){
			let total = 0;
			for (let c=0; c<limit; ++c){
				total += arr[ start+c ];
			}
			total /= limit;
			return total;
		};
		/*let maxCurring = function (){
			if ( arguments.length <= 1 ){
				return arguments[0];
			}
			Array.prototype.splice.apply(arguments, [Number(arguments[0] > arguments[1]), 1]);
			return maxCurring.apply(null, arguments);
		};*/

		let ave = averageArr(fbc, 80, 100);
		if( ave > max ){
			max = ave;
		}


		$('#bugger').text(`
			0-100 ave: ${ave}
			0-100 max: ${max}
		`);

		$('img').css('box-shadow', `0px 0px ${ave/4}px ${globalColor}`);

	}
	pauseBeat(){
		bp.streamPause = 1;
	}
	initTotalBeats(){
		let fresh = this.fresh;
		bp.setStream(fresh);
		bp.streamPause = 0;
	}

}

class BpFrame extends TotalBeats {
	/* 初始化 Current
		当 Current 改变时，视图中的 封面、歌名、艺术家、专辑名称都会发生改变
	 */
	initCurrent(){
		this._current = {};
		Object.defineProperty(this, 'current', {
			get(){
				return this._current;
			},
			set(set){
				this._current = set;

				$('#title').text(set.title);
				$('#artist').text(set.artist);
				$('#album').text(set.album);

				$('img')[0].src = set.coverUrl;

				return set;
			}
		});

		/* 压入一个核心事件 */
		bp.coreEvent.reload.push(item => {
			this.current = item;
		});
	}

	/* 初始化 进度条 */
	initProgress(){
		bp.eventPool.timeupdate.push(function (){
			let width = (this.audio.currentTime / this.audio.duration) * 100;
			$('#progress .current').css({width:  `${width}%`});
		});
	}
}

let frame = new BpFrame;

const start = function (){

	document.getElementsByTagName('body')[0].appendChild(bp.audio);

	bp.eventPool.timeupdate.push(function (){console.log('timeupdate')});

	bp.playMode = 'normal';
	bp.load();
	bp.play();
};

$.json('list.json', function (d){
	console.log('list.json 读取完成');
	bp.list = d;
	start();
}, function (){
	alert('list.json 获取失败了');
});

let toEnd = function (){
	bp.audio.currentTime = bp.audio.duration-1;
};
