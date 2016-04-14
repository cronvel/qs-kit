/*
	The Cedric's Swiss Knife (CSK) - CSK query string toolbox test suite

	Copyright (c) 2015 Cédric Ronvel 
	
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

/* jshint unused:false */
/* global describe, it, before, after */


var qs = require( '../lib/qs.js' ) ;
var expect = require( 'expect.js' ) ;





			/* Tests */



describe( "Parse" , function() {
	
	it( "Scalar usage" , function() {
		expect( qs.parse( "k=v" ) ).to.eql( { k: "v" } ) ;
		expect( qs.parse( "key=value" ) ).to.eql( { key: "value" } ) ;
		expect( qs.parse( "a=1" ) ).to.eql( { a: 1 } ) ;
		expect( qs.parse( "key=value&a=1" ) ).to.eql( { key: "value" , a: 1 } ) ;
		expect( qs.parse( "key=value&a=1&b=2&c=string" ) ).to.eql( { key: "value" , a: 1 , b: 2 , c: "string" } ) ;
	} ) ;
	
	it( "String encoded" , function() {
		expect( qs.parse( "key=some%20value" ) ).to.eql( { key: "some value" } ) ;
	} ) ;
} ) ;



describe( "Stringify" , function() {
	
	it( "Scalar usage" ) ;
	it( "String encoded" ) ;
} ) ;



describe( "Historical bugs" , function() {
	
	it( "Bad query string: =one=two" , function() {
		// should throw
		expect( function() { qs.parse( "=one=two" ) ; } ).to.throwException() ;
	} ) ;
} ) ;





