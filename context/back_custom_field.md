# Strapi Admin Custom Field — Abandoned Attempt

## Goal

Display a hardcoded help text panel directly above the `Carte` repeatable field in the `Le Menu`
content type edit view. The panel would show keyboard shortcut reminders for the shop owner:

> Pour une nouvelle ligne : Shift (⇧) + Retour (↩)
> Pour le trait, copier/coller : ———

The panel should be read-only — purely decorative, storing no data.

## Intended Implementation

Strapi does not expose field-level injection zones, so the only way to place a component at a
specific position in the edit form (i.e. directly above `Carte`) is via a **custom field** — a
named field type that renders a custom React component instead of a standard input.

### Three files were involved

**`backend/src/index.ts`** — server-side registration (required for Strapi to validate the schema):
```ts
register({ strapi }) {
  strapi.customFields.register({
    name: 'aide-menu',
    plugin: 'global',
    type: 'string',
  });
}
```

**`backend/src/admin/app.ts`** — frontend registration (the React component rendered in the form):
```ts
app.customFields.register({
  name: 'aide-menu',
  pluginId: 'global',
  type: 'string',
  intlLabel: { id: 'global.aide-menu.label', defaultMessage: 'Aide à la saisie' },
  intlDescription: { id: 'global.aide-menu.description', defaultMessage: '' },
  components: {
    Input: async () => ({ default: AideMenuComponent }),
  },
});
```

**`backend/src/api/le-menu/content-types/le-menu/schema.json`** — field added before `Carte`:
```json
"Aide_saisie": {
  "type": "customField",
  "customField": "global::aide-menu"
}
```

### Why it looked correct

- `customFields` is typed and present on `StrapiApp` in v5
- `'string'` is in Strapi's `ALLOWED_TYPES` list
- The server-side registration is required (and was done) because Strapi validates the schema
  before the admin frontend loads — skipping it caused an immediate crash on startup
- The React component used `React.createElement` (no JSX), consistent with the rest of `app.ts`

## What Went Wrong

After all three changes were in place, the Strapi admin showed a white page on the Le Menu
edit view. The exact cause was not pinpointed, but the likely candidates are:

1. **React error boundary** — Strapi's content manager wraps each field in an error boundary.
   If `AideMenuComponent` throws for any reason (e.g. unexpected props, context mismatch,
   React version issues), the boundary may render nothing, causing the white page.

2. **Async lazy import format** — `Input: async () => ({ default: AideMenuComponent })` mimics
   a dynamic import, but Strapi v5 may expect the actual `import()` syntax rather than a
   manually constructed module object.

3. **Form context incompatibility** — In Strapi v5, the content manager uses a form system
   (possibly react-hook-form) that may expect `Input` components to register themselves with
   `field.onChange`/`field.value`. A component that ignores all props and renders static HTML
   may not integrate cleanly.

## Alternative to Explore

Instead of a custom field, try injecting via the content manager plugin's injection zones:

```ts
app.getPlugin('content-manager').injectComponent('editView', 'informations', {
  name: 'aide-menu',
  Component: AideMenuComponent,
});
```

This places the component in the right-hand sidebar of the edit view rather than inline in the
form. Less precise positioning, but simpler and less likely to break the page.

Alternatively, a sticky note on the shop owner's desk remains a perfectly valid solution.
