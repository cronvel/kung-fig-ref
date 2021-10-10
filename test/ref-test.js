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

/* global describe, it, expect */

"use strict" ;



//const kungFig = require( '../lib/kungFig.js' ) ;
const Ref = require( '..' ) ;



/*
function deb( v ) {
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}
*/



describe( "Ref" , () => {

	describe( "Get" , () => {

		it( "parse and get a simple ref" , () => {
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

			// Unexistant, or not in object
			ref_ = Ref.parse( '$x' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;

			ref_ = Ref.parse( '$x.y.z' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;

			ref_ = Ref.parse( '$a.x' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;

			ref_ = Ref.parse( '$e' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;

			ref_ = Ref.parse( '$e.f.g' ) ;
			expect( ref_.get( ctx ) ).to.be( undefined ) ;
		} ) ;

		it( "ref with empty path parts" , () => {
			var ref_ ;

			var ctx = {
				"": {
					hidden: "value" ,
					"": {
						hidden2: "value2" ,
					} ,
					sub: {
						"": {
							hidden3: "value3" ,
						} ,
					}
				}
			} ;

			ref_ = Ref.parse( '$' ) ;
			expect( ref_.getPath() ).to.be( '' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx ) ;

			ref_ = Ref.parse( '$.' ) ;
			expect( ref_.getPath() ).to.be( '.' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''] ) ;

			ref_ = Ref.parse( '$.hidden' ) ;
			expect( ref_.getPath() ).to.be( '.hidden' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''].hidden ) ;

			ref_ = Ref.parse( '$..' ) ;
			expect( ref_.getPath() ).to.be( '..' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''][''] ) ;

			ref_ = Ref.parse( '$..hidden2' ) ;
			expect( ref_.getPath() ).to.be( '..hidden2' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''][''].hidden2 ) ;

			ref_ = Ref.parse( '$.sub' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''].sub ) ;
			ref_ = Ref.parse( '$.sub.' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''].sub ) ;

			ref_ = Ref.parse( '$.sub..' ) ;
			expect( ref_.getPath() ).to.be( '.sub..' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''].sub[''] ) ;

			ref_ = Ref.parse( '$.sub..hidden3' ) ;
			expect( ref_.getPath() ).to.be( '.sub..hidden3' ) ;
			expect( ref_.get( ctx ) ).to.be( ctx[''].sub[''].hidden3 ) ;
		} ) ;

		it( "it should autobox Boolean, String and Number for the root ref" , () => {
			var ref_ ;

			var ctx = {
				b: new Boolean( true ) ,
				s: new String( 'bob' ) ,
				n: new Number( 10 )
			} ;

			ref_ = Ref.parse( '$b' ) ;
			expect( ref_.get( ctx ) ).to.be.a( Boolean ) ;
			ref_ = Ref.parse( '$s' ) ;
			expect( ref_.get( ctx ) ).to.be.a( String ) ;
			ref_ = Ref.parse( '$n' ) ;
			expect( ref_.get( ctx ) ).to.be.a( Number ) ;

			ref_ = Ref.parse( '$' ) ;
			expect( ref_.get( ctx.b ) ).not.to.be.a( Boolean ) ;
			expect( ref_.get( ctx.b ) ).to.be( true ) ;
			ref_ = Ref.parse( '$' ) ;
			expect( ref_.get( ctx.s ) ).not.to.be.a( String ) ;
			expect( ref_.get( ctx.s ) ).to.be( 'bob' ) ;
			ref_ = Ref.parse( '$' ) ;
			expect( ref_.get( ctx.n ) ).not.to.be.a( Number ) ;
			expect( ref_.get( ctx.n ) ).to.be( 10 ) ;
		} ) ;

		it( "parse and get a ref on a context having arrays" , () => {
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

		it( "parse and get a ref with quoted keys" , () => {
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

		it( "parse and get a complex ref (ref having refs)" , () => {
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

		it( "function in context" , () => {
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


	describe( "Set" , () => {

		it( "set a simple ref" , () => {
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

		it( "set a ref on a context having arrays" , () => {
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

		it( "set a complex ref (ref having refs)" , () => {
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

		it( "set and the auto-creation feature" , () => {
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

		it( "function in context" , () => {
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

	describe( "Define" , () => {

		it( "define a simple ref" , () => {
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

	describe( "Unset" , () => {

		it( "define a simple ref" , () => {
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

	describe( "Calling a function" , () => {

		it( "parse and call a function pointed by a ref" , () => {
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

	describe( "Misc" , () => {

		it( "Ref#clone()" , () => {
			var ctx = { a: { b: { c: 42 } } } ;
			var ref1 = new Ref( '$a.b' ) ;
			var ref2 = ref1.clone() ;
			expect( ref1.getFinalValue( ctx ) ).to.be( ctx.a.b ) ;
			expect( ref2.getFinalValue( ctx ) ).to.be( ctx.a.b ) ;
			ref1.appendPart( 'c' ) ;
			expect( ref1.getFinalValue( ctx ) ).to.be( 42 ) ;
			expect( ref2.getFinalValue( ctx ) ).to.be( ctx.a.b ) ;
		} ) ;

		it( "Ref#getFinalValue()" , () => {
			var ctx = { a: 42 } ;
			ctx.b = new Ref( '$a' ) ;
			ctx.c = new Ref( '$b' ) ;
			ctx.d = new Ref( '$c' ) ;
			expect( ctx.b.getFinalValue( ctx ) ).to.be( 42 ) ;
			expect( ctx.c.getFinalValue( ctx ) ).to.be( 42 ) ;
			expect( ctx.d.getFinalValue( ctx ) ).to.be( 42 ) ;
		} ) ;

		/*
		// Does not make sense, data should not contain dynamic, only resolved dynamic or applicable
		it( "Ref#getDeepFinalValue()" , () => {
			var ctx = { a: 42 , container: {} } ;
			ctx.container.b = new Ref( '$a' ) ;
			ctx.container.c = new Ref( '$container.b' ) ;
			ctx.container.d = new Ref( '$container.c' ) ;
			ctx.refContainer = new Ref( '$container' ) ;
			expect( ctx.refContainer.extractFromStatic( ctx ) ).to.equal( { b: 42 , c: 42 , d: 42 } ) ;
			expect( ctx.refContainer.getDeepFinalValue( ctx ) ).to.equal( { b: 42 , c: 42 , d: 42 } ) ;
		} ) ;
		*/

		it( "Ref#toString()" , () => {
			var ctx = { a: 42 } ;
			ctx.b = new Ref( '$a' ) ;
			ctx.c = new Ref( '$b' ) ;
			ctx.d = new Ref( '$c' ) ;
			expect( ctx.b.toString( ctx ) ).to.be( "42" ) ;
			expect( ctx.c.toString( ctx ) ).to.be( "42" ) ;
			expect( ctx.d.toString( ctx ) ).to.be( "42" ) ;
		} ) ;

		it( "Ref#getPath()" , () => {
			expect( new Ref( '$prop' ).getPath() ).to.be( "prop" ) ;
			expect( new Ref( '$a.b.c.def' ).getPath() ).to.be( "a.b.c.def" ) ;
			expect( new Ref( '$' ).getPath() ).to.be( '' ) ;
			expect( new Ref( '$.prop' ).getPath() ).to.be( ".prop" ) ;
		} ) ;
	} ) ;

	describe( "Parser edge cases" , () => {

		it( "should stop parsing at first non-enclosed space" , () => {
			var ref_ = Ref.parse( '$x y z' ) ;
			expect( ref_.refParts ).to.equal( [ 'x' ] ) ;
		} ) ;

		it( "should support empty properties" , () => {
			var ref_ ;

			var ctx = {
				'': {
					a: 1 ,
					'': {
						b: 2
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

	describe( "Stringify" , () => {

		it( "basic stringify" , () => {
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

			expect( Ref.parse( '$path[$my.index].to.value' ).stringify() ).to.be( '$path[$my.index].to.value' ) ;
		} ) ;
	} ) ;

	describe( ".toJs()" , () => {

		it( "basic .toJs()" , () => {
			expect( Ref.parse( '$key' ).toJs() ).to.be( 'ctx?.key' ) ;
			expect( Ref.parse( '$path.to.var' ).toJs() ).to.be( 'ctx?.path?.to?.var' ) ;
			expect( Ref.parse( '$[1][2][3]' ).toJs() ).to.be( 'ctx?.[1]?.[2]?.[3]' ) ;
			expect( Ref.parse( '$[1].prop[2][3]' ).toJs() ).to.be( 'ctx?.[1]?.prop?.[2]?.[3]' ) ;
			expect( Ref.parse( '$prop[1].prop' ).toJs() ).to.be( 'ctx?.prop?.[1]?.prop' ) ;
			expect( Ref.parse( '$["key with space"]' ).toJs() ).to.be( 'ctx?.["key with space"]' ) ;
			expect( Ref.parse( '$["key with space"].prop' ).toJs() ).to.be( 'ctx?.["key with space"]?.prop' ) ;
			expect( Ref.parse( '$["key with space"]["and again"]' ).toJs() ).to.be( 'ctx?.["key with space"]?.["and again"]' ) ;
			expect( Ref.parse( '$["key with space"]["dollar$"]' ).toJs() ).to.be( 'ctx?.["key with space"]?.dollar$' ) ;
			expect( Ref.parse( '$["key with space"]["dot.dot.dot"]' ).toJs() ).to.be( 'ctx?.["key with space"]?.["dot.dot.dot"]' ) ;

			expect( Ref.parse( '$some.var-with.hyphen' ).toJs() ).to.be( 'ctx?.some?.["var-with"]?.hyphen' ) ;
			expect( Ref.parse( '$some.var-with-hyphen' ).toJs() ).to.be( 'ctx?.some?.["var-with-hyphen"]' ) ;
			expect( Ref.parse( '$some-var-with-hyphen' ).toJs() ).to.be( 'ctx?.["some-var-with-hyphen"]' ) ;

			expect( Ref.parse( '$path[$my.index].to.value' ).toJs() ).to.be( 'ctx?.path?.[ctx?.my?.index]?.to?.value' ) ;
			expect( Ref.parse( '$path[$var.with-hyphen].to.value' ).toJs() ).to.be( 'ctx?.path?.[ctx?.var?.["with-hyphen"]]?.to?.value' ) ;
		} ) ;
	} ) ;

	describe( ".compile()" , () => {

		it( "basic .compile()" , () => {
			var context = {
				key: "value" ,
				path: {
					to: { 'var': 42 } ,
					"some index": {
						to: { value: "some value" }
					}
				} ,
				array: [ [ 0 , 1 ] ] ,
				"key with space": "value with space" ,
				my: { index: "some index" }
			} ;
			
			expect( Ref.parse( '$key' ).compile()( context ) ).to.be( 'value' ) ;
			expect( Ref.parse( '$path.to.var' ).compile()( context ) ).to.be( 42 ) ;
			expect( Ref.parse( '$array[0][1]' ).compile()( context ) ).to.be( 1 ) ;
			expect( Ref.parse( '$["key with space"]' ).compile()( context ) ).to.be( "value with space" ) ;

			expect( Ref.parse( '$path[$my.index].to.value' ).compile()( context ) ).to.be( "some value" ) ;
		} ) ;

		it( ".compile() should support unexisting path or path inside non-objects" , () => {
			var context = {
				key: "value" ,
				"true": true ,
				"null": null ,
			} ;

			expect( Ref.parse( '$path.to.unexisting' ).compile()( context ) ).to.be( undefined ) ;
			expect( Ref.parse( '$key.path.to.unexisting' ).compile()( context ) ).to.be( undefined ) ;
			expect( Ref.parse( '$true.path.to.unexisting' ).compile()( context ) ).to.be( undefined ) ;
			expect( Ref.parse( '$null.path.to.unexisting' ).compile()( context ) ).to.be( undefined ) ;
		} ) ;
	} ) ;

	// Useful for Babel Tower's parser
	describe( "No initial dollar mode" , () => {

		it( "parse and get a simple ref" , () => {
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
} ) ;

