

# QS Kit

A query string manipulation toolbox.

Early alpha.



Full BDD spec generated by Mocha:


# TOC
   - [Parse](#parse)
   - [Stringify](#stringify)
   - [Historical bugs](#historical-bugs)
<a name=""></a>
 
<a name="parse"></a>
# Parse
Scalar.

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

Array 'autoPush' option.

```js
options = { autoPush: true } ;
expect( qs.parse( "key=one&key=two&key=three" ) ).to.eql( { key: 'three' } ) ;
expect( qs.parse( "key=one&key=two&key=three" , options ) ).to.eql( { key: [ 'one' , 'two' , 'three' ] } ) ;
```

Array with the 'brackets' option.

```js
var options = { brackets: true } ;
expect( qs.parse( "key=[one,two,three]" ) ).to.eql( { key: "[one,two,three]" } ) ;
expect( qs.parse( "key=[one,two,three]" , options ) ).to.eql( { key: [ 'one' , 'two' , 'three' ] } ) ;
```

Array 'keyPath' option.

```js
options = { keyPath: true } ;
expect( qs.parse( "a[0]=val&a[1]=val2" ) ).to.eql( { "a[0]": 'val' , "a[1]": 'val2' } ) ;
expect( qs.parse( "a[0]=val&a[1]=val2" , options ) ).to.eql( { a: [ 'val' , 'val2' ] } ) ;
```

Object 'keyPath' option.

```js
options = { keyPath: true } ;
expect( qs.parse( "a.b=val" ) ).to.eql( { "a.b": 'val' } ) ;
expect( qs.parse( "a.b=val" , options ) ).to.eql( { a: { b: 'val' } } ) ;
```

'keyPath' and 'autoPush' option.

```js
expect( qs.parse( "a.b=val&a.b=val2" ) ).to.eql( { "a.b": "val2" } ) ;
expect( qs.parse( "a.b=val&a.b=val2" , { keyPath: true } ) ).to.eql( { a: { b: "val2" } } ) ;
expect( qs.parse( "a.b=val&a.b=val2" , { autoPush: true } ) ).to.eql( { "a.b": [ "val" , "val2" ] } ) ;
expect( qs.parse( "a.b=val&a.b=val2" , { keyPath: true , autoPush: true } ) ).to.eql( { a: { b: [ "val" , "val2" ] } } ) ;
```

<a name="stringify"></a>
# Stringify
<a name="historical-bugs"></a>
# Historical bugs
Bad query string.

```js
// should throw
expect( function() { qs.parse( "=one=two" ) ; } ).to.throwException() ;
```

