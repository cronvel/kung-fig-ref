/*
	Kung Fig Ref

	Copyright (c) 2015 - 2021 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const Dynamic = require( 'kung-fig-dynamic' ) ;
const common = require( 'kung-fig-common' ) ;



function Ref( path ) {
	this.refParts = null ;
	this.setRef( path ) ;
}

module.exports = Ref ;

Ref.prototype = Object.create( Dynamic.prototype ) ;
Ref.prototype.constructor = Ref ;
Ref.prototype.__prototypeUID__ = 'kung-fig/Ref' ;
Ref.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

Ref.serializerFnId = 'Ref' ;
Ref.prototype.clone = function() { return new Ref( this.refParts ) ; } ;



Ref.serializer = function( object ) {
	return {
		args: [ object.refParts ] ,
		overideKeys: [ '__isDynamic__' , '__isApplicable__' ]
	} ;
} ;



Ref.prototype.setRef = function( arg ) {
	if ( Array.isArray( arg ) ) {
		// Don't set, copy it
		this.refParts = Array.from( arg ) ;
	}
	else if ( typeof arg === 'string' ) {
		this.refParts = parseRefParts( arg , { i: 0 , iEndOfLine: arg.length } ) ;
	}
	else if ( arg === undefined || arg === null ) {
		this.refParts = [] ;
	}
	else {
		throw new TypeError( 'Ref#setRef() argument should be an array or a string' ) ;
	}
} ;



Ref.prototype.getPath = function( arg ) {
	return this.refParts[ this.refParts.length - 1 ] === '' ?  this.refParts.join( '.' ) + '.' :
		this.refParts.join( '.' ) ;
} ;



// Used by stats-modifiers
Ref.prototype.appendPart = function( part ) { this.refParts.push( part ) ; } ;



Ref.prototype.getValue = Ref.prototype.get = function( ctx , bound , getArray , fromApply ) {
	if ( ! this.__isDynamic__ && ( ! fromApply || ! this.__isApplicable__ ) ) { return getArray ? [ this ] : this ; }

	var part , lastValue ,
		value = ctx ,
		i = 0 ,
		iMax = this.refParts.length ;

	for ( ; i < iMax ; i ++ ) {
		part = this.refParts[ i ] ;

		if ( ! value || ( typeof value !== 'object' && typeof value !== 'function' ) ) { return getArray ? [] : undefined ; }

		if ( part && typeof part === 'object' && part.__prototypeUID__ === 'kung-fig/Ref' ) {
			part = part.get( ctx , false , false , fromApply ) ;
		}

		lastValue = value ;
		value = value[ part ] ;
	}

	if ( bound && typeof value === 'function' ) { value = value.bind( lastValue ) ; }

	// Autoboxing root, useful for Babel-Temple
	if ( ! iMax && value && typeof value === 'object'
		&& ( ( value instanceof Boolean ) || ( value instanceof Number ) || ( value instanceof String ) )
	) {
		value = value.valueOf() ;
	}

	return getArray ? [ value , lastValue , part ] : value ;
} ;



Ref.prototype.apply = function( ctx , bound , getArray ) { return this.get( ctx , bound , getArray , true ) ; } ;



Ref.prototype.set = function( ctx , v , defineOnly , unset ) {
	if ( ! this.__isDynamic__ || ! this.refParts.length || ! ctx || ( typeof ctx !== 'object' && typeof ctx !== 'function' ) ) {
		return ;
	}

	var part , lastPart , lastBase ,
		base = ctx ,
		i = 0 ,
		iMax = this.refParts.length - 1 ,
		key = this.refParts[ this.refParts.length - 1 ] ;

	if ( key && typeof key === 'object' && key.__prototypeUID__ === 'kung-fig/Ref' ) {
		key = key.get( ctx ) ;
	}

	for ( ; i < iMax ; i ++ ) {
		part = this.refParts[ i ] ;

		if ( part && typeof part === 'object' && part.__prototypeUID__ === 'kung-fig/Ref' ) {
			part = part.get( ctx ) ;
		}

		if ( ! base || ( typeof base !== 'object' && typeof base !== 'function' ) ) {
			if ( unset ) { return ; }

			// Auto-create
			if ( typeof part === 'number' ) { base = lastBase[ lastPart ] = [] ; }
			else { base = lastBase[ lastPart ] = {} ; }
		}

		lastBase = base ;
		lastPart = part ;
		base = base[ part ] ;
	}

	if ( ! base || ( typeof base !== 'object' && typeof base !== 'function' ) ) {
		if ( unset ) { return ; }

		// Auto-create
		if ( typeof key === 'number' ) { base = lastBase[ part ] = [] ; }
		else { base = lastBase[ part ] = {} ; }
	}

	if ( unset ) {
		delete base[ key ] ;
	}
	else if ( ! defineOnly || base[ key ] === undefined ) {
		base[ key ] = v ;
	}
} ;



// Shorthand to .set() with the 'defineOnly' argument on
Ref.prototype.define = function( ctx , v ) { return this.set( ctx , v , true ) ; } ;

// Shorthand to .set() with the 'unset' argument on
Ref.prototype.unset = function( ctx ) { return this.set( ctx , undefined , false , true ) ; } ;



Ref.prototype.getFinalValue = function( ctx , bound , getArray ) {
	var array , value ;

	if ( getArray ) {
		array = this.get( ctx , bound , true ) ;

		while ( array[ 0 ] && typeof array[ 0 ] === 'object' && array[ 0 ].__isDynamic__ ) {
			array = array[ 0 ].get( ctx , bound , true ) ;
		}

		return array ;
	}

	value = this ;

	while ( value && typeof value === 'object' && value.__isDynamic__ ) {
		value = value.get( ctx , bound ) ;
	}

	return value ;

} ;



// Call the function pointed by the Ref, and set 'this' to the second last element of the Ref, like javascript does.
Ref.prototype.callFn = function( ctx , ... args ) {
	if ( ! this.__isDynamic__ ) { return this ; }

	var array = this.get( ctx , false , true ) ;

	if ( typeof array[ 0 ] !== 'function' ) { throw new TypeError( 'Ref#callFn(): this does not point to a function' ) ; }

	return array[ 0 ].apply( array[ 1 ] , args ) ;
} ;



const STRINGIFIED_KEY_NEEDING_QUOTES_REGEX = /[\s"[\].$\x00-\x1f\x7f]/ ;

Ref.prototype.stringify = function() {
	var str = '$' ;

	this.refParts.forEach( ( part , index ) => {
		if ( part instanceof Ref ) {
			str += '[' + part.stringify() + ']' ;
		}
		else if ( typeof part === 'number' ) {
			str += '[' + part + ']' ;
		}
		else if ( STRINGIFIED_KEY_NEEDING_QUOTES_REGEX.test( part ) ) {
			str += '[' + common.stringifiers.stringifyQuotedString( part ) + ']' ;
		}
		else if ( index ) {
			str += '.' + part ;
		}
		else {
			str += part ;
		}
	} ) ;

	return str ;
} ;



const JS_KEY_NOT_NEEDING_QUOTES_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/ ;

Ref.prototype.toJs = function() {
	var str = 'ctx' ;

	this.refParts.forEach( ( part , index ) => {
		if ( part instanceof Ref ) {
			str += '?.[' + part.toJs() + ']' ;
		}
		else if ( typeof part === 'number' ) {
			str += '?.[' + part + ']' ;
		}
		else if ( JS_KEY_NOT_NEEDING_QUOTES_REGEX.test( part ) ) {
			str += '?.' + part ;
		}
		else {
			str += '?.[' + common.stringifiers.stringifyQuotedString( part ) + ']' ;
		}
	} ) ;

	return str ;
} ;



Ref.prototype.compile = function() {
	return new Function( 'ctx' , 'return ' + this.toJs() ) ;
} ;



/* Parser */



