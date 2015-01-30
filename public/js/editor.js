/* global $ */
/* global apos, aposSchemas */

function AposPreferences() {
  // get the template
  var self = this;

  self.schema = apos.data.aposPreferences.schema;

  $('[data-apos-preferences-menu]').click( function() {

    // get the preferences
    var $el = apos.modalFromTemplate('.apos-template.apos-preferences-modal', {
      init: function(callback) {

        $.getJSON('/apos-preferences', function(data) {
          aposSchemas.populateFields($el, self.schema, data, function(){
            // set the save button listener
            $el.find('[data-save]').on('click', function() {
              $(this).addClass('apos-busy');
              savePreferences($el);
              return false;
            });

            return callback();
          });
        });

      }
    });
  });

  function savePreferences($el) {
    var data= {};
    aposSchemas.convertFields($el, self.schema, data, function(err) {
      if(err) {
        aposSchemas.scrollToError($el);
      }

      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/apos-preferences',
        data: data,
        success: function() {
          window.location.reload(true);
        },
        error: function() {
          apos.notification('There was an error communicating with the server.', { type: 'error' });
        }
      });
    });
  }
}

$(function() {
  window.aposPreferences = new AposPreferences();
});
