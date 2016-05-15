/* 一个HTML5播放器（音频）的核心部分 */
"use strict";
(function (){
	class BPList{
		newItem(title, url, artist, album, coverUrl){
			return {
				title,
				url,
				artist,
				album,
				coverUrl
			};
		}
		/* 给歌单添加一个项目 */
		addItem(){
			this.list.push( this.newItem.apply(this, arguments) );
		}

		/* 重新加载 this.list[this.cursor] 的歌曲 */
		/* 触发reload核心事件） */
		reload(){
			this.load();
			this.play();
		}

		/* 下一首 */
		next(){}

		/* 上一首 */
		previous(){}

		/* 获得随机数 */
		getRandom(From, to){
			while (1){
				let t = Math.floor(Math.random()*to);
				if ( t >= From ){
					return t;
				}
			}
		}
		/* 设置随机数 */
		setRandom(){
			let ran = this.getRandom(0, this.list.length);

			return this.cursor = (ran === this.cursor ? this.setRandom() : ran);
		}

		/* 播放结束 */
		playEnd(e){
			switch(this.playMode){
				case 'random':{
					this.setRandom();
				}
				break;

				case 'normal':{
					++this.cursor;
				}
				break;

				case 'loop':{
					this.play();
				}
				break;

				case 'single':{}
				break;

				default:
					console.warn("这种情况应该是很bug的吧");
			}
		}

		setCurrentTime(setTime){
			this.audio.duration = setTime;
		}

		/* 返回当前歌曲 */
		getCurrent(){
			return this.list[this.cursor];
		}
	}
	BPList.prototype._cursor = 0;
	BPList.prototype._playMode = 'loop';
	BPList.prototype.list = [];

	let supportPlayMode = ['random', 'single', 'normal', 'loop'];
	Object.defineProperties(BPList.prototype, {
		'playMode': {
			get(){
				return this._playMode;
			},
			set(set){
				if ( !supportPlayMode.includes(set) ){
					console.warn(`设置这种播放模式是不行的 (只支持这些：${supportPlayMode.toString()})`);
				}else{
					this._playMode = set;
				}
			}
		},
		'cursor':{
			get(){
				return this._cursor;
			},
			set(set){
				if ( set >= this.list.length ){
					console.warn(`设置了一个比 list长度 还长的cursor\ncursor已归零`);
					this.cursor = 0;
				}else{
					this._cursor = set;
					console.info(`cursor已切换到${set}`);

					this.reload();
				}
			}
		},
		'current': {
			get(){
				return this.getCurrent();
			},
			set(set){
				console.warn("设置了也没有什么卵用");
			}
		}
	});

	class BPCore{
		play(){
			this.audio.play();
		}
		stop(){
			this.audio.currentTime = 0;
			this.pause();
		}
		pause(){
			this.audio.pause();
		}
		load(item){
			if ( item === undefined ){
				item = this.getCurrent();
			}
			this.audio.src = item.url;
			this.audio.load();
		}
	}
	BPCore.prototype.__proto__ = BPList.prototype;


	let BP = function (audioEle){

		this.rmEvent = function (eventName, func){
			this.audio.removeEvent(eventName, func);
		};
		this.addEvent = function (eventName, callBack, t){
			this.audio.addEventListener(eventName, callBack, t);
		};
		function maxCurring(){
			if ( arguments.length <= 1 ){
				return arguments[0];
			}
			Array.prototype.splice.apply(arguments, [Number(arguments[0] > arguments[1]), 1]);
			return maxCurring.apply(null, arguments);
		}
		let rmItem = function (arr, item){
			var status = Array.prototype.indexOf.call(arr, item);
			return (status >= 0) && Array.prototype.splice.apply(arr, [status, 1]);
		};

		this.rmPoolItem = function (poolName, item){
			return rmItem(this.eventPool[poolName], item);
		};

		/* 初始化自定义事件轮询 */
		this.initEventList = function (){
			let fetch = function (){
				let args = arguments;
				this.forEach(function (func){
					func.apply(null, args);
				});
			};
			this.eventList.forEach(function (eventName, currsor){
				/* 事件池初始化 */
				if ( this.eventPool[eventName] === undefined ){
					this.eventPool[eventName] = [];
				}
				this.addEvent(eventName, fetch.bind(this.eventPool[eventName]));
			}.bind(this));
		};

		/* 设定核心事件 */
		this.initCoreEvent = function (){
			/* 定义 ended 核心事件 */
			this.coreEvent.ended = function (){
				this.playEnd.apply(this, arguments);
			};
			this.addEvent('ended', this.coreEvent.ended.bind(this));
		};
		this.getReload = function (){
			return this.__proto__.__proto__.__proto__.reload;
		};

		console.log('bpConstructor');
		this.audio = audioEle || (new Audio);

		this.initEventList();
		this.initCoreEvent();

		this.load();

	};
	BP.prototype.coreEvent = {};
	BP.prototype.eventFetch = {};
	BP.prototype.eventPool = {};
	BP.prototype.eventList = ["loadstart", "durationchange", "timeupdate", "loadedmetadata", "loadeddata", "progress", "canplay", "canplaythrough", "play", "pause", "ended"]

	BP.prototype.__proto__ = BPCore.prototype;

	window.BP = BP;
})();
