"use strict";
let bp = new BP($('#audio')[0]);

class Intro{
	/* 构造函数，总之各种初始化 */
	constructor(){
		this.initDom();

		/* 初始化设置界面与右键菜单 */
		this.initSetting();
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
	initDom(){
		this.$mainEle = $("main");
		this.mainEle = this.$mainEle[0];
	}
}

class Config extends Intro{

	/* 收集保存前的信息 */
	collectCurrent(){
		this.config.playMode = bp.playMode;
		this.config.cursor = bp.cursor;
	}

	saveConfig(){
		this.collectCurrent();
		window.localStorage.setItem('bpconfig', JSON.stringify(this.config));
	}

	queryConfig(newConfig){
		Object.keys(this.config).forEach(key => {
			if ( newConfig[key] !== undefined ){
				this.config[key] = newConfig[key];
			}
		});
	}

	loadConfig(){
		if ( !window.localStorage ){
			console.log('环境不支持window.localStorage方法');
			throw new Error('undefined');
		}

		try{
			let config = window.localStorage.getItem('bpconfig');
			config = JSON.parse(config);

			this.queryConfig(config);
		}catch(e){
			console.log('config字段parse错误');
			throw new Error('parseFail');
		}
	}

	applyConfig(){
		for ( let key in this.config){
			if ( key === 'playMode' ){
				bp.playMode = this.config[key];
			}
			else if ( key === 'totalBeats' ){
				this.config[key] ? this.enableBeat() : this.stopBeat();
			}
			else if ( key === 'progressSize' ){
				this.progressSize = this.config[key];
			}
		}
	}

	/* 初始化设定 */
	initConfig(){
		try{
			this.loadConfig();
		}catch(e){
			console.log('读取默认的config');
			this.queryConfig({});
		}
		this.applyConfig();
		this.exitSave();
	}

	start(data){
		this.initConfig();
		bp.list = data;

		bp.reload();
	}

	setConfig(key, value){
		if ( this.config[key] !== undefined ){
			this.config[key] = value
			this.applyConfig();
		}else{
			throw new Error('不能接受的configKey');
		}
	}

	/* 在页面关闭或者刷新时绑定的事件，用来设置退出前保存 */
	exitSave(){
		window.addEventListener('beforeunload', () => {
			this.saveConfig();
		});
	}
}
Config.prototype.config = {
	cursor: 0,
	playMode: 'loop',
	totalBeats: true,
	progressSize: 1,
};

class Setting extends Config{
	collectSavePanel(){
		let bpFrame = this,
		collect = function (){
			try{
				let
				totalBeats = 'totalBeats',
				progressSize = 'progressSize';
				bpFrame.config[totalBeats] = this[totalBeats.toLowerCase()].checked;

				bpFrame.config[progressSize] = this[progressSize.toLowerCase()].value;

				bpFrame.applyConfig();
				bpFrame.saveConfig();
			}catch(e){
				console.error(e);
			}
			return false;
		};
		$('#config [type="submit"]')[0].onclick = function (){
			collect.call($('#config')[0]);
			return false;
		};
		$('#config')[0].onsubmit = function (){
			return false;
		};
	}
	settingEvent(e){
		if ( this.settingIsFadeIn && e.button === 2 || e.button === 3){
			this.closeSetting();
		}
	}
	openSetting(){
		let
		ele = this.settingEle,
		time = 618;
		this.setTransition(ele, time/1000);
		ele.style.opacity = '0';
		ele.style.display = 'block';

		this.renderForm();

		setTimeout(() => {
			ele.style.opacity = '1';
		}, 16.7);
		this.settingIsFadeIn = true;
		/* 如果点的不是左键 */
		document.body.addEventListener('mouseup', this.settingEvent.bind(this));
	}
	closeSetting(){
		let
		ele = this.settingEle,
		time = 618;
		this.setTransition(ele, time/1000);
		ele.style.opacity = '1';
		setTimeout(() => {
			ele.style.opacity = '0';
		}, 16.7);

		/* 取消事件 */
		document.body.removeEventListener('mouseup', this.settingEvent.bind(this));
		setTimeout(()=>{
			ele.style.display = 'none';

			this.settingIsFadeIn = false;
		}, time);
	}
	detectLocation(e){
		this.settingEle.style.display = 'block';
		let
		ele = this.settingEle,
		settingWidth = ele.offsetWidth,
		settingHeight = ele.offsetHeight,
		pageWidth = document.body.offsetWidth,
		pageHeight = document.body.offsetHeight,
		locateX = e.pageX,
		locateY = e.pageY;

		if ( ((settingWidth / 2) + locateX) > pageWidth ){
			locateX = pageWidth - (settingWidth / 2) - 10;
		}
		if ( ((settingHeight / 2) + locateY) > pageHeight ){
			locateY = pageHeight - (settingHeight / 2) - 10;
		}
		if ( locateX - (settingWidth / 2) <= 0 ){
			locateX = (settingWidth / 2) + 10;
		}
		if ( locateY - (settingHeight / 2) <= 0 ){
			locateY = (settingHeight / 2) + 10;
		}

		locateX = locateX - ( settingWidth / 2 );
		locateY = locateY - ( settingHeight / 2 );

		ele.style.left = locateX + 'px';
		ele.style.top = locateY + 'px';

		this.openSetting();
	}

