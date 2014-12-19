(function() {
  var TapeCaculator;

  TapeCaculator = (function() {
    function TapeCaculator() {}

    TapeCaculator.prototype.sayHi = function() {
      return console.log('hi!');
    };

    return TapeCaculator;

  })();

}).call(this);

(function() {
  angular.module('tape-calculator').directive('ngTapeCalculator', function() {
    return {
      link: function(scope, elem) {
        return console.log('hello world!');
      }
    };
  });

}).call(this);
