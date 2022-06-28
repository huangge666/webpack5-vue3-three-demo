import { createRouter, createWebHashHistory } from "vue-router";
import store from "../store/index";
const Index = () =>
  import(/* webpackChunkName: "index" */ "../views/index.vue");
const hash = createWebHashHistory();
const router = createRouter({
  history: hash,
  routes: [
    {
      path: "/",
      name: "index",
      component: Index,
      meta: {
        auth: false, // 是否需要登录
        keepAlive: false, // 是否缓存组件
      },
    },
    {
      path: "/tyt",
      name: "tyt",
      component: () =>
        import(/* webpackChunkName: "index" */ "@/views/game/tyt/index.vue"),
      meta: {
        auth: false, // 是否需要登录
        keepAlive: false, // 是否缓存组件
      },
    },
    {
      path: "/fj",
      name: "fj",
      component: () =>
        import(/* webpackChunkName: "index" */ "@/views/game/feiji/index.vue"),
      meta: {
        auth: false, // 是否需要登录
        keepAlive: false, // 是否缓存组件
      },
    },
    {
      path: "/test/demo",
      name: "demo",
      component: () =>
        import(/* webpackChunkName: "index" */ "@/views/test/demo.vue"),
      meta: {
        auth: false, // 是否需要登录
        keepAlive: false, // 是否缓存组件
      },
    },
  ],
});
// 全局路由钩子函数 对全局有效
router.beforeEach((to, from, next) => {
  let auth = to.meta.auth;
  let token = store.state.token;
  if (auth && !token) {
    // 需要登录
    next({
      path: "/login",
      query: {
        fullPath: to.fullPath,
      },
    });
  } else {
    next();
  }
});
export default router;
