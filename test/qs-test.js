/*
	Query String Kit

	Copyright (c) 2014 - 2020 Cédric Ronvel

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
	
	it( "'autoNumber' option" , () => {
		var options = { autoNumber: true } ;
		expect( qs.parse( "a=10&b=20&c=string" , options ) ).to.equal( { a: 10 , b: 20 , c: "string" } ) ;
		expect( qs.parse( "a=1&b=-2&c=12.345&d=-123.45" , options ) ).to.equal( { a: 1 , b: -2 , c: 12.345 , d: -123.45 } ) ;
		expect( qs.parse( "a=10ab&b=2a" , options ) ).to.equal( { a: "10ab" , b: "2a" } ) ;
	} ) ;
	
	it( "String encoded" , () => {
		expect( qs.parse( "key=some%20value" ) ).to.equal( { key: "some value" } ) ;
	} ) ;
	
	it( "Array 'autoPush' option" , () => {
		var options = { autoPush: true } ;
		expect( qs.parse( "key=one&key=two&key=three" ) ).to.equal( { key: 'three' } ) ;
		expect( qs.parse( "key=one&key=two&key=three" , options ) ).to.equal( { key: [ 'one' , 'two' , 'three' ] } ) ;
	} ) ;
	
	it( "Array with the 'brackets' option" , () => {
		var options = { brackets: true } ;
		expect( qs.parse( "key=[one,two,three]" ) ).to.equal( { key: "[one,two,three]" } ) ;
		expect( qs.parse( "key=[one,two,three]" , options ) ).to.equal( { key: [ 'one' , 'two' , 'three' ] } ) ;
	} ) ;
	
	it( "Array 'keyPath' option" , () => {
		var options = { keyPath: true } ;
		expect( qs.parse( "a[0]=val&a[1]=val2" ) ).to.equal( { "a[0]": 'val' , "a[1]": 'val2' } ) ;
		expect( qs.parse( "a[0]=val&a[1]=val2" , options ) ).to.equal( { a: [ 'val' , 'val2' ] } ) ;
	} ) ;
	
	it( "Object 'keyPath' option" , () => {
		var options = { keyPath: true } ;
		expect( qs.parse( "a.b=val" ) ).to.equal( { "a.b": 'val' } ) ;
		expect( qs.parse( "a.b=val" , options ) ).to.equal( { a: { b: 'val' } } ) ;
		expect( qs.parse( "a.b=val&a.c=ue" , options ) ).to.equal( { a: { b: 'val' , c: 'ue' } } ) ;
		expect( qs.parse( "a.b=val&c.d=ue" , options ) ).to.equal( { a: { b: 'val' } , c: { d: 'ue' } } ) ;
	} ) ;
	
	it( "'keyPath' and 'autoPush' option" , () => {
		expect( qs.parse( "a.b=val&a.b=val2" ) ).to.equal( { "a.b": "val2" } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { keyPath: true } ) ).to.equal( { a: { b: "val2" } } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { autoPush: true } ) ).to.equal( { "a.b": [ "val" , "val2" ] } ) ;
		expect( qs.parse( "a.b=val&a.b=val2" , { keyPath: true , autoPush: true } ) ).to.equal( { a: { b: [ "val" , "val2" ] } } ) ;
	} ) ;

	it( "the '+' chars should be translated to spaces" , () => {
		expect( qs.parse( "search=some+keywords+with+space" ) ).to.equal( { search: "some keywords with space" } ) ;
		expect( qs.parse( "some+prop=value" ) ).to.equal( { "some prop": "value" } ) ;
		expect( qs.parse( "some+prop=some+keywords+with+space" ) ).to.equal( { "some prop": "some keywords with space" } ) ;
	} ) ;

	it( "'restQueryFilter' option" , () => {
		var options = { restQueryFilter: true , autoNumber: true } ;
		expect( qs.parse( ".prop=value" , options ) ).to.equal( { prop: "value" } ) ;
		expect( qs.parse( ".path.to.prop=value" , options ) ).to.equal( { "path.to.prop": "value" } ) ;
		expect( qs.parse( ".path.to.prop.$lt=10" , options ) ).to.equal( { "path.to.prop": { $lt: 10 } } ) ;
		expect( qs.parse( ".path.to.prop.$lt=10&.path.to.prop.$gt=5" , options ) ).to.equal( { "path.to.prop": { $lt: 10 , $gt: 5 } } ) ;
		expect( qs.parse( ".path.to.prop.$lt=10&.path.to.prop.$gt=5&.path.to.prop2.$ne=10" , options ) ).to.equal( { "path.to.prop": { $lt: 10 , $gt: 5 } , "path.to.prop2": { $ne: 10 } } ) ;
	} ) ;

	it( "mixing 'restQueryFilter' and 'brackets' options" , () => {
		var options = { restQueryFilter: true , brackets: true , autoNumber: true } ;
		expect( qs.parse( ".prop=[one,two,three]" , options ) ).to.equal( { prop: [ 'one' , 'two' , 'three' ] } ) ;
		expect( qs.parse( ".path.to.prop=[one,two,three]" , options ) ).to.equal( { "path.to.prop": [ 'one' , 'two' , 'three' ] } ) ;
		expect( qs.parse( ".path.to.prop.$in=[one,two,three]" , options ) ).to.equal( { "path.to.prop": { $in: [ 'one' , 'two' , 'three' ] } } ) ;
	} ) ;

	it( "'restQueryFilter' option set to a string should use it as the property which the filters will be nested into" , () => {
		var value , encoded ,
			options = { restQueryFilter: 'filter' , autoNumber: true } ;
		
		expect( qs.parse( ".prop=value" , options ) ).to.equal( { filter: { prop: "value" } } ) ;
		expect( qs.parse( ".path.to.prop=value" , options ) ).to.equal( { filter: { "path.to.prop": "value" } } ) ;
		expect( qs.parse( ".path.to.prop.$lt=10" , options ) ).to.equal( { filter: { "path.to.prop": { $lt: 10 } } } ) ;
		expect( qs.parse( ".path.to.prop.$lt=10&.path.to.prop.$gt=5" , options ) ).to.equal( { filter: { "path.to.prop": { $lt: 10 , $gt: 5 } } } ) ;
		expect( qs.parse( ".path.to.prop.$lt=10&.path.to.prop.$gt=5&.path.to.prop2.$ne=10" , options ) ).to.equal( { filter: { "path.to.prop": { $lt: 10 , $gt: 5 } , "path.to.prop2": { $ne: 10 } } } ) ;
		
		// Historical bug: URI encodinig was not working with the 'restQueryFilter' option
		value = "éµ%!:&=?#«»" ;
		encoded = encodeURIComponent( value ) ;
		expect( qs.parse( ".prop=" + encoded , options ) ).to.equal( { filter: { prop: value } } ) ;
		expect( qs.parse( ".path.to.prop=" + encoded , options ) ).to.equal( { filter: { "path.to.prop": value } } ) ;

		value = "إختبار" ;
		encoded = encodeURIComponent( value ) ;
		expect( qs.parse( ".prop=" + encoded , options ) ).to.equal( { filter: { prop: value } } ) ;
		expect( qs.parse( ".path.to.prop=" + encoded , options ) ).to.equal( { filter: { "path.to.prop": value } } ) ;

		value = "测试" ;
		encoded = encodeURIComponent( value ) ;
		expect( qs.parse( ".prop=" + encoded , options ) ).to.equal( { filter: { prop: value } } ) ;
		expect( qs.parse( ".path.to.prop=" + encoded , options ) ).to.equal( { filter: { "path.to.prop": value } } ) ;
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



describe( "encodeURIComponent" , () => {

	it( "should encode all QS Kit special characters" , () => {
		expect( encodeURIComponent( "=" ) ).to.be( "%3D" ) ;
		expect( encodeURIComponent( "&" ) ).to.be( "%26" ) ;
		expect( encodeURIComponent( "[]" ) ).to.be( "%5B%5D" ) ;
		expect( encodeURIComponent( "," ) ).to.be( "%2C" ) ;
	} ) ;
} ) ;



describe( "Historical bugs" , () => {
	
	it( "Bad query string" , () => {
		// should throw
		expect( () => qs.parse( "=one=two" ) ).to.throw() ;
	} ) ;
} ) ;

