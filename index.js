/* jshint node:true */

var _ = require('lodash');
var async = require('async');
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
    if (!(permissions && permissions.admin)) {
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
    if((!req.user) || (!req.user.permissions.admin)) {
      res.statusCode = 403;
      return res.send();
    }
    self._preferences.find().toArray( function(err, results) {
      if (results.length) {
        return res.json( _.omit(results[0], '_id') );
      } else {
        return res.send({ status: 'ok', errors: 'No Preferences Results' });
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
        return res.send({ status: 'Error', errors: err });
      } else {

        self._preferences.find().toArray( function(err, results) {
          var newPrefs = _.merge((results.length ? {
            _id: results[0]._id
          } : {}), values );
          // Discard _ properties that should never persist, however preserve _id
          // separately because clonePermanent expects JSON-safe data and
          // _id is not
          var _id = newPrefs._id;
          newPrefs = self._apos.clonePermanent(newPrefs);
          if (_id) {
            newPrefs._id = _id;
          }
          self._preferences.save(newPrefs, function(err) {
            return res.send({
              status: err ? 'Error' : 'ok',
              errors: err
            });
          });
        });
      }
    });
  });

  // Put the preferences in req.extras. If req.extras does not exist
  // it is created. This way the method can be called directly when
  // you're not generating an A2 page response, for instance from
  // an AJAX action.
  //
  // For bc reasons this method must be called self.loader, which makes
  // it a page loader. But we now also invoke it from middleware, to make
  // the data available in contexts like the notfound template. So there is
  // a built-in guard against loading twice.

  self.loader = function(req, callback) {
    if (req._aposPreferencesLoaded) {
      return setImmediate(callback);
    }
    req.extras = req.extras || {};
    return async.series([
      find,
      areas,
      joins
    ], callback);
    function find(callback) {
      return self._preferences.find().toArray( function(err, results) {
        req._aposPreferencesLoaded = true;
        req.extras.preferences = {};
        if (err) {
          return callback(err);
        }
        if (results.length) {
          req.extras.preferences = self._apos.clonePermanent(_.omit(results[0], '_id'));
        }
        return callback(null);
      });
    }
    function areas(callback) {
      return self._apos.callLoadersForPage(req, req.extras.preferences, callback);
    }
    function joins(callback) {
      return self._schemas.join(req, self._schema, req.extras.preferences, true, callback);
    }
  };

  self.middleware = [
    function(req, res, next) {
      return self.loader(req, function(err) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          req.template = 'serverError';
          return res.send(options.pages.renderPage(req, options.apos.options.rootDir + '/views/pages/serverError', {}, 'anon'));
        }
        return next();
      });
    }
  ];

  // Must wait at least until next tick to invoke callback!
  if (callback) {
    process.nextTick(function() { return callback(null); });
  }
};
