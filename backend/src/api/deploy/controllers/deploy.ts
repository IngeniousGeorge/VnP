export default {
  async trigger(ctx) {
    const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;

    if (!hookUrl) {
      ctx.status = 500;
      ctx.body = { error: 'NETLIFY_BUILD_HOOK_URL not configured' };
      return;
    }

    try {
      const response = await fetch(hookUrl, { method: 'POST' });
      if (!response.ok) {
        ctx.status = 502;
        ctx.body = { error: 'Netlify build hook failed' };
        return;
      }
      ctx.body = { ok: true };
    } catch {
      ctx.status = 500;
      ctx.body = { error: 'Failed to reach Netlify' };
    }
  },
};
