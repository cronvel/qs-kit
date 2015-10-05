/*
	The Cedric's Swiss Knife (CSK) - CSK Query String toolbox

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



/*
	Most of this code is directly borrowed from the core Node.js 'querystring' module.
	
	This modification allow object notation and right-side array notation:
		a.b=1&a.c=2		->		{ a: { b: '1' , c: '2' } }
		a=[b,c,d]		->		{ a: [ 'b' , 'c' , 'd' ] }
	
	Still, not everything is possible.
*/



'use strict';



// Load modules
var tree = require( 'tree-kit' ) ;



var QueryString = {} ;
module.exports = QueryString ;



/*
	Parse a key=val string.
	
	Modified from original 'querystring' core module: option 'maxKeys' -> 'maxItems'
*/
QueryString.parse = QueryString.decode = function( str , sep , eq , options )
{
	sep = sep || '&' ;
	eq = eq || '=' ;
	
	var i , iMax , j , jMax , count = 0 , obj = {} ;

	if ( typeof str !== 'string' || str.length === 0 ) { return obj ; }

	var regexp = /\+/g ;
	str = str.split( sep ) ;
	
	var maxItems = 1000 ;
	if ( options && typeof options.maxItems === 'number' ) { maxItems = options.maxItems ; }

	var iMax = str.length;

	var decode = QueryString.unescape;
	
	if ( options && typeof options.decodeURIComponent === 'function' )
	{
		decode = options.decodeURIComponent;
	}

	for ( i = 0 ; i < iMax && count < maxItems ; i ++ , count ++ )
	{
		var x = str[ i ].replace( regexp , '%20' ) ,
			idx = x.indexOf( eq ) ,
			k, v ;
		
		if ( idx === -1 ) { continue ; }
		
		k = decodeStr( x.substring( 0 , idx ) , decode ) ;
		
		v = x.substring( idx + 1 ) ;
		
		if (  v[ 0 ] === '['   &&   v[ v.length - 1 ]  ===  ']'  )
		{
			v = v.substring( 1 , v.length - 1 ).split( ',' ) ;
			jMax = v.length ;
			
			for ( j = 0 ; j < jMax && count < maxItems ; j ++ , count ++ )
			{
				v[ j ] = decodeStr( v[ j ] , decode ) ;
			}
		}
		else
		{
			v = decodeStr( v , decode ) ;
		}
		
		tree.path.set( obj , k , v ) ;
	}
	
	return obj ;
} ;



QueryString.stringify = QueryString.encode = function( obj , sep , eq , options )
{
	sep = sep || '&' ;
	eq = eq || '=' ;
	
	obj = tree.extend( { flat: true , deepFilter: { blacklist: [ Array.prototype ] } } , {} , obj ) ;
	
	var encode = QueryString.escape ;
	if ( options && typeof options.encodeURIComponent === 'function' ) { encode = options.encodeURIComponent ; }
	
	if ( obj !== null && typeof obj === 'object' )
	{
		var keys = Object.keys( obj ) ;
		var len = keys.length ;
		var flast = len - 1 ;
		var fields = '' ;
		var i ;
		
		for ( i = 0 ; i < len ; i ++ )
		{
			var k = keys[ i ] ;
			var v = obj[ k ] ;
			var ks = encode( stringifyPrimitive( k ) ) + eq ;

			if ( Array.isArray( v ) )
			{
				var vlen = v.length ;
				var vlast = vlen - 1 ;
				var j ;
				
				fields += ks + '[' ;
				
				for ( j = 0 ; j < vlen ; j ++ )
				{
					fields += encode( stringifyPrimitive( v[ j ] ) ) ;
					if ( j < vlast ) { fields += ',' ; }
				}
				
				fields += ']' ;
				
				if ( vlen && i < flast ) { fields += sep ; }
			}
			else
			{
				fields += ks + encode( stringifyPrimitive( v ) ) ;
				if ( i < flast ) { fields += sep ; }
			}
		}
		
		return fields ;
	}
	
	return '' ;
} ;





// Unmodified part, from Node.js v4.1.1



function charCode(c) {
  return c.charCodeAt(0);
}


