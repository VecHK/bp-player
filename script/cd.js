/*
Create DOM

以看起来似乎很简单的方式构建一个DOM……
然后似乎没什么好说明的了
 */
"use strict";

(function (){
	let
	$c,
	isArray = value => Array.isArray(value),
	isPureObject = function (obj){
		return !isArray(obj) && typeof obj === 'object';
	},
	isUndefined = function (obj){
		return typeof(obj) === 'undefined';
	},
	isDOM = obj => obj instanceof HTMLElement,
	DOMorString = function (set){
		if ( !isDOM(set) && isPureObject(set) ){
			return $c(set);
		}
		else if ( isDOM(set) ){
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
		if ( !isDOM(set.html) && isPureObject(set.html) ){
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
		/* 是数组的话就按照 query的方式 处理 （但是不支持对象的形式） */
		else if ( isArray(set.html) ){
			let tempQuery = set.query;
			set.query = set.html;
			setQuery(ele, set);

			if ( isUndefined(tempQuery) ){
				delete set.query;
			}else{
				set.query = tempQuery;
			}
		}
		else if ( set.html ){
			ele.innerHTML = set.html;
		}
		newEle && ele.appendChild( newEle );

		return newEle || ele;
	},
	/* 执行序列化 */
	execQuery = (arr, set) => arr.map( item => setElementHTMLorText($c(set.tag || 'div'), {html: item}) ),
	/* 序列化处理 */
	setQuery = (ele, set) => {
		let query = set.query,
			param;
		if ( query === undefined ){
			return ;
		}

		/* 如果是数组（序列化处理HTML） */
		if ( isArray( query ) ){
			param = [query, {}];
		}
		if ( isPureObject( query ) ){
			param = [query.list, query];
		}

		set._queryHtml = execQuery.apply(null, param);

		set._queryHtml.forEach( ele.appendChild.bind(ele) );
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
	attr = (ele, property, value) => {
		let atr = document.createAttribute(property);
		atr.value = value;
		ele.attributes.setNamedItem(atr);
	},
	setAttr = (ele, set) => {
		if ( isPureObject(set.attr) ){
			Object.keys(set.attr).forEach(key => attr(ele, key, set.attr[key]));
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
		setQuery(ele, set);

		setId(ele, set);
		setClass(ele, set);

		setAttr(ele, set);

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

	$c.version = "0.2.0";
	console.info('cd.js '+$c.version);
	window.$c = $c;
})();
