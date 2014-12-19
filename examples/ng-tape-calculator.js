(function() {
  window.TapeCalculator = (function() {
    function _Class(options) {
      this.opened = options.opened;
      this.closed = options.closed;
      this.tapeChanged = options.tapeChanged;
      this.isOpen = false;
      this.clear(true);
    }

    _Class.binaryOperators = {
      '+': function(calc) {
        return calc.accum += calc.value;
      },
      '-': function(calc) {
        return calc.accum -= calc.value;
      },
      '*': function(calc) {
        return calc.accum *= calc.value;
      },
      '/': function(calc) {
        return calc.accum /= calc.value;
      }
    };

    _Class.isOperator = function(key) {
      return (key === '=' || key === 'C') || (TapeCalculator.binaryOperators[key] != null);
    };

    _Class.prototype.open = function() {
      if (this.isOpen) {
        return;
      }
      this.isOpen = true;
      return this.opened();
    };

    _Class.prototype.close = function() {
      if (!this.isOpen) {
        return;
      }
      this.clear(true);
      this.isOpen = false;
      return this.closed();
    };

    _Class.prototype.clear = function(clearTape) {
      this.accum = 0;
      this.value = null;
      if (clearTape) {
        return this.tape = [];
      }
    };

    _Class.prototype.getLastTapeLine = function() {
      var len;
      len = this.tape.length;
      if (len === 0) {
        return null;
      }
      return this.tape[len - 1];
    };

    _Class.prototype.reduce = function() {
      var lastLine;
      lastLine = this.getLastTapeLine();
      if ((lastLine != null ? lastLine.operator : void 0) == null) {
        return false;
      }
      lastLine.value = this.value;
      lastLine.operator(this);
      return true;
    };

    _Class.prototype.handleKey = function(key, value) {
      var clearAll, entryValue, lastLine, operator, _ref;
      this.value = (_ref = value != null ? value : this.value) != null ? _ref : 0;
      switch (key) {
        case '=':
          if (this.reduce()) {
            this.tape.push({
              symbol: '=',
              value: this.accum
            });
            this.value = entryValue = this.accum;
          } else {
            lastLine = this.getLastTapeLine();
            if ((lastLine == null) || lastLine.symbol === '' && lastLine.value !== this.value) {
              this.accum = this.value;
              this.tape.push({
                symbol: '',
                value: this.value
              });
            }
          }
          break;
        case 'C':
          lastLine = this.getLastTapeLine();
          clearAll = (lastLine == null) || lastLine.symbol === 'C';
          this.clear(clearAll);
          if (!clearAll) {
            this.tape.push({
              value: 0,
              symbol: 'C'
            });
          }
          entryValue = '';
          break;
        default:
          operator = TapeCalculator.binaryOperators[key];
          if (operator == null) {
            return null;
          }
          lastLine = this.getLastTapeLine();
          if (!this.reduce() && ((lastLine == null) || lastLine.value !== this.value)) {
            this.accum = this.value;
            this.tape.push({
              symbol: '',
              value: this.value
            });
          }
          this.tape.push({
            symbol: key,
            operator: operator,
            value: null
          });
          entryValue = '';
      }
      this.open();
      this.tapeChanged(this.tape);
      return entryValue;
    };

    return _Class;

  })();

}).call(this);

(function() {
  angular.module('tape-calculator', []).directive('ngTapeCalculator', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attrs, ngModel) {
        var addCommasToInteger, evaluate, getEntryValue, operatorClasses, removeTapeWrapper, renderTape, renderTapeWrapper, tapeEl, tapeWrapper, updateModelAndClose;
        tapeWrapper = void 0;
        tapeEl = void 0;
        renderTapeWrapper = function() {
          var elemBounding, tapeLeft;
          elemBounding = elem[0].getBoundingClientRect();
          tapeWrapper = angular.element("<div class='tape-calculator-wrapper'></div>");
          angular.element(document.body).append(tapeWrapper);
          tapeLeft = elemBounding.left + elemBounding.width - 150;
          tapeWrapper.css('left', "" + tapeLeft + "px");
          tapeWrapper.css('top', "" + elemBounding.top + "px");
          tapeEl = angular.element("<div class='tape-calculator-container'></div>");
          tapeWrapper.append(tapeEl);
          return tapeEl = tapeEl[0];
        };
        removeTapeWrapper = function() {
          tapeWrapper.remove();
          tapeWrapper = void 0;
          return tapeEl = void 0;
        };
        addCommasToInteger = function(val) {
          if (val == null) {
            return '';
          }
          return val.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        };
        operatorClasses = {
          '=': 'tape-calculator-line-equals',
          'C': 'tape-calculator-line-equals'
        };
        renderTape = function(tape) {
          var innerHtml, tapeLine, _i, _len;
          innerHtml = '';
          for (_i = 0, _len = tape.length; _i < _len; _i++) {
            tapeLine = tape[_i];
            innerHtml += "<div class='" + operatorClasses[tapeLine.symbol] + "' style='clear: both'> <div class='tape-calculator-number'> " + (addCommasToInteger(tapeLine.value)) + " </div> <div class='tape-calculator-operator'> " + tapeLine.symbol + " </div> </div>";
          }
          return tapeEl.innerHTML = innerHtml;
        };
        getEntryValue = function() {
          return parseFloat(elem.val()) || null;
        };
        evaluate = function() {
          var entryValue;
          entryValue = getEntryValue();
          return scope.calculator.handleKey('=', entryValue);
        };
        updateModelAndClose = function() {
          var accum;
          accum = scope.calculator.accum;
          scope.$eval("" + attrs.ngModel + " = " + accum);
          scope.$apply();
          return scope.calculator.close();
        };
        elem.on('blur', function(evt) {
          var _ref;
          if ((_ref = scope.calculator) != null ? _ref.isOpen : void 0) {
            evaluate();
            return updateModelAndClose();
          }
        });
        elem.on('keydown', function(evt) {
          var entry, entryValue, _ref;
          if (!((_ref = scope.calculator) != null ? _ref.isOpen : void 0)) {
            return true;
          }
          switch (evt.which) {
            case 13:
              entryValue = getEntryValue();
              if (scope.calculator.getLastTapeLine().symbol === '=') {
                evaluate();
                updateModelAndClose();
              } else {
                entry = evaluate();
                elem.val(entry);
              }
              evt.preventDefault();
              return false;
            case 27:
              updateModelAndClose();
              evt.preventDefault();
              return false;
          }
          return true;
        });
        return elem.on('keypress', function(evt) {
          var entry, entryValue, key, treatAsMinusSign;
          key = String.fromCharCode(evt.which).toUpperCase();
          treatAsMinusSign = evt.target.selectionStart === evt.target.selectionEnd && elem.val().length !== 0 && evt.target.selectionStart === elem.val().length;
          if (!TapeCalculator.isOperator(key) || key === '-' && !treatAsMinusSign) {
            return true;
          }
          if (scope.calculator == null) {
            scope.calculator = new TapeCalculator({
              opened: renderTapeWrapper,
              closed: removeTapeWrapper,
              tapeChanged: renderTape
            });
          }
          entryValue = getEntryValue();
          entry = scope.calculator.handleKey(key, entryValue);
          if (entry != null) {
            elem.val(entry);
          }
          evt.preventDefault();
          return false;
        });
      }
    };
  });

}).call(this);
