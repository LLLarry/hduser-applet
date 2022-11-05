
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