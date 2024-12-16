import { boot } from 'quasar/wrappers';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app, store }) => {
  app.config.globalProperties.$server_ip = 'http://127.0.0.1:5000/';
  store.use(({ store }) => {
    store.server_ip = 'http://127.0.0.1:5000/';
  });
});
