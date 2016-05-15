"use strict";
class BpFrame extends BP{

}

BpFrame.prototype.frameCurrent = {
	_title: '',
	_url: '',
	_artist: '',
	_album: '',
	_coverUrl: ''
};
Object.defineProperties(BpFrame.prototype.frameCurrent, {
	'title': {
		get(){
			return this._title;
		},
		set(set){
			this._title = set;
			$('#title').text(set);
		}
	}
});

let bp;

const start = function (){
	document.getElementsByTagName('body')[0].appendChild(bp.audio);

	bp.eventPool.timeupdate.push(function (){console.log('timeupdate')});

	bp.playMode = 'random';
	bp.load();bp.play();
};

$.json('list.json', function (d){
	BpFrame.prototype.list = d;
	bp = new BpFrame;
	start();
}, function (){
	alert('list.json 获取失败了');
});

let toEnd = function (){
	bp.audio.currentTime = bp.audio.duration-1;
};
