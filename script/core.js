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
		reload(){
			this.load();
			this.play();
		}

		/* 下一首 */
		next(){
			++this.cursor;
		}

		/* 上一首 */
		previous(){
			--this.cursor;
		}

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
					this.next();
				}
				break;

				case 'loop':{
					/*this.audio.currentTime = 0;*/
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
				if ( set < 0 ){
					console.warn(`cursor(${set})设置为比0小的数是不行的`);
				}
				else if ( set >= this.list.length ){
					console.warn(`设置了一个比 list长度 还长的cursor\ncursor已归零`);
					this.cursor = 0;
				}else{
					this._cursor = set;
					console.info(`cursor已切换到${set}`);

					this.reload();

					this.fetchEvent(this.coreEvent.cursorchange, [set, this.current]);
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
			if ( arguments.length === 0 ){
				return this.load( this.getCurrent() );
			}
			if ( item !== undefined ){
				/* 传递reload核心事件（对象复制） */
				this.fetchEvent(this.coreEvent.reload, [ JSON.parse(JSON.stringify(item)) ]);

				this.audio.src = item.url;
				this.audio.load();

			}
		}

		/* 移除事件 */
		rmEvent(eventName, func){
			this.audio.removeEventListener(eventName, func);
		}

		/* 添加事件 */
		addEvent(eventName, callBack, t){
			this.audio.addEventListener(eventName, callBack, t);
		}

		/* 遍历事件池
			自定义事件与核心事件共用
		 */
		fetchEvent(eventList, args){
			eventList.forEach(func => {
				func.apply(this, args);
			});
		}

		/*
			移除事件池中的函数（类似于 removeEventListener）
		*/
		rmPoolItem(poolName, item){
			let rmItem = function (arr, item){
				var status = Array.prototype.indexOf.call(arr, item);
				return (status >= 0) && Array.prototype.splice.apply(arr, [status, 1]);
			};
			return rmItem(this.eventPool[poolName], item);
		}

	}
	BPCore.prototype.__proto__ = BPList.prototype;

	/* 构造函数 */
	let BP = function (audioEle){
		this.audio = audioEle || (new Audio);

		/* 设定自定义事件轮询 */
		this.eventList.forEach((eventName, currsor) => {
			/* 事件池初始化 */
			this.eventPool[eventName] = this.eventPool[eventName] || [];

			this.addEvent(eventName, () => {
				this.fetchEvent(this.eventPool[eventName], arguments);
			});
		});

		/* 设定核心事件 */
		/* 定义 ended 核心事件 */
		this.coreEvent.ended = this.playEnd;
		this.addEvent('ended', this.coreEvent.ended.bind(this));

		this.load();

		/* 传递 construct 核心事件 */
		this.fetchEvent(this.coreEvent.construct, [this]);
	};
	BP.prototype.coreEvent = {
		/* 定义 cursorchange 核心事件 */
		cursorchange: [],

		/* 定义 reload 核心事件 */
		reload: [],

		/* 定义 construct 核心事件 */
		construct: [],
	};
	BP.prototype.eventFetch = {};
	BP.prototype.eventPool = {};
	BP.prototype.eventList = ["loadstart", "durationchange", "timeupdate", "loadedmetadata", "loadeddata", "progress", "canplay", "canplaythrough", "play", "pause", "ended"]

	BP.prototype.__proto__ = BPCore.prototype;

	window.BP = BP;

	BPCore.prototype.version = "0.0.2";
	console.info(`bp-core ${BP.prototype.version}`);
})();
