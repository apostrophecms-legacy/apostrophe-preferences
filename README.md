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

## Loading preferences when you're not rendering a page

On regular Apostrophe pages, you can always see the preferences in `req.extras.preferences`. However it is also sometimes useful to have access to the preferences in an AJAX route, or another situation where page loaders are not called, such as in a task.

To do that, just call the loader yourself:

```javascript
return site.modules['apostrophe-preferences'].loader(req, function(err) {
  // req.extras.preferences is available here
});
```

If `req.extras` is not already defined it will be created for you.


## Changelog

In version 0.5.16, it became possible to call the loader easily yourself in situations where page loaders are not ordinarily called.

In version 0.5.14, important security provisions were added. You must pass the `permissions` object as was always documented above. If, as found in some of our older projects, you were previously passing `edit: true`, you will need to fix that as we are now checking permissions properly.

Starting with version 0.5.14 we also refresh the page fully after preferences are saved. Since the preferences are global they tend to impact elements in the outer layout. Since they are edited rarely there is no real penalty for refreshing the page.
