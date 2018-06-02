/*
	Kung Fig Ref
	
	Copyright (c) 2015 - 2018 Cédric Ronvel
	
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

/* global describe, it, before, after */

"use strict" ;



//var kungFig = require( '../lib/kungFig.js' ) ;
var Ref = require( '..' ) ;



/*
function deb( v )
{
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}
*/



describe( "Ref" , function() {
	
	describe( "Get" , function() {
		
		it( "parse and get a simple ref" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 2 ,
				sub: {
					c: 3 ,
					sub: {
						d: 4
					}
				}
			} ;
			
			ref_ = Ref.parse( '$x' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;
			
			ref_ = Ref.parse( '$x.y.z' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;
			
			ref_ = Ref.parse( '$a' ) ;
			expect( ref_.get( ctx ) ).to.be( 1 ) ;
			
			ref_ = Ref.parse( '$b' ) ;
			expect( ref_.get( ctx ) ).to.be( 2 ) ;
			
			ref_ = Ref.parse( '$sub' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx.sub ) ;
			
			ref_ = Ref.parse( '$sub.c' ) ;
			expect( ref_.get( ctx ) ).to.be( 3 ) ;
			
			ref_ = Ref.parse( '$sub.sub' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx.sub.sub ) ;
			
			ref_ = Ref.parse( '$sub.sub.d' ) ;
			expect( ref_.get( ctx ) ).to.be( 4 ) ;
			
			ref_ = Ref.parse( '$e' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;
			
			ref_ = Ref.parse( '$e.f.g' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;
		} ) ;
		
		it( "parse and get a ref on a context having arrays" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] , { array: [ 'seven' , 'eight' ] } ]
			} ;
			
			ref_ = Ref.parse( '$array' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx.array ) ;
			
			ref_ = Ref.parse( '$array[0]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'one' ) ;
			
			ref_ = Ref.parse( '$array[10]' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;
			
			ref_ = Ref.parse( '$array[10][10]' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;
			
			ref_ = Ref.parse( '$array[2][1]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'four' ) ;
			
			ref_ = Ref.parse( '$array[3]' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx.array[3] ) ;
			
			ref_ = Ref.parse( '$array[3].array' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx.array[3].array ) ;
			
			ref_ = Ref.parse( '$array[3].array[1]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'eight' ) ;
			
			ref_ = Ref.parse( '$[1]' ) ;
			expect( ref_.get( ctx.array ) ).to.be( 'two' ) ;
			
			ref_ = Ref.parse( '$[2][1]' ) ;
			expect( ref_.get( ctx.array ) ).to.be( 'four' ) ;
			
			ref_ = Ref.parse( '$[3].array[1]' ) ;
			expect( ref_.get( ctx.array ) ).to.be( 'eight' ) ;
		} ) ;
		
		it( "parse and get a ref with quoted keys" , function() {
			var ref_ ;
			
			var ctx = {
				key: 'value' ,
				"a key with spaces": {
					"another one": 'sure'
				}
			} ;
			
			ref_ = Ref.parse( '$key' ) ;
			expect( ref_.get( ctx ) ).to.be( 'value' ) ;
			
			ref_ = Ref.parse( '$["key"]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'value' ) ;
			
			ref_ = Ref.parse( '$["a key with spaces"]' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx["a key with spaces"] ) ;
			
			ref_ = Ref.parse( '$["a key with spaces"]["another one"]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'sure' ) ;
		} ) ;
		
		it( "parse and get a complex ref (ref having refs)" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 3 ,
				c: 0 ,
				k1: 'someKey' ,
				k2: 'anotherKey' ,
				array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] ] ,
				object: {
					someKey: 'value' ,
					anotherKey: 'another value'
				}
			} ;
			
			ref_ = Ref.parse( '$array[$a]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'two' ) ;
			
			ref_ = Ref.parse( '$array[$b]' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx.array[3] ) ;
			
			ref_ = Ref.parse( '$array[$c]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'one' ) ;
			
			ref_ = Ref.parse( '$object[$k1]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'value' ) ;
			
			ref_ = Ref.parse( '$object[$k2]' ) ;
			expect( ref_.get( ctx ) ).to.be( 'another value' ) ;
		} ) ;
		
		it( "function in context" , function() {
			var ref_ ;
			
			var ctx = {
				fn: function myFunc() {}
			} ;
			
			ctx.fn.prop = 'val' ;
			
			ref_ = Ref.parse( '$fn' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx.fn ) ;
			
			ref_ = Ref.parse( '$fn.name' ) ;
			expect( ref_.get( ctx ) ).to.be( 'myFunc' ) ;
			
			ref_ = Ref.parse( '$fn.prop' ) ;
			expect( ref_.get( ctx ) ).to.be( 'val' ) ;
		} ) ;
	} ) ;
	
		
	describe( "Set" , function() {
		
		it( "set a simple ref" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 2 ,
				sub: {
					c: 3 ,
					sub: {
						d: 4
					}
				}
			} ;
			
			ref_ = Ref.parse( '$a' ) ;
			ref_.set( ctx , 7 ) ;
			expect( ctx.a ).to.be( 7 ) ;
			
			ref_ = Ref.parse( '$sub.c' ) ;
			ref_.set( ctx , 22 ) ;
			expect( ctx.sub.c ).to.be( 22 ) ;
			
			ref_ = Ref.parse( '$sub.sub' ) ;
			ref_.set( ctx , 'hello' ) ;
			expect( ctx.sub.sub ).to.be( 'hello' ) ;
			
			expect( ctx ).to.equal( {
				a: 7 ,
				b: 2 ,
				sub: {
					c: 22 ,
					sub: 'hello'
				}
			} ) ;
		} ) ;
		
		it( "set a ref on a context having arrays" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] , { array: [ 'seven' , 'eight' ] } ]
			} ;
			
			ref_ = Ref.parse( '$array[0]' ) ;
			ref_.set( ctx , 'ONE' ) ;
			expect( ctx.array[0] ).to.be( 'ONE' ) ;
			
			ref_ = Ref.parse( '$array[3][1]' ) ;
			ref_.set( ctx , 4 ) ;
			expect( ctx.array[3][1] ).to.be( 4 ) ;
		} ) ;
		
		it( "set a complex ref (ref having refs)" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 3 ,
				c: 0 ,
				k1: 'someKey' ,
				k2: 'anotherKey' ,
				array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] ] ,
				object: {
					someKey: 'value' ,
					anotherKey: 'another value'
				}
			} ;
			
			ref_ = Ref.parse( '$array[$a]' ) ;
			ref_.set( ctx , 2 ) ;
			expect( ctx.array[1] ).to.be( 2 ) ;
			
			ref_ = Ref.parse( '$object[$k1]' ) ;
			ref_.set( ctx , 'my value' ) ;
			expect( ctx.object.someKey ).to.be( 'my value' ) ;
			
			ref_ = Ref.parse( '$object[$k2]' ) ;
			ref_.set( ctx , 'my other value' ) ;
			expect( ctx.object.anotherKey ).to.be( 'my other value' ) ;
		} ) ;
		
		it( "set and the auto-creation feature" , function() {
			var ref_ ;
			
			var ctx = {} ;
			
			ref_ = Ref.parse( '$a.b' ) ;
			ref_.set( ctx , 7 ) ;
			
			expect( ctx ).to.equal( {
				a: { b: 7 }
			} ) ;
			
			ref_ = Ref.parse( '$c.d.e.f' ) ;
			ref_.set( ctx , 'Gee!' ) ;
			
			expect( ctx ).to.equal( {
				a: { b: 7 } ,
				c: { d: { e: { f: 'Gee!' } } }
			} ) ;
			
			ref_ = Ref.parse( '$arr[1]' ) ;
			ref_.set( ctx , 'one' ) ;
			
			expect( ctx ).to.equal( {
				a: { b: 7 } ,
				c: { d: { e: { f: 'Gee!' } } } ,
				arr: [ undefined , 'one' ]
			} ) ;
			
			ref_ = Ref.parse( '$arr2[3][2][1]' ) ;
			ref_.set( ctx , 'nested' ) ;
			
			expect( ctx ).to.equal( {
				a: { b: 7 } ,
				c: { d: { e: { f: 'Gee!' } } } ,
				arr: [ undefined , 'one' ] ,
				arr2: [ undefined , undefined , undefined , [ undefined , undefined , [ undefined , 'nested' ] ] ]
			} ) ;
		} ) ;
		
		it( "function in context" , function() {
			var ref_ ;
			
			var ctx = {
				fn: function myFunc() {}
			} ;
			
			ctx.fn.prop = 'val' ;
			
			ref_ = Ref.parse( '$fn.prop' ) ;
			ref_.set( ctx , true ) ;
			expect( ctx.fn.prop , true ) ;
			
			ref_ = Ref.parse( '$fn.prop2' ) ;
			ref_.set( ctx , 'plop' ) ;
			expect( ctx.fn.prop2 ).to.be( 'plop' ) ;
		} ) ;
	} ) ;
	
	describe( "Define" , function() {
		
		it( "define a simple ref" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 2 ,
				sub: {
					c: 3 ,
					sub: {
						d: 4
					}
				}
			} ;
			
			ref_ = Ref.parse( '$a' ) ;
			ref_.define( ctx , 7 ) ;
			expect( ctx.a ).to.be( 1 ) ;
			
			ref_ = Ref.parse( '$e' ) ;
			ref_.define( ctx , 7 ) ;
			expect( ctx.e ).to.be( 7 ) ;
			
			ref_ = Ref.parse( '$sub.c' ) ;
			ref_.define( ctx , 22 ) ;
			expect( ctx.sub.c ).to.be( 3 ) ;
			
			ref_ = Ref.parse( '$sub.f' ) ;
			ref_.define( ctx , 22 ) ;
			expect( ctx.sub.f ).to.be( 22 ) ;
			
			ref_ = Ref.parse( '$sub.sub' ) ;
			ref_.define( ctx , 'hello' ) ;
			expect( ctx.sub.sub ).to.equal( { d: 4 } ) ;
			
			expect( ctx ).to.equal( {
				a: 1 ,
				b: 2 ,
				e: 7 ,
				sub: {
					c: 3 ,
					f: 22 ,
					sub: {
						d: 4
					}
				}
			} ) ;
		} ) ;
	} ) ;
		
	describe( "Unset" , function() {
		
		it( "define a simple ref" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 2 ,
				sub: {
					c: 3 ,
					sub: {
						d: 4
					}
				}
			} ;
			
			ref_ = Ref.parse( '$a' ) ;
			ref_.unset( ctx ) ;
			expect( ctx.a ).to.be( undefined ) ;
			
			ref_ = Ref.parse( '$e' ) ;
			ref_.unset( ctx ) ;
			expect( ctx.e ).to.be( undefined ) ;
			
			ref_ = Ref.parse( '$sub.sub' ) ;
			ref_.unset( ctx ) ;
			expect( ctx.sub.sub ).to.be( undefined ) ;
			
			expect( ctx ).to.equal( {
				b: 2 ,
				sub: {
					c: 3
				}
			} ) ;
			
			ref_ = Ref.parse( '$sub' ) ;
			ref_.unset( ctx ) ;
			expect( ctx.sub ).to.be( undefined ) ;
			
			expect( ctx ).to.equal( {
				b: 2
			} ) ;
		} ) ;
	} ) ;
		
	describe( "Calling a function" , function() {
		
		it( "parse and call a function pointed by a ref" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 2 ,
				fn: function( a , b , c ) {
					return a + b + c + this.a + this.b + this.sub.c ;
				} ,
				sub: {
					c: 3 ,
					fn: function( a ) {
						return a + this.c + this.sub.d ;
					} ,
					sub: {
						d: 4 ,
						fn: function( a ) {
							return a + this.d ;
						}
					}
				}
			} ;
			
			ref_ = Ref.parse( '$fn' ) ;
			expect( ref_.callFn( ctx , 4 , 5 , 6 ) ).to.be( 21 ) ;
			
			ref_ = Ref.parse( '$sub.fn' ) ;
			expect( ref_.callFn( ctx , 10 ) ).to.be( 17 ) ;
			
			ref_ = Ref.parse( '$sub.sub.fn' ) ;
			expect( ref_.callFn( ctx , -5 ) ).to.be( -1 ) ;
		} ) ;
	} ) ;
	
	describe( "Misc" , function() {
	
		it( "Ref#getFinalValue()" , function() {
			var ctx = { a: 42 } ;
			ctx.b = Ref.create( '$a' ) ;
			ctx.c = Ref.create( '$b' ) ;
			ctx.d = Ref.create( '$c' ) ;
			expect( ctx.b.getFinalValue( ctx ) ).to.be( 42 ) ;
			expect( ctx.c.getFinalValue( ctx ) ).to.be( 42 ) ;
			expect( ctx.d.getFinalValue( ctx ) ).to.be( 42 ) ;
		} ) ;
		
		it( "Ref#getRecursiveFinalValue()" , function() {
			var ctx = { a: 42 , container: {} } ;
			ctx.container.b = Ref.create( '$a' ) ;
			ctx.container.c = Ref.create( '$container.b' ) ;
			ctx.container.d = Ref.create( '$container.c' ) ;
			ctx.refContainer = Ref.create( '$container' ) ;
			expect( ctx.refContainer.getRecursiveFinalValue( ctx ) ).to.equal( { b:42 , c:42 , d:42 } ) ;
		} ) ;
		
		it( "Ref#toString()" , function() {
			var ctx = { a: 42 } ;
			ctx.b = Ref.create( '$a' ) ;
			ctx.c = Ref.create( '$b' ) ;
			ctx.d = Ref.create( '$c' ) ;
			expect( ctx.b.toString( ctx ) ).to.be( "42" ) ;
			expect( ctx.c.toString( ctx ) ).to.be( "42" ) ;
			expect( ctx.d.toString( ctx ) ).to.be( "42" ) ;
		} ) ;
		
		it( "Ref#getPath()" , function() {
			expect( Ref.create( '$prop' ).getPath() ).to.be( "prop" ) ;
			expect( Ref.create( '$a.b.c.def' ).getPath() ).to.be( "a.b.c.def" ) ;
			expect( Ref.create( '$' ).getPath() ).to.be( '' ) ;
			expect( Ref.create( '$.prop' ).getPath() ).to.be( ".prop" ) ;
		} ) ;
	} ) ;
	
	describe( "Parser edge cases" , function() {
	
		it( "should stop parsing at first non-enclosed space" , function() {
			var ref_ = Ref.parse( '$x y z' ) ;
			expect( ref_.refParts ).to.equal( [ 'x' ] ) ;
		} ) ;
		
		it( "should support empty properties" , function() {
			var ref_ ;
			
			var ctx = {
				'': {
					a: 1 ,
					'': {
						b: 2 ,
					}
				} ,
				c: 3
			} ;
			
			ref_ = Ref.parse( '$.a' ) ;
			expect( ref_.refParts ).to.equal( [ '' , 'a' ] ) ;
			expect( ref_.get( ctx ) ).to.be( 1 ) ;
			
			ref_ = Ref.parse( '$..b' ) ;
			expect( ref_.refParts ).to.equal( [ '' , '' , 'b' ] ) ;
			expect( ref_.get( ctx ) ).to.be( 2 ) ;
			
			ref_ = Ref.parse( '$.' ) ;
			expect( ref_.refParts ).to.equal( [ '' ] ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''] ) ;
			
			ref_ = Ref.parse( '$..' ) ;
			expect( ref_.refParts ).to.equal( [ '' , '' ] ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''][''] ) ;
			
			ref_ = Ref.parse( '$..b' ) ;
			ref_.set( ctx , 'bob' ) ;
			expect( ref_.get( ctx ) ).to.be( 'bob' ) ;
		} ) ;
	} ) ;
	
	describe( "Stringify" , function() {
		
		it( "basic stringify" , function() {
			expect( Ref.parse( '$key' ).stringify() ).to.be( '$key' ) ;
			expect( Ref.parse( '$path.to.var' ).stringify() ).to.be( '$path.to.var' ) ;
			expect( Ref.parse( '$[1][2][3]' ).stringify() ).to.be( '$[1][2][3]' ) ;
			expect( Ref.parse( '$[1].prop[2][3]' ).stringify() ).to.be( '$[1].prop[2][3]' ) ;
			expect( Ref.parse( '$prop[1].prop' ).stringify() ).to.be( '$prop[1].prop' ) ;
			expect( Ref.parse( '$.prop[1].prop' ).stringify() ).to.be( '$.prop[1].prop' ) ;
			expect( Ref.parse( '$["key with space"]' ).stringify() ).to.be( '$["key with space"]' ) ;
			expect( Ref.parse( '$["key with space"].prop' ).stringify() ).to.be( '$["key with space"].prop' ) ;
			expect( Ref.parse( '$["key with space"]["and again"]' ).stringify() ).to.be( '$["key with space"]["and again"]' ) ;
			expect( Ref.parse( '$["key with space"]["dollar$"]' ).stringify() ).to.be( '$["key with space"]["dollar$"]' ) ;
			expect( Ref.parse( '$["key with space"]["dot.dot.dot"]' ).stringify() ).to.be( '$["key with space"]["dot.dot.dot"]' ) ;
		} ) ;
	} ) ;
} ) ;



// Useful for Babel Tower's parser
describe( "No initial dollar mode" , function() {
	
	it( "parse and get a simple ref" , function() {
		var ref_ ;
		
		var ctx = {
			a: 1 ,
			b: 2 ,
			sub: {
				c: 3 ,
				sub: {
					d: 4
				}
			} ,
			array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] ]
		} ;
		
		ref_ = Ref.parse( 'a' , { noInitialDollar: true } ) ;
		expect( ref_.get( ctx ) ).to.be( 1 ) ;
		
		ref_ = Ref.parse( 'sub.c' , { noInitialDollar: true } ) ;
		expect( ref_.get( ctx ) ).to.be( 3 ) ;
		
		ref_ = Ref.parse( 'sub.sub.d' , { noInitialDollar: true } ) ;
		expect( ref_.get( ctx ) ).to.be( 4 ) ;
		
		ref_ = Ref.parse( 'array[$b]' , { noInitialDollar: true } ) ;
		expect( ref_.get( ctx ) ).to.be( ctx.array[2] ) ;
	} ) ;
} ) ;

