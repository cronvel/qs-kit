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

	If option 'autoNumber' is on, valid numbers are cast to number

	If option 'keyPath' is on, this modification allow object dot notation and left-hand-side array notation:
		a.b=1&a.c=2				->		{ a: { b: '1' , c: '2' } }
		a[0]=one&a[1]=two		->		{ a: [ 'one' , 'two' ] }

	If option 'brackets' is on:
		a=[b,c,d]				->		{ a: [ 'b' , 'c' , 'd' ] }

	If option 'autoPush' is on:
		a=b&a=c&a=d				->		{ a: [ 'b' , 'c' , 'd' ] }

	If option 'restQueryFilter' is on:
		.path.to.prop.$lt=10	->		{ "path.to.prop": { $lt: 10 } }

	Still, not everything is possible.
*/



const tree = require( 'tree-kit' ) ;



const QueryString = {} ;
module.exports = QueryString ;



const partRe = /\+/g ;
const numberRe = /^-?[0-9]+(?:\.[0-9]+)?$/ ;



/*
	Parse a key=val string.

	Modified API from original 'querystring' core module: option 'maxKeys' -> 'maxItems'
*/
QueryString.parse = QueryString.decode = function( str , options = {} ) {
	var i , iMax , j , jMax , count = 0 ,
		strParts , current ,
		key , value , operator ,
		indexOfEq , indexOfDotDollar ,
		objectFilter ,
		object = {} ;

	var sep = options.separator || '&' ;
	var eq = options.equal || '=' ;

	if ( typeof str !== 'string' || str.length === 0 ) { return object ; }

	strParts = str.split( sep ) ;

	var maxItems = 1000 ;
	if ( typeof options.maxItems === 'number' ) { maxItems = options.maxItems ; }

	iMax = strParts.length ;

	for ( i = 0 ; i < iMax && count < maxItems ; i ++ , count ++ ) {
		current = strParts[ i ].replace( partRe , '%20' ) ;
		indexOfEq = current.indexOf( eq ) ;

		if ( indexOfEq === -1 ) { continue ; }

		key = decodeURIComponent( current.substring( 0 , indexOfEq ) ) ;

		if ( ! key ) { throw Error( "Empty key" ) ; }

		//console.log( "key:",key ) ;

		value = current.substring( indexOfEq + 1 ) ;


		// First, decode the value

		if ( options.brackets && value[ 0 ] === '[' && value[ value.length - 1 ] === ']' ) {
			if ( value.length === 2 ) {
				// This is an empty array
				value = [] ;
			}
			else {
				value = value.substring( 1 , value.length - 1 ).split( ',' ) ;
				jMax = value.length ;

				for ( j = 0 ; j < jMax && count < maxItems ; j ++ , count ++ ) {
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

		if ( options.restQueryFilter && key[ 0 ] === '.' ) {
			if ( typeof options.restQueryFilter === 'string' ) {
				if ( ! object[ options.restQueryFilter ] ) { object[ options.restQueryFilter ] = {} ; }
				objectFilter = object[ options.restQueryFilter ] ;
			}
			else {
				objectFilter = object ;
			}

			indexOfDotDollar = key.lastIndexOf( '.$' ) ;

			if ( indexOfDotDollar >= 0 ) {
				operator = key.slice( indexOfDotDollar + 1 ) ;
				key = key.slice( 1 , indexOfDotDollar ) ;
				if ( ! objectFilter[ key ] ) { objectFilter[ key ] = {} ; }
				objectFilter[ key ][ operator ] = value ;
			}
			else {
				key = key.slice( 1 ) ;
				objectFilter[ key ] = value ;
			}

			continue ;
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
	var i , iMax , j , k , v , ks , keys ,
		lastField , fields = '' , vLength , vLast ;

	var sep = options.separator || '&' ;
	var eq = options.equal || '=' ;

	object = tree.extend( EXTEND_OPTIONS , {} , object ) ;

	if ( object !== null && typeof object === 'object' ) {
		keys = Object.keys( object ) ;
		iMax = keys.length ;
		lastField = iMax - 1 ;

		for ( i = 0 ; i < iMax ; i ++ ) {
			k = keys[ i ] ;
			v = object[ k ] ;
			ks = encodeURIComponent( stringifyPrimitive( k ) ) ;

			if ( Array.isArray( v ) ) {
				if ( options.brackets ) {
					vLength = v.length ;
					vLast = vLength - 1 ;

					fields += ks + eq + '[' ;

					for ( j = 0 ; j < vLength ; j ++ ) {
						fields += encodeURIComponent( stringifyPrimitive( v[ j ] ) ) ;
						if ( j < vLast ) { fields += ',' ; }
					}

					fields += ']' ;

					if ( vLength && i < lastField ) { fields += sep ; }
				}
				else {
					vLength = v.length ;
					vLast = vLength - 1 ;

					for ( j = 0 ; j < vLength ; j ++ ) {
						fields += ks + '[' + j + ']' + eq + encodeURIComponent( stringifyPrimitive( v[ j ] ) ) ;
						if ( j < vLast ) { fields += '&' ; }
					}

					if ( vLength && i < lastField ) { fields += sep ; }
				}
			}
			else {
				fields += ks + eq + encodeURIComponent( stringifyPrimitive( v ) ) ;
				if ( i < lastField ) { fields += sep ; }
			}
		}

		return fields ;
	}

	return '' ;
} ;



function stringifyPrimitive( v ) {
	if ( typeof v === 'string' ) { return v ; }
	if ( typeof v === 'number' && isFinite( v ) ) { return '' + v ; }
	if ( typeof v === 'boolean' ) { return v ? 'true' : 'false' ; }
	return '' ;
}

