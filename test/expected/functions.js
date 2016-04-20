//  foo :: Integer -> Integer
var foo = def("foo", {}, [$.Integer, $.Integer], function (x) {
  return x + 10;
});

//    concat :: (Semigroup a, Flam a) => a -> a -> a
const concat = def("concat", {
  a: [Semigroup, Flam]
}, [a, a, a], (x, y) => x.concat(y));

//    head :: [a] -> Maybe a
const head = def("head", {}, [$.Array(a), $.Maybe(a)], x => x.length === 0 ? Nothing() : Just(x[0]));

//# chain :: (b -> Either a c) -> Either a b -> Either a c
//.
//. Takes a function and returns `this` if `this` is a Left; otherwise
//. it returns the result of applying the function to this Right's value.
//.
//. ```javascript
//. > global.sqrt = n =>
//. .   n < 0 ? S.Left('Cannot represent square root of negative number')
//. .         : S.Right(Math.sqrt(n))
//. sqrt
//.
//. > S.Left('Cannot divide by zero').chain(sqrt)
//. Left('Cannot divide by zero')
//.
//. > S.Right(-1).chain(sqrt)
//. Left('Cannot represent square root of negative number')
//.
//. > S.Right(25).chain(sqrt)
//. Right(5)
//. ```
const chain = def("chain", {}, [$.Function, $.Either(a, b), $.Either(a, c)], (either, f) => f(either.value));