// a safe fast alternative to decodeURIComponent
QueryString.unescapeBuffer = function(s, decodeSpaces) {
  var out = new Buffer(s.length);
  var state = 'CHAR'; // states: CHAR, HEX0, HEX1
  var n, m, hexchar;

  for (var inIndex = 0, outIndex = 0; inIndex <= s.length; inIndex++) {
    var c = s.charCodeAt(inIndex);
    switch (state) {
      case 'CHAR':
        switch (c) {
          case charCode('%'):
            n = 0;
            m = 0;
            state = 'HEX0';
            break;
          case charCode('+'):
            if (decodeSpaces) c = charCode(' ');
            // falls through
          default:
            out[outIndex++] = c;
            break;
        }
        break;

      case 'HEX0':
        state = 'HEX1';
        hexchar = c;
        if (charCode('0') <= c && c <= charCode('9')) {
          n = c - charCode('0');
        } else if (charCode('a') <= c && c <= charCode('f')) {
          n = c - charCode('a') + 10;
        } else if (charCode('A') <= c && c <= charCode('F')) {
          n = c - charCode('A') + 10;
        } else {
          out[outIndex++] = charCode('%');
          out[outIndex++] = c;
          state = 'CHAR';
          break;
        }
        break;

      case 'HEX1':
        state = 'CHAR';
        if (charCode('0') <= c && c <= charCode('9')) {
          m = c - charCode('0');
        } else if (charCode('a') <= c && c <= charCode('f')) {
          m = c - charCode('a') + 10;
        } else if (charCode('A') <= c && c <= charCode('F')) {
          m = c - charCode('A') + 10;
        } else {
          out[outIndex++] = charCode('%');
          out[outIndex++] = hexchar;
          out[outIndex++] = c;
          break;
        }
        out[outIndex++] = 16 * n + m;
        break;
    }
  }

  // TODO support returning arbitrary buffers.

  return out.slice(0, outIndex - 1);
};


QueryString.unescape = function(s, decodeSpaces) {
  try {
    return decodeURIComponent(s);
  } catch (e) {
    return QueryString.unescapeBuffer(s, decodeSpaces).toString();
  }
};


var hexTable = new Array(256);
for (var i = 0; i < 256; ++i)
  hexTable[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
QueryString.escape = function(str) {
  // replaces encodeURIComponent
  // http://www.ecma-international.org/ecma-262/5.1/#sec-15.1.3.4
  str = '' + str;
  var len = str.length;
  var out = '';
  var i, c;

  if (len === 0)
    return str;

  for (i = 0; i < len; ++i) {
    c = str.charCodeAt(i);

    // These characters do not need escaping (in order):
    // ! - . _ ~
    // ' ( ) *
    // digits
    // alpha (uppercase)
    // alpha (lowercase)
    if (c === 0x21 || c === 0x2D || c === 0x2E || c === 0x5F || c === 0x7E ||
        (c >= 0x27 && c <= 0x2A) ||
        (c >= 0x30 && c <= 0x39) ||
        (c >= 0x41 && c <= 0x5A) ||
        (c >= 0x61 && c <= 0x7A)) {
      out += str[i];
      continue;
    }

    // Other ASCII characters
    if (c < 0x80) {
      out += hexTable[c];
      continue;
    }

    // Multi-byte characters ...
    if (c < 0x800) {
      out += hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)];
      continue;
    }
    if (c < 0xD800 || c >= 0xE000) {
      out += hexTable[0xE0 | (c >> 12)] +
             hexTable[0x80 | ((c >> 6) & 0x3F)] +
             hexTable[0x80 | (c & 0x3F)];
      continue;
    }
    // Surrogate pair
    ++i;
    c = 0x10000 + (((c & 0x3FF) << 10) | (str.charCodeAt(i) & 0x3FF));
    out += hexTable[0xF0 | (c >> 18)] +
           hexTable[0x80 | ((c >> 12) & 0x3F)] +
           hexTable[0x80 | ((c >> 6) & 0x3F)] +
           hexTable[0x80 | (c & 0x3F)];
  }
  return out;
};

var stringifyPrimitive = function(v) {
  if (typeof v === 'string')
    return v;
  if (typeof v === 'number' && isFinite(v))
    return '' + v;
  if (typeof v === 'boolean')
    return v ? 'true' : 'false';
  return '';
};




function decodeStr(s, decoder) {
  try {
    return decoder(s);
  } catch (e) {
    return QueryString.unescape(s, true);
  }
}
