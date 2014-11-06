/* jshint node:true */

var _ = require('lodash');

module.exports = aposPreferences;

function aposPreferences(options, callback) {
  return new aposPreferences.Construct(options, callback);
}

aposPreferences.Construct = function(options, callback) {
  var self = this;

  // you need a schema since there isn't one by default!
  if(!options.schema) {
    throw new Error('apos-preferences: You need to specify a schema in order to use this module.');
  }

  // =================================================================
  // CONFIGURATION
  // =================================================================

  self._app = options.app;
  self._apos = options.apos;
  self._schemas = options.schemas;
  self._schema = self._schemas.compose(options.schema);

  self._preferences = self._apos.db.collection('aposPreferences');

  self._apos.mixinModuleAssets(self, 'aposPreferences', __dirname, options);
  self.pushAsset('script', 'editor', { when: 'user' });
  self.pushAsset('template', 'manage', { when: 'user', data: { fields: self._schema } });

  self._apos.addLocal('aposPreferencesMenu', function(permissions) {
    if (!permissions.admin) {
      // Oh heck no
      return '';
    }
    return self.render(__dirname + '/views/preferencesMenu', {});
  });

  self._apos.pushGlobalData({
    aposPreferences: {
      schema: self._schema
    }
  });

  options.modules = (options.modules || []).concat([ { dir: __dirname, name: 'events' } ]);

  // =================================================================
  // ROUTES
  // =================================================================

  self._app.get('/apos-preferences', function(req, res) {
    console.log(req.user.permissions);
    if((!req.user) || (!req.user.permissions.admin)) {
      res.statusCode = 403;
      return res.send();
    }
    self._preferences.find().toArray( function(err, results) {
      if (results.length) {
        return res.json( _.omit(results[0], '_id') );
      } else {
        return res.send({ staus: 'ok', errors: 'No Preferences Results' });
      }
    });
  });


  self._app.post('/apos-preferences', function(req, res) {
    if((!req.user) || (!req.user.permissions.admin)) {
      res.statusCode = 403;
      return res.send();
    }
    var values = {};
    return self._schemas.convertFields(req, self._schema, 'form', req.body, values, function(err) {
      if (err) {
        return res.send({ staus: 'Error', errors: err });
      } else {

        self._preferences.find().toArray( function(err, results) {
          var newPrefs = _.merge((results.length ? results[0] : {}), values );
          self._preferences.save(newPrefs, function(err) {
            return res.send({
              staus: err ? 'Error' : 'ok',
              errors: err
            });
          });
        });
      }
    });
  });

  // Put the preferences in req.extras
  self.loader = function(req, callback) {
    if (req && req.extras) {
      self._preferences.find().toArray( function(err, results) {
        if (results.length) {
          req.extras.preferences = _.omit(results[0], '_id');
        }
        return callback(null);
      });
    } else {
      return callback(null);
    }
  };

  // Must wait at least until next tick to invoke callback!
  if (callback) {
    process.nextTick(function() { return callback(null); });
  }
};