	renderForm(){
		let ele = $('#config')[0];
		console.info(ele.totalbeats.checked, this.config['totalBeats']);
		ele.totalbeats.checked = this.config['totalBeats'];

		ele.progresssize.value = this.config['progressSize'];
	}

	initSetting(){
		this.settingEleR = $('#setting');
		this.settingEle = this.settingEleR[0];

		this.settingFrame = {
			title: '设置',
			click: this.detectLocation.bind(this),
		};

		this.collectSavePanel();

		$('.setting-control button')[0].addEventListener('click', () => this.closeSetting());
	}
}

class About extends Setting{
	setBlur(){
		$('main').css('webkitFilter', 'blur(20px)');
	}
	cancelBlur(){
		$('main').css('webkitFilter', 'blur(0px)');
	}
	setTransition(ele, time){
		time = time || 2;
		ele.style.transition = `opacity ${time}s`;
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
		pauseOrPlay = {
			title: $c({
				class: 'play-or-pause',
				text: '||',
			}),
			click: function (e){

				if ( bp.audio.paused ){
					$(e.target).html('||');
				}else{
					$(e.target).html('●');
				}
				bp[ bp.audio.paused ? 'play' : 'pause' ]();
				return true;
			}
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
			[ playmodeFrame,  previousFrame, pauseOrPlay, nextFrame ],
			this.settingFrame,
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
	scroll(direct, anti){
		this.isFadein || this.fadeIn();

		++this.limit;

		if ( this.limit > 3 ){
			if ( anti ){
				this['scroll' + (direct ? 'Down' : 'Up')]();
			}else{
				this['scroll' + (direct ? 'Up' : 'Down')]();
			}

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
			let direct = (e.wheelDelta || e.detail) > 0;

			if ( e.wheelDelta === undefined ){
				func(direct, true);
			}
			/* firefox */
			else{
				func(direct, false);
			}


		};

		/* IE/Opera/Chrome */
		if ( window.onmousewheel !== undefined ){
			window.onmousewheel = document.onmousewheel = scrollFunc;
		}
		/* fireFox */
		else{
			document.addEventListener('DOMMouseScroll', scrollFunc, true);
		}

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
	enableBeat(){
		bp.streamPause = false;
	}
	pauseBeat(){
		bp.streamPause = true;
	}
	flushBeat(){
		$('img').css('box-shadow', ``);
	}
	stopBeat(){
		this.pauseBeat();
		setTimeout(this.flushBeat.bind(this), 16.7);
	}
	initTotalBeats(){
		let fresh = this.fresh;
		bp.setStream(fresh);
		bp.streamPause = 1;
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
		let
		bpFrame = this,
		lastProgress = -1,
		setCSS = (() => {
			let eleR = $('#progress .current');
			return width => eleR.css({width:  `${width}%`});
		})(),
		freshProgress = function (){
			let width = (this.audio.currentTime / this.audio.duration) * 100;
			if ( (width - lastProgress) >= bpFrame.config.progressSize ){
				setCSS(width);
				lastProgress = width;
			}
		};
		bp.eventPool.timeupdate.push(freshProgress);
		bp.eventPool.seeking.push( () => {
			lastProgress = -1;
			freshProgress.call(bp);
		});
		bp.coreEvent.reload.push(() => {
			setCSS(0);
			lastProgress = -1;
		});
	}
}
BpFrame.prototype.version = "0.3.3";

let frame = new BpFrame;

let toEnd = function (){
	bp.audio.currentTime = bp.audio.duration-1;
};
