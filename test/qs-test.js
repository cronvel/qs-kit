/*
	Query String Kit

	Copyright (c) 2014 - 2018 Cédric Ronvel

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





			/* Tests */



describe( "Parse" , () => {
	
	it( "Scalar" , () => {
		expect( qs.parse( "k=v" ) ).to.equal( { k: "v" } ) ;
		expect( qs.parse( "key=value" ) ).to.equal( { key: "value" } ) ;
		expect( qs.parse( "a=1" ) ).to.equal( { a: "1" } ) ;
		expect( qs.parse( "key=value&a=1" ) ).to.equal( { key: "value" , a: "1" } ) ;
		expect( qs.parse( "key=value&a=1&b=2&c=string" ) ).to.equal( { key: "value" , a: "1" , b: "2" , c: "string" } ) ;
	} ) ;
	
	it( "String encoded" , () => {
		expect( qs.parse( "key=some%20value" ) ).to.equal( { key: "some value" } ) ;
	} ) ;
	
	it( "Array 'autoPush' option" , () => {
		options = { autoPush: true } ;
		expect( qs.parse( "key=one&key=two&key=three" ) ).to.equal( { key: 'three' } ) ;
		expect( qs.parse( "key=one&key=two&key=three" , options ) ).to.equal( { key: [ 'one' , 'two' , 'three' ] } ) ;
	} ) ;
	
	it( "Array with the 'brackets' option" , () => {
		var options = { brackets: true } ;
		expect( qs.parse( "key=[one,two,three]" ) ).to.equal( { key: "[one,two,three]" } ) ;
		expect( qs.parse( "key=[one,two,three]" , options ) ).to.equal( { key: [ 'one' , 'two' , 'three' ] } ) ;
	} ) ;
	
	it( "Array 'keyPath' option" , () => {
		options = { keyPath: true } ;
		expect( qs.parse( "a[0]=val&a[1]=val2" ) ).to.equal( { "a[0]": 'val' , "a[1]": 'val2' } ) ;
		expect( qs.parse( "a[0]=val&a[1]=val2" , options ) ).to.equal( { a: [ 'val' , 'val2' ] } ) ;
	} ) ;
	
	it( "Object 'keyPath' option" , () => {
		options = { keyPath: true } ;
		expect( qs.parse( "a.b=val" ) ).to.equal( { "a.b": 'val' } ) ;
		expect( qs.parse( "a.b=val" , options ) ).to.equal( { a: { b: 'val' } } ) ;
	} ) ;
	
	it( "'keyPath' and 'autoPush' option" , () => {
		expect( qs.parse( "a.b=val&a.b=val2" ) ).to.equal( { "a.b": "val2" } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { keyPath: true } ) ).to.equal( { a: { b: "val2" } } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { autoPush: true } ) ).to.equal( { "a.b": [ "val" , "val2" ] } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { keyPath: true , autoPush: true } ) ).to.equal( { a: { b: [ "val" , "val2" ] } } ) ;
	} ) ;
} ) ;



describe( "Stringify" , () => {
	
	it( "should stringify an object" , () => {
		var object = { firstName: "Joe" , lastName: "Doe" } ;
		expect( qs.stringify( object ) ).to.be( "firstName=Joe&lastName=Doe" ) ;
	} ) ;
	
	it( "Scalar" ) ;
	it( "String encoded" ) ;
} ) ;



describe( "Historical bugs" , () => {
	
	it( "Bad query string" , () => {
		// should throw
		expect( () => qs.parse( "=one=two" ) ).to.throw() ;
	} ) ;
} ) ;





