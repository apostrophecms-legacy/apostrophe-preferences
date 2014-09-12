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