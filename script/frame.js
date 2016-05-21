"use strict";
let bp = new BP($('#audio')[0]);

class Intro{
	/* 构造函数，总之各种初始化 */
	constructor(){
		this.initDom();

		this.initContextMenu();

		this.initCurrent();

		this.initTotalBeats();

		this.initProgress();

		this.initIntro(
			this.initScrollSelector.bind(this)
		);
	}
	initIntro(ok){
		$.json('list.json',
			function (data){
				this.start(data);
				ok(data);
			}.bind(this),
			function (){
				alert('list.json 获取失败了');
			}
		);
		this.initAbout();
	}
	start(data){
		bp.list = data;

		bp.playMode = 'random';
		bp.reload();
	}
	initDom(){
		this.$mainEle = $("main");
		this.mainEle = this.$mainEle[0];
	}
}
class About extends Intro{
	setBlur(){
		$('main').css('webkitFilter', 'blur(20px)');
	}
	cancelBlur(){
		$('main').css('webkitFilter', 'blur(0px)');
	}
	setTransition(ele){
		ele.style.transition = `opacity 2s`;
	}
	aboutFadeIn(){
		let ele = this.aboutEle;
		this.setTransition(ele);
		ele.style.opacity = '0';
		ele.style.display = 'flex';

		setTimeout(function (){
			ele.style.opacity = '1';
		}, 16.7);

		this.setBlur();
	}
	aboutFadeOut(){
		let ele = this.aboutEle;
		this.setTransition(ele);
		ele.style.opacity = '1';
		setTimeout(function (){
			ele.style.opacity = '0';
		}, 16.7);

		setTimeout(function (){
			ele.style.display = 'none';
		}, 2000);
		this.cancelBlur();
	}
	initAbout(){
		this.aboutEleR = $('#about');
		this.aboutEle = this.aboutEleR[0];

		this.mainEleR = $('main');
		this.mainEle = this.mainEleR[0];

		this.aboutFadeOut();
		$('#about').html(`
			<h1>-bp-</h1>
			<span>version ${this.version} </span>
		`);
		$(`#about`)[0].addEventListener('click', this.aboutFadeOut.bind(this));
	}
}
class contextMenu extends About{
	initContextMenu(){
		let
		/* 播放模式切换 */
		playmodeSwitch = function (){
			let cursor = bp.supportPlayMode.indexOf(bp.playMode);
			if ( ++cursor === bp.supportPlayMode.length  ){
				cursor = 0;
			}
			bp.playMode = bp.supportPlayMode[cursor];
			return true;
		},
		playmodeFrame = {
			title: $c({
				id: 'playmode',
				html: bp.playMode,
			}),
			click: playmodeSwitch,
		},
		previousFrame = {
			title: $c({
				class: 'play-control',
				text: '<',
			}),
			click: function (){
				bp.previous();
				return true;
			},
		},
		nextFrame = {
			title: $c({
				class: 'play-control',
				text: '>'
			}),
			click: function (){
				bp.next();
				return true;
			},
		},
		settingFrame = {
			title: '设置',
			click: function (){
				alert('正在建设……');
			},
		},
		aboutFrame = {
			title: '关于',
			click: function (){
				this.aboutFadeIn();
			}.bind(this),
		},
		albumFrame = {
			title: '专辑信息：',
			type: 'lock'
		};

		this.bm = new BM(document.body, [
			[ playmodeFrame,  previousFrame,  nextFrame ],
			settingFrame,
			aboutFrame,
			albumFrame,
		]);

		/* playmodechange触发的时候，playmodeFrame也相应变化 */
		bp.coreEvent.playmodechange.push(playmode => {
			playmodeFrame.title.innerHTML = playmode;
		});

		/* 新曲目时，更新 albumFrame */
		bp.coreEvent.reload.push(function (current){
			this.bm.items[this.bm.items.length-1].title = `
			专辑： ${current.album} <br />
			艺术家： ${current.artist}
			`;
		}.bind(this));
	}
}

