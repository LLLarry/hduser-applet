<script>
import { authorization } from "@/api/home/index.js";
export default {
  onLaunch: function (options) {
    //调用API从本地缓存中获取数据
    var logs = uni.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    uni.setStorageSync("logs", logs); // console.log("全局onLaunch options==" + JSON.stringify(options))
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
        if (typeof cb == "function") {
          cb(this.userInfo);
        }
      } else {
        //调用登录接口
        var user = uni.getStorageSync("appuser") || {};

        if (user == null || user == {}) {
          uni.login({
            success: function (res) {
              authorization({ code: res.code }).then((res) => {
                var session_key = res.session_key;
                unionidval = res.unionid;
                openidval = res.openid;
                var obj = {
                  unionid: unionidval,
                  openid: openidval,
                  openidval,
                };
                uni.setStorageSync("appuser", obj);
              });
            },
          });
        }
      }
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
@import "@/uni_modules/uview-ui/index.scss";
@import "@/style/iconfont.css";
</style>
