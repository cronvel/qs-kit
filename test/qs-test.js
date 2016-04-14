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
	
	it( "Scalar" , function() {
		expect( qs.parse( "k=v" ) ).to.eql( { k: "v" } ) ;
		expect( qs.parse( "key=value" ) ).to.eql( { key: "value" } ) ;
		expect( qs.parse( "a=1" ) ).to.eql( { a: 1 } ) ;
		expect( qs.parse( "key=value&a=1" ) ).to.eql( { key: "value" , a: 1 } ) ;
		expect( qs.parse( "key=value&a=1&b=2&c=string" ) ).to.eql( { key: "value" , a: 1 , b: 2 , c: "string" } ) ;
	} ) ;
	
	it( "String encoded" , function() {
		expect( qs.parse( "key=some%20value" ) ).to.eql( { key: "some value" } ) ;
	} ) ;
	
	it( "Array 'autoPush' option" , function() {
		options = { autoPush: true } ;
		expect( qs.parse( "key=one&key=two&key=three" ) ).to.eql( { key: 'three' } ) ;
		expect( qs.parse( "key=one&key=two&key=three" , options ) ).to.eql( { key: [ 'one' , 'two' , 'three' ] } ) ;
	} ) ;
	
	it( "Array with the 'brackets' option" , function() {
		var options = { brackets: true } ;
		expect( qs.parse( "key=[one,two,three]" ) ).to.eql( { key: "[one,two,three]" } ) ;
		expect( qs.parse( "key=[one,two,three]" , options ) ).to.eql( { key: [ 'one' , 'two' , 'three' ] } ) ;
	} ) ;
	
	it( "Array 'keyPath' option" , function() {
		options = { keyPath: true } ;
		expect( qs.parse( "a[0]=val&a[1]=val2" ) ).to.eql( { "a[0]": 'val' , "a[1]": 'val2' } ) ;
		expect( qs.parse( "a[0]=val&a[1]=val2" , options ) ).to.eql( { a: [ 'val' , 'val2' ] } ) ;
	} ) ;
	
	it( "Object 'keyPath' option" , function() {
		options = { keyPath: true } ;
		expect( qs.parse( "a.b=val" ) ).to.eql( { "a.b": 'val' } ) ;
		expect( qs.parse( "a.b=val" , options ) ).to.eql( { a: { b: 'val' } } ) ;
	} ) ;
	
	it( "'keyPath' and 'autoPush' option" , function() {
		expect( qs.parse( "a.b=val&a.b=val2" ) ).to.eql( { "a.b": "val2" } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { keyPath: true } ) ).to.eql( { a: { b: "val2" } } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { autoPush: true } ) ).to.eql( { "a.b": [ "val" , "val2" ] } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { keyPath: true , autoPush: true } ) ).to.eql( { a: { b: [ "val" , "val2" ] } } ) ;
	} ) ;
} ) ;



describe( "Stringify" , function() {
	
	it( "Scalar" ) ;
	it( "String encoded" ) ;
} ) ;



describe( "Historical bugs" , function() {
	
	it( "Bad query string" , function() {
		// should throw
		expect( function() { qs.parse( "=one=two" ) ; } ).to.throwException() ;
	} ) ;
} ) ;





