require('@babel/register')({
  sourceType: 'unambiguous',
  plugins: ['async-debugger/babel-plugin'],
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
});
