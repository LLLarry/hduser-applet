<script>
	export default {
		onLaunch: function (options) {
		    //调用API从本地缓存中获取数据
		    var logs = uni.getStorageSync('logs') || [];
		    logs.unshift(Date.now());
		    uni.setStorageSync('logs', logs); // console.log("全局onLaunch options==" + JSON.stringify(options))
		    // let q = decodeURIComponent(options.query.q)
		    // if (q) {
		    //   console.log("全局onLaunch onload url=" + q)
		    //   console.log("全局onLaunch onload 参数 flag=" + utils.getQueryString(q, 'flag'))
		    // }
		},
		globalData: {
		    userInfo: null,
		
		    getUserInfo: function (cb) {
		        var that = this;
		        var unionidval = null;
		        var openidval = null;
		
		        if (this.userInfo) {
		            if (typeof cb == 'function') {
		                cb(this.userInfo);
		            }
		        } else {
		            //调用登录接口
		            var user = uni.getStorageSync('appuser') || {};
		
		            if (user == null || user == {}) {
		                uni.login({
		                    success: function (res) {
		                        var l =
		                            'https://api.weixin.qq.com/sns/jscode2session?appid=wxd055087c1caa71a6&secret=c94124dcb3eeecc068802f4025ecb8a0&js_code=' +
		                            res.code +
		                            '&grant_type=authorization_code';
		                        uni.request({
		                            url: l,
		                            data: {},
		                            method: 'GET',
		                            // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
		                            // header: {}, // 设置请求的 header
		                            success: function (res) {
		                                console.log(res.data.session_key);
		                                var session_key = res.data.session_key;
		                                console.log(res.data.session_key);
		                                unionidval = res.data.unionid;
		                                openidval = res.data.openid;
		                                var obj = {
		                                    unionid: unionidval,
		                                    openid,
		                                    openidval
		                                };
		                                uni.setStorageSync('appuser', obj);
		                                console.log('openid===' + obj.openid);
		                                console.log('unionid===' + obj.unionid);
		                            },
		                            complete: function () {}
		                        });
		                    }
		                });
		            }
		        }
		    }
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";
	@import "@/static/css/iconfont.scss"
</style>
