
/**
 * 查询元素信息，
 * context: 查询上下文环境this
 * selector: 选择器
 * range: 查询范围 0 查询一个元素 1 查询多个元素 2 查询视口
 */
export const getElementInfo = (context, selector, range = 0) => {
	return new Promise((resolve, reject) => {
		if (typeof selector === 'undefined') {
			return reject(new Error('参数错误'))
		} 
		if (selector === 0) {
			selector = null
			range = 0
		}
		const key = range === 2 ? 'selectViewport' :  range === 1 ? 'selectAll' : 'select'
		const query = uni.createSelectorQuery().in(context);
		if (key === 'selectViewport') {
			query.selectViewport().boundingClientRect(data => {
			  resolve(data)
			}).exec();
		} else {
			query[key](selector).boundingClientRect(data => {
			  resolve(data)
			}).exec();
		}
		
	})
}

/**
 * 解析url
 */
export const parseUrl = (string) => {
	const keyValues = string.split(/&/)
	return keyValues.reduce((acc, item) => {
		const result = item.split(/=/)
		if (result.length <= 1) {
			return acc
		}
		const [key, value] = result
		if (typeof acc[key] === 'undefined') {
			acc[key] = decodeURIComponent(value)
		} else {
			if (!(acc[key] instanceof Array)) {
				acc[key] = [acc[key]]
			}
			acc[key].push(decodeURIComponent(value))
		}
		return acc
	}, {})
}
/**
 * 
 * @param {string} base_url //扫码基础路径，在app.js中配置的全局变量
 * @param {string} url //要检测的地址
 * 返回值 {object} status：400 检验地址不通过，201 检验在线卡/设备号不通过 200是校验成功
 * type：1、校验设备地址 2、检验在线卡地址
 */
export const checkURL= (base_url,url)=>{
  const blueBaseUrl = 'https://www.tengfuchong.cn' //蓝牙设备基础路径 
  const list= url.split('?')
  const c_url= list[0]
  const c_data= parseUrl(list[1])
  const checkState= [
    {
      path: '/oauth2pay',
      regexp: /^\d{6}$/,
      key: 'code'
    },
    {
      path: '/oauth2Portpay',
      regexp: /^\d{7,8}$/,
      key: 'codeAndPort'
    },
    {
      path: '/oauth2online',
      regexp: /^[0-9A-F]{8}$/i,
      key: 'cardNumber'
    }, // https://www.tengfuchong.cn/applet/009506
	{
		path: '/applet',
		regexp: /^\d{7,8}$/,
		key: ''
	}
  ]
  for(let {path,regexp,key} of checkState){
    if(c_url.includes(base_url+path)){
      return {
        status: regexp.test(c_data[key]) ? 200 : 201, //200检验成功,201、设备号或在线卡检验不通过
        type: key === 'code' ? 1 : key === 'codeAndPort' ? 2 : key === 'cardNumber' ? 3 : 0, // 1扫设备号、2扫端口号、3扫在线卡
        ...c_data
      }
    } else {
		if (url.includes('https://www.tengfuchong.cn/applet/')) {
			const resu = url.replace('https://www.tengfuchong.cn/applet/', '')
			return {
			  status: 200,
			  type: 'applet',
			  code: resu.substr(0, 6),
			  port: resu.substr(6),
			}
		}
	}
  }
   return{
    status: 400, //地址不匹配
    ...c_data
  }
}