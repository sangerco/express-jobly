const { BadRequestError } = require("../expressError");

// Takes data from updates and parses into json for updating db
// json is converted to 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // Turn keys for submitted object argument into array
  const keys = Object.keys(dataToUpdate);
  // if array is 0, throw error
  if (keys.length === 0) throw new BadRequestError("No data");
  // map array into into individual arrays, if no column already exists, insert into new array
  // create string to fit format for inserting data into db in non-attackable way 
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  // convert array into strings, followed by array of submitted object values
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
