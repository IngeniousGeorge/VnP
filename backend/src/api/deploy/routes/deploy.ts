export default {
  routes: [
    {
      method: 'POST',
      path: '/deploy',
      handler: 'deploy.trigger',
      config: { auth: false },
    },
  ],
};
