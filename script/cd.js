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
	isDOM = obj => obj instanceof HTMLElement,
	DOMorString = function (set){
		if ( isDOM(set) ){
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
		/* 如果是个对象（而且还不能是DOM）的话，以这个对象为参数重新执行 $c */
		if ( !isDOM(set.html) && typeof(set.html) === 'object' ){
			newEle = $c(set.html);
		}
		/* 如果是个函数的话，以 ele, set 作为参数执行，如果有返回值，则将其添加到ele的底部 */
		else if ( typeof(set.html) === 'function' ){
			newEle = set.html(ele, set);
		}
		/* 如果是DOM */
		else if ( isDOM(set.html) ){
			newEle = set.html;
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
		let addClass = setArr => setArr.forEach(item => ele.classList.add(item));

		isUndefined(set.class) || addClass( Array.isArray(set.class) ? set.class : [set.class] );
	},
	/***** 这里的Event有个问题，就是addEventListener的第三个参数不能设定 */
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
		let ele = DOMorString(set.tag) || $c('div');

		setElementHTMLorText(ele, set);

		setId(ele, set);
		setClass(ele, set);

		setCss(ele, set);

		setEvent(ele, set);

		/* 判断有没有func */
		set.func && set.func.apply(ele, [ele, action]);

		return ele;
	};
	$c = function (set){
		let ele;
		/* 如果是set对象，则以这个对象开始chuangjDOM
		不是对象的话，则以set为参数走一遍DOMorString */
		if ( !isDOM(set) && isPureObject(set) ){
			ele = $cSet(set);
		}else{
			ele = DOMorString(set);
		}
		return ele;
	};

	$c.version = "0.0.1";
	console.info('cd.js '+$c.version);
	window.$c = $c;
})();
