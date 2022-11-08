import App from './App'
// // #ifndef VUE3
import Vue from 'vue'
import uView from '@/uni_modules/uview-ui'
// Api函数polyfill（目前为实验版本，如不需要，可删除！）';
import Polyfill from './polyfill/polyfill';
Polyfill.init();

// 全局mixins，用于实现setData等功能，请勿删除！';
import Mixin from './polyfill/mixins';

Vue.use(uView)
Vue.mixin(Mixin);
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// // #endif

// // #ifdef VUE3


// Vue.use(uView)

// uni.$u.config.unit = 'rpx'

// export function createApp() {
//   const app = createSSRApp(App)
//   return {
//     app
//   }
// }
// // #endif