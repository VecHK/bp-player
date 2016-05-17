# bp-core

bp Player 的播放器核心文件，可以独立调用。

## Intro

bp-core 使用并不复杂，它提供了以下功能

 - 列表
 - 一些常见的播放模式
 - 简单性
 - 除了可以绑定Audio原生事件，还可以绑定由bp-core设定的 *核心事件(coreEvent)*
 - 内部采用了数据绑定的编程方式


### Example

```javascript
let bp = new BP;

bp.list = [
	{
		"title": "Name",
		"url": "AudioURL",
		"artist": "AudioArtist",
		"album": "AudioAlbum",
		"coverUrl": "CoverURL"
	}
];

bp.load();
bp.play();

```

### 设定列表

如同上面的Example一样

```javascript

let bp = new BP;

bp.list = [
	{
		'url': 'http://abc.com/nofound.mp3'
	},
	{
		'url': 'http://cba.com/nofound.wav'
	},
];

```

其实只设定一个`url`属性就可以了，不过为了好识别，还是加点别的吧

### 设定播放模式

```javascript
bp.playMode = 'random';

```
目前播放模式支持列表

 - 随机播放 'random'
 - 单曲播放 'single'
 - 列表循环 'normal'
 - 单曲循环 'loop'


### 换曲

```javascript
++bp.cursor;

/* 或者用 bp.next(); 也可以 */

```
这两种方式换曲**并不受播放模式影响**，bp-core将在未来版本支持 **受播放模式影响** 的换曲方式

`bp.cursor` 是歌曲列表的指针，指向 `bp.list` 中当前播放的曲目。如果`bp.cursor`被修改了，bp-core的就会以被修改后的`bp.cursor`重新加载曲目。如果把`bp.cursor`设为比`bp.list`长度还大的数，`bp.cursor`将会被设置为`0`；如果设置为小于0的数字，则忽略

** 受播放模式影响 ** 的换取方式见 APIs栏的 `BP.prototype.playEnd`

### 事件

除了原生的Audio事件以外，bp-core提供了核心内的事件机制。

与以往的绑定方式不同，bp-core的事件是存储在对应的事件池中的，这意味着，你可以随时修改他们并移除他们（然并卵）

#### 绑定一个原生事件

```javascript

bp.eventPool['ended'].push(function (){
	alert("播放结束");
});

```

#### 绑定一个核心事件

```javascript

bp.coreEvent['reload'].push(function (item){
	console.info(`现在切换了一个歌曲，新歌曲的名字是 ${item.title}`);
});

```

## APIs

一些API的列表

### BP.prototype.addItem

从bp.list尾部添加一个新的曲目

```javascript

bp.addItem('曲名', '曲URL', '艺术家', '专辑名', '封面URL');

```

### BP.prototype.reload()

重新加载并播放 `BP.prototype.list[BP.prototype.cursor]` 的曲目

### BP.prototype.previous()

切换上一首，** 不受播放模式影响 **

### BP.prototype.playEnd()

换曲，** 受播放模式影响 **

### BP.prototype.getCurrent()

返回当前曲目

### BP.prototype.pause()

暂停播放

### BP.prototype.stop()

停止播放

### BP.prototype.addEvent()

添加原生事件，并不存储在事件池

```javascript
let end = function (){
	alert('歌曲播放完毕');
};
let bp = new BP;
bp.addEvent('ended', end);

```

### BP.prototype.rmEvent()

移除非存在于事件池中的事件

```javascript

let end = function (){
	alert('歌曲播放完毕');
};
let bp = new BP;
bp.addEvent('ended', end);

bp.rmEvent('ended', end);

```

### BP.prototype.rmPoolItem()

移除事件池中的函数（类似于 removeEventListener）

```javascript

let end = function (){
	alert('歌曲播放完毕');
};
let bp = new BP;

bp.eventPool.ended.push(end);

bp.rmPoolItem('ended', end);

```

## Plugin

编写插件也很容易，像这样写

```javascript

let pluginFunc = function (){
	console.info(this);	//这里的this已经指向BP的上下文中
	/* 然后怎么做你懂得。。。。。。 */
};

BP.prototype.coreEvent.construct.push(function (){
	pluginFunc.apply(this);
});

```

