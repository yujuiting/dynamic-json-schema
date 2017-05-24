console.log(JSON.stringify({
  "__type": "validator",
  "__id": "fake-id-1",
  "name": "number-validator",
  "fn": function (value) { return typeof value === "number" }.toString(),
  "errorMessage": "Type of {value} should be number"
}));