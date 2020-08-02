import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router';
import routes from './router/index';

Vue.config.productionTip = false

Vue.use(VueRouter);

new Vue({
  router: new VueRouter(routes),
  render: h => h(App),
}).$mount('#app')
