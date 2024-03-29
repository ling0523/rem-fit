type ProportionItemType = {
	breakpoint: number
	proportion: number
}
class RemFit {
	proportion: number | ProportionItemType[]
	useDpr?: boolean

	constructor(proportion: number | ProportionItemType[], useDpr?: boolean) {
		this.proportion = proportion
		this.useDpr = useDpr
		this.__checkParams()
	}

	//校验参数
	private __checkParams() {
		if ((typeof this.proportion != 'number' || isNaN(this.proportion)) && !Array.isArray(this.proportion)) {
			throw new TypeError('The first argument must be a number or array')
		}
		//如果dpr未赋值，则默认为true
		if (typeof this.useDpr != 'boolean') {
			this.useDpr = false
		}
		//如果是数组
		if (Array.isArray(this.proportion)) {
			const pass = this.proportion.every(item => {
				if (item && typeof item == 'object') {
					if (typeof item.breakpoint == 'number' && !isNaN(item.breakpoint) && item.breakpoint >= 0) {
						if (typeof item.proportion == 'number' && !isNaN(item.proportion) && item.proportion > 0) {
							return true
						}
					}
				}
				return false
			})
			if (!pass) {
				throw new TypeError('Invalid arguments')
			}
		}
	}

	//设置根元素字体大小
	private __setFontSize(proportion: number) {
		let fontSize = Number((this.__getScreenWidth() / proportion).toFixed(2))
		document.documentElement.setAttribute('data-standard', proportion + '')
		document.documentElement.style.setProperty('font-size', fontSize + 'px', 'important')
	}

	//获取屏幕宽度
	private __getScreenWidth() {
		return document.documentElement.offsetWidth > window.innerWidth ? document.documentElement.offsetWidth : window.innerWidth
	}

	//进行适配设置
	init() {
		//默认dpr为1
		let dpr = 1
		if (this.useDpr) {
			dpr = Math.round(window.devicePixelRatio || 1) //获取设备dpr
		}
		let scale = Number((1 / dpr).toFixed(2))
		let metaEle = document.querySelector('meta[name="viewport"]') //meta元素
		//如果meta元素不存在，则自动创建并加入到head里。
		if (!metaEle) {
			metaEle = document.createElement('meta') //创建
			metaEle.setAttribute('name', 'viewport')
			metaEle.setAttribute('content', 'width=device-width,user-scalable=no, initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale)
			document.getElementsByTagName('head')[0].appendChild(metaEle)
		} else {
			metaEle.setAttribute('content', 'width=device-width,user-scalable=no, initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale)
		}
		//proportion为数组
		if (Array.isArray(this.proportion)) {
			for (let item of this.proportion) {
				if (this.__getScreenWidth() >= item.breakpoint) {
					this.__setFontSize(item.proportion)
				}
			}
		} else {
			this.__setFontSize(this.proportion)
		}
		//将dpr绑定到html元素上
		document.documentElement.setAttribute('data-dpr', dpr + '')
	}

	//移除适配
	static remove() {
		//meta元素
		let metaEle = document.querySelector('meta[name="viewport"]')
		//如果meta元素存在，则重置视口
		if (metaEle) {
			metaEle.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no')
		}
		//清除对根元素的设置
		document.documentElement.removeAttribute('data-standard')
		document.documentElement.removeAttribute('data-dpr')
		document.documentElement.style.fontSize = ''
	}
}

export default RemFit
