var assert = require('assert');
var Utilities = require('../dist/state/Utilities.js');

describe('Utilities test suite', function() {

  describe('Listening Components tests', function() {
    afterEach(function() {
      var componentKeys = Object.keys(Utilities.getListeningComponents());

      for (var idx = 0; idx < componentKeys.length; idx++) {
        Utilities.removeListeningComponent(componentKeys[idx]);
      }
    });

    it('returns empty object before components mounted', function() {
      assert.deepEqual(Utilities.getListeningComponents(), {});
    });

    it('mounts components correctly', function() {
      var sampleComponent = getSampleComponent();
      var id = Utilities.setListeningComponent(sampleComponent);
      var expected = {};
      expected[id] = sampleComponent;
      assert.deepEqual(Utilities.getListeningComponents(), expected);
    });

    it('assigns unique ids', function() {
      var ids = [];
      for (var runCount = 0; runCount < 10; runCount++) {
        ids.push(Utilities.setListeningComponent(getSampleComponent()));
        assert.equal(ids.indexOf(ids[ids.length - 1]), ids.length - 1);
      }
    });

    it('removes mounted components', function() {
      var sampleComponent = getSampleComponent();
      var id = Utilities.setListeningComponent(sampleComponent);
      Utilities.removeListeningComponent(id);
      assert.deepEqual(Utilities.getListeningComponents(), {});
    });

    it('returns true when a mounted component is removed', function() {
      var sampleComponent = getSampleComponent();
      var id = Utilities.setListeningComponent(sampleComponent);
      assert.ok(Utilities.removeListeningComponent(id));
    });
  });
});

function getSampleComponent() {
  return { doStuff: function() {} };
}
