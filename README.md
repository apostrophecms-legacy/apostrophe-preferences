### Apostrophe Preferences

Apostrophe Prefrences introduces a site-wide preferences menu to Apostrophe editors. Given a schema, the preferences module will save and load preferences on every page across your site. Use this module when you wish to give users control over aspects of the site that don't fit neatly into page settings or site content.

In your `app.js` site configuration:
```javascript
modules: {
  ...
  'apostrophe-preferences': {
    schema: {
      addFields: [
        {
          name: 'myPreference',
          label: 'My Preference',
          type: 'string'
        }
      ]
    }
  }
}
```

In `outerLayout.html` where your Apostrophe site-wide menu is defined:
```twig
{{ aposPreferencesMenu(permissions) }}
```

In templates, your site preferences are now available in the `preferences` variable.

## Loading preferences where middleware doesn't run

This module now loads its content via middleware, so it's likely you'll always have the data in `req.extras.preferences`. However if you're writing a command line task, you might want to call the loader yourself:

```javascript
var req = apos.getTaskReq();
return site.modules['apostrophe-preferences'].loader(req, function(err) {
  // req.extras.preferences is available here
});
```

If `req.extras` is not already defined it will be created for you.


## Changelog

In version 0.5.21, area/widget loaders and joins are executed properly, and stale related objects are not stored in the preferences collection. For existing preferences, hit save once to get the benefit of this fix.

In version 0.5.20, a bug was fixed causing a crash if the `permissions` object does not exist in outerLayout.

In version 0.5.19, the loader began running as middleware. For bc reasons, the `self.loader` method is called from the middleware, and has a new provision to gracefully ignore double invocation.

In versions 0.5.17-0.5.18, provision was made to guarantee `req.extras.preferences` exists as an empty object even if there is no data yet.

In version 0.5.16, it became possible to call the loader easily yourself in situations where page loaders are not ordinarily called.

In version 0.5.14, important security provisions were added. You must pass the `permissions` object as was always documented above. If, as found in some of our older projects, you were previously passing `edit: true`, you will need to fix that as we are now checking permissions properly.

Starting with version 0.5.14 we also refresh the page fully after preferences are saved. Since the preferences are global they tend to impact elements in the outer layout. Since they are edited rarely there is no real penalty for refreshing the page.
