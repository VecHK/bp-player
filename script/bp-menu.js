/*
	bp-menu
		一个右键菜单类
*/
"use strict";
(function (){
	var BpMenu = function (info){
		this.init(info);

		info.ele.appendChild(this.menuEle);

		this.bindRightClick(info.ele, info.func);

	};
	BpMenu.prototype.transitionSpeed = '382';
	BpMenu.prototype.setTransition = function (b){
		this.menuEle.style.transition = b ? '' : 'opacity 0.'+ this.transitionSpeed +'s';
	};
	BpMenu.prototype.fadeIn = function (){
		console.log(this.menuEle);
		this.menuEle.style.opacity = '0';
		this.setTransition('clear');

		this.menuEle.style.display = 'block';
		setTimeout(function (){
			this.setTransition();
			this.menuEle.style.opacity = '1';
		}.bind(this), 16.7);

		this.isFadeIn = true;
	};
	BpMenu.prototype.fadeOut = function (){
		/*this.setTransition();*/
		setTimeout(function (){
			this.menuEle.style.opacity = '0';

			setTimeout(function (){
				this.menuEle.style.display = '';
			}.bind(this), this.transitionSpeed);
		}.bind(this), 16.7);

		this.isFadeIn = false;
	};
	BpMenu.prototype.init = function (info){
		this.initMenu(info.items);
	};
	BpMenu.prototype.bindRightClick = function (bindEle, func){
		let noContextMenu = function (e){
			e.cancelBubble = true;
			e.returnValue = false;
			return false;
		};

		let locate = function (e){
			let
			menuEle = this.menuEle,
			body = document.body,
			/* 菜单栏位置处理（解决菜单栏在最边上的时候会渲染到外面的问题） */
			backOffset = function (offset, direct){
				let offsetStr = 'offset'+direct;
				let morethan = function (){
					return (offset + menuEle[offsetStr]) >= body[offsetStr];
				};
				return morethan.apply(null, arguments) ? menuEle[offsetStr] : 0;
			};

			/* 如果 菜单栏 处于 display:none 的时候，offsetHeight 或者 offsetWidth 什么的都是 0 */
			menuEle.style.display = 'block';

			let
			offsetY = e.offsetY - backOffset(e.offsetY, 'Height'),
			offsetX = e.offsetX - backOffset(e.offsetX, 'Width');

			menuEle.style.top = offsetY + 'px';
			menuEle.style.left = offsetX + 'px';
		}.bind(this);

		if ( bindEle.oncontextmenu !== undefined ){
			bindEle.oncontextmenu = noContextMenu;
		}
		bindEle.addEventListener('mouseup', function (e){
			console.warn(e);
			func && func.apply(this, arguments);

			if (e.button === 2 || e.button === 3){
				console.log(this);
				console.log(e);
				locate(e);
				this.fadeIn();
				return noContextMenu(e);
			}
			/* 如果点击到的不是菜单栏 */
			else if ( this.isFadeIn && ( 0 > Array.prototype.indexOf.apply(this.menuEle, [e.target]) )  ){
				/* 如果不是 锁定项（无回调函数的item） */
				if ( !e.target.classList.contains('bp-menu-lock') ){
					this.fadeOut();
				}else{

				}

			}
		}.bind(this), true);
	};
	BpMenu.prototype.bindLeftClick = function (ele, func){
		ele.addEventListener(ele, func);
	};

	var BpMenuItem = function (){};
	BpMenuItem.prototype.initMenu = function (items){
		this.createMenu(items);
	};
	BpMenuItem.prototype.createItem = function (item){
		console.info(item);

		var ele = document.createElement('div');
		ele.innerHTML = item.name;
		/* ele[ele.textContent!==undefined ? 'textContent' : 'innerText'] = item.name;*/

		ele.className = 'bp-menu-item';

		var menuEle = this.menuEle;
		if ( item.click ){
			ele.classList.add('bp-menu-click');
			ele.addEventListener('mouseup', function (){
				console.info(menuEle);
				this.fadeOut();
				item.click.apply(this, arguments);
			}.bind(this), true);
		}else{
			ele.classList.add('bp-menu-lock');
		}

		return ele;
	};
	BpMenuItem.prototype.createMenu = function (items){
		/* 这里应该写些关于快捷键的设定 */

		this.menuEle = document.createElement('div');
		this.menuEle.className = 'bp-menu';

		items.forEach( function (item){
			 this.menuEle.appendChild(this.createItem.apply(this,[item]));
		}.bind(this) );
	};

	BpMenu.prototype.__proto__ = BpMenuItem.prototype;

	window.BpMenu = BpMenu;
	console.log('Bp-Menu has already registered.');
})();
var bpm;
window.addEventListener('load', function (){
	bpm = new BpMenu({
		ele: document.body,
		items: [
			{
				name: '查看专辑信息',
				click: function (){
					alert('clicked');
				},
			},
			{
				name: '下一首',
				click: function (){
					alert('版本未知');
				},
			},
			{
				name: '随机播放',
				click: function (){
					alert('random');
				},
			},
			{
				name: "单曲循环",
				click: function (){
					alert('loop');
				}
			},
			{
				name: 'bp-menu.js <br /> Power By <a href="http://vechk.com">vecHK</a>',
			}
		]
	});
});
