angular.module('tape-calculator', []).directive 'ngTapeCalculator',
->
    {
        restrict: 'A'
        require: 'ngModel'
        link: (scope, elem, attrs, ngModel) ->                   
            tapeWrapper = undefined
            tapeEl = undefined

            renderTapeWrapper = ->
                elemBounding = elem[0].getBoundingClientRect()
                tapeWrapper = angular.element "<div class='tape-calculator-wrapper'></div>"
                angular.element(document.body).append tapeWrapper
                tapeLeft = elemBounding.left + elemBounding.width - tapeWrapper.width
                tapeWrapper.css 'left', "#{tapeLeft}px"
                tapeWrapper.css 'top', "#{elemBounding.top}px"
                tapeEl = angular.element "<div class='tape-calculator-container'></div>"
                tapeWrapper.append tapeEl
                tapeEl = tapeEl[0]

            removeTapeWrapper = ->
                tapeWrapper.remove()
                tapeWrapper = undefined
                tapeEl = undefined

            addCommasToInteger = (val) ->
                return '' unless val?
                val.toString().replace /(\d)(?=(\d{3})+(?!\d))/g, '$1,'

            operatorClasses =
                '=': 'tape-calculator-line-equals'
                'C': 'tape-calculator-line-equals'

            renderTape = (tape) ->
                innerHtml = ''
                for tapeLine in tape
                    innerHtml += "
                        <div class='clearfix #{operatorClasses[tapeLine.symbol]}'>
                            <div class='tape-calculator-number'>
                                #{ addCommasToInteger(tapeLine.value) }
                            </div>
                            <div class='tape-calculator-operator'>
                                #{ tapeLine.symbol }
                            </div>
                        </div>"
                tapeEl.innerHTML = innerHtml

            getEntryValue = -> parseFloat(elem.val()) || null
            
            evaluate = ->
                entryValue = getEntryValue()
                return scope.calculator.handleKey '=', entryValue

            updateModelAndClose = ->
                accum = scope.calculator.accum
                scope.$eval "#{attrs.ngModel} = #{accum}"
                scope.$apply()                
                scope.calculator.close()

            elem.on 'blur', (evt) -> 
                if scope.calculator?.isOpen
                    evaluate()
                    updateModelAndClose()
                                                         
            elem.on 'keydown', (evt) ->
                return true unless scope.calculator?.isOpen
                
                switch evt.which 
                    when 13 # Enter
                        entryValue = getEntryValue()
                        
                        if scope.calculator.getLastTapeLine().symbol == '='
                            evaluate()
                            updateModelAndClose()
                        else
                            entry = evaluate()
                            elem.val entry
                        
                        return false
                        
                    when 27 # Esc  
                        updateModelAndClose()
                        return false

                return true

            elem.on 'keypress', (evt) ->
                key = String.fromCharCode(evt.which).toUpperCase()
                
                # We'll treat '-' as a minus sign instead of a unary negative if:
                #  1. there is no selection, and
                #  2. the textbox contains characters, and
                #  3. the caret is at the end of the text
                
                treatAsMinusSign = 
                    evt.target.selectionStart == evt.target.selectionEnd and
                    elem.val().length != 0 and
                    evt.target.selectionStart == elem.val().length

                return true if not TapeCalculator.isOperator(key) or key == '-' and not treatAsMinusSign
                                          
                if not scope.calculator?
                    scope.calculator = new TapeCalculator 
                        opened: renderTapeWrapper
                        closed: removeTapeWrapper
                        tapeChanged: renderTape
                
                entryValue = getEntryValue()
                entry = scope.calculator.handleKey key, entryValue
                
                if entry?
                    elem.val entry
                    evt.preventDefault()
                    return false
                    
                return true
    }
    