Ref.parseFromKfg = function( str , runtime , applicable ) {
	var v = new Ref( parseRefParts( str , runtime ) ) ;

	if ( applicable ) {
		v.__isDynamic__ = false ;
		v.__isApplicable__ = true ;
	}

	return v ;
} ;



Ref.parse = function( str , options ) {
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length
	} ;

	return new Ref( parseRefParts( str , runtime , options && options.noInitialDollar ) ) ;
} ;



function parseRefParts( str , runtime , noDollar ) {
	var parts = [] ;

	// This mode is useful for Babel Tower's parser
	if ( ! noDollar ) {
		if ( str[ runtime.i ] !== '$' ) {
			throw new SyntaxError( "This is not a Ref, it should start with a '$' sign" ) ;
		}

		runtime.i ++ ;
	}

	// Note: Kung-Fig Expression allow missing space before/after the parens
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] !== ' ' && str[ runtime.i ] !== '(' && str[ runtime.i ] !== ')' ) {
		if ( str[ runtime.i ] === '[' ) {
			runtime.i ++ ;
			parts.push( parseBracketedPart( str , runtime ) ) ;
		}
		else if ( str[ runtime.i ] === ']' ) {
			runtime.i ++ ;
			return parts ;
		}
		else {
			parts.push( parsePart( str , runtime ) ) ;
		}
	}

	return parts ;
}



