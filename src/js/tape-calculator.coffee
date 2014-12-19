window.TapeCalculator = class
    constructor: (options) ->
        @opened = options.opened
        @closed = options.closed
        @tapeChanged = options.tapeChanged
        @isOpen = false
            
        @clear true

    @binaryOperators = 
        '+': (calc) -> calc.accum += calc.value
        '-': (calc) -> calc.accum -= calc.value
        '*': (calc) -> calc.accum *= calc.value
        '/': (calc) -> calc.accum /= calc.value

    @isOperator = (key) ->
        return key in ['=','C'] or TapeCalculator.binaryOperators[key]?

    open: ->
        return if @isOpen
        @isOpen = true
        @opened()
        
    close: ->
        return unless @isOpen
            
        @clear true
        @isOpen = false
        @closed()

    clear: (clearTape) ->
        @accum = 0
        @value = null
        @tape = [] if clearTape
            
    getLastTapeLine: -> 
        len = @tape.length
        return null if len == 0
        return @tape[len - 1]

    reduce: ->
        lastLine = @getLastTapeLine()
            
        return false unless lastLine?.operator?
            
        lastLine.value = @value                
        lastLine.operator @
        return true

    handleKey: (key, value) ->
        @value = value ? @value ? 0

        switch key
            when '='
                if @reduce()
                    @tape.push symbol: '=', value: @accum
                    @value = entryValue = @accum
                else 
                    lastLine = @getLastTapeLine()
                        
                    if not lastLine? or lastLine.symbol == '' and lastLine.value != @value
                        @accum = @value
                        @tape.push symbol: '', value: @value                                                

            when 'C'
                lastLine = @getLastTapeLine()
                clearAll = not lastLine? or lastLine.symbol == 'C'
                @clear clearAll
                @tape.push value: 0, symbol: 'C' unless clearAll
                entryValue = ''

            else
                operator = TapeCalculator.binaryOperators[key]                                       
                return null unless operator?

                lastLine = @getLastTapeLine()
                    
                if not @reduce() and (not lastLine? or lastLine.value != @value)
                    @accum = @value
                    @tape.push symbol: '', value: @value
                        
                @tape.push symbol: key, operator: operator, value: null
                entryValue = ''

        @open()  
        @tapeChanged @tape
                          
        return entryValue
