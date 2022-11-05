// const BAST_URL = 'http://192.168.3.7:3000'
const BAST_URL = 'http://www.tengfuchong.com.cn'
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
				reslove(res.data)
		    },
			fail: (err) => {
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