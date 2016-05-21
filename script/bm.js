"use strict";
(() => {
	let addProperty = function (context, property){
		Object.keys(property).forEach(
			key => context[key] = property[key]
		);
		return context;
	};
	class Intro {
		constructor(bindEle, items){
			/* 添加参数到对象上下文中 */
			addProperty(this, {
				bindEle,
				_items: items,
				items: [],
			});

			/* 初始化一些特效 */
			this.initAction();

			/* 初始化菜单栏 */
			this.initMenu();

			/* 绑定鼠标事件 */
			this.bindMouse(this.bindEle);
		}
	}
	class Menu extends Intro{
		setItem(item, bindEle){
			let itemEvent = {};
			if ( Array.isArray(item) ){
				bindEle.appendChild( this.fetchList(item, $c({
					class: ['bm-menu-column'],
				})));
			}
			let classList = ['bm-menu-item'];
			if ( item.type === 'lock' ) {
				classList.push('bm-menu-lock');
			}
			else if ( item.click ){
				classList.push('bm-menu-click');
				/* 如果click返回了true之类的数值的话，就不会淡出菜单栏 */
				itemEvent.mouseup = e => item.click(e) || this.fadeOut();
			}
			/*
			bm-item的title属性支持DOM或者PureObject
			如果是DOM的话则将其设置为 $c tag
			如果是PureObject的话则将其设置为 $c html
			*/
			if ( typeof(item.title) === 'object' ){
				var newEle = $c({
					class: classList,
					tag: item.title,
					event: itemEvent,
				});
			}else{
				var newEle = $c({
					class: classList,
					html: item.title,
					event: itemEvent,
				});
			}

			bindEle.appendChild(newEle);
			return newEle;
		}
		fetchList(items, bindEle){
			let bmThis = this;
			return $c({
				tag: bindEle,
				html: function (binEle){
					items.forEach((item, index) => {
						bmThis.items[index].ele = bmThis.setItem(item, bindEle);
					});
				}
			});
		}
		initDom(bindEle){
			let
			items = this._items,
			menuEle = $c({
				'class': 'bm-menu',
			});
			this.menuEle = menuEle;

			bindEle.appendChild( this.fetchList(items, menuEle) );
		}
		initMenu(){
			this.items = this.bindItems(this._items);
			this.initDom(this.bindEle);
		}
		bindItem(source){
			let bindItem = {
				source,
			};
			Object.defineProperties(bindItem, {
				title: {
					get(){
						return source.title;
					},
					set(set){
						source.title = set;
						$c({
							tag: this.ele,
							html: set
						});
					}
				},
				click: {
					get(){
						return source.click;
					}
				}
			});

			return bindItem;
		}
		bindItems(_items){
			let bindItems = [];
			_items.forEach((_item) =>
				bindItems.push(
					Array.isArray(_item) ? this.bindItems(_item, bindItems) : this.bindItem(_item)
				)
			);
			return bindItems;
		}
	}
	class Action extends Menu{
		initAction(){
			this.transitionSpeed = '382';
		}
		setTransition(b){
			this.menuEle.style.transition = b ? '' : 'opacity 0.'+ this.transitionSpeed +'s';
		}
		fadeIn(callback){
			this.isFadeIn = false;
			//console.log(this.menuEle);
			this.menuEle.style.opacity = '0';
			this.setTransition('clear');

			this.menuEle.style.display = 'block';
			setTimeout(function (){
				this.setTransition();
				this.menuEle.style.opacity = '1';

				callback && callback(this);
			}.bind(this), 16.7);


			setTimeout(function (){
				this.isFadeIn = true;
				callback && callback(this);
			}.bind(this), this.transitionSpeed);

		}
		fadeOut(callback){
			/*this.setTransition();*/
			setTimeout(function (){
				this.menuEle.style.opacity = '0';

				setTimeout(function (){
					this.menuEle.style.display = '';
					this.isFadeIn = false;
					callback && callback(this);
				}.bind(this), this.transitionSpeed);
			}.bind(this), 16.7);
		}
	}
	class Click extends Action{
		/* 从程序意图来讲，来到这儿的都不会是右键，大概 */
		leftClick(e){
			/* 点到的不是菜单栏项目的话…… */
			if ( !e.target.classList.contains('bm-menu-item') ){
				this.fadeOut();
			}
		}

		locate(e){
			let
			offsetX = e.pageX,
			offsetY = e.pageY,
			menuEle = this.menuEle;

			/* 如果 菜单栏 处于 display:none 的时候，offsetHeight 或者 offsetWidth 什么的都是 0 */
			this.menuEle.style.display = 'block';

			console.warn(e);

			if ( (e.pageX + menuEle.offsetWidth) > document.body.offsetWidth ){
				offsetX = e.pageX - menuEle.offsetWidth;
			}
			if ( (e.pageY + menuEle.offsetHeight) > document.body.offsetHeight ){
				offsetY = e.pageY - menuEle.offsetHeight;
			}

			/* 点到的不是菜单栏项目的话…… */
			if ( !e.target.classList.contains('bm-menu-item') ){

				this.menuEle.style.left = offsetX + 'px';
				this.menuEle.style.top = offsetY + 'px';
				this.fadeIn();
			}
		}
		checkTarget(checkEle, target){
			return checkEle === target;
		}
		/* 右键 */
		rightClick(e){
			/* 定位 */
			this.locate(e);

			/* 既然是点了右键，那就是要屏蔽掉右键菜单栏咯 */
			this.noContextMenu(e);
		}
	}
	class Bind extends Click{
		/* 取消浏览器的右键菜单栏 */
		noContextMenu(e){
			e.cancelBubble = true;
			e.returnValue = false;
			return false;
		}
		bindMouse(ele){
			if ( ele.oncontextmenu !== undefined ){
				ele.oncontextmenu = this.noContextMenu;
			}
			/* 判断左右键 */
			ele.addEventListener('mouseup', e =>
				this[
					(e.button === 2 || e.button === 3 ? 'right' : 'left') + 'Click'
				].apply(this, [e])
			);

			/*
			ele.addEventListener('mousedown', function (e){
				if ( this.isFadeIn ){
					// 点到的不是菜单栏项目的话……
					if ( !e.target.classList.contains('bm-menu-item') ){
						this.fadeOut();
					}
				}

			}.bind(this));
			*/
		}
	}
	class BM extends Bind{

	}
	BM.prototype.version = '0.2.0';

	window.BM = BM;
})();
