// const BAST_URL = 'http://192.168.3.7:3000'
const BAST_URL = 'https://app.tengfuchong.com'
export default ({ url =  '', data, header = {}, method = 'GET', timeout = 120000, showLoading = '加载中' } = {}) => {
	if (method.toUpperCase() === 'POST' && !header['content-type']) {
		header['content-type'] = 'application/x-www-form-urlencoded'
	}
	return new Promise((reslove, reject) => {
		if (showLoading) {
			uni.showLoading({
				title: showLoading
			});
		}
		uni.request({
		    url: BAST_URL + url, //仅为示例，并非真实接口地址。
		    data,
		    header,
			timeout,
			method,
		    success: (res) => {
				// uni.showToast({
				// 	title: JSON.stringify(res)
				// })
				reslove(res.data)
		    },
			fail: (err) => {
				// uni.showToast({
				// 	title: err.errMsg
				// })
				reject(err)
			},
			complete () {
				if (showLoading) {
					uni.hideLoading()
				}
			}
		})
	})
}