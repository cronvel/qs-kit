# TOC
   - [Parse](#parse)
   - [Stringify](#stringify)
   - [Historical bugs](#historical-bugs)
<a name=""></a>
 
<a name="parse"></a>
# Parse
Scalar usage.

```js
expect( qs.parse( "k=v" ) ).to.eql( { k: "v" } ) ;
expect( qs.parse( "key=value" ) ).to.eql( { key: "value" } ) ;
expect( qs.parse( "a=1" ) ).to.eql( { a: 1 } ) ;
expect( qs.parse( "key=value&a=1" ) ).to.eql( { key: "value" , a: 1 } ) ;
expect( qs.parse( "key=value&a=1&b=2&c=string" ) ).to.eql( { key: "value" , a: 1 , b: 2 , c: "string" } ) ;
```

String encoded.

```js
expect( qs.parse( "key=some%20value" ) ).to.eql( { key: "some value" } ) ;
```

<a name="stringify"></a>
# Stringify
<a name="historical-bugs"></a>
# Historical bugs
Bad query string: =one=two.

```js
// should throw
expect( function() { qs.parse( "=one=two" ) ; } ).to.throwException() ;
```

