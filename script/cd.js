/*
Create DOM

以看起来似乎很简单的方式构建一个DOM……
然后似乎没什么好说明的了
 */
"use strict";

(function (){
	let
	$c,
	isPureObject = function (obj){
		return !Array.isArray(obj) && typeof obj === 'object';
	},
	isUndefined = function (obj){
		return typeof(obj) === 'undefined';
	},
	DOMorString = function (set){
		if ( set instanceof HTMLElement ){
			return set;
		}else if ( typeof(set) === 'string' ){
			return document.createElement(set);
		}
	},
	setElementHTMLorText = function (ele, set){
		let newEle;
		/* 如果有 text…… */
		if ( set.text ){
			ele[ele.textContent ? 'textContent' : 'innerText'] = set.text;
		}
		/* 如果有 html…… */
		/* 如果是个对象的话，以这个对象为参数重新执行 $c */
		if ( typeof(set.html) === 'object' ){
			newEle = $c(set.html);
		}
		/* 如果是个函数的话，以 ele, set 作为参数执行，如果有返回值，则将其添加到ele的底部 */
		else if ( typeof(set.html) === 'function' ){
			newEle = set.html(ele, set);
		}
		else if ( set.html ){
			ele.innerHTML = set.html;
		}

		newEle && ele.appendChild( newEle );
	},
	setId = function (ele, set){
		if ( set.id ){
			ele.id = set.id;
		}
	},
	setClass = function (ele, set){
		let setClassList = function (classList){
			classList.forEach(item => ele.classList.add(item));
		};
		/* 设定className，支持字符串和数组 */
		if ( typeof(set.class) === 'string' ){
			ele.className = set.class;

			/* 如果还存在 classList 的话... */
			set.classList && setClassList(set.classList);
		}
		else{
			setClassList(set.class);
		}
	},
	setEvent = function (ele, set){
		let fetchEvent = function (eventName, eventArr){
			if ( typeof(eventArr) === 'function' ){
				eventArr = [eventArr];
			}
			eventArr.forEach(function (eventFunc){
				ele.addEventListener(eventName, eventFunc);
			});
		};
		/* key即事件名 */
		if ( isPureObject(set.event) ){
			Object.keys(set.event).forEach(function (key){
				fetchEvent(key, set.event[key]);
			});
		}
	},
	setCss = function (ele, set){
		let setCssProperty = function (obj1, obj2, property){
			obj1[property] = obj2[property];
		};
		if ( typeof(set.css) === 'string' ){
			ele.style.cssText = set.css;
		}
		else if ( isPureObject(set.css) ){
			for ( let setProperty in set.css ){
				/* 不设定不存在的CSS属性 */
				isUndefined(ele.style[setProperty]) || setCssProperty(ele.style, set.css, setProperty);
			}
		}
	},
	$cSet = function (set){
		/* 如果没有指定 tag 的话则默认创建一个div标签 */
		let ele = document.createElement(set.tag || 'div');

		setId(ele, set);
		setClass(ele, set);
		setElementHTMLorText(ele, set);

		setCss(ele, set);

		setEvent(ele, set);

		/* 判断有没有func */
		set.func && set.func.apply(ele, [ele, action]);

		return ele;
	};
	$c = function (set){
		let ele = DOMorString(set) || $cSet(set);
		return ele;
	};

	$c.version = "0.0.1";
	console.info('cd.js '+$c.version);
	window.$c = $c;
})();
