import Vue from 'vue'
import App from './App.vue'
import BaiduMap from 'vue-baidu-map'
import Axios from "axios";
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css' // 引入element-ui样式

Vue.use(Element);
Vue.use(BaiduMap, {
  // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
  ak: '7UNbz4033giyAA5fNTd36Hihu02WdHXP'
})

Vue.config.productionTip = false
Vue.prototype.$http = Axios;

new Vue({
  render: h => h(App),
}).$mount('#app')
