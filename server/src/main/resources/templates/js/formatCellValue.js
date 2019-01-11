var NumericUnit;
(function (NumericUnit) {
    NumericUnit["None"] = "\u65E0";
    NumericUnit["TenThousand"] = "\u4E07";
    NumericUnit["OneHundredMillion"] = "\u4EBF";
    NumericUnit["Thousand"] = "k";
    NumericUnit["Million"] = "M";
    NumericUnit["Giga"] = "G";
})(NumericUnit || (NumericUnit = {}));
var FieldFormatTypes;
(function (FieldFormatTypes) {
    FieldFormatTypes["Default"] = "default";
    FieldFormatTypes["Numeric"] = "numeric";
    FieldFormatTypes["Currency"] = "currency";
    FieldFormatTypes["Percentage"] = "percentage";
    FieldFormatTypes["ScientificNotation"] = "scientificNotation";
    FieldFormatTypes["Date"] = "date";
    FieldFormatTypes["Custom"] = "custom";
})(FieldFormatTypes || (FieldFormatTypes = {}));

function formartByDecimalPlaces(value, decimalPlaces) {
  if (isNaN(value)) {
      return value;
  }
  if (decimalPlaces < 0 || decimalPlaces > 100) {
      return value;
  }
  return (+value).toFixed(decimalPlaces);
}
function formatByThousandSeperator(value, useThousandSeparator) {
  if (isNaN(+value) || !useThousandSeparator) {
      return value;
  }
  var parts = value.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  var formatted = parts.join('.');
  return formatted;
}
function formatByUnit(value, unit) {
  var numericValue = +value;
  if (isNaN(numericValue)) {
      return value;
  }
  var exponent = 0;
  switch (unit) {
      case NumericUnit.TenThousand:
          exponent = 4;
          break;
      case NumericUnit.OneHundredMillion:
          exponent = 8;
          break;
      case NumericUnit.Thousand:
          exponent = 3;
          break;
      case NumericUnit.Million:
          exponent = 6;
          break;
      case NumericUnit.Giga:
          exponent = 9;
          break;
  }
  return numericValue / Math.pow(10, exponent);
}

function getFormattedValue(value, format) {
    if (!format) {
        return value;
    }
    var format = JSON.parse(format)
    var formatType = format.formatType;
    var config = format[formatType];
    var formattedValue;
    switch (formatType) {
        case FieldFormatTypes.Numeric:
        case FieldFormatTypes.Currency:
            var _a = config, decimalPlaces = _a.decimalPlaces, unit = _a.unit, useThousandSeparator = _a.useThousandSeparator;
            formattedValue = formatByUnit(value, unit);
            formattedValue = formartByDecimalPlaces(formattedValue, decimalPlaces);
            formattedValue = formatByThousandSeperator(formattedValue, useThousandSeparator);
            if (unit !== NumericUnit.None) {
                formattedValue = "" + formattedValue + unit;
            }
            if (formatType === FieldFormatTypes.Currency) {
                var _b = config, prefix = _b.prefix, suffix = _b.suffix;
                formattedValue = [prefix, formattedValue, suffix].join('');
            }
            break;
        case FieldFormatTypes.Percentage:
            formattedValue = (+value) * 100;
            formattedValue = isNaN(formattedValue) ? value
                : formartByDecimalPlaces(formattedValue, config.decimalPlaces) + "%";
            break;
        case FieldFormatTypes.ScientificNotation:
            formattedValue = (+value).toExponential(config.decimalPlaces);
            formattedValue = isNaN(formattedValue) ? value : formattedValue;
            break;
        case FieldFormatTypes.Custom:
            // @TODO
            break;
        default:
            formattedValue = value;
            break;
    }
    return formattedValue;
}

function getFormattedValues (values, format) { 
    if (!values || !values.length) { return [] } 
    var formattedValues = []
    for (var i = 0; i < values.length; i++) {
      formattedValues.push(getFormattedValue(values[i], format))
    }
    return formattedValues 
}

function test(rows){
  return rows
}

