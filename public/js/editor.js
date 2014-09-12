function AposPreferences() {
  // get the template
  self.schema = apos.data.aposPreferences.schema;

  $('[data-apos-preferences-menu]').click( function() {
    // get the preferences
    var $el = apos.modalFromTemplate('.apos-template.apos-preferences-modal', {});

    loadPreferences($el, function() {
      $el.find('[data-save]').on('click', function(e) {
        $(this).addClass('apos-busy');
        var data = {};
        savePreferences($el);
      });
    });
  });

  function loadPreferences($el, cb) {
    $.getJSON('/apos-preferences', function(data) {
      aposSchemas.populateFields($el, self.schema, data, cb);
    });
  }

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
        success: function(response) {
          apos.change('preferences');
        },
        error: function() {
          apos.notification('There was an error communicating with the server.', { type: 'error' });
        }
      })
    });
  }
}

$( function() {
  window.aposPreferences = new AposPreferences();
});