function parsePart( str , runtime ) {
	var c , j = runtime.i , l = runtime.iEndOfLine , v = '' ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		// This construct is intended: this is much faster (15%)
		if ( c === 0x2e || c === 0x5b || c === 0x5d || c === 0x20 || c === 0x28 || c === 0x29 || c <= 0x1f ) {
			if ( c === 0x2e ) {
				// dot .
				v = str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c === 0x5b ) {
				// open bracket [
				v = str.slice( runtime.i , j ) ;
				runtime.i = j ;	// do not eat the bracket
				return v ;
			}
			else if ( c === 0x5d ) {
				// close bracket ]
				v = str.slice( runtime.i , j ) ;
				runtime.i = j ;	// do not eat the bracket
				return v ;
			}
			// Note: Kung-Fig Expression allow missing space before/after the parens
			else if ( c === 0x20 || c === 0x28 || c === 0x29 ) {
				// space
				v = str.slice( runtime.i , j ) ;
				runtime.i = j ;
				return v ;
			}
			else if ( c <= 0x1f ) {
				// illegal
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + runtime.lineNumber + ")" ) ;
			}
		}
	}

	v = str.slice( runtime.i , j ) ;
	runtime.i = j + 1 ;
	return v ;
}



function parseBracketedPart( str , runtime ) {
	var c , j = runtime.i , l = runtime.iEndOfLine , v ;

	c = str.charCodeAt( runtime.i ) ;

	if ( c >= 0x30 && c <= 0x39 ) {
		// digit
		v = parseIndex( str , runtime ) ;
	}
	else {
		switch ( c ) {
			case 0x22 :		// " double-quote: this is a string key
				runtime.i ++ ;
				v = common.parsers.parseQuotedString( str , runtime ) ;
				break ;
			case 0x24 :		// $ dollar: this is sub-reference
				v = new Ref( parseRefParts( str , runtime ) ) ;
				break ;
		}
	}

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		if ( c === 0x5d ) {
			// close bracket ]
			runtime.i = j + 1 ;
			if ( str[ runtime.i ] === '.' ) { runtime.i ++ ; }
			return v ;
		}
	}

	throw new SyntaxError( 'Ref parse error: missing closing bracket' ) ;
}



function parseIndex( str , runtime ) {
	var c , j = runtime.i , l = runtime.iEndOfLine ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;
		if ( c < 0x30 && c > 0x39 ) { break ; }
	}

	return parseInt( str.slice( runtime.i , j ) , 10 ) ;
}

