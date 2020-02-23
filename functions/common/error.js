exports.ParsingError = function (message='Parsing error.') {
  const err = new Error(message);
  err.code = 500;
  return err;
}