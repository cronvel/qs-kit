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

"use strict" ;



/*
	Most of this code is directly borrowed from the core Node.js 'querystring' module.

	If option 'autoNumber' is on, valid numbers are casted into number.

	If option 'keyPath' is on, this modification allow object dot notation and left-hand-side array notation:
		a.b=1&a.c=2					->		{ a: { b: "1" , c: "2" } }
		a[0]=one&a[1]=two			->		{ a: [ "one" , "two" ] }

	If option 'brackets' is on:
		a=[b,c,d]					->		{ a: [ "b" , "c" , "d" ] }

	If option 'autoPush' is on:
		a=b&a=c&a=d					->		{ a: [ "b" , "c" , "d" ] }

	If option 'restQueryFlatPrefixes' is an object of string, e.g. restQueryFlatPrefix={ "filter.": "filter" , ".": "filter" , "sort.": "sort" }, then:
		filter.path.to.prop.$lt=10	->		{ filter: { "path.to.prop": { $lt: 10 } } }
		sort.path.to.prop=1			->		{ sort: { "path.to.prop": 1 } }
		.path.to.prop.$lt=10		->		{ "path.to.prop": { $lt: 10 } }

	Still, not everything is possible.
*/



const tree = require( 'tree-kit' ) ;



const QueryString = {} ;
module.exports = QueryString ;



const partRe = /\+/g ;

// If starting with with 0 and not followed directly by a ".", it will not be considered as a number.
// This is because it could lead to a lost of information, e.g. "07" would be casted as 7, thus if the userland want to cast it
// back to a string, it would lost the 0 permanently.
// Use case where it causes trouble: french department from 01 to 09, client code with leading zero like "000478", and so on.
const numberRe = /^-?(0|[1-9][0-9]*)(?:\.[0-9]+)?$/ ;



/*
	Parse a key=val string.

	Modified API from original 'querystring' core module: option 'maxKeys' -> 'maxItems'
*/
QueryString.parse = QueryString.decode = function( str , options = {} ) {
	var object = {} ,
		maxItems = options.maxItems ?? 1000 ,
		sep = options.separator || '&' ,
		eq = options.equal || '=' ,
		count = 0 ;

	if ( typeof str !== 'string' || str.length === 0 ) { return object ; }

	var strParts = str.split( sep ) ;


	for ( let i = 0 , iMax = strParts.length ; i < iMax && count < maxItems ; i ++ , count ++ ) {
		let part = strParts[ i ].replace( partRe , '%20' ) ;
		let indexOfEq = part.indexOf( eq ) ;

		if ( indexOfEq === - 1 ) { continue ; }

		let key = decodeURIComponent( part.substring( 0 , indexOfEq ) ) ;
		if ( ! key ) { throw Error( "Empty key" ) ; }

		let value = part.substring( indexOfEq + 1 ) ;


		// First, decode the value

		if ( options.brackets && value[ 0 ] === '[' && value[ value.length - 1 ] === ']' ) {
			if ( value.length === 2 ) {
				// This is an empty array
				value = [] ;
			}
			else {
				value = value.substring( 1 , value.length - 1 ).split( ',' ) ;

				for ( let j = 0 , jMax = value.length ; j < jMax && count < maxItems ; j ++ , count ++ ) {
					if ( options.autoNumber && numberRe.test( value[ j ] ) ) {
						value[ j ] = parseFloat( value[ j ] ) ;
					}
					else {
						value[ j ] = decodeURIComponent( value[ j ] ) ;
					}
				}
			}
		}
		else if ( options.autoNumber && numberRe.test( value ) ) {
			value = parseFloat( value ) ;
		}
		else {
			value = decodeURIComponent( value ) ;
		}


		// Then, decode the key/path

		if ( options.restQueryFlatPrefixes ) {
			let prefix ;

			for ( let currentPrefix of Object.keys( options.restQueryFlatPrefixes ) ) {
				if ( key.startsWith( currentPrefix ) ) {
					prefix = currentPrefix ;
					break ;
				}
			}

			if ( prefix ) {
				let topLevelKey = options.restQueryFlatPrefixes[ prefix ] ;

				if ( ! object[ topLevelKey ] ) { object[ topLevelKey ] = {} ; }
				let subObject = object[ topLevelKey ] ;

				let indexOfDotDollar = key.lastIndexOf( '.$' ) ;

				if ( indexOfDotDollar >= 0 ) {
					let operator = key.slice( indexOfDotDollar + 1 ) ;
					key = key.slice( prefix.length , indexOfDotDollar ) ;
					if ( ! subObject[ key ] ) { subObject[ key ] = {} ; }
					subObject[ key ][ operator ] = value ;
				}
				else {
					key = key.slice( prefix.length ) ;
					subObject[ key ] = value ;
				}

				continue ;
			}
		}

		//console.log( "tree.path.set( object , k , value ):\nobject:" , object , "\nk:" , k , "\nvalue:" , value ) ;
		if ( options.keyPath ) {
			if ( options.autoPush ) { tree.path.autoPush( object , key , value ) ; }
			else { tree.path.set( object , key , value ) ; }
		}
		else if ( object[ key ] === undefined || ! options.autoPush ) {
			object[ key ] = value ;
		}
		else if ( Array.isArray( object[ key ] ) ) {
			object[ key ].push( value ) ;
		}
		else {
			object[ key ] = [ object[ key ] , value ] ;
		}
	}

	return object ;
} ;



const EXTEND_OPTIONS = { flat: true , immutables: new Set( [ Array.prototype ] ) } ;

QueryString.stringify = QueryString.encode = function( object , options = {} ) {
	if ( ! object || typeof object !== 'object' ) { return '' ; }

	var fields = '' ,
		sep = options.separator || '&' ,
		eq = options.equal || '=' ,
		flatObject = tree.extend( EXTEND_OPTIONS , {} , object ) ,
		keys = Object.keys( flatObject ) ,
		iMax = keys.length ,
		lastField = iMax - 1 ;

	for ( let i = 0 ; i < iMax ; i ++ ) {
		let key = keys[ i ] ;
		let value = flatObject[ key ] ;
		let encodedKey = encodeURIComponent( stringifyPrimitive( key ) ) ;

		if ( Array.isArray( value ) ) {
			let valueLength = value.length ;
			let valueLast = valueLength - 1 ;

			if ( options.brackets ) {
				fields += encodedKey + eq + '[' ;

				for ( let j = 0 ; j < valueLength ; j ++ ) {
					fields += encodeURIComponent( stringifyPrimitive( value[ j ] ) ) ;
					if ( j < valueLast ) { fields += ',' ; }
				}

				fields += ']' ;

				if ( valueLength && i < lastField ) { fields += sep ; }
			}
			else {
				for ( let j = 0 ; j < valueLength ; j ++ ) {
					fields += encodedKey + '[' + j + ']' + eq + encodeURIComponent( stringifyPrimitive( value[ j ] ) ) ;
					if ( j < valueLast ) { fields += '&' ; }
				}

				if ( valueLength && i < lastField ) { fields += sep ; }
			}
		}
		else {
			fields += encodedKey + eq + encodeURIComponent( stringifyPrimitive( value ) ) ;
			if ( i < lastField ) { fields += sep ; }
		}
	}

	return fields ;
} ;



function stringifyPrimitive( v ) {
	if ( typeof v === 'string' ) { return v ; }
	if ( typeof v === 'number' && isFinite( v ) ) { return '' + v ; }
	if ( typeof v === 'boolean' ) { return v ? 'true' : 'false' ; }
	return '' ;
}