class ScrollSelectorAction extends contextMenu{
	fadeIn(){
		/* this.$mainEle.css('webkitFilter', 'blur(10px)'); */
		$(this.ele).fadeIn();
		this.isFadein = 1;
	}
	fadeOut(){
		this.$mainEle.css('webkitFilter', 'blur(0px)');
		$(this.ele).fadeOut(function (){
			this.isFadein = 0;
		}.bind(this));
	}
	scrollUp(){
		--this.cursor;
	}
	scrollDown(){
		++this.cursor;
	}
	scroll(direct){
		this.isFadein || this.fadeIn();

		++this.limit;

		if ( this.limit > 3 ){
			this['scroll' + (direct ? 'Up' : 'Down')]();
			this.limit = 0;
		}

		/* 移除上次的定时，并重新开始一个新的计时 */
		clearTimeout(this.timeOut);
		this.timeOut = setTimeout(function (){
			/* 总不能是同一首曲子重新播放吧？ */
			if ( bp.cursor !== this.cursor ){
				bp.cursor = this.cursor;
			}
			this.fadeOut();
		}.bind(this), 1500);
	}
	initSSDOM(){
		this.$ssList = $("#ss-list");
		this.ssList = this.$ssList[0];

		this.$ssItem = $(".ss-item");
		this.ssItem = Array.prototype.slice.apply(this.$ssItem);
	}
	initCursor(){
		Object.defineProperty(this, 'cursor', {
			get(){
				return this._cursor;
			},
			set(set){
				if ( set >= bp.list.length || set < 0 ){
					return ;
				}
				this._cursor = set;

				/* let ssItem = $('.ss-item'); */
				let itemOffset =  this.ssItem[set].offsetHeight;
				let totalOffset = itemOffset * set;

				this.ssItem.forEach((ele, index) => {
					if ( index === set ){
						ele.classList.add('current');
					}else{
						ele.classList.remove('current');
					}
				});

				this.$ssList.css('marginTop', `calc( 50vh - ${totalOffset}px )`);
			}
		});
		this.cursor = bp.cursor;

		bp.coreEvent['cursorchange'].push(function (bpCursor){
			if ( !this.isFadeIn ){
				this.cursor = bpCursor;
			}
		}.bind(this));
	}
}
//ScrollSelectorAction.prototype. = 0;

class ScrollSelector extends ScrollSelectorAction{
	/* 设定滚动事件 */
	setScrollDirect(func){
		let scrollFunc = (e) => {
			e = e || window.event;
			let direct = (e.wheelDelta || e.detail) > 0
			func(direct);
		};

		/*
		if( document.addEventListener ){
			document.addEventListener('DOMMouseScroll', scrollFunc, true);
		}*/
		/* IE/Opera/Chrome */
		window.onmousewheel = document.onmousewheel = scrollFunc;
	}

	/* 渲染列表 */
	renderList(){
		let itemTemplate = '`<li class="ss-item"><div><span>${content}</span></div></li>`';
		let html = '';
		bp.list.forEach(function (item){
			let content = item.title;

			html += eval(itemTemplate);
		}.bind(this));

		$('#ss-list')[0].innerHTML = html;
		this.initSSDOM();
	}

	/* 初始化 滚动选择器 */
	initScrollSelector(){
		this.ele = $('#scroll-selector')[0];

		this.limit = 0;

		this.renderList();

		this.initCursor();

		$(this.ele).css('background', 'rgba(255, 255, 255, 0.7)');
		$(this.ele).fadeOut(
			() => this.setScrollDirect(this.scroll.bind(this))
		);
	}
}

let globalColor = 'darkred';
globalColor = '#AA3300'
let max = 0;
let bugger = $('#bugger');
class TotalBeats extends ScrollSelector{
	fresh(fbc){
		let averageArr = function (arr, start, limit){
			let total = 0;
			for (let c=0; c<limit; ++c){
				total += arr[ start+c ];
			}
			total /= limit;
			return total;
		};

		let ave = averageArr(fbc, 80, 100);
		if( ave > max ){
			max = ave;
		}

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

				if ( set.coverUrl !== undefined ){
					$('img')[0].src = set.coverUrl;
					$('img').css('display', '');
				}else{
					$('img').css('display', 'none');
				}

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
BpFrame.prototype.version = "0.2.0";

let frame = new BpFrame;

let toEnd = function (){
	bp.audio.currentTime = bp.audio.duration-1;
};
