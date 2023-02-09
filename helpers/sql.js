const { BadRequestError } = require("../expressError");

// Takes data from updates and parses into json for updating db
// json is converted to 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // jsToSql merely changes js inputs into their SQL counterparts
  // Turn keys for submitted object argument into array
  const keys = Object.keys(dataToUpdate);
  // if array is 0, throw error
  if (keys.length === 0) throw new BadRequestError("No data");
  // map array into input strings - make sure the column names are in SQL format
  // ensure string fits format for inserting data into db in non-attackable way 
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  // return in format to be converted into query string in update method
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
