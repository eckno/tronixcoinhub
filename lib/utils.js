const _ = require('lodash');
const { Iconv } = require('iconv');
const validator = require('validator');
const crypto = require('crypto');
const dayjs = require('dayjs');
const _strtotime = require("./php_js/strtotime");
const _arsort = require("./php_js/arsort");
const _array_reverse = require("./php_js/array_reverse");
const _date = require("./date");
const _base64_decode = require("./php_js/base64_decode");
const _base64_encode = require("./php_js/base64_encode");

let _this = this;
/**
 *
 * @todo complete all use cases for function, update matches
 * @param {object} pattern
 * @param {string} subject
 * @param {*} matches
 * @param {int} flags
 * @param {int} offset
 * @returns {int|false}
 */
exports.preg_match = (pattern, subject, matches = null, flags = 0, offset = 0) => {

    return _.toString(subject).match(pattern);
};

exports.uniqid = (prefix = "", more_entropy = false) => {
    const sec = Date.now() * 1000 + Math.random() * 1000;
    const id = sec.toString(16).replace(/\./g, "").padEnd(13, "0");
    return `${prefix}${id}${more_entropy ? `.${Math.trunc(Math.random() * 100000000)}` : ""}`;
};


/**
 * function to convert array strings to utf8 encoding
 * @param {*} record
 * @returns
 */
exports.utf8_convert = (record) => {
  //array conversion
  if (this.isObject(record) && !this.empty(record)) {
    //loop through each value and convert to utf8
    Object.keys(record).forEach((rec_key) => {
      let value=record[rec_key];
      if (this.isString(value) && !this.empty(value)) {
        try {
          value = this.convert_smart_quotes(value);
          record[rec_key] = this.convertUTF7toUTF8(value);
        } catch (e){}
      } else if (this.isObject(value)) {
        record[rec_key] = this.utf8_convert(value);
      }
    })
  } else if (this.isString(record) && !this.empty(record)) {
    //just a string conversion
    try {
      record = this.convert_smart_quotes(record);
      record = this.convertUTF7toUTF8(record);
    } catch (e){}
  }
  return record;
}

/**
 * Function to convert quotes
 * @param {string} str
 * @returns
 */
exports.convert_smart_quotes = (str) => {
  if (this.isString(str)) return str;
  const search = [String.fromCharCode(145), String.fromCharCode(146), '´', '′', '’', '‘', String.fromCharCode(147), String.fromCharCode(148), String.fromCharCode(151)];
  const replace = ["'", "'", "'", "'", "'", "'", '"', '"', '-'];

  search.map((s, i) => {
    str.replace(s, replace[i]);
  })
  return str;
}


/**
 * Function to utf7 to utf8 chars
 * @todo: Fix issue with normalizing emails e.g. test+32@gamil.com is returned as test@gmail.com. This shouldnt work this way
 * @param {string} str
 * @returns
 */
exports.convertUTF7toUTF8 = (str)=> {
  return str;
  let b64Token = /\+([a-z\d/+]*-?)/gi,
    hex, len, replace, i;

  return str.replace(b64Token, function(match, grp) {
    hex = Buffer.from(grp, 'base64');
    len = hex.length >> 1 << 1;
    replace = '';
    i = 1;

    for(i; i < len; i = i + 2) {
      replace += String.fromCharCode(hex.readUInt16BE(i - 1));
    }

    return replace;
  });
}

/**
 *
 * @param {string} str
 * @returns
 */
exports.humanize = (str) => {
    if (!_.isString(str)) return str;
    return this.ucwords(str.trim().toLowerCase().replace(/[_]+/g, ' '));
}

/**
 * Uppercase the first character of each word in a string
 * @param {string} str
 * @returns
 */
exports.ucwords = (str) => {
  if (!_.isString(str) || !str.trim()) {
    return str;
  }

  let words = str.trim().split(' ');
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }
  return words.join(' ');
}

/**
 * Reindex a result set/array by a given key
 * @param {array} array Array to be searched
 * @param {string} key Field to search
 * Useful for taking database result sets and indexing them by id or unique_hash
 *
 */
exports.reindex = (array, key = 'id') => {
    const indexed_array = {};
    if ((_.isArray(array) || _.isObject(array)) && !this.empty(array)) {
        _.forEach(array, item => {
            if (this.isObject(item) && _.has(item, key)) {
                indexed_array[item[key]] = item;
            }
        })
        return indexed_array;
    } else {
        return false;
    }
}

/**
 * Parse about any English textual datetime description into a Unix timestamp
 * @param {string} datetime
 * The string to parse.
 *
 * @param {number|null} baseTimestamp [optional]
 * Default value: null The timestamp which is used as a base for the calculation of relative dates.
 *
 * @return {number|false}
 * a timestamp on success, false otherwise.
 * Use this function or import and use strtotime from /lib/php_js/strtotime.js
 */
exports.strtotime = (datetime, baseTimestamp=null) => {
    return _strtotime(datetime, baseTimestamp);
}

//      note 1: SORT_STRING (as well as natsort and natcasesort) might also be
//      note 1: integrated into all of these functions by adapting the code at
//      note 1: https://sourcefrog.net/projects/natsort/natcompare.js
//      note 1: The examples are correct, this is a new way
//      note 1: Credits to: https://javascript.internet.com/math-related/bubble-sort.html
//      note 1: This function deviates from PHP in returning a copy of the array instead
//      note 1: of acting by reference and returning true; this was necessary because
//      note 1: IE does not allow deleting and re-adding of properties without caching
//      note 1: of property position; you can set the ini of "locutus.sortByReference" to true to
//      note 1: get the PHP behavior, but use this only if you are in an environment
//      note 1: such as Firefox extensions where for-in iteration order is fixed and true
//      note 1: property deletion is supported. Note that we intend to implement the PHP
//      note 1: behavior by default if IE ever does allow it; only gives shallow copy since
//      note 1: is by reference in PHP anyways
//      note 1: Since JS objects' keys are always strings, and (the
//      note 1: default) SORT_REGULAR flag distinguishes by key type,
//      note 1: if the content is a numeric string, we treat the
//      note 1: "original type" as numeric.
//   example 1: var $data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'}
//   example 1: arsort($data)
//   example 1: var $result = $data
//   returns 1: {a: 'orange', d: 'lemon', b: 'banana', c: 'apple'}
//   example 2: ini_set('locutus.sortByReference', true)
//   example 2: var $data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'}
//   example 2: arsort($data)
//   example 2: var $result = $data
//   returns 2: {a: 'orange', d: 'lemon', b: 'banana', c: 'apple'}
//        test: skip-1
exports.arsort = (inputArr, sortFlags) => {
    return _arsort(inputArr, sortFlags);
}

//  discuss at: https://locutus.io/php/array_reverse/
// original by: Kevin van Zonneveld (https://kvz.io)
// improved by: Karol Kowalski
//   example 1: array_reverse( [ 'php', '4.0', ['green', 'red'] ], true)
//   returns 1: { 2: ['green', 'red'], 1: '4.0', 0: 'php'}
exports.array_reverse = (array, preserveKeys) => {
    return _array_reverse(array, preserveKeys);
}

/**
 * js version of php date()
 * @param {string} format
 * The string format.
 *
 * @param {number|null} timestamp [optional]
 * Default value: null The timestamp which is used as a base for the calculation of relative dates.
 *
 * @return {string|false}
 * a formatted date on success.
 */
exports.date = (format, timestamp) => {
    return _date(format, timestamp);
}

/**
 *
 * @todo Cover all use cases
 * @param {*} body
 * @param {*} rule
 * @returns
 */
exports.filter_var = (body, rule) => {
    switch (rule) {
        case "FILTER_VALIDATE_EMAIL":
            return validator.isEmail(body);
        case "FILTER_SANITIZE_EMAIL":
            return validator.normalizeEmail(body);
        case "FILTER_VALIDATE_URL":
          return validator.isURL(body);
        case "FILTER_FLAG_NO_ENCODE_QUOTES":
        // return validator.escape(body);
        default:
            return body;
    }
};

/**
 * Simple rule conversion for code igniter, probably missing some but these are the common ones
 * @param rule     ci rule e.g. required, minlength etc
 * @param label    field label e.g. Email Address
 * @return {array}    {'class': [class name], 'arguments': [initial data for class initialization])}
 */
exports.convert_ci_rules = (rule, label, id = "", database = "") => {
    let length = 0, match = null;
    let validationClass = "", validate_settings = {}, values;
    let validator_rule="";
    if (_.includes(rule, 'match_field') !== false || _.includes(rule, 'minlength') !== false || _.includes(rule, 'is_unique_in_collection') !== false || _.includes(rule, 'exists_in_collection') !== false || _.includes(rule, 'maxlength') !== false) {
        match = this.preg_match(/\[(.*?)\]/, rule, match);
        if(match && this.isArray(match) && match[1]) {
          length = match[1];
        }
        if (_.includes(rule, 'minlength') !== false) {
            rule = 'minlength';
        } else if (_.includes(rule, 'match_field') !== false) {
            rule = 'match_field';
        } else if (_.includes(rule, 'maxlength') !== false) {
            rule = 'maxlength';
        } else if (_.includes(rule, 'is_unique_in_collection') !== false) {
            rule = 'is_unique_in_collection';
        } else {
            rule = 'exists_in_collection';
        }

    }
    //Default messages.

  let collection="";
  let collection_field="";
  if(typeof length ==="string") {
    let $values = length.split(".");
    collection = !this.empty($values[0]) ? $values[0] : "";
    collection_field = !this.empty($values[1]) ? $values[1] : "";
  }

    switch (rule) {
        case 'valid_json_array':
            validate_settings = {
                'message': `The ${label} field is not a valid json array`
            };
            validationClass = "ValidJsonArray";
          validator_rule = "json_array";
            break;
        case 'required':
            validate_settings = {
                'message': `The ${label} field is required`
            };
            validationClass = "Presence";
            validator_rule = "required";
            break;
        case 'minlength':
            validate_settings = {
                'message': `The ${label} field must be a minimum of ${length} characters`
            };
            validationClass = "Length";
          validator_rule = `min:${length}`;
            break;
        case 'maxlength':
            validate_settings = {
                'message': `The ${label} field must not exceed ${length} characters`
            };
            validationClass = "Length";
          validator_rule = `max:${length}`;
            break;
        case 'valid_phone':
            validate_settings = {
                'message': `The ${label} field is not a valid phone number`
            };
            validationClass = "Format";
          validator_rule = `valid_phone`;
            break;
        case 'valid_email':
            validate_settings = {
                'message': `The ${label} field is not valid`
            };
          validator_rule = `email`;
            validationClass = "ValidEmail";
            break;
        case 'is_unique_in_collection':
            validate_settings = {
                'message': `The ${label} field already exists`
            };
          validator_rule = `${!this.empty(collection)?`is_unique_in_collection:${collection},${collection_field},${database},${id}`:''}`;
            validationClass = "IsUniqueInCollection";
            break;
        case 'exists_in_collection':
            validate_settings = {
                'message': `The ${label} field already exists`
            };
          validator_rule = `exists_in_collection:${collection},${collection_field}`;
          validator_rule = `${!this.empty(collection)?`exists_in_collection:${collection},${collection_field}`:''}`;
            validationClass = "ExistsInCollection";
            break;

        // case 'match_field':
        //     validate_settings = {
        //         'with': !this.empty(length) ? length : "",
        //         'message': `The ${label} field does not match ${length}`
        //     };
        //     validationClass = "Confirmation";
        //     break;
        // case 'valid_full_date':
        //     validate_settings = {
        //         'format': !this.empty(length) ? length : "",
        //         'message': `The ${label} field is invalid (Incorrect Date)`
        //     };
        //     validationClass = "ValidFullDate";
        //     break;
        // case 'valid_full_time':
        //     validate_settings = {
        //         'message': `The ${label} field is invalid (Incorrect Time)`
        //     };
        //     validationClass = "ValidFullTime";
        //     break;
        // case 'required_array':
        //     validate_settings = {
        //         'message': `The ${label} field is required`
        //     };
        //     validationClass = "RequiredArray";
        //     break;
        // case 'valid_latitude':
        //     validate_settings = {
        //         'message': `The ${label} field is invalid (Incorrect Latitude)`
        //     };
        //     validationClass = "ValidLatitude";
        //     break;
        // case 'valid_longitude':
        //     validate_settings = {
        //         'message': `The ${label} field is invalid (Incorrect Longitude)`
        //     };
        //     validationClass = "ValidLongitude";
        //     break;
    }
    return { 'class': validationClass, 'arguments': validate_settings, validator_rule };
};

exports.get_ip_address = (req) => {
    let ip = null;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.socket && req.socket.remoteAddress) {
        ip = req.socket.remoteAddress;
    } else {
        ip = req.ip;
    }
    return ip;
};

/**
 * Computes the difference of arrays
 * @param {array} value
 * @param {array} options
 * @return {array} an array containing all the entries from value that are not present in any of the other arrays (options).
 */
exports.array_diff = (value = [], options = []) => {
    return value.filter(v => !options.includes(v));
};

/**
 * Calculate the sha1 hash of a string
 * @todo Add salt to hash, add binary
 * @param {string} str The input string.
 * @param {boolean} binary [optional]
 * If the optional raw_output is set to true, then the sha1 digest is instead returned in raw binary format with a length of 20, otherwise the returned value is a 40-character hexadecimal number.
 * @returns {string} the sha1 hash as a string.
 */
exports.sha1 = (str, binary = false) => {
    const hash = crypto.createHash('sha1');
    return hash.update(str);
}

/**
 * Check for numeric character(s)
 * @todo check for all use cases in PHP's equivalent (check for ASCII values)
 * @param {string} text
 * @returns {boolean} true if every character in the string text is a decimal digit, false otherwise.
 */
exports.ctype_digit = (text) => {
    try {
        return Number.isInteger(Number(text));
    } catch (e) {
        return false;
    }
}

/**
 * Get valid phone number regex
 * @returns
 */
exports.get_valid_phone_regex = () => /^[+]?[0-9]+$/g;

/**
 * Verify phone number
 * @param {string} phone
 * @param {boolean} should_return_data
 * @returns
 */
exports.verify_phone_number = (phone, should_return_data) => {
    let allDigitPhone = phone.replace(/\D/g, "");

    if (!(allDigitPhone.length >= 10 && allDigitPhone.length <= 15 && /^[+]?[0-9]+$/g.test(allDigitPhone)) || (allDigitPhone.length === 10 && allDigitPhone.substr(0, 1) === "+")) {
        return false;
    }
    if (typeof should_return_data !== true) {
        return true;
    }
    if (allDigitPhone.startsWith("+")) {
        allDigitPhone = allDigitPhone.substring(1);
    }
    return allDigitPhone;
};

/**
 * Get the integer value of a variable
 * @param {*} value The scalar value being converted to an integer
 * @param {number} base [optional] The base for the conversion
 * @returns {number} The integer value of var on success, or 0 on failure. Empty arrays and objects return 0, non-empty arrays and objects return 1.
 * Strings will most likely return 0 although this depends on the leftmost characters of the string. The common rules of integer casting apply.
 */
exports.intval = (value, base = 10) => {
    try {
        if (this.isString(value) || this.isNumber(value)) {
            value = parseInt(value, base);
            if (_.isNaN(value)) return 0;
        } else if (!this.empty(value)) {
            value = 1;
        } else value = 0;

        return value;
    } catch (e) {
        return 0;
    }
}

/**
 * Counts all elements in an array, or something in an object.
 * @param {array|Countable} value — The array or the object.
 * @param {numbe} $mode [optional] If the optional mode parameter is set to COUNT_RECURSIVE (or 1), count will recursively count the array. This is particularly useful for counting all the elements of a multidimensional array. count does not detect infinite recursion.
 * @returns {number} the number of elements in var, which is typically an array, since anything else will have one element.
 * If var is not an array or an object with implemented Countable interface, 1 will be returned. There is one exception, if var is null, 0 will be returned.
 * Caution: count may return 0 for a variable that isn't set, but it may also return 0 for a variable that has been initialized with an empty array. Use isset to test if a variable is set.
 * count( any array_or_countable [, int $mode = COUNT_NORMAL ]): int
 *
 * @param {*} value
 */
exports.count = (value) => {
    if (!value) return 0;
    if (typeof value === "string" || Array.isArray(value)) {
        return value.length;
    }
    if (typeof value === "object") {
        return Object.keys(value).length;
    }
    return 0;
}

exports.cmp_time = (a, b) => {
    if (this.strtotime('1970/01/01 ' + a) === this.strtotime('1970/01/01 ' + b)) {
        return 0;
    }
    return (this.strtotime('1970/01/01 ' + a) < this.strtotime('1970/01/01 ' + b)) ? -1 : 1;
}

/**
 * Sort an array by keys using a user-defined comparison function
 * @param {array} array The input array.
 * @param {callable} callback The callback comparison function.
 * Function cmp_function should accept two parameters which will be filled by pairs of array keys. The comparison function must return an integer less than, equal to, or greater than zero if the first argument is considered to be respectively less than, equal to, or greater than the second.
 * @returns {boolean} true on success or false on failure.
 */
exports.uksort = (array, callback) => {
    if (Array.isArray(array)) {
        // return sorted array
        return array.sort(callback);
    } else if (typeof array === "object") {
        // sort object keys using callback return value
        const keysSort = Object.keys(array).sort(callback);

        // return object with sorted keys
        return keysSort.reduce((object, key) => {
            object[key] = array[key]
            return object
        }, {});
    }
}

/**
 * Validate date values
 * @param {String} date value to be validated
 * @param {String} format for date value (optional)
 * @param {String} start_date date for valid dates range (optional)
 * @param {String} end_date date for valid dates range (optional)
 * Useful for ensuing a date value is safe and correct
 *
 */
exports.validate_full_date = (date, format = "M/D/Y", start_date = '', end_date = '') => {
    let separator = "", explode = 0;
    if (_.includes(format, "/")) {
        separator = "/";
        explode = _.split(format, separator);
    } else if (_.includes(format, "-")) {
        separator = "-";
        explode = _.split(format, separator);
    }

    if (this.empty(separator) || this.count(explode) != 3) {
        return false;
    }
    let day = 0, month = 0, year = 0;
    _.forEach(explode, (ex_format, ex_key) => {
        if (_.isString(ex_format) && _.toUpper(ex_format.substr(0, 1)) === "M") {
            month = ex_key + 1;
        }
        if (_.isString(ex_format) && _.toUpper(ex_format.substr(0, 1)) === "Y") {
            year = ex_key + 1;
        }
        if (_.isString(ex_format) && _.toUpper(ex_format.substr(0, 1)) === "D") {
            day = ex_key + 1;
        }
    })

    const exploded_date = _.split(date, separator);
    if (
        this.count(exploded_date) !== 3
        || !_.includes([1, 2, 3], day) || !_.includes([1, 2, 3], month) || !_.includes([1, 2, 3], year)
        || day === month || day === year || month === year
    ) {
        return false;
    }
    const regex = [];
    regex[day - 1] = "[0-9]{1,2}";
    regex[month - 1] = "[0-9]{1,2}";
    regex[year - 1] = "[0-9]{1,4}";
    let split = [];
    let realdate = `${exploded_date[0]}-${exploded_date[1]}-${exploded_date[2]}`;
    if (this.preg_match(new RegExp(`^(${regex[0]})-(${regex[1]})-(${regex[2]})$`), realdate, split)) {
        if (!this.checkdate(split[month], split[day], split[year])) {
            return false;
        } else {
            if (!this.empty(start_date) && (this.strtotime(_.trim(date)) < this.strtotime(_.trim(start_date)))) {
                return false;
            }
            if (!this.empty(end_date) && (this.strtotime(_.trim(date)) > this.strtotime(_.trim(end_date)))) {
                return false;
            }
            return true;
        }
    }

    return false;
}

/**
 * Validate a Gregorian date
 * @param {number} month The month is between 1 and 12 inclusive.
 * @param {number} day The day is within the allowed number of days for the given month. Leap years are taken into consideration.
 * @param {number} year The year is between 1 and 32767 inclusive.
 * @returns {boolean} true if the date given is valid; otherwise returns false.
 */
exports.checkdate = (month, day, year) => {
    month = this.intval(month);
    day = this.intval(day);
    year = this.intval(year);

    const dayjs = require('dayjs');
    const customParseFormat = require('dayjs/plugin/customParseFormat');
    dayjs.extend(customParseFormat);

    return dayjs(`${year}-${month}-${day}`, 'YYYY-MM-DD', true).isValid();
}

exports.handleError = (e, error) => {
    if (this.isObject(e) && _.has(e, 'app_id')) {
        return e;
    }
    return !this.empty(error) ? error : "An error occurred. Please check your request and try again";
}

// note : Does not replace invalid characters with '_' as in PHP, nor does it return false with
// a seriously malformed URL. Besides function name, is essentially the same as parseUri as well as our allowing an extra slash after the scheme/protocol (to allow file:/// as in PHP)
// example: parse_url('https://gooduser:secretpassword@www.example.com/a@b.c/folder?foo=bar')
// returns: { scheme: 'https', host: 'www.example.com', path: '/a@b.c/folder', query: 'foo=bar', user: 'gooduser', pass: 'secretpassword' }
exports.parse_url = (str, component, mode = "php") => {
    let query;
    const uri = {}
    const allowed_modes = ["php", "strict", "loose"];
    mode = typeof mode === "string" && allowed_modes.includes(mode) ? mode : 'php';
    const key = [
        'source',
        'scheme',
        'authority',
        'userInfo',
        'user',
        'pass',
        'host',
        'port',
        'relative',
        'path',
        'directory',
        'file',
        'query',
        'fragment'
    ];

    let parser = {
        php: new RegExp([
            '(?:([^:\\/?#]+):)?',
            '(?:\\/\\/()(?:(?:()(?:([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?))?',
            '()',
            '(?:(()(?:(?:[^?#\\/]*\\/)*)()(?:[^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'
        ].join('')),
        strict: new RegExp([
            '(?:([^:\\/?#]+):)?',
            '(?:\\/\\/((?:(([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?))?',
            '((((?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'
        ].join('')),
        loose: new RegExp([
            '(?:(?![^:@]+:[^:@\\/]*@)([^:\\/?#.]+):)?',
            '(?:\\/\\/\\/?)?',
            '((?:(([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?)',
            '(((\\/(?:[^?#](?![^?#\\/]*\\.[^?#\\/.]+(?:[?#]|$)))*\\/?)?([^?#\\/]*))',
            '(?:\\?([^#]*))?(?:#(.*))?)'
        ].join(''))
    }
    const m = parser[mode].exec(str);
    let i = 14;
    while (i--) {
        if (m[i]) {
            uri[key[i]] = m[i]
        }
    }
    if (component) {
        return uri[component.replace('PHP_URL_', '').toLowerCase()]
    }
    if (mode !== 'php') {
        const name = 'queryKey'
        parser = /(?:^|&)([^&=]*)=?([^&]*)/g
        uri[name] = {}
        query = uri[key[12]] || ''
        query.replace(parser, function ($0, $1, $2) {
            if ($1) {
                uri[name][$1] = $2
            }
        })
    }
    delete uri.source
    return uri
}

/** PHP  preg_replace_callback js equivalent
* Perform a regular expression search and replace using a callback
* example: preg_replace_callback("/(\\@[^\\s,\\.]*)/ig",function(matches){return matches[0].toLowerCase();},'#FollowFriday @FGRibreau @GeekFG');
* returns: "#FollowFriday @fgribreau @geekfg"
* ! Only works with string
**/
exports.preg_replace_callback = (pattern, callback, subject, limit) => {
    if (typeof pattern !== "string") return subject;

    limit = !limit ? -1 : limit;

    let _flag = pattern.substring(pattern.lastIndexOf(pattern[0]) + 1),
        _pattern = pattern.substring(1, pattern.lastIndexOf(pattern[0])),
        reg = new RegExp(_pattern, _flag),
        rs = null,
        res = [],
        x = 0,
        ret = subject;

    if (limit === -1) {
        let tmp = [];

        do {
            tmp = reg.exec(subject);
            if (tmp !== null) {
                res.push(tmp);
            }
        } while (tmp !== null && _flag.indexOf('g') !== -1)
    } else {
        res.push(reg.exec(subject));
    }

    for (x = res.length - 1; x > -1; x--) {//explore match
        ret = ret.replace(res[x][0], callback(res[x]));
    }
    return ret;
}

/***
 * Trying to mimic PHP unset method
 * @param any data (string | array | key/pair object)
 * @param array  keyPath_or_index (array | string | number)
 * @param  string array_mode (index | value) if data is an array, determines whether keyPath_or_index represents the position/index or value of the item to delete - defualts to index
 ***/
exports.unset = (data, keyPath_or_index, array_mode = "index") => {
    if (typeof data == "object") {
        if (Array.isArray(data) && typeof keyPath_or_index !== "undefined") {
            let del_indexes = Array.isArray(keyPath_or_index) ? keyPath_or_index : [typeof keyPath_or_index === "number" ? keyPath_or_index : (typeof keyPath_or_index === "string" ? parseInt(keyPath_or_index, 10) : '')];
            if (array_mode !== "index") {
                del_indexes = Array.isArray(keyPath_or_index) ? keyPath_or_index : [keyPath_or_index];
            }
            if (del_indexes.length > 0 && del_indexes[0] !== "") {
                data = data.filter((value, index) => {
                    if (array_mode === "index") {
                        // delete based index
                        return del_indexes.indexOf(index) == -1;
                    }
                    // delete based on value
                    return del_indexes.indexOf(value) == -1;
                });
            }
        } else if (typeof keyPath_or_index !== "undefined") {
            _.unset(data, _.toString(keyPath_or_index));
        }
    } else if (typeof data === "string") {
        data = undefined;
    }

    return data;
}

/***
 * Javascript equivalent of PHP's rawurlencode
 * example: rawurlencode('https://www.google.nl/search?q=Locutus&ie=utf-8')
 * returns: 'https://www.google.nl/search?q=Locutus&ie='
 ***/
exports.rawurlencode = (str) => {
    str = (str + '')
    // Tilde should be allowed unescaped in future versions of PHP (as reflected below),
    // but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
}

/***
 * Javascript equivalent of PHP's rawurldecode
 * example: rawurldecode('https%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3D')
 * returns: 'https%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8'
 ***/
exports.rawurldecode = (str) => {
    return decodeURIComponent((str + '')
        .replace(/%(?![\da-f]{2})/gi, function () {
            // PHP tolerates poorly formed escape sequences
            return '%25'
        }))
}
/**
 * Helper function that checks if supplied parameter is an object type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an object or false if it's not.
 */
exports.isObject = (data = null) => {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Object]") ? true : false;
}

/**
 * Helper function that checks if supplied parameter is an array or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an array or false if it's not.
 */
exports.isArray = (data = null) => {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Array]") || Array.isArray(data) ? true : false;
}

/**
 * Helper function that checks if supplied parameter is a string type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a string or false if it's not.
 */
exports.isString = (data = null) => {
    return typeof data === "string";
}

/**
 * Helper function that checks if supplied parameter is a number type or not.
 * @param {any} value - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a number or false if it's not.
 */
exports.isNumber = (value = null) => {
    try {
        // return typeof data === "number" || /[0-9]/.test(data);
        return typeof value === 'number' && value === value && value !== Infinity && value !== -Infinity
    } catch (err) {
        return false;
    }
}

/**
 * Helper function that checks if supplied parameter is a boolean type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a booloean type or false if it's not.
 */
exports.isBoolean = (data = null) => {
    return (typeof data === "boolean" || data === true || data === false);
}

/**
 * Helper function that checks if supplied parameter is undefined type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is undefined or false if it's not.
 */
exports.isUndefined = (data = null) => {
    return ((typeof data === "undefined" || data == undefined) ? true : false);
}

/**
 * Helper function that checks if supplied parameter is defined or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is defined or false if it's not.
 */
exports.isDefined = (data = null) => {
    return typeof data !== "undefined";
}

/**
 * Helper function that checks if supplied parameter is null type or not.
 * @param {any} data - Represents the data to run check on. Accepts international numbers too
 * @returns {boolean} - Returns true if supplied parameter (data) is a valid phone number or false if it's not.
 */
exports.isNull = (data = null) => {
    return (data === null ? true : false);
}

/**
 * Cloned Helper function that checks if supplied parameter is empty (has no value) or not.
 * Cloned from the isEmpty() function
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
exports.empty = (data = null) => {
    return this.isEmpty(data);
}

/**
 * Helper function that checks if supplied parameter is empty (has no value) or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
exports.isEmpty = (data = null) => {
    let rtn = false;
    if (this.isString(data) && (data === "" || data.trim() === "")) rtn = true;
    else if (this.isNumber(data) && data === 0) rtn = true;
    else if (this.isBoolean(data) && data === false) rtn = true;
    else if (this.isObject(data) && Object.values(data).length === 0) rtn = true;
    else if (this.isArray(data) && data.length === 0) rtn = true;
    else if (this.isUndefined(data)) rtn = true;
    else if (this.isNull(data)) rtn = true;

    return rtn;
}

/**
 * Get the float value of a variable
 * @param {*} value The scalar value being converted to an float
 * @returns {number} The float value of var on success, or 0 on failure. Empty arrays and objects return 0, non-empty arrays and objects return 1.
 * Strings will most likely return 0 although this depends on the leftmost characters of the string. The common rules of float casting apply.
 */
exports.floatval = (value) => {
    try {
        if (_.isString(value) || _.isNumber(value)) {
            value = parseFloat(value);
            if (_.isNaN(value)) return 0;
        } else if (!this.empty(value)) {
            value = 1;
        } else value = 0;

        return value;
    } catch (e) {
        return 0;
    }
}

/**
 *
 * @param {*} table
 * @param {string} quoteStyle
 * @returns
 *
 * Example usage:  example 1: get_html_translation_table('HTML_SPECIALCHARS')
 * returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
 */
exports.get_html_translation_table = (table, quoteStyle) => {
    const entities = {}
    const hashMap = {}
    let decimal
    const constMappingTable = {}
    const constMappingQuoteStyle = {}
    let useTable = {}
    let useQuoteStyle = {}

    // Translate arguments
    constMappingTable[0] = 'HTML_SPECIALCHARS'
    constMappingTable[1] = 'HTML_ENTITIES'
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES'
    constMappingQuoteStyle[2] = 'ENT_COMPAT'
    constMappingQuoteStyle[3] = 'ENT_QUOTES'

    useTable = !isNaN(table)
        ? constMappingTable[table]
        : table
            ? table.toUpperCase()
            : 'HTML_SPECIALCHARS'

    useQuoteStyle = !isNaN(quoteStyle)
        ? constMappingQuoteStyle[quoteStyle]
        : quoteStyle
            ? quoteStyle.toUpperCase()
            : 'ENT_COMPAT'

    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
        throw new Error('Table: ' + useTable + ' not supported')
    }

    entities['38'] = '&amp;'
    if (useTable === 'HTML_ENTITIES') {
        entities['160'] = '&nbsp;'
        entities['161'] = '&iexcl;'
        entities['162'] = '&cent;'
        entities['163'] = '&pound;'
        entities['164'] = '&curren;'
        entities['165'] = '&yen;'
        entities['166'] = '&brvbar;'
        entities['167'] = '&sect;'
        entities['168'] = '&uml;'
        entities['169'] = '&copy;'
        entities['170'] = '&ordf;'
        entities['171'] = '&laquo;'
        entities['172'] = '&not;'
        entities['173'] = '&shy;'
        entities['174'] = '&reg;'
        entities['175'] = '&macr;'
        entities['176'] = '&deg;'
        entities['177'] = '&plusmn;'
        entities['178'] = '&sup2;'
        entities['179'] = '&sup3;'
        entities['180'] = '&acute;'
        entities['181'] = '&micro;'
        entities['182'] = '&para;'
        entities['183'] = '&middot;'
        entities['184'] = '&cedil;'
        entities['185'] = '&sup1;'
        entities['186'] = '&ordm;'
        entities['187'] = '&raquo;'
        entities['188'] = '&frac14;'
        entities['189'] = '&frac12;'
        entities['190'] = '&frac34;'
        entities['191'] = '&iquest;'
        entities['192'] = '&Agrave;'
        entities['193'] = '&Aacute;'
        entities['194'] = '&Acirc;'
        entities['195'] = '&Atilde;'
        entities['196'] = '&Auml;'
        entities['197'] = '&Aring;'
        entities['198'] = '&AElig;'
        entities['199'] = '&Ccedil;'
        entities['200'] = '&Egrave;'
        entities['201'] = '&Eacute;'
        entities['202'] = '&Ecirc;'
        entities['203'] = '&Euml;'
        entities['204'] = '&Igrave;'
        entities['205'] = '&Iacute;'
        entities['206'] = '&Icirc;'
        entities['207'] = '&Iuml;'
        entities['208'] = '&ETH;'
        entities['209'] = '&Ntilde;'
        entities['210'] = '&Ograve;'
        entities['211'] = '&Oacute;'
        entities['212'] = '&Ocirc;'
        entities['213'] = '&Otilde;'
        entities['214'] = '&Ouml;'
        entities['215'] = '&times;'
        entities['216'] = '&Oslash;'
        entities['217'] = '&Ugrave;'
        entities['218'] = '&Uacute;'
        entities['219'] = '&Ucirc;'
        entities['220'] = '&Uuml;'
        entities['221'] = '&Yacute;'
        entities['222'] = '&THORN;'
        entities['223'] = '&szlig;'
        entities['224'] = '&agrave;'
        entities['225'] = '&aacute;'
        entities['226'] = '&acirc;'
        entities['227'] = '&atilde;'
        entities['228'] = '&auml;'
        entities['229'] = '&aring;'
        entities['230'] = '&aelig;'
        entities['231'] = '&ccedil;'
        entities['232'] = '&egrave;'
        entities['233'] = '&eacute;'
        entities['234'] = '&ecirc;'
        entities['235'] = '&euml;'
        entities['236'] = '&igrave;'
        entities['237'] = '&iacute;'
        entities['238'] = '&icirc;'
        entities['239'] = '&iuml;'
        entities['240'] = '&eth;'
        entities['241'] = '&ntilde;'
        entities['242'] = '&ograve;'
        entities['243'] = '&oacute;'
        entities['244'] = '&ocirc;'
        entities['245'] = '&otilde;'
        entities['246'] = '&ouml;'
        entities['247'] = '&divide;'
        entities['248'] = '&oslash;'
        entities['249'] = '&ugrave;'
        entities['250'] = '&uacute;'
        entities['251'] = '&ucirc;'
        entities['252'] = '&uuml;'
        entities['253'] = '&yacute;'
        entities['254'] = '&thorn;'
        entities['255'] = '&yuml;'
    }

    if (useQuoteStyle !== 'ENT_NOQUOTES') {
        entities['34'] = '&quot;'
    }
    if (useQuoteStyle === 'ENT_QUOTES') {
        entities['39'] = '&#39;'
    }
    entities['60'] = '&lt;'
    entities['62'] = '&gt;'

    // ascii decimals to real symbols
    for (decimal in entities) {
        if (entities.hasOwnProperty(decimal)) {
            hashMap[String.fromCharCode(decimal)] = entities[decimal]
        }
    }

    return hashMap
}

/**
 * Convert all HTML entities to their applicable characters
 * @param {string} string
 * @param {string} quoteStyle
 * @returns
 *
 * Usage example: html_entity_decode('&amp;lt;');
 * returns: '&lt;'
 *
 * example 1: html_entity_decode('Kevin &amp; van Zonneveld')
 * returns 1: 'Kevin & van Zonneveld'
 *
 * example 2: html_entity_decode('&amp;lt;')
 * returns 2: '&lt;'
 */
exports.html_entity_decode = (string, quoteStyle=null) => {
    let tmpStr = ''
    let entity = ''
    let symbol = ''
    tmpStr = string.toString()
    const hashMap = this.get_html_translation_table('HTML_ENTITIES', quoteStyle)
    if (hashMap === false) {
        return false
    }

    delete (hashMap['&'])
    hashMap['&'] = '&amp;'
    for (symbol in hashMap) {
        entity = hashMap[symbol]
        tmpStr = tmpStr.split(entity).join(symbol)
    }
    tmpStr = tmpStr.split('&#039;').join("'")
    return tmpStr
}

/**
 * Convert all applicable characters to HTML entities
 * @param {string} string
 * @param {string} quoteStyle
 * @param {*} charset
 * @param {*} doubleEncode
 * @returns
 *
 * htmlentities("foo'bar","ENT_QUOTES")
 * returns:  'foo&#039;bar'
 *
 * example 1: htmlentities('Kevin & van Zonneveld')
 * returns 1: 'Kevin &amp; van Zonneveld'
 *
 * example 2: htmlentities("foo'bar","ENT_QUOTES")
 * returns 2: 'foo&#039;bar'
 */
exports.htmlentities = (string, quoteStyle="", charset="", doubleEncode=null) => {
    const hashMap = this.get_html_translation_table('HTML_ENTITIES', quoteStyle)
    string = string === null ? '' : string + ''
    if (!hashMap) {
        return false
    }
    if (quoteStyle && quoteStyle === 'ENT_QUOTES') {
        hashMap["'"] = '&#039;'
    }
    doubleEncode = doubleEncode === null || !!doubleEncode
    const regex = new RegExp('&(?:#\\d+|#x[\\da-f]+|[a-zA-Z][\\da-z]*);|[' +
        Object.keys(hashMap)
            .join('')
            // replace regexp special chars
            .replace(/([()[\]{}\-.*+?^$|/\\])/g, '\\$1') + ']',
        'g')
    return string.replace(regex, function (ent) {
        if (ent.length > 1) {
            return doubleEncode ? hashMap['&'] + ent.substr(1) : ent
        }
        return hashMap[ent]
    })
}

exports.is_dev = (req=null) => {
    const environment = process.env.NODE_ENV;
    if (environment && environment === "production") {
        return false;
    } else if ( 
        req && req.hostname
            && this.isString(req.hostname)
            && (
                _.includes(req.hostname, 'local.') === true
                || _.includes(req.hostname, 'local-') === true
                || _.includes(req.hostname, 'dev.') === true
                || _.includes(req.hostname, 'phreetech.') === true
                || _.includes(req.hostname, 'brightspotapps.') === true
            )
    ) {
        return true;
    }
    return true;
}

exports.is_local = (req) => {
    const environment = process.env.NODE_ENV;
    if (
        (environment && environment.indexOf('local') > -1)
        || ( req && req.hostname && this.isString(req.hostname) && (_.includes(req.hostname, 'local.') === true || _.includes(req.hostname, 'local-') === true))
    ) {
        return true;
    }
    return false;
}

exports.url_exists = (req) => {
    const hdrs = req.headers;
    return this.isArray(hdrs) ? this.preg_match(/[^HTTP\\/\\d+\\.\\d+\\s+2\\d\\d\\s+.*$]/, hdrs[0]) : false;
}

exports.skip_weekends = (date, numberofdays) => {
    const d = new Date(date);
    let t = d.getTime();
    // loop for X days
    let total_days = 0;

    //skip weekends
    for (let i = 0; i < numberofdays; i++) {
        // add 1 day to timestamp
        let addDay = 86400000;

        // get what day it is next day
        const nextDay = new Date(t + addDay).getDay();

        // if it's Saturday or Sunday get i-1
        if (nextDay === 0 || nextDay === 6) {
            i--;
        }

        // modify timestamp, add 1 day
        t = t + addDay;
        total_days++;
    }

    d.setTime(t);
    return { 'date': d, 'total_days': total_days };
}

/**
 * @todo resolve session_id
 * @returns
 */
exports.session_status = () => {
    return session_id() === '' ? 1 : 2;
}

exports.format_date = (date, format = 'M jS, Y') => {
    return dayjs(this.strtotime(date)).format(format);
}

exports.get_valid_phone_regex = () => {
    return /^[+]?([\d]{0,3})?[\(\.\-\s]?([\d]{3})[\)\.\-\s]*([\d]{3})[\.\-\s]?([\d]{4})$/;
}

exports.get_all_countries = () => {
    const countries = {
        "AF": "Afghanistan",
        "AL": "Albania",
        "DZ": "Algeria",
        "AS": "American Samoa",
        "AD": "Andorra",
        "AO": "Angola",
        "AI": "Anguilla",
        "AQ": "Antarctica",
        "AG": "Antigua and Barbuda",
        "AR": "Argentina",
        "AM": "Armenia",
        "AW": "Aruba",
        "AU": "Australia",
        "AT": "Austria",
        "AZ": "Azerbaijan",
        "BS": "Bahamas",
        "BH": "Bahrain",
        "BD": "Bangladesh",
        "BB": "Barbados",
        "BY": "Belarus",
        "BE": "Belgium",
        "BZ": "Belize",
        "BJ": "Benin",
        "BM": "Bermuda",
        "BT": "Bhutan",
        "BO": "Bolivia",
        "BA": "Bosnia and Herzegovina",
        "BW": "Botswana",
        "BV": "Bouvet Island",
        "BR": "Brazil",
        "IO": "British Indian Ocean Territory",
        "BN": "Brunei Darussalam",
        "BG": "Bulgaria",
        "BF": "Burkina Faso",
        "BI": "Burundi",
        "KH": "Cambodia",
        "CM": "Cameroon",
        "CA": "Canada",
        "CV": "Cape Verde",
        "KY": "Cayman Islands",
        "CF": "Central African Republic",
        "TD": "Chad",
        "CL": "Chile",
        "CN": "China",
        "CX": "Christmas Island",
        "CC": "Cocos (Keeling) Islands",
        "CO": "Colombia",
        "KM": "Comoros",
        "CG": "Congo",
        "CD": "Congo, the Democratic Republic of the",
        "CK": "Cook Islands",
        "CR": "Costa Rica",
        "CI": "Cote D'Ivoire",
        "HR": "Croatia",
        "CU": "Cuba",
        "CY": "Cyprus",
        "CZ": "Czech Republic",
        "DK": "Denmark",
        "DJ": "Djibouti",
        "DM": "Dominica",
        "DO": "Dominican Republic",
        "EC": "Ecuador",
        "EG": "Egypt",
        "SV": "El Salvador",
        "GQ": "Equatorial Guinea",
        "ER": "Eritrea",
        "EE": "Estonia",
        "ET": "Ethiopia",
        "FK": "Falkland Islands (Malvinas)",
        "FO": "Faroe Islands",
        "FJ": "Fiji",
        "FI": "Finland",
        "FR": "France",
        "GF": "French Guiana",
        "PF": "French Polynesia",
        "TF": "French Southern Territories",
        "GA": "Gabon",
        "GM": "Gambia",
        "GE": "Georgia",
        "DE": "Germany",
        "GH": "Ghana",
        "GI": "Gibraltar",
        "GR": "Greece",
        "GL": "Greenland",
        "GD": "Grenada",
        "GP": "Guadeloupe",
        "GU": "Guam",
        "GT": "Guatemala",
        "GN": "Guinea",
        "GW": "Guinea-Bissau",
        "GY": "Guyana",
        "HT": "Haiti",
        "HM": "Heard Island and Mcdonald Islands",
        "VA": "Holy See (Vatican City State)",
        "HN": "Honduras",
        "HK": "Hong Kong",
        "HU": "Hungary",
        "IS": "Iceland",
        "IN": "India",
        "ID": "Indonesia",
        "IR": "Iran, Islamic Republic of",
        "IQ": "Iraq",
        "IE": "Ireland",
        "IL": "Israel",
        "IT": "Italy",
        "JM": "Jamaica",
        "JP": "Japan",
        "JO": "Jordan",
        "KZ": "Kazakhstan",
        "KE": "Kenya",
        "KI": "Kiribati",
        "KP": "Korea, Democratic People's Republic of",
        "KR": "Korea, Republic of",
        "KW": "Kuwait",
        "KG": "Kyrgyzstan",
        "LA": "Lao People's Democratic Republic",
        "LV": "Latvia",
        "LB": "Lebanon",
        "LS": "Lesotho",
        "LR": "Liberia",
        "LY": "Libyan Arab Jamahiriya",
        "LI": "Liechtenstein",
        "LT": "Lithuania",
        "LU": "Luxembourg",
        "MO": "Macao",
        "MK": "Macedonia, the Former Yugoslav Republic of",
        "MG": "Madagascar",
        "MW": "Malawi",
        "MY": "Malaysia",
        "MV": "Maldives",
        "ML": "Mali",
        "MT": "Malta",
        "MH": "Marshall Islands",
        "MQ": "Martinique",
        "MR": "Mauritania",
        "MU": "Mauritius",
        "YT": "Mayotte",
        "MX": "Mexico",
        "FM": "Micronesia, Federated States of",
        "MD": "Moldova, Republic of",
        "MC": "Monaco",
        "MN": "Mongolia",
        "MS": "Montserrat",
        "MA": "Morocco",
        "MZ": "Mozambique",
        "MM": "Myanmar",
        "NA": "Namibia",
        "NR": "Nauru",
        "NP": "Nepal",
        "NL": "Netherlands",
        "AN": "Netherlands Antilles",
        "NC": "New Caledonia",
        "NZ": "New Zealand",
        "NI": "Nicaragua",
        "NE": "Niger",
        "NG": "Nigeria",
        "NU": "Niue",
        "NF": "Norfolk Island",
        "MP": "Northern Mariana Islands",
        "NO": "Norway",
        "OM": "Oman",
        "PK": "Pakistan",
        "PW": "Palau",
        "PS": "Palestinian Territory, Occupied",
        "PA": "Panama",
        "PG": "Papua New Guinea",
        "PY": "Paraguay",
        "PE": "Peru",
        "PH": "Philippines",
        "PN": "Pitcairn",
        "PL": "Poland",
        "PT": "Portugal",
        "PR": "Puerto Rico",
        "QA": "Qatar",
        "RE": "Reunion",
        "RO": "Romania",
        "RU": "Russian Federation",
        "RW": "Rwanda",
        "SH": "Saint Helena",
        "KN": "Saint Kitts and Nevis",
        "LC": "Saint Lucia",
        "PM": "Saint Pierre and Miquelon",
        "VC": "Saint Vincent and the Grenadines",
        "WS": "Samoa",
        "SM": "San Marino",
        "ST": "Sao Tome and Principe",
        "SA": "Saudi Arabia",
        "SN": "Senegal",
        "CS": "Serbia and Montenegro",
        "SC": "Seychelles",
        "SL": "Sierra Leone",
        "SG": "Singapore",
        "SK": "Slovakia",
        "SI": "Slovenia",
        "SB": "Solomon Islands",
        "SO": "Somalia",
        "ZA": "South Africa",
        "GS": "South Georgia and the South Sandwich Islands",
        "ES": "Spain",
        "LK": "Sri Lanka",
        "SD": "Sudan",
        "SR": "Suriname",
        "SJ": "Svalbard and Jan Mayen",
        "SZ": "Swaziland",
        "SE": "Sweden",
        "CH": "Switzerland",
        "SY": "Syrian Arab Republic",
        "TW": "Taiwan, Province of China",
        "TJ": "Tajikistan",
        "TZ": "Tanzania, United Republic of",
        "TH": "Thailand",
        "TL": "Timor-Leste",
        "TG": "Togo",
        "TK": "Tokelau",
        "TO": "Tonga",
        "TT": "Trinidad and Tobago",
        "TN": "Tunisia",
        "TR": "Turkey",
        "TM": "Turkmenistan",
        "TC": "Turks and Caicos Islands",
        "TV": "Tuvalu",
        "UG": "Uganda",
        "UA": "Ukraine",
        "AE": "United Arab Emirates",
        "GB": "United Kingdom",
        "US": "United States",
        "UM": "United States Minor Outlying Islands",
        "UY": "Uruguay",
        "UZ": "Uzbekistan",
        "VU": "Vanuatu",
        "VE": "Venezuela",
        "VN": "Viet Nam",
        "VG": "Virgin Islands, British",
        "VI": "Virgin Islands, U.s.",
        "WF": "Wallis and Futuna",
        "EH": "Western Sahara",
        "YE": "Yemen",
        "ZM": "Zambia",
        "ZW": "Zimbabwe"
    };

    return countries;
}

exports.get_state_cities = (state = null) => {
    const result = [];
    const state_cities = {
        "AL": [
            "Autauga",
            "Baldwin",
            "Barbour",
            "Bibb",
            "Blount",
            "Bullock",
            "Butler",
            "Calhoun",
            "Chambers",
            "Cherokee",
            "Chilton",
            "Choctaw",
            "Clarke",
            "Clay",
            "Cleburne",
            "Coffee",
            "Colbert",
            "Conecuh",
            "Coosa",
            "Covington",
            "Crenshaw",
            "Cullman",
            "Dale",
            "Dallas",
            "DeKalb",
            "Elmore",
            "Escambia",
            "Etowah",
            "Fayette",
            "Franklin",
            "Geneva",
            "Greene",
            "Hale",
            "Henry",
            "Houston",
            "Jackson",
            "Jefferson",
            "Lamar",
            "Lauderdale",
            "Lawrence",
            "Lee",
            "Limestone",
            "Lowndes",
            "Macon",
            "Madison",
            "Marengo",
            "Marion",
            "Marshall",
            "Mobile",
            "Monroe",
            "Montgomery",
            "Morgan",
            "Perry",
            "Pickens",
            "Pike",
            "Randolph",
            "Russell",
            "Shelby",
            "St. Clair",
            "Sumter",
            "Talladega",
            "Tallapoosa",
            "Tuscaloosa",
            "Walker",
            "Washington",
            "Wilcox",
            "Winston"
        ],
        "AK": [
            "Anchorage Borough",
            "Bethel Census Area",
            "Bristol Bay Borough",
            "Dillingham Census Area",
            "Fairbanks North Star Borough",
            "Haines Borough",
            "Juneau Borough",
            "Kenai Peninsula Borough",
            "Ketchikan Gateway Borough",
            "Kodiak Island Borough",
            "Matanuska-Susitna Borough",
            "Nome Census Area",
            "North Slope Borough",
            "Prince of Wales-Outer Ketchikan Census A",
            "Sitka Borough",
            "Skagway-Hoonah-Angoon Census Area",
            "Southeast Fairbanks Census Area",
            "Valdez-Cordova Census Area",
            "Wade Hampton Census Area",
            "Wrangell-Petersburg Census Area",
            "Yakutat Borough",
            "Yukon-Koyukuk Census Area"
        ],
        "AZ": [
            "Apache",
            "Cochise",
            "Coconino",
            "Gila",
            "Graham",
            "Greenlee",
            "La Paz",
            "Maricopa",
            "Mohave",
            "Navajo",
            "Pima",
            "Pinal",
            "Santa Cruz",
            "Yavapai",
            "Yuma"
        ],
        "AR": [
            "Arkansas",
            "Ashley",
            "Baxter",
            "Benton",
            "Boone",
            "Bradley",
            "Calhoun",
            "Carroll",
            "Chicot",
            "Clark",
            "Clay",
            "Cleburne",
            "Cleveland",
            "Columbia",
            "Conway",
            "Craighead",
            "Crawford",
            "Crittenden",
            "Cross",
            "Dallas",
            "Desha",
            "Drew",
            "Faulkner",
            "Franklin",
            "Fulton",
            "Garland",
            "Grant",
            "Greene",
            "Hempstead",
            "Hot Spring",
            "Howard",
            "Independence",
            "Izard",
            "Jackson",
            "Jefferson",
            "Johnson",
            "Lafayette",
            "Lawrence",
            "Lee",
            "Lincoln",
            "Little River",
            "Logan",
            "Lonoke",
            "Madison",
            "Marion",
            "Miller",
            "Mississippi",
            "Monroe",
            "Montgomery",
            "Nevada",
            "Newton",
            "Ouachita",
            "Perry",
            "Phillips",
            "Pike",
            "Poinsett",
            "Polk",
            "Pope",
            "Prairie",
            "Pulaski",
            "Randolph",
            "Saline",
            "Scott",
            "Searcy",
            "Sebastian",
            "Sevier",
            "Sharp",
            "St. Francis",
            "Stone",
            "Union",
            "Van Buren",
            "Washington",
            "White",
            "Woodruff",
            "Yell"
        ],
        "CA": [
            "Alameda",
            "Alpine",
            "Amador",
            "Butte",
            "Calaveras",
            "Colusa",
            "Contra Costa",
            "Del Norte",
            "El Dorado",
            "Fresno",
            "Glenn",
            "Humboldt",
            "Imperial",
            "Inyo",
            "Kern",
            "Kings",
            "Lake",
            "Lassen",
            "Los Angeles",
            "Madera",
            "Marin",
            "Mariposa",
            "Mendocino",
            "Merced",
            "Modoc",
            "Mono",
            "Monterey",
            "Napa",
            "Nevada",
            "Orange",
            "Placer",
            "Plumas",
            "Riverside",
            "Sacramento",
            "San Benito",
            "San Bernardino",
            "San Diego",
            "San Francisco",
            "San Joaquin",
            "San Luis Obispo",
            "San Mateo",
            "Santa Barbara",
            "Santa Clara",
            "Santa Cruz",
            "Shasta",
            "Sierra",
            "Siskiyou",
            "Solano",
            "Sonoma",
            "Stanislaus",
            "Sutter",
            "Tehama",
            "Trinity",
            "Tulare",
            "Tuolumne",
            "Ventura",
            "Yolo",
            "Yuba"
        ],
        "CO": [
            "Adams",
            "Alamosa",
            "Arapahoe",
            "Archuleta",
            "Baca",
            "Bent",
            "Boulder",
            "Broomfield",
            "Chaffee",
            "Cheyenne",
            "Clear Creek",
            "Conejos",
            "Costilla",
            "Crowley",
            "Custer",
            "Delta",
            "Denver",
            "Dolores",
            "Douglas",
            "Eagle",
            "El Paso",
            "Elbert",
            "Fremont",
            "Garfield",
            "Gilpin",
            "Grand",
            "Gunnison",
            "Hinsdale",
            "Huerfano",
            "Jackson",
            "Jefferson",
            "Kiowa",
            "Kit Carson",
            "La Plata",
            "Lake",
            "Larimer",
            "Las Animas",
            "Lincoln",
            "Logan",
            "Mesa",
            "Mineral",
            "Moffat",
            "Montezuma",
            "Montrose",
            "Morgan",
            "Otero",
            "Ouray",
            "Park",
            "Phillips",
            "Pitkin",
            "Prowers",
            "Pueblo",
            "Rio Blanco",
            "Rio Grande",
            "Routt",
            "Saguache",
            "San Juan",
            "San Miguel",
            "Sedgwick",
            "Summit",
            "Teller",
            "Washington",
            "Weld",
            "Yuma"
        ],
        "CT": [
            "Fairfield",
            "Hartford",
            "Litchfield",
            "Middlesex",
            "New Haven",
            "New London",
            "Tolland",
            "Windham"
        ],
        "DE": [
            "Kent",
            "New Castle",
            "Sussex"
        ],
        "DC": [
            "District of Columbia",
            "Montgomery",
        ],
        "FL": [
            "Alachua",
            "Baker",
            "Bay",
            "Bradford",
            "Brevard",
            "Broward",
            "Calhoun",
            "Charlotte",
            "Citrus",
            "Clay",
            "Collier",
            "Columbia",
            "DeSoto",
            "Dixie",
            "Duval",
            "Escambia",
            "Flagler",
            "Franklin",
            "Gadsden",
            "Gilchrist",
            "Glades",
            "Gulf",
            "Hamilton",
            "Hardee",
            "Hendry",
            "Hernando",
            "Highlands",
            "Hillsborough",
            "Holmes",
            "Indian River",
            "Jackson",
            "Jefferson",
            "Lafayette",
            "Lake",
            "Lee",
            "Leon",
            "Levy",
            "Liberty",
            "Madison",
            "Manatee",
            "Marion",
            "Martin",
            "Miami-Dade",
            "Monroe",
            "Nassau",
            "Okaloosa",
            "Okeechobee",
            "Orange",
            "Osceola",
            "Palm Beach",
            "Pasco",
            "Pinellas",
            "Polk",
            "Putnam",
            "Santa Rosa",
            "Sarasota",
            "Seminole",
            "St. Johns",
            "St. Lucie",
            "Sumter",
            "Suwannee",
            "Taylor",
            "Union",
            "Volusia",
            "Wakulla",
            "Walton",
            "Washington"
        ],
        "GA": [
            "Appling",
            "Atkinson",
            "Bacon",
            "Baker",
            "Baldwin",
            "Banks",
            "Barrow",
            "Bartow",
            "Ben Hill",
            "Berrien",
            "Bibb",
            "Bleckley",
            "Brantley",
            "Brooks",
            "Bryan",
            "Bulloch",
            "Burke",
            "Butts",
            "Calhoun",
            "Camden",
            "Candler",
            "Carroll",
            "Catoosa",
            "Charlton",
            "Chatham",
            "Chattahoochee",
            "Chattooga",
            "Cherokee",
            "Clarke",
            "Clay",
            "Clayton",
            "Clinch",
            "Cobb",
            "Coffee",
            "Colquitt",
            "Columbia",
            "Cook",
            "Coweta",
            "Crawford",
            "Crisp",
            "Dade",
            "Dawson",
            "Decatur",
            "DeKalb",
            "Dodge",
            "Dooly",
            "Dougherty",
            "Douglas",
            "Early",
            "Echols",
            "Effingham",
            "Elbert",
            "Emanuel",
            "Evans",
            "Fannin",
            "Fayette",
            "Floyd",
            "Forsyth",
            "Franklin",
            "Fulton",
            "Gilmer",
            "Glascock",
            "Glynn",
            "Gordon",
            "Grady",
            "Greene",
            "Gwinnett",
            "Habersham",
            "Hall",
            "Hancock",
            "Haralson",
            "Harris",
            "Hart",
            "Heard",
            "Henry",
            "Houston",
            "Irwin",
            "Jackson",
            "Jasper",
            "Jeff Davis",
            "Jefferson",
            "Jenkins",
            "Johnson",
            "Jones",
            "Lamar",
            "Lanier",
            "Laurens",
            "Lee",
            "Liberty",
            "Lincoln",
            "Long",
            "Lowndes",
            "Lumpkin",
            "Macon",
            "Madison",
            "Marion",
            "McDuffie",
            "McIntosh",
            "Meriwether",
            "Miller",
            "Mitchell",
            "Monroe",
            "Montgomery",
            "Morgan",
            "Murray",
            "Muscogee",
            "Newton",
            "Oconee",
            "Oglethorpe",
            "Paulding",
            "Peach",
            "Pickens",
            "Pierce",
            "Pike",
            "Polk",
            "Pulaski",
            "Putnam",
            "Quitman",
            "Rabun",
            "Randolph",
            "Richmond",
            "Rockdale",
            "Schley",
            "Screven",
            "Seminole",
            "Spalding",
            "Stephens",
            "Stewart",
            "Sumter",
            "Talbot",
            "Taliaferro",
            "Tattnall",
            "Taylor",
            "Telfair",
            "Terrell",
            "Thomas",
            "Tift",
            "Toombs",
            "Towns",
            "Treutlen",
            "Troup",
            "Turner",
            "Twiggs",
            "Union",
            "Upson",
            "Walker",
            "Walton",
            "Ware",
            "Warren",
            "Washington",
            "Wayne",
            "Webster",
            "Wheeler",
            "White",
            "Whitfield",
            "Wilcox",
            "Wilkes",
            "Wilkinson",
            "Worth"
        ],
        "HI": [
            "Hawaii",
            "Honolulu",
            "Kalawao",
            "Kauai",
            "Maui"
        ],
        "ID": [
            "Ada",
            "Adams",
            "Bannock",
            "Bear Lake",
            "Benewah",
            "Bingham",
            "Blaine",
            "Boise",
            "Bonner",
            "Bonneville",
            "Boundary",
            "Butte",
            "Camas",
            "Canyon",
            "Caribou",
            "Cassia",
            "Clark",
            "Clearwater",
            "Custer",
            "Elmore",
            "Franklin",
            "Fremont",
            "Gem",
            "Gooding",
            "Idaho",
            "Jefferson",
            "Jerome",
            "Kootenai",
            "Latah",
            "Lemhi",
            "Lewis",
            "Lincoln",
            "Madison",
            "Minidoka",
            "Nez Perce",
            "Oneida",
            "Owyhee",
            "Payette",
            "Power",
            "Shoshone",
            "Teton",
            "Twin Falls",
            "Valley",
            "Washington"
        ],
        "IL": [
            "Adams",
            "Alexander",
            "Bond",
            "Boone",
            "Brown",
            "Bureau",
            "Calhoun",
            "Carroll",
            "Cass",
            "Champaign",
            "Christian",
            "Clark",
            "Clay",
            "Clinton",
            "Coles",
            "Cook",
            "Crawford",
            "Cumberland",
            "De Witt",
            "DeKalb",
            "Douglas",
            "DuPage",
            "Edgar",
            "Edwards",
            "Effingham",
            "Fayette",
            "Ford",
            "Franklin",
            "Fulton",
            "Gallatin",
            "Greene",
            "Grundy",
            "Hamilton",
            "Hancock",
            "Hardin",
            "Henderson",
            "Henry",
            "Iroquois",
            "Jackson",
            "Jasper",
            "Jefferson",
            "Jersey",
            "Jo Daviess",
            "Johnson",
            "Kane",
            "Kankakee",
            "Kendall",
            "Knox",
            "La Salle",
            "Lake",
            "Lawrence",
            "Lee",
            "Livingston",
            "Logan",
            "Macon",
            "Macoupin",
            "Madison",
            "Marion",
            "Marshall",
            "Mason",
            "Massac",
            "McDonough",
            "McHenry",
            "McLean",
            "Menard",
            "Mercer",
            "Monroe",
            "Montgomery",
            "Morgan",
            "Moultrie",
            "Ogle",
            "Peoria",
            "Perry",
            "Piatt",
            "Pike",
            "Pope",
            "Pulaski",
            "Putnam",
            "Randolph",
            "Richland",
            "Rock Island",
            "Saline",
            "Sangamon",
            "Schuyler",
            "Scott",
            "Shelby",
            "St. Clair",
            "Stark",
            "Stephenson",
            "Tazewell",
            "Union",
            "Vermilion",
            "Wabash",
            "Warren",
            "Washington",
            "Wayne",
            "White",
            "Whiteside",
            "Will",
            "Williamson",
            "Winnebago",
            "Woodford"
        ],
        "IN": [
            "Adams",
            "Allen",
            "Bartholomew",
            "Benton",
            "Blackford",
            "Boone",
            "Brown",
            "Carroll",
            "Cass",
            "Clark",
            "Clay",
            "Clinton",
            "Crawford",
            "Daviess",
            "De Kalb",
            "Dearborn",
            "Decatur",
            "Delaware",
            "Dubois",
            "Elkhart",
            "Fayette",
            "Floyd",
            "Fountain",
            "Franklin",
            "Fulton",
            "Gibson",
            "Grant",
            "Greene",
            "Hamilton",
            "Hancock",
            "Harrison",
            "Hendricks",
            "Henry",
            "Howard",
            "Huntington",
            "Jackson",
            "Jasper",
            "Jay",
            "Jefferson",
            "Jennings",
            "Johnson",
            "Knox",
            "Kosciusko",
            "La Porte",
            "Lagrange",
            "Lake",
            "Lawrence",
            "Madison",
            "Marion",
            "Marshall",
            "Martin",
            "Miami",
            "Monroe",
            "Montgomery",
            "Morgan",
            "Newton",
            "Noble",
            "Ohio",
            "Orange",
            "Owen",
            "Parke",
            "Perry",
            "Pike",
            "Porter",
            "Posey",
            "Pulaski",
            "Putnam",
            "Randolph",
            "Ripley",
            "Rush",
            "Scott",
            "Shelby",
            "Spencer",
            "St. Joseph",
            "Starke",
            "Steuben",
            "Sullivan",
            "Switzerland",
            "Tippecanoe",
            "Tipton",
            "Union",
            "Vanderburgh",
            "Vermillion",
            "Vigo",
            "Wabash",
            "Warren",
            "Warrick",
            "Washington",
            "Wayne",
            "Wells",
            "White",
            "Whitley"
        ],
        "IA": [
            "Adair",
            "Adams",
            "Allamakee",
            "Appanoose",
            "Audubon",
            "Benton",
            "Black Hawk",
            "Boone",
            "Bremer",
            "Buchanan",
            "Buena Vista",
            "Butler",
            "Calhoun",
            "Carroll",
            "Cass",
            "Cedar",
            "Cerro Gordo",
            "Cherokee",
            "Chickasaw",
            "Clarke",
            "Clay",
            "Clayton",
            "Clinton",
            "Crawford",
            "Dallas",
            "Davis",
            "Decatur",
            "Delaware",
            "Des Moines",
            "Dickinson",
            "Dubuque",
            "Emmet",
            "Fayette",
            "Floyd",
            "Franklin",
            "Fremont",
            "Greene",
            "Grundy",
            "Guthrie",
            "Hamilton",
            "Hancock",
            "Hardin",
            "Harrison",
            "Henry",
            "Howard",
            "Humboldt",
            "Ida",
            "Iowa",
            "Jackson",
            "Jasper",
            "Jefferson",
            "Johnson",
            "Jones",
            "Keokuk",
            "Kossuth",
            "Lee",
            "Linn",
            "Louisa",
            "Lucas",
            "Lyon",
            "Madison",
            "Mahaska",
            "Marion",
            "Marshall",
            "Mills",
            "Mitchell",
            "Monona",
            "Monroe",
            "Montgomery",
            "Muscatine",
            "O'Brien",
            "Osceola",
            "Page",
            "Palo Alto",
            "Plymouth",
            "Pocahontas",
            "Polk",
            "Pottawattamie",
            "Poweshiek",
            "Ringgold",
            "Sac",
            "Scott",
            "Shelby",
            "Sioux",
            "Story",
            "Tama",
            "Taylor",
            "Union",
            "Van Buren",
            "Wapello",
            "Warren",
            "Washington",
            "Wayne",
            "Webster",
            "Winnebago",
            "Winneshiek",
            "Woodbury",
            "Worth",
            "Wright"
        ],
        "KS": [
            "Allen",
            "Anderson",
            "Atchison",
            "Barber",
            "Barton",
            "Bourbon",
            "Brown",
            "Butler",
            "Chase",
            "Chautauqua",
            "Cherokee",
            "Cheyenne",
            "Clark",
            "Clay",
            "Cloud",
            "Coffey",
            "Comanche",
            "Cowley",
            "Crawford",
            "Decatur",
            "Dickinson",
            "Doniphan",
            "Douglas",
            "Edwards",
            "Elk",
            "Ellis",
            "Ellsworth",
            "Finney",
            "Ford",
            "Franklin",
            "Geary",
            "Gove",
            "Graham",
            "Grant",
            "Gray",
            "Greeley",
            "Greenwood",
            "Hamilton",
            "Harper",
            "Harvey",
            "Haskell",
            "Hodgeman",
            "Jackson",
            "Jefferson",
            "Jewell",
            "Johnson",
            "Kearny",
            "Kingman",
            "Kiowa",
            "Labette",
            "Lane",
            "Leavenworth",
            "Lincoln",
            "Linn",
            "Logan",
            "Lyon",
            "Marion",
            "Marshall",
            "McPherson",
            "Meade",
            "Miami",
            "Mitchell",
            "Montgomery",
            "Morris",
            "Morton",
            "Nemaha",
            "Neosho",
            "Ness",
            "Norton",
            "Osage",
            "Osborne",
            "Ottawa",
            "Pawnee",
            "Phillips",
            "Pottawatomie",
            "Pratt",
            "Rawlins",
            "Reno",
            "Republic",
            "Rice",
            "Riley",
            "Rooks",
            "Rush",
            "Russell",
            "Saline",
            "Scott",
            "Sedgwick",
            "Seward",
            "Shawnee",
            "Sheridan",
            "Sherman",
            "Smith",
            "Stafford",
            "Stanton",
            "Stevens",
            "Sumner",
            "Thomas",
            "Trego",
            "Wabaunsee",
            "Wallace",
            "Washington",
            "Wichita",
            "Wilson",
            "Woodson",
            "Wyandotte"
        ],
        "KY": [
            "Adair",
            "Allen",
            "Anderson",
            "Ballard",
            "Barren",
            "Bath",
            "Bell",
            "Boone",
            "Bourbon",
            "Boyd",
            "Boyle",
            "Bracken",
            "Breathitt",
            "Breckenridge",
            "Bullitt",
            "Butler",
            "Caldwell",
            "Calloway",
            "Campbell",
            "Carlisle",
            "Carroll",
            "Carter",
            "Casey",
            "Christian",
            "Clark",
            "Clay",
            "Clinton",
            "Crittenden",
            "Cumberland",
            "Daviess",
            "Edmonson",
            "Elliott",
            "Estill",
            "Fayette",
            "Fleming",
            "Floyd",
            "Franklin",
            "Fulton",
            "Gallatin",
            "Garrard",
            "Grant",
            "Graves",
            "Grayson",
            "Green",
            "Greenup",
            "Hancock",
            "Hardin",
            "Harlan",
            "Harrison",
            "Hart",
            "Henderson",
            "Henry",
            "Hickman",
            "Hopkins",
            "Jackson",
            "Jefferson",
            "Jessamine",
            "Johnson",
            "Kenton",
            "Knott",
            "Knox",
            "Larue",
            "Laurel",
            "Lawrence",
            "Lee",
            "Leslie",
            "Letcher",
            "Lewis",
            "Lincoln",
            "Livingston",
            "Logan",
            "Lyon",
            "Madison",
            "Magoffin",
            "Marion",
            "Marshall",
            "Martin",
            "Mason",
            "McCracken",
            "McCreary",
            "McLean",
            "Meade",
            "Menifee",
            "Mercer",
            "Metcalfe",
            "Monroe",
            "Montgomery",
            "Morgan",
            "Muhlenberg",
            "Nelson",
            "Nicholas",
            "Ohio",
            "Oldham",
            "Owen",
            "Owsley",
            "Pendleton",
            "Perry",
            "Pike",
            "Powell",
            "Pulaski",
            "Robertson",
            "Rockcastle",
            "Rowan",
            "Russell",
            "Scott",
            "Shelby",
            "Simpson",
            "Spencer",
            "Taylor",
            "Todd",
            "Trigg",
            "Trimble",
            "Union",
            "Warren",
            "Washington",
            "Wayne",
            "Webster",
            "Whitley",
            "Wolfe",
            "Woodford"
        ],
        "LA": [
            "Acadia Parish",
            "Allen Parish",
            "Ascension Parish",
            "Assumption Parish",
            "Avoyelles Parish",
            "Beauregard Parish",
            "Bienville Parish",
            "Bossier Parish",
            "Caddo Parish",
            "Calcasieu Parish",
            "Caldwell Parish",
            "Cameron Parish",
            "Catahoula Parish",
            "Claiborne Parish",
            "Concordia Parish",
            "De Soto Parish",
            "East Baton Rouge Parish",
            "East Carroll Parish",
            "East Feliciana Parish",
            "Evangeline Parish",
            "Franklin Parish",
            "Grant Parish",
            "Iberia Parish",
            "Iberville Parish",
            "Jackson Parish",
            "Jefferson Davis Parish",
            "Jefferson Parish",
            "La Salle Parish",
            "Lafayette Parish",
            "Lafourche Parish",
            "Lincoln Parish",
            "Livingston Parish",
            "Madison Parish",
            "Morehouse Parish",
            "Natchitoches Parish",
            "Orleans Parish",
            "Ouachita Parish",
            "Plaquemines Parish",
            "Pointe Coupee Parish",
            "Rapides Parish",
            "Red River Parish",
            "Richland Parish",
            "Sabine Parish",
            "St. Bernard Parish",
            "St. Charles Parish",
            "St. Helena Parish",
            "St. James Parish",
            "St. John the Baptist Parish",
            "St. Landry Parish",
            "St. Martin Parish",
            "St. Mary Parish",
            "St. Tammany Parish",
            "Tangipahoa Parish",
            "Tensas Parish",
            "Terrebonne Parish",
            "Union Parish",
            "Vermilion Parish",
            "Vernon Parish",
            "Washington Parish",
            "Webster Parish",
            "West Baton Rouge Parish",
            "West Carroll Parish",
            "West Feliciana Parish",
            "Winn Parish"
        ],
        "ME": [
            "Androscoggin",
            "Aroostook",
            "Cumberland",
            "Franklin",
            "Hancock",
            "Kennebec",
            "Knox",
            "Lincoln",
            "Oxford",
            "Penobscot",
            "Piscataquis",
            "Sagadahoc",
            "Somerset",
            "Waldo",
            "Washington",
            "York",
            "Maryland",
            "Allegany",
            "Anne Arundel",
            "Baltimore City",
            "Baltimore",
            "Calvert",
            "Caroline",
            "Carroll",
            "Cecil",
            "Charles",
            "Dorchester",
            "Frederick",
            "Garrett",
            "Harford",
            "Howard",
            "Kent",
            "Montgomery",
            "Prince George's",
            "Queen Anne's",
            "Somerset",
            "St. Mary's",
            "Talbot",
            "Washington",
            "Wicomico",
            "Worcester",
            "Massachusetts",
            "Barnstable",
            "Berkshire",
            "Bristol",
            "Dukes",
            "Essex",
            "Franklin",
            "Hampden",
            "Hampshire",
            "Middlesex",
            "Nantucket",
            "Norfolk",
            "Plymouth",
            "Suffolk",
            "Worcester"
        ],
        "MD": [
            "Allegany",
            "Anne Arundel",
            "Baltimore",
            "Calvert",
            "Caroline",
            "Carroll",
            "Cecil",
            "Charles",
            "Dorchester",
            "Frederick",
            "Garrett",
            "Harford",
            "Howard",
            "Kent",
            "Montgomery",
            "Prince Georges",
            "Queen Annes",
            "St Marys",
            "Somerset",
            "Talbot",
            "Washington",
            "Wicomico",
            "Worcester",
            "Baltimore City",
        ],
        "MA": [
            "Barnstable",
            "Berkshire",
            "Bristol",
            "Dukes",
            "Essex",
            "Franklin",
            "Hampden",
            "Hampshire",
            "Middlesex",
            "Nantucket",
            "Norfolk",
            "Plymouth",
            "Suffolk",
            "Worcester",
        ],
        "MI": [
            "Alcona",
            "Alger",
            "Allegan",
            "Alpena",
            "Antrim",
            "Arenac",
            "Baraga",
            "Barry",
            "Bay",
            "Benzie",
            "Berrien",
            "Branch",
            "Calhoun",
            "Cass",
            "Charlevoix",
            "Cheboygan",
            "Chippewa",
            "Clare",
            "Clinton",
            "Crawford",
            "Delta",
            "Dickinson",
            "Eaton",
            "Emmet",
            "Genesee",
            "Gladwin",
            "Gogebic",
            "Grand Traverse",
            "Gratiot",
            "Hillsdale",
            "Houghton",
            "Huron",
            "Ingham",
            "Ionia",
            "Iosco",
            "Iron",
            "Isabella",
            "Jackson",
            "Kalamazoo",
            "Kalkaska",
            "Kent",
            "Keweenaw",
            "Lake",
            "Lapeer",
            "Leelanau",
            "Lenawee",
            "Livingston",
            "Luce",
            "Mackinac",
            "Macomb",
            "Manistee",
            "Marquette",
            "Mason",
            "Mecosta",
            "Menominee",
            "Midland",
            "Missaukee",
            "Monroe",
            "Montcalm",
            "Montmorency",
            "Muskegon",
            "Newaygo",
            "Oakland",
            "Oceana",
            "Ogemaw",
            "Ontonagon",
            "Osceola",
            "Oscoda",
            "Otsego",
            "Ottawa",
            "Presque Isle",
            "Roscommon",
            "Saginaw",
            "Sanilac",
            "Schoolcraft",
            "Shiawassee",
            "St. Clair",
            "St. Joseph",
            "Tuscola",
            "Van Buren",
            "Washtenaw",
            "Wayne",
            "Wexford"
        ],
        "MN": [
            "Aitkin",
            "Anoka",
            "Becker",
            "Beltrami",
            "Benton",
            "Big Stone",
            "Blue Earth",
            "Brown",
            "Carlton",
            "Carver",
            "Cass",
            "Chippewa",
            "Chisago",
            "Clay",
            "Clearwater",
            "Cook",
            "Cottonwood",
            "Crow Wing",
            "Dakota",
            "Dodge",
            "Douglas",
            "Faribault",
            "Fillmore",
            "Freeborn",
            "Goodhue",
            "Grant",
            "Hennepin",
            "Houston",
            "Hubbard",
            "Isanti",
            "Itasca",
            "Jackson",
            "Kanabec",
            "Kandiyohi",
            "Kittson",
            "Koochiching",
            "Lac qui Parle",
            "Lake of the Woods",
            "Lake",
            "Le Sueur",
            "Lincoln",
            "Lyon",
            "Mahnomen",
            "Marshall",
            "Martin",
            "McLeod",
            "Meeker",
            "Mille Lacs",
            "Morrison",
            "Mower",
            "Murray",
            "Nicollet",
            "Nobles",
            "Norman",
            "Olmsted",
            "Otter Tail",
            "Pennington",
            "Pine",
            "Pipestone",
            "Polk",
            "Pope",
            "Ramsey",
            "Red Lake",
            "Redwood",
            "Renville",
            "Rice",
            "Rock",
            "Roseau",
            "Scott",
            "Sherburne",
            "Sibley",
            "St. Louis",
            "Stearns",
            "Steele",
            "Stevens",
            "Swift",
            "Todd",
            "Traverse",
            "Wabasha",
            "Wadena",
            "Waseca",
            "Washington",
            "Watonwan",
            "Wilkin",
            "Winona",
            "Wright",
            "Yellow Medicine"
        ],
        "MS": [
            "Adams",
            "Alcorn",
            "Amite",
            "Attala",
            "Benton",
            "Bolivar",
            "Calhoun",
            "Carroll",
            "Chickasaw",
            "Choctaw",
            "Claiborne",
            "Clarke",
            "Clay",
            "Coahoma",
            "Copiah",
            "Covington",
            "DeSoto",
            "Forrest",
            "Franklin",
            "George",
            "Greene",
            "Grenada",
            "Hancock",
            "Harrison",
            "Hinds",
            "Holmes",
            "Humphreys",
            "Issaquena",
            "Itawamba",
            "Jackson",
            "Jasper",
            "Jefferson",
            "Jefferson Davis",
            "Jones",
            "Kemper",
            "Lafayette",
            "Lamar",
            "Lauderdale",
            "Lawrence",
            "Leake",
            "Lee",
            "Leflore",
            "Lincoln",
            "Lowndes",
            "Madison",
            "Marion",
            "Marshall",
            "Monroe",
            "Montgomery",
            "Neshoba",
            "Newton",
            "Noxubee",
            "Oktibbeha",
            "Panola",
            "Pearl River",
            "Perry",
            "Pike",
            "Pontotoc",
            "Prentiss",
            "Quitman",
            "Rankin",
            "Scott",
            "Sharkey",
            "Simpson",
            "Smith",
            "Stone",
            "Sunflower",
            "Tallahatchie",
            "Tate",
            "Tippah",
            "Tishomingo",
            "Tunica",
            "Union",
            "Walthall",
            "Warren",
            "Washington",
            "Wayne",
            "Webster",
            "Wilkinson",
            "Winston",
            "Yalobusha",
            "Yazoo"
        ],
        "MO": [
            "Adair",
            "Andrew",
            "Atchison",
            "Audrain",
            "Barry",
            "Barton",
            "Bates",
            "Benton",
            "Bollinger",
            "Boone",
            "Buchanan",
            "Butler",
            "Caldwell",
            "Callaway",
            "Camden",
            "Cape Girardeau",
            "Carroll",
            "Carter",
            "Cass",
            "Cedar",
            "Chariton",
            "Christian",
            "Clark",
            "Clay",
            "Clinton",
            "Cole",
            "Cooper",
            "Crawford",
            "Dade",
            "Dallas",
            "Daviess",
            "Dent",
            "DeKalb",
            "Douglas",
            "Dunklin",
            "Franklin",
            "Gasconade",
            "Gentry",
            "Greene",
            "Grundy",
            "Harrison",
            "Henry",
            "Hickory",
            "Holt",
            "Howard",
            "Howell",
            "Iron",
            "Jackson",
            "Jasper",
            "Jefferson",
            "Johnson",
            "Knox",
            "Laclede",
            "Lafayette",
            "Lawrence",
            "Lewis",
            "Lincoln",
            "Linn",
            "Livingston",
            "Macon",
            "Madison",
            "Maries",
            "Marion",
            "McDonald",
            "Mercer",
            "Miller",
            "Mississippi",
            "Moniteau",
            "Monroe",
            "Montgomery",
            "Morgan",
            "New Madrid",
            "Newton",
            "Nodaway",
            "Oregon",
            "Osage",
            "Ozark",
            "Pemiscot",
            "Perry",
            "Pettis",
            "Phelps",
            "Pike",
            "Platte",
            "Polk",
            "Pulaski",
            "Putnam",
            "Ralls",
            "Randolph",
            "Ray",
            "Reynolds",
            "Ripley",
            "Saline",
            "Schuyler",
            "Scotland",
            "Scott",
            "Shannon",
            "Shelby",
            "St. Charles",
            "St. Clair",
            "St. Francois",
            "St. Louis city",
            "St. Louis",
            "Ste. Genevieve",
            "Stoddard",
            "Stone",
            "Sullivan",
            "Taney",
            "Texas",
            "Vernon",
            "Warren",
            "Washington",
            "Wayne",
            "Webster",
            "Worth",
            "Wright"
        ],
        "MT": [
            "Beaverhead",
            "Big Horn",
            "Blaine",
            "Broadwater",
            "Carbon",
            "Carter",
            "Cascade",
            "Chouteau",
            "Custer",
            "Daniels",
            "Dawson",
            "Deer Lodge",
            "Fallon",
            "Fergus",
            "Flathead",
            "Gallatin",
            "Garfield",
            "Glacier",
            "Golden Valley",
            "Granite",
            "Hill",
            "Jefferson",
            "Judith Basin",
            "Lake",
            "Lewis and Clark",
            "Liberty",
            "Lincoln",
            "Madison",
            "McCone",
            "Meagher",
            "Mineral",
            "Missoula",
            "Musselshell",
            "Park",
            "Petroleum",
            "Phillips",
            "Pondera",
            "Powder River",
            "Powell",
            "Prairie",
            "Ravalli",
            "Richland",
            "Roosevelt",
            "Rosebud",
            "Sanders",
            "Sheridan",
            "Silver Bow",
            "Stillwater",
            "Sweet Grass",
            "Teton",
            "Toole",
            "Treasure",
            "Valley",
            "Wheatland",
            "Wibaux",
            "Yellowstone"
        ],
        "NE": [
            "Adams",
            "Antelope",
            "Arthur",
            "Banner",
            "Blaine",
            "Boone",
            "Box Butte",
            "Boyd",
            "Brown",
            "Buffalo",
            "Burt",
            "Butler",
            "Cass",
            "Cedar",
            "Chase",
            "Cherry",
            "Cheyenne",
            "Clay",
            "Colfax",
            "Cuming",
            "Custer",
            "Dakota",
            "Dawes",
            "Dawson",
            "Deuel",
            "Dixon",
            "Dodge",
            "Douglas",
            "Dundy",
            "Fillmore",
            "Franklin",
            "Frontier",
            "Furnas",
            "Gage",
            "Garden",
            "Garfield",
            "Gosper",
            "Grant",
            "Greeley",
            "Hall",
            "Hamilton",
            "Harlan",
            "Hayes",
            "Hitchcock",
            "Holt",
            "Hooker",
            "Howard",
            "Jefferson",
            "Johnson",
            "Kearney",
            "Keith",
            "Keya Paha",
            "Kimball",
            "Knox",
            "Lancaster",
            "Lincoln",
            "Logan",
            "Loup",
            "Madison",
            "McPherson",
            "Merrick",
            "Morrill",
            "Nance",
            "Nemaha",
            "Nuckolls",
            "Otoe",
            "Pawnee",
            "Perkins",
            "Phelps",
            "Pierce",
            "Platte",
            "Polk",
            "Red Willow",
            "Richardson",
            "Rock",
            "Saline",
            "Sarpy",
            "Saunders",
            "Scotts Bluff",
            "Seward",
            "Sheridan",
            "Sherman",
            "Sioux",
            "Stanton",
            "Thayer",
            "Thomas",
            "Thurston",
            "Valley",
            "Washington",
            "Wayne",
            "Webster",
            "Wheeler",
            "York"
        ],
        "NV": [
            "Churchill",
            "Clark",
            "Douglas",
            "Elko",
            "Esmeralda",
            "Eureka",
            "Humboldt",
            "Lander",
            "Lincoln",
            "Lyon",
            "Mineral",
            "Nye",
            "Pershing",
            "Storey",
            "Washoe",
            "White Pine"
        ],
        "NH": [
            "Belknap",
            "Carroll",
            "Cheshire",
            "Coos",
            "Grafton",
            "Hillsboro",
            "Merrimack",
            "Rockingham",
            "Strafford",
            "Sullivan"
        ],
        "NJ": [
            "Atlantic",
            "Bergen",
            "Burlington",
            "Camden",
            "Cape May",
            "Cumberland",
            "Essex",
            "Gloucester",
            "Hudson",
            "Hunterdon",
            "Mercer",
            "Middlesex",
            "Monmouth",
            "Morris",
            "Ocean",
            "Passaic",
            "Salem",
            "Somerset",
            "Sussex",
            "Union",
            "Warren"
        ],
        "NM": [
            "Bernalillo",
            "Catron",
            "Chaves",
            "Cibola",
            "Colfax",
            "Curry",
            "DeBaca",
            "Dona Ana",
            "Eddy",
            "Grant",
            "Guadalupe",
            "Harding",
            "Hidalgo",
            "Lea",
            "Lincoln",
            "Los Alamos",
            "Luna",
            "McKinley",
            "Mora",
            "Otero",
            "Quay",
            "Rio Arriba",
            "Roosevelt",
            "San Juan",
            "San Miguel",
            "Sandoval",
            "Santa Fe",
            "Sierra",
            "Socorro",
            "Taos",
            "Torrance",
            "Union",
            "Valencia"
        ],
        "NY": [
            "Albany",
            "Allegany",
            "Bronx",
            "Broome",
            "Cattaraugus",
            "Cayuga",
            "Chautauqua",
            "Chemung",
            "Chenango",
            "Clinton",
            "Columbia",
            "Cortland",
            "Delaware",
            "Dutchess",
            "Erie",
            "Essex",
            "Franklin",
            "Fulton",
            "Genesee",
            "Greene",
            "Hamilton",
            "Herkimer",
            "Jefferson",
            "Kings",
            "Lewis",
            "Livingston",
            "Madison",
            "Monroe",
            "Montgomery",
            "Nassau",
            "New York",
            "Niagara",
            "Oneida",
            "Onondaga",
            "Ontario",
            "Orange",
            "Orleans",
            "Oswego",
            "Otsego",
            "Putnam",
            "Queens",
            "Rensselaer",
            "Richmond",
            "Rockland",
            "Saratoga",
            "Schenectady",
            "Schoharie",
            "Schuyler",
            "Seneca",
            "St. Lawrence",
            "Steuben",
            "Suffolk",
            "Sullivan",
            "Tioga",
            "Tompkins",
            "Ulster",
            "Warren",
            "Washington",
            "Wayne",
            "Westchester",
            "Wyoming",
            "Yates"
        ],
        "NC": [
            "Alamance",
            "Alexander",
            "Alleghany",
            "Anson",
            "Ashe",
            "Avery",
            "Beaufort",
            "Bertie",
            "Bladen",
            "Brunswick",
            "Buncombe",
            "Burke",
            "Cabarrus",
            "Caldwell",
            "Camden",
            "Carteret",
            "Caswell",
            "Catawba",
            "Chatham",
            "Cherokee",
            "Chowan",
            "Clay",
            "Cleveland",
            "Columbus",
            "Craven",
            "Cumberland",
            "Currituck",
            "Dare",
            "Davidson",
            "Davie",
            "Duplin",
            "Durham",
            "Edgecombe",
            "Forsyth",
            "Franklin",
            "Gaston",
            "Gates",
            "Graham",
            "Granville",
            "Greene",
            "Guilford",
            "Halifax",
            "Harnett",
            "Haywood",
            "Henderson",
            "Hertford",
            "Hoke",
            "Hyde",
            "Iredell",
            "Jackson",
            "Johnston",
            "Jones",
            "Lee",
            "Lenoir",
            "Lincoln",
            "Macon",
            "Madison",
            "Martin",
            "McDowell",
            "Mecklenburg",
            "Mitchell",
            "Montgomery",
            "Moore",
            "Nash",
            "New Hanover",
            "Northampton",
            "Onslow",
            "Orange",
            "Pamlico",
            "Pasquotank",
            "Pender",
            "Perquimans",
            "Person",
            "Pitt",
            "Polk",
            "Randolph",
            "Richmond",
            "Robeson",
            "Rockingham",
            "Rowan",
            "Rutherford",
            "Sampson",
            "Scotland",
            "Stanly",
            "Stokes",
            "Surry",
            "Swain",
            "Transylvania",
            "Tyrrell",
            "Union",
            "Vance",
            "Wake",
            "Warren",
            "Washington",
            "Watauga",
            "Wayne",
            "Wilkes",
            "Wilson",
            "Yadkin",
            "Yancey"
        ],
        "ND": [
            "Adams",
            "Barnes",
            "Benson",
            "Billings",
            "Bottineau",
            "Bowman",
            "Burke",
            "Burleigh",
            "Cass",
            "Cavalier",
            "Dickey",
            "Divide",
            "Dunn",
            "Eddy",
            "Emmons",
            "Foster",
            "Golden Valley",
            "Grand Forks",
            "Grant",
            "Griggs",
            "Hettinger",
            "Kidder",
            "LaMoure",
            "Logan",
            "McHenry",
            "McIntosh",
            "McKenzie",
            "McLean",
            "Mercer",
            "Morton",
            "Mountrail",
            "Nelson",
            "Oliver",
            "Pembina",
            "Pierce",
            "Ramsey",
            "Ransom",
            "Renville",
            "Richland",
            "Rolette",
            "Sargent",
            "Sheridan",
            "Sioux",
            "Slope",
            "Stark",
            "Steele",
            "Stutsman",
            "Towner",
            "Traill",
            "Walsh",
            "Ward",
            "Wells",
            "Williams"
        ],
        "OH": [
            "Adams",
            "Allen",
            "Ashland",
            "Ashtabula",
            "Athens",
            "Auglaize",
            "Belmont",
            "Brown",
            "Butler",
            "Carroll",
            "Champaign",
            "Clark",
            "Clermont",
            "Clinton",
            "Columbiana",
            "Coshocton",
            "Crawford",
            "Cuyahoga",
            "Darke",
            "Defiance",
            "Delaware",
            "Erie",
            "Fairfield",
            "Fayette",
            "Franklin",
            "Fulton",
            "Gallia",
            "Geauga",
            "Greene",
            "Guernsey",
            "Hamilton",
            "Hancock",
            "Hardin",
            "Harrison",
            "Henry",
            "Highland",
            "Hocking",
            "Holmes",
            "Huron",
            "Jackson",
            "Jefferson",
            "Knox",
            "Lake",
            "Lawrence",
            "Licking",
            "Logan",
            "Lorain",
            "Lucas",
            "Madison",
            "Mahoning",
            "Marion",
            "Medina",
            "Meigs",
            "Mercer",
            "Miami",
            "Monroe",
            "Montgomery",
            "Morgan",
            "Morrow",
            "Muskingum",
            "Noble",
            "Ottawa",
            "Paulding",
            "Perry",
            "Pickaway",
            "Pike",
            "Portage",
            "Preble",
            "Putnam",
            "Richland",
            "Ross",
            "Sandusky",
            "Scioto",
            "Seneca",
            "Shelby",
            "Stark",
            "Summit",
            "Trumbull",
            "Tuscarawas",
            "Union",
            "Van Wert",
            "Vinton",
            "Warren",
            "Washington",
            "Wayne",
            "Williams",
            "Wood",
            "Wyandot"
        ],
        "OK": [
            "Adair",
            "Alfalfa",
            "Atoka",
            "Beaver",
            "Beckham",
            "Blaine",
            "Bryan",
            "Caddo",
            "Canadian",
            "Carter",
            "Cherokee",
            "Choctaw",
            "Cimarron",
            "Cleveland",
            "Coal",
            "Comanche",
            "Cotton",
            "Craig",
            "Creek",
            "Custer",
            "Delaware",
            "Dewey",
            "Ellis",
            "Garfield",
            "Garvin",
            "Grady",
            "Grant",
            "Greer",
            "Harmon",
            "Harper",
            "Haskell",
            "Hughes",
            "Jackson",
            "Jefferson",
            "Johnston",
            "Kay",
            "Kingfisher",
            "Kiowa",
            "Latimer",
            "Le Flore",
            "Lincoln",
            "Logan",
            "Love",
            "Major",
            "Marshall",
            "Mayes",
            "McClain",
            "McCurtain",
            "McIntosh",
            "Murray",
            "Muskogee",
            "Noble",
            "Nowata",
            "Okfuskee",
            "Oklahoma",
            "Okmulgee",
            "Osage",
            "Ottawa",
            "Pawnee",
            "Payne",
            "Pittsburg",
            "Pontotoc",
            "Pottawatomie",
            "Pushmataha",
            "Roger Mills",
            "Rogers",
            "Seminole",
            "Sequoyah",
            "Stephens",
            "Texas",
            "Tillman",
            "Tulsa",
            "Wagoner",
            "Washington",
            "Washita",
            "Woods",
            "Woodward"
        ],
        "OR": [
            "Baker",
            "Benton",
            "Clackamas",
            "Clatsop",
            "Columbia",
            "Coos",
            "Crook",
            "Curry",
            "Deschutes",
            "Douglas",
            "Gilliam",
            "Grant",
            "Harney",
            "Hood River",
            "Jackson",
            "Jefferson",
            "Josephine",
            "Klamath",
            "Lake",
            "Lane",
            "Lincoln",
            "Linn",
            "Malheur",
            "Marion",
            "Morrow",
            "Multnomah",
            "Polk",
            "Sherman",
            "Tillamook",
            "Umatilla",
            "Union",
            "Wallowa",
            "Wasco",
            "Washington",
            "Wheeler",
            "Yamhill"
        ],
        "PA": [
            "Adams",
            "Allegheny",
            "Armstrong",
            "Beaver",
            "Bedford",
            "Berks",
            "Blair",
            "Bradford",
            "Bucks",
            "Butler",
            "Cambria",
            "Cameron",
            "Carbon",
            "Centre",
            "Chester",
            "Clarion",
            "Clearfield",
            "Clinton",
            "Columbia",
            "Crawford",
            "Cumberland",
            "Dauphin",
            "Delaware",
            "Elk",
            "Erie",
            "Fayette",
            "Forest",
            "Franklin",
            "Fulton",
            "Greene",
            "Huntingdon",
            "Indiana",
            "Jefferson",
            "Juniata",
            "Lackawanna",
            "Lancaster",
            "Lawrence",
            "Lebanon",
            "Lehigh",
            "Luzerne",
            "Lycoming",
            "McKean",
            "Mercer",
            "Mifflin",
            "Monroe",
            "Montgomery",
            "Montour",
            "Northampton",
            "Northumberland",
            "Perry",
            "Philadelphia",
            "Pike",
            "Potter",
            "Schuylkill",
            "Snyder",
            "Somerset",
            "Sullivan",
            "Susquehanna",
            "Tioga",
            "Union",
            "Venango",
            "Warren",
            "Washington",
            "Wayne",
            "Westmoreland",
            "Wyoming",
            "York"
        ],
        "RI": [
            "Bristol",
            "Kent",
            "Newport",
            "Providence",
            "Washington"
        ],
        "SC": [
            "Abbeville",
            "Aiken",
            "Allendale",
            "Anderson",
            "Bamberg",
            "Barnwell",
            "Beaufort",
            "Berkeley",
            "Calhoun",
            "Charleston",
            "Cherokee",
            "Chester",
            "Chesterfield",
            "Clarendon",
            "Colleton",
            "Darlington",
            "Dillon",
            "Dorchester",
            "Edgefield",
            "Fairfield",
            "Florence",
            "Georgetown",
            "Greenville",
            "Greenwood",
            "Hampton",
            "Horry",
            "Jasper",
            "Kershaw",
            "Lancaster",
            "Laurens",
            "Lee",
            "Lexington",
            "Marion",
            "Marlboro",
            "McCormick",
            "Newberry",
            "Oconee",
            "Orangeburg",
            "Pickens",
            "Richland",
            "Saluda",
            "Spartanburg",
            "Sumter",
            "Union",
            "Williamsburg",
            "York"
        ],
        "SD": [
            "Aurora",
            "Beadle",
            "Bennett",
            "Bon Homme",
            "Brookings",
            "Brown",
            "Brule",
            "Buffalo",
            "Butte",
            "Campbell",
            "Charles Mix",
            "Clark",
            "Clay",
            "Codington",
            "Corson",
            "Custer",
            "Davison",
            "Day",
            "Deuel",
            "Dewey",
            "Douglas",
            "Edmunds",
            "Fall River",
            "Faulk",
            "Grant",
            "Gregory",
            "Haakon",
            "Hamlin",
            "Hand",
            "Hanson",
            "Harding",
            "Hughes",
            "Hutchinson",
            "Hyde",
            "Jackson",
            "Jerauld",
            "Jones",
            "Kingsbury",
            "Lake",
            "Lawrence",
            "Lincoln",
            "Lyman",
            "Marshall",
            "McCook",
            "McPherson",
            "Meade",
            "Mellette",
            "Miner",
            "Minnehaha",
            "Moody",
            "Pennington",
            "Perkins",
            "Potter",
            "Roberts",
            "Sanborn",
            "Shannon",
            "Spink",
            "Stanley",
            "Sully",
            "Todd",
            "Tripp",
            "Turner",
            "Union",
            "Walworth",
            "Yankton",
            "Ziebach"
        ],
        "TN": [
            "Anderson",
            "Bedford",
            "Benton",
            "Bledsoe",
            "Blount",
            "Bradley",
            "Campbell",
            "Cannon",
            "Carroll",
            "Carter",
            "Cheatham",
            "Chester",
            "Claiborne",
            "Clay",
            "Cocke",
            "Coffee",
            "Crockett",
            "Cumberland",
            "Davidson",
            "Decatur",
            "DeKalb",
            "Dickson",
            "Dyer",
            "Fayette",
            "Fentress",
            "Franklin",
            "Gibson",
            "Giles",
            "Grainger",
            "Greene",
            "Grundy",
            "Hamblen",
            "Hamilton",
            "Hancock",
            "Hardeman",
            "Hardin",
            "Hawkins",
            "Haywood",
            "Henderson",
            "Henry",
            "Hickman",
            "Houston",
            "Humphreys",
            "Jackson",
            "Jefferson",
            "Johnson",
            "Knox",
            "Lake",
            "Lauderdale",
            "Lawrence",
            "Lewis",
            "Lincoln",
            "Loudon",
            "Macon",
            "Madison",
            "Marion",
            "Marshall",
            "Maury",
            "McMinn",
            "McNairy",
            "Meigs",
            "Monroe",
            "Montgomery",
            "Moore",
            "Morgan",
            "Obion",
            "Overton",
            "Perry",
            "Pickett",
            "Polk",
            "Putnam",
            "Rhea",
            "Roane",
            "Robertson",
            "Rutherford",
            "Scott",
            "Sequatchie",
            "Sevier",
            "Shelby",
            "Smith",
            "Stewart",
            "Sullivan",
            "Sumner",
            "Tipton",
            "Trousdale",
            "Unicoi",
            "Union",
            "Van Buren",
            "Warren",
            "Washington",
            "Wayne",
            "Weakley",
            "White",
            "Williamson",
            "Wilson"
        ],
        "TX": [
            "Anderson",
            "Andrews",
            "Angelina",
            "Aransas",
            "Archer",
            "Armstrong",
            "Atascosa",
            "Austin",
            "Bailey",
            "Bandera",
            "Bastrop",
            "Baylor",
            "Bee",
            "Bell",
            "Bexar",
            "Blanco",
            "Borden",
            "Bosque",
            "Bowie",
            "Brazoria",
            "Brazos",
            "Brewster",
            "Briscoe",
            "Brooks",
            "Brown",
            "Burleson",
            "Burnet",
            "Caldwell",
            "Calhoun",
            "Callahan",
            "Cameron",
            "Camp",
            "Carson",
            "Cass",
            "Castro",
            "Chambers",
            "Cherokee",
            "Childress",
            "Clay",
            "Cochran",
            "Coke",
            "Coleman",
            "Collin",
            "Collingsworth",
            "Colorado",
            "Comal",
            "Comanche",
            "Concho",
            "Cooke",
            "Coryell",
            "Cottle",
            "Crane",
            "Crockett",
            "Crosby",
            "Culberson",
            "Dallam",
            "Dallas",
            "Dawson",
            "Deaf Smith",
            "Delta",
            "Denton",
            "DeWitt",
            "Dickens",
            "Dimmit",
            "Donley",
            "Duval",
            "Eastland",
            "Ector",
            "Edwards",
            "El Paso",
            "Ellis",
            "Erath",
            "Falls",
            "Fannin",
            "Fayette",
            "Fisher",
            "Floyd",
            "Foard",
            "Fort Bend",
            "Franklin",
            "Freestone",
            "Frio",
            "Gaines",
            "Galveston",
            "Garza",
            "Gillespie",
            "Glasscock",
            "Goliad",
            "Gonzales",
            "Gray",
            "Grayson",
            "Gregg",
            "Grimes",
            "Guadalupe",
            "Hale",
            "Hall",
            "Hamilton",
            "Hansford",
            "Hardeman",
            "Hardin",
            "Harris",
            "Harrison",
            "Hartley",
            "Haskell",
            "Hays",
            "Hemphill",
            "Henderson",
            "Hidalgo",
            "Hill",
            "Hockley",
            "Hood",
            "Hopkins",
            "Houston",
            "Howard",
            "Hudspeth",
            "Hunt",
            "Hutchinson",
            "Irion",
            "Jack",
            "Jackson",
            "Jasper",
            "Jeff Davis",
            "Jefferson",
            "Jim Hogg",
            "Jim Wells",
            "Johnson",
            "Jones",
            "Karnes",
            "Kaufman",
            "Kendall",
            "Kenedy",
            "Kent",
            "Kerr",
            "Kimble",
            "King",
            "Kinney",
            "Kleberg",
            "Knox",
            "La Salle",
            "Lamar",
            "Lamb",
            "Lampasas",
            "Lavaca",
            "Lee",
            "Leon",
            "Liberty",
            "Limestone",
            "Lipscomb",
            "Live Oak",
            "Llano",
            "Loving",
            "Lubbock",
            "Lynn",
            "Madison",
            "Marion",
            "Martin",
            "Mason",
            "Matagorda",
            "Maverick",
            "McCulloch",
            "McLennan",
            "McMullen",
            "Medina",
            "Menard",
            "Midland",
            "Milam",
            "Mills",
            "Mitchell",
            "Montague",
            "Montgomery",
            "Moore",
            "Morris",
            "Motley",
            "Nacogdoches",
            "Navarro",
            "Newton",
            "Nolan",
            "Nueces",
            "Ochiltree",
            "Oldham",
            "Orange",
            "Palo Pinto",
            "Panola",
            "Parker",
            "Parmer",
            "Pecos",
            "Polk",
            "Potter",
            "Presidio",
            "Rains",
            "Randall",
            "Reagan",
            "Real",
            "Red River",
            "Reeves",
            "Refugio",
            "Roberts",
            "Robertson",
            "Rockwall",
            "Runnels",
            "Rusk",
            "Sabine",
            "San Augustine",
            "San Jacinto",
            "San Patricio",
            "San Saba",
            "Schleicher",
            "Scurry",
            "Shackelford",
            "Shelby",
            "Sherman",
            "Smith",
            "Somervell",
            "Starr",
            "Stephens",
            "Sterling",
            "Stonewall",
            "Sutton",
            "Swisher",
            "Tarrant",
            "Taylor",
            "Terrell",
            "Terry",
            "Throckmorton",
            "Titus",
            "Tom Green",
            "Travis",
            "Trinity",
            "Tyler",
            "Upshur",
            "Upton",
            "Uvalde",
            "Val Verde",
            "Van Zandt",
            "Victoria",
            "Walker",
            "Waller",
            "Ward",
            "Washington",
            "Webb",
            "Wharton",
            "Wheeler",
            "Wichita",
            "Wilbarger",
            "Willacy",
            "Williamson",
            "Wilson",
            "Winkler",
            "Wise",
            "Wood",
            "Yoakum",
            "Young",
            "Zapata",
            "Zavala"
        ],
        "UT": [
            "Beaver",
            "Box Elder",
            "Cache",
            "Carbon",
            "Daggett",
            "Davis",
            "Duchesne",
            "Emery",
            "Garfield",
            "Grand",
            "Iron",
            "Juab",
            "Kane",
            "Millard",
            "Morgan",
            "Piute",
            "Rich",
            "Salt Lake",
            "San Juan",
            "Sanpete",
            "Sevier",
            "Summit",
            "Tooele",
            "Uintah",
            "Utah",
            "Wasatch",
            "Washington",
            "Wayne",
            "Weber"
        ],
        "VT": [
            "Addison",
            "Bennington",
            "Caledonia",
            "Chittenden",
            "Essex",
            "Franklin",
            "Grand Isle",
            "Lamoille",
            "Orange",
            "Orleans",
            "Rutland",
            "Washington",
            "Windham",
            "Windsor"
        ],
        "VA": [
            "Accomack",
            "Albemarle",
            "Alleghany",
            "Amelia",
            "Amherst",
            "Appomattox",
            "Arlington",
            "Augusta",
            "Bath",
            "Bedford",
            "Bland",
            "Botetourt",
            "Brunswick",
            "Buchanan",
            "Buckingham",
            "Campbell",
            "Caroline",
            "Carroll",
            "Charles City",
            "Charlotte",
            "Chesterfield",
            "Clarke",
            "Craig",
            "Culpeper",
            "Cumberland",
            "Dickenson",
            "Dinwiddie",
            "Essex",
            "Fairfax",
            "Fauquier",
            "Floyd",
            "Fluvanna",
            "Franklin",
            "Frederick",
            "Giles",
            "Gloucester",
            "Goochland",
            "Grayson",
            "Greene",
            "Greensville",
            "Halifax",
            "Hanover",
            "Henrico",
            "Henry",
            "Highland",
            "Isle of Wight",
            "James City",
            "King and Queen",
            "King George",
            "King William",
            "Lancaster",
            "Lee",
            "Loudoun",
            "Louisa",
            "Lunenburg",
            "Madison",
            "Mathews",
            "Mecklenburg",
            "Middlesex",
            "Montgomery",
            "Nelson",
            "New Kent",
            "Northampton",
            "Northumberland",
            "Nottoway",
            "Orange",
            "Page",
            "Patrick",
            "Pittsylvania",
            "Powhatan",
            "Prince Edward",
            "Prince George",
            "Prince William",
            "Pulaski",
            "Rappahannock",
            "Richmond",
            "Roanoke",
            "Rockbridge",
            "Rockingham",
            "Russell",
            "Scott",
            "Shenandoah",
            "Smyth",
            "Southampton",
            "Spotsylvania",
            "Stafford",
            "Surry",
            "Sussex",
            "Tazewell",
            "Warren",
            "Washington",
            "Westmoreland",
            "Wise",
            "Wythe",
            "York"
        ],
        "WA": [
            "Adams",
            "Asotin",
            "Benton",
            "Chelan",
            "Clallam",
            "Clark",
            "Columbia",
            "Cowlitz",
            "Douglas",
            "Ferry",
            "Franklin",
            "Garfield",
            "Grant",
            "Grays Harbor",
            "Island",
            "Jefferson",
            "King",
            "Kitsap",
            "Kittitas",
            "Klickitat",
            "Lewis",
            "Lincoln",
            "Mason",
            "Okanogan",
            "Pacific",
            "Pend Oreille",
            "Pierce",
            "San Juan",
            "Skagit",
            "Skamania",
            "Snohomish",
            "Spokane",
            "Stevens",
            "Thurston",
            "Wahkiakum",
            "Walla Walla",
            "Whatcom",
            "Whitman",
            "Yakima"
        ],
        "WV": [
            "Barbour",
            "Berkeley",
            "Boone",
            "Braxton",
            "Brooke",
            "Cabell",
            "Calhoun",
            "Clay",
            "Doddridge",
            "Fayette",
            "Gilmer",
            "Grant",
            "Greenbrier",
            "Hampshire",
            "Hancock",
            "Hardy",
            "Harrison",
            "Jackson",
            "Jefferson",
            "Kanawha",
            "Lewis",
            "Lincoln",
            "Logan",
            "Marion",
            "Marshall",
            "Mason",
            "McDowell",
            "Mercer",
            "Mineral",
            "Mingo",
            "Monongalia",
            "Monroe",
            "Morgan",
            "Nicholas",
            "Ohio",
            "Pendleton",
            "Pleasants",
            "Pocahontas",
            "Preston",
            "Putnam",
            "Raleigh",
            "Randolph",
            "Ritchie",
            "Roane",
            "Summers",
            "Taylor",
            "Tucker",
            "Tyler",
            "Upshur",
            "Wayne",
            "Webster",
            "Wetzel",
            "Wirt",
            "Wood",
            "Wyoming"
        ],
        "WI": [
            "Adams",
            "Ashland",
            "Barron",
            "Bayfield",
            "Brown",
            "Buffalo",
            "Burnett",
            "Calumet",
            "Chippewa",
            "Clark",
            "Columbia",
            "Crawford",
            "Dane",
            "Dodge",
            "Door",
            "Douglas",
            "Dunn",
            "Eau Claire",
            "Florence",
            "Fond du Lac",
            "Forest",
            "Grant",
            "Green",
            "Green Lake",
            "Iowa",
            "Iron",
            "Jackson",
            "Jefferson",
            "Juneau",
            "Kenosha",
            "Kewaunee",
            "La Crosse",
            "Lafayette",
            "Langlade",
            "Lincoln",
            "Manitowoc",
            "Marathon",
            "Marinette",
            "Marquette",
            "Menominee",
            "Milwaukee",
            "Monroe",
            "Oconto",
            "Oneida",
            "Outagamie",
            "Ozaukee",
            "Pepin",
            "Pierce",
            "Polk",
            "Portage",
            "Price",
            "Racine",
            "Richland",
            "Rock",
            "Rusk",
            "Sauk",
            "Sawyer",
            "Shawano",
            "Sheboygan",
            "St. Croix",
            "Taylor",
            "Trempealeau",
            "Vernon",
            "Vilas",
            "Walworth",
            "Washburn",
            "Washington",
            "Waukesha",
            "Waupaca",
            "Waushara",
            "Winnebago",
            "Wood"
        ],
        "WY": [
            "Albany",
            "Big Horn",
            "Campbell",
            "Carbon",
            "Converse",
            "Crook",
            "Fremont",
            "Goshen",
            "Hot Springs",
            "Johnson",
            "Laramie",
            "Lincoln",
            "Natrona",
            "Niobrara",
            "Park",
            "Platte",
            "Sheridan",
            "Sublette",
            "Sweetwater",
            "Teton",
            "Uinta",
            "Washakie",
            "Weston"
        ]
    };

    if (this.isString(state) && !this.empty(state) && !this.empty(state_cities[state])) {
        result = state_cities[state];
    } else {
        result = state_cities;
    }

    return result;
}

exports.get_us_states = () => {
    const us_states = {
        'AL': "Alabama",
        'AK': "Alaska",
        'AZ': "Arizona",
        'AR': "Arkansas",
        "AS": "American Samoa",
        'CA': "California",
        'CO': "Colorado",
        'CT': "Connecticut",
        'DE': "Delaware",
        'DC': "District Of Columbia",
        'FL': "Florida",
        'GA': "Georgia",
        "GU": "Guam",
        'HI': "Hawaii",
        'ID': "Idaho",
        'IL': "Illinois",
        'IN': "Indiana",
        'IA': "Iowa",
        'KS': "Kansas",
        'KY': "Kentucky",
        'LA': "Louisiana",
        'ME': "Maine",
        'MD': "Maryland",
        'MA': "Massachusetts",
        'MI': "Michigan",
        'MN': "Minnesota",
        'MS': "Mississippi",
        'MO': "Missouri",
        "MP": "Northern Mariana Islands",
        'MT': "Montana",
        'NE': "Nebraska",
        'NV': "Nevada",
        'NH': "New Hampshire",
        'NJ': "New Jersey",
        'NM': "New Mexico",
        'NY': "New York",
        'NC': "North Carolina",
        'ND': "North Dakota",
        'OH': "Ohio",
        'OK': "Oklahoma",
        'OR': "Oregon",
        'PA': "Pennsylvania",
        'RI': "Rhode Island",
        'SC': "South Carolina",
        'SD': "South Dakota",
        'TN': "Tennessee",
        'TX': "Texas",
        'UM': 'Minor Outlying Islands',
        'UT': "Utah",
        'VT': "Vermont",
        'VA': "Virginia",
        'VI': 'Virgin Islands',
        'WA': "Washington",
        'WV': "West Virginia",
        'WI': "Wisconsin",
        'WY': "Wyoming",
        'PR': "Puerto Rico",
        'OU': "Outside US"
    };
    return us_states;
}

exports.non_ups_locations = () => {
    return {
        "Adamawa": [
            "Lamurde",
            "Mayo",
            "Toungo",
        ],
        "Akwa Ibom": [
            "Esit Eket",
            "Ini"
        ],
        "Anambra": [
            "Dunukofia",
            "Idemili North",
            "Idemili South",
            "Njikoka"
        ],
        "Bauchi": [
            "Bogoro"
        ],
        "Bayelsa": [
            "Brass",
            "Ogbia",
            "Southern Ijaw",
            "Yenagoa"
        ],
        "Benue": [
            "Gwer East",
            "Gwer West",
            "Konshisha",
            "Markurdi",
            "Ogbadibo"
        ],
        "Borno": [
            "Bayo",
            "Guzamala",
            "Gwoza",
            "Konduga",
            "Magumeri Gubio",
            "Ngala",
            "Nganzai"
        ],
        "Cross River": [
            "Abi",
            "Akpabuyo",
            "Bakassi",
            "Bekwara",
            "Biase",
            "Boki",
            "Obanliku",
            "Yakuur",
            "Yala"
        ],
        "Delta": [
            "Ethiope East",
            "Ethiope West",
            "Isoko North",
            "Isoko South",
            "Ughelli North",
            "Ughelli South",
            "Uvwie"
        ],
        "Ebonyi": [
            "Ebonyi"
        ],
        "Edo": [
            "Akoko Edo",
            "Etsako Central",
            "Etsako East",
            "Etsako West",
            "Orhionmwon"
        ],
        "Ekiti": [
            "Efon",
            "Ijero",
            "Ikere"
        ],
        "Enugu": [
            "Enugu East",
            "Enugu North",
            "Enugu South",
            "Ezeagu"
        ],
        "Gombe": [
            "Akko",
            "Funakaye",
            "Yamaltu"
        ],
        "Imo": [
            "Ahiazu-Mbaise",
            "Ideato North",
            "Ideato South",
            "Njaba",
            "Owerri North",
            "Owerri West"
        ],
        "Jigawa": [
            "Buji",
            "Guri",
            "Malam-Madori",
            "Miga"
        ],
        "Kaduna": [
            "Lere"
        ],
        "Kano": [
            "Bebeji",
            "Dala",
            "Gabasawa",
            "Gezawa",
            "Kunchi",
            "Nasarawa",
            "Rogo",
            "Tofa",
            "Ungongo"
        ],
        "Katsina": [
            "Kusada",
            "Malufashi",
            "Matazu",
            "Safana",
            "Zango"
        ],
        "Kebbi": [
            "Koko/Besse"
        ],
        "Kogi": [
            "Ibaji",
            "Idah",
            "Kabba/Bunu",
            "Omala",
            "Yagba-East",
            "Yagba-West"
        ],
        "Lagos": [
            "Alimosho",
            "Ojo"
        ],
        "Nasarawa": [
            "Keana",
            "Kokona",
            "Nasarawa",
            "Nasarawa Egon"
        ],
        "Niger": [
            "Bosso",
            "Edati",
            "Gbako",
            "Gurara",
            "Lavun",
            "Magama",
            "Mariga",
            "Mashegu",
            "Munya",
            "Raffi",
            "Rafi"
        ],
        "Ogun": [
            "Remo North"
        ],
        "Ondo": [
            "Akoko North East",
            "Akoko North West",
            "Akoko South East",
            "Akoko South West"
        ],
        "Osun": [
            "Isokan",
            "Odo Otin"
        ],
        "Oyo": [
            "Ibadan North",
            "Ibadan North East",
            "Ibadan North West",
            "Ibarapa Central",
            "Ibarapa East",
            "Ibarapa North",
            "Ogbomosho North",
            "Ogbomosho South",
            "Oluyole",
            "Ona-Ara",
            "South East",
            "South West"
        ],
        "Plateau": [
            "Qua'an Pan",
            "Riyom"
        ],
        "Rivers": [
            "Andoni",
            "Eleme",
            "Emohua",
            "Gokana",
            "Khana",
            "Ogba",
            "Tai"
        ],
        "Sokoto": [
            "Gonroyo",
            "Isa",
            "Tangaza",
            "Tureta"
        ],
        "Taraba": [
            "Ardo Kola",
            "Sardauna",
            "Ussa",
            "Wukari"
        ],
        "Yobe": [
            "Fune",
            "Gujba",
            "Yunusari",
            "Yusufari"
        ]
    };
}

exports.get_gi_cities = () => {
    return {
        "Anambra": [
            "Awka"
        ],
        'Abia': [
            "Aba"
        ],
        "Abuja": [
            "Abuja"
        ],
        "Bayelsa": [
            "Yenagoa"
        ],
        "Cross River": [
            "Calabar"
        ],
        "Delta": [
            "Asaba",
            "Warri"
        ],
        "Edo": [
            "Auchi",
            "Benin",
            "Ekpoma"
        ],
        "Kwara": [
            "Ilorin"
        ],
        "Ondo": [
            "Akure"
        ],
        "Osun": [
            "Oshogbo",
            "Osogbo"
        ],
        "Plateau": [
            "Jos"
        ],
        "Kaduna": [
            "Kaduna"
        ]
    };
}

exports.get_gi_lgas = () => {
    return {
        'Abia': [
            'Aba North',
            'Aba South',
            'Umuahia North',
            'Umuahia South'
        ],
        "Anambra": [
            "Nnewi North",
            "Nnewi South",
            "Onitsha North",
            "Onitsha South"
        ],
        "Akwa Ibom": [
            "Uyo"
        ],
        "Abuja": [
            "Abuja Municipal"
        ],
        "Bayelsa": [
            "Yenagoa"
        ],
        "Ondo": [
            "Akure South"
        ],
        "Cross River": [
            "Calabar Municipal",
            "Calabar South"
        ],
        "Enugu": [
            "Enugu"
        ],
        "Imo": [
            "Owerri"
        ],
        "Oyo": [
            "Ibadan"
        ],
        "Osun": [
            "Ife Central",
            "Ife East",
            "Ife North",
            "Ife South"
        ],
        "Kaduna": [
            "Zaria",
            "Kaduna North",
            "Kaduna South"
        ],
        "Kwara": [
            "Ilorin East",
            "Ilorin South",
            "Ilorin West"
        ],
        "Plateau": [
            "Jos East",
            "Jos North",
            "Jos South"
        ],
        "Rivers": [
            "Port Harcourt"
        ],
        "Kano": [
            "Kano"
        ],
        "Lagos": [
            "Agege/Ijaiye",
            "Ajeromi/Ifelodun",
            "Alimosho",
            "Amuwo Odofin",
            "Apapa",
            "Badagry",
            "Epe",
            "Eti Osa",
            "Ibeju/Lekki",
            "Ifako Ijaiye",
            "Ikeja",
            "Ikorodu",
            "Kosofe",
            "Lagos Island",
            "Lagos Mainland",
            "Mushin",
            "Ojo",
            "Oshodi/Isolo",
            "Shomolu",
            "Surulere"
        ]
    };
}

exports.get_ng_lgas = () => {
    return {
        'Abia': [
            'Aba North',
            'Aba South',
            'Arochukwu',
            'Bende',
            'Ikwauano',
            'Isiala-Ngwa North',
            'Isiala-Ngwa South',
            'Isuikwuato',
            'Obi Ngwa',
            'Ohafia',
            'Osisioma Ngwa',
            'Ugwunagbo',
            'Ukwa East',
            'Ukwa West',
            'Umu Nneochi',
            'Umuahia North',
            'Umuahia South'
        ],
        "Abuja": [
            "Abaji",
            "Abuja Municipal",
            "Bwari",
            "Gwagwalada",
            "Kuje",
            "Kwali"
        ],
        "Adamawa": [
            "Demsa",
            "Fufore",
            "Ganye",
            "Girei",
            "Gombi",
            "Guyuk",
            "Hong",
            "Jada",
            "Lamurde",
            "Madagali",
            "Maiya",
            "Mayo",
            "Michika",
            "Mubi North",
            "Mubi South",
            "Numan",
            "Shelleg",
            "Song",
            "Toungo",
            "Yola",
            "Yola South"
        ],
        "Akwa Ibom": [
            "Abak",
            "Eastern Obolo",
            "Eket",
            "Esit Eket",
            "Essien Udim",
            "Etim Ekpo",
            "Etinan",
            "Ibeno",
            "Ibesikpo Asutan",
            "Ibiono Ibom",
            "Ika",
            "Ikono",
            "Ikot Abasi",
            "Ikot Ekpene",
            "Ini",
            "Itu",
            "Mbo",
            "Mkpat Enin",
            "Nsit Atai",
            "Nsit Ibom",
            "Nsit Ubium",
            "Obot Akare",
            "Okobo",
            "Onna",
            "Oron",
            "Oruk Anam",
            "Udung Uko",
            "Ukanafun",
            "Uruan",
            "Urue/Offong",
            "Uyo"
        ],
        "Anambra": [
            "Aguata",
            "Anambra East",
            "Anambra West",
            "Anaocha",
            "Awka North",
            "Awka South",
            "Ayamelum",
            "Dunukofia",
            "Ekwusigo",
            "Idemili North",
            "Idemili South",
            "Ihiala",
            "Njikoka",
            "Nnewi North",
            "Nnewi South",
            "Ogbaru",
            "Onitsha North",
            "Onitsha South",
            "Orumba North",
            "Orumba South",
            "Oyi"
        ],
        "Bauchi": [
            "Alkaleri",
            "Bauchi",
            "Bogoro",
            "Dambam",
            "Darazo",
            "Dass",
            "Gamawa",
            "Ganjuwa",
            "Giade",
            "Itas-Gadau",
            "Jama'are",
            "Katagum",
            "Kirfi",
            "Misau",
            "Ningi",
            "Shira",
            "Tafawa Balewa",
            "Toro",
            "Warji",
            "Zaki"
        ],
        "Bayelsa": [
            "Brass",
            "Ekeremor",
            "Kolokuma/Opokuma",
            "Nembe",
            "Ogbia",
            "Sagbama",
            "Southern Ijaw",
            "Yenagoa"
        ],
        "Benue": [
            "Ado",
            "Agatu",
            "Apa",
            "Buruku",
            "Gboko",
            "Guma",
            "Gwer East",
            "Gwer West",
            "Katsina-Ala",
            "Konshisha",
            "Kwande",
            "Logo",
            "Markurdi",
            "Obi",
            "Ogbadibo",
            "Ohinimi",
            "Oju",
            "Okpokwu",
            "Otukpo",
            "Tarka",
            "Ukum",
            "Ushongo",
            "Vandeikya"
        ],
        "Borno": [
            "Abadam",
            "Askira/Uba",
            "Bama",
            "Bayo",
            "Biu",
            "Chibok",
            "Damboa",
            "Dikwa",
            "Gubio",
            "Guzamala",
            "Gwoza",
            "Hawul",
            "Jere",
            "Kaga",
            "Kala Balge",
            "Konduga",
            "Kukawa",
            "Kwaya-Kusar",
            "Mafa",
            "Magumeri Gubio",
            "Maiduguri",
            "Marte",
            "Mobbar",
            "Monguno",
            "Ngala",
            "Nganzai",
            "Shani"
        ],
        "Cross River": [
            "Abi",
            "Akamkpa",
            "Akpabuyo",
            "Bakassi",
            "Bekwara",
            "Biase",
            "Boki",
            "Calabar Municipal",
            "Calabar South",
            "Etung",
            "Ikom",
            "Obanliku",
            "Obubra",
            "Obudu",
            "Odukpani",
            "Ogoja",
            "Yakuur",
            "Yala"
        ],
        "Delta": [
            "Aniocha North",
            "Aniocha South",
            "Bomadi",
            "Burutu",
            "Ethiope East",
            "Ethiope West",
            "Ika North East",
            "Ika South",
            "Isoko North",
            "Isoko South",
            "Ndokwa East",
            "Ndokwa West",
            "Okpe",
            "Oshimili North",
            "Oshimili South",
            "Patani",
            "Sapele",
            "Udu",
            "Ughelli North",
            "Ughelli South",
            "Ukwuani",
            "Uvwie",
            "Warri North",
            "Warri South",
            "Warri South West"
        ],
        "Ebonyi": [
            "Abakaliki",
            "Afikpo North",
            "Afikpo South",
            "Ebonyi",
            "Ezza North",
            "Ezza South",
            "Ikwo",
            "Ishielu",
            "Ivo",
            "Izzi",
            "Ohaozara",
            "Ohaukwu",
            "Onicha"
        ],
        "Edo": [
            "Akoko Edo",
            "Egor",
            "Esan Central",
            "Esan North East",
            "Esan South East",
            "Esan West",
            "Etsako Central",
            "Etsako East",
            "Etsako West",
            "Igueben",
            "Ikpoba-Okha",
            "Oredo",
            "Orhionmwon",
            "Ovia North-East",
            "Ovia South-West",
            "Owan East",
            "Owan West",
            "Uhunmwode"
        ],
        "Ekiti": [
            "Ado Ekiti",
            "Efon",
            "Ekiti East",
            "Ekiti South West",
            "Ekiti West",
            "Emure",
            "Gbonyin",
            "Ido-Osi",
            "Ijero",
            "Ikere",
            "Ikole",
            "Ilejemeje",
            "Irepodun",
            "Ise Orun",
            "Moba",
            "Oye"
        ],
        "Enugu": [
            "Aninri",
            "Awgu",
            "Enugu",
            "Ezeagu",
            "Igbo-Etiti",
            "Igbo-Eze North",
            "Igbo-Eze South",
            "Isi-Uzo",
            "Nkanu East",
            "Nkanu West",
            "Nsukka",
            "Oji River",
            "Udenu",
            "Udi",
            "Uzo-Uwani"
        ],
        "Gombe": [
            "Akko",
            "Balanga",
            "Billiri",
            "Dukku",
            "Funakaye",
            "Gombe",
            "Kaltungo",
            "Kwami",
            "Nafada",
            "Shongom",
            "Yamaltu"
        ],
        "Imo": [
            "Aboh-Mbaise",
            "Ahiazu-Mbaise",
            "Ehime-Mbano",
            "Ezinihitte",
            "Ideato North",
            "Ideato South",
            "Ihitte/Uboma",
            "Ikeduru",
            "Isiala Mbano",
            "Isu",
            "Mbaitoli",
            "Ngor-Okpala",
            "Njaba",
            "Nkwerre",
            "Nwangele",
            "Obowo",
            "Oguta",
            "Ohaji/Egbema",
            "Okigwe",
            "Onuimo",
            "Orlu",
            "Orsu",
            "Oru East",
            "Oru West",
            "Owerri",
            "Owerri North",
            "Owerri West"
        ],
        "Jigawa": [
            "Auyo",
            "Babura",
            "Biriniwa",
            "Birnin Kudu",
            "Buji",
            "Dutse",
            "Gagarawa",
            "Garki",
            "Gumel",
            "Guri",
            "Gwaram",
            "Gwiwa",
            "Hadejia",
            "Jahun",
            "Kafin Hausa",
            "Kaugama",
            "Kazaure",
            "Kiri-Kasama",
            "Kiyawa",
            "Maigatari",
            "Malam-Madori",
            "Miga",
            "Ringim",
            "Roni",
            "Sule Tankarkar",
            "Taura",
            "Yankwashi"
        ],
        "Kaduna": [
            "Birnin Gwari",
            "Chikun",
            "Giwa",
            "Igabi",
            "Ikara",
            "Jaba",
            "Jema'a",
            "Kachia",
            "Kaduna North",
            "Kaduna South",
            "Kagarko",
            "Kajuru",
            "Kaura",
            "Kauru",
            "Kubau",
            "Kudan",
            "Lere",
            "Makarfi",
            "Sabon Gari",
            "Sanga",
            "Soba",
            "Zangon Kataf",
            "Zaria"
        ],
        "Kano": [
            "Ajingi",
            "Alabsu",
            "Bagwai",
            "Bebeji",
            "Bichi",
            "Bunkure",
            "Dala",
            "Dambatta",
            "Dawakin Kundu",
            "Dawakin Tofa",
            "Doguwa",
            "Fagge",
            "Gabasawa",
            "Garko",
            "Garun Mallam",
            "Gaya",
            "Gezawa",
            "Gwale",
            "Gwarzo",
            "Kabo",
            "Kano",
            "Karaye",
            "Kibiya",
            "Kiru",
            "Kumbotso",
            "Kunchi",
            "Kura",
            "Madobi",
            "Makoda",
            "Minjibir",
            "Nasarawa",
            "Rano",
            "Rimin Gado",
            "Rogo",
            "Shanono",
            "Sumaila",
            "Takai",
            "Tarauni",
            "Tofa",
            "Tsanyawa",
            "Tundun Wada",
            "Ungongo",
            "Warawa",
            "Wudil"
        ],
        "Katsina": [
            "Bakori",
            "Batagarawa",
            "Batsari",
            "Baure",
            "Bindawa",
            "Charanchi",
            "Dan Musa",
            "Dandume",
            "Danja",
            "Daura",
            "Dutsi",
            "Dutsin Ma",
            "Faskari",
            "Funtua",
            "Ingawa",
            "Jibia",
            "Kafur",
            "Kaita",
            "Kankara",
            "Kankia",
            "Katsina",
            "Kurfi",
            "Kusada",
            "Mai'adua",
            "Malufashi",
            "Mani",
            "Mashi",
            "Matazu",
            "Musawa",
            "Rimi",
            "Sabuwa",
            "Safana",
            "Sandamu",
            "Zango"
        ],
        "Kebbi": [
            "Aleiro",
            "Arewa Dandi",
            "Argungu",
            "Augie",
            "Bagudo",
            "Birni Kebbi",
            "Bunza",
            "Dandi",
            "Danko/Wasagu",
            "Fakai",
            "Gwandu",
            "Jega",
            "Kalgo",
            "Koko/Besse",
            "Maiyama",
            "Ngaski",
            "Sakaba",
            "Shanga",
            "Suru",
            "Yauri",
            "Zuru"
        ],
        "Kogi": [
            "Adavi",
            "Ajaokuta",
            "Ankpa",
            "Bassa",
            "Dekina",
            "Ibaji",
            "Idah",
            "Igalamela-Odolu",
            "Ijumu",
            "Kabba/Bunu",
            "Kogi",
            "Lokoja",
            "Mopa-Muro",
            "Ofu",
            "Ogori/Magongo",
            "Okehi",
            "Okene",
            "Olamaboro",
            "Omala",
            "Yagba-East",
            "Yagba-West"
        ],
        "Kwara": [
            "Asa",
            "Baruten",
            "Edu",
            "Ekiti",
            "Ifelodun",
            "Ilorin East",
            "Ilorin South",
            "Ilorin West",
            "Irepodun",
            "Isin",
            "Kaiama",
            "Moro",
            "Offa",
            "Oke Ero",
            "Oyun",
            "Pategi"
        ],
        "Lagos": [
            "Agege/Ijaiye",
            "Ajeromi/Ifelodun",
            "Alimosho",
            "Amuwo Odofin",
            "Apapa",
            "Badagry",
            "Epe",
            "Eti Osa",
            "Ibeju/Lekki",
            "Ifako Ijaiye",
            "Ikeja",
            "Ikorodu",
            "Kosofe",
            "Lagos Island",
            "Lagos Mainland",
            "Mushin",
            "Ojo",
            "Oshodi/Isolo",
            "Shomolu",
            "Surulere"
        ],
        "Nasarawa": [
            "Akwanga",
            "Awe",
            "Doma",
            "Karu",
            "Keana",
            "Keffi",
            "Kokona",
            "Lafia",
            "Nasarawa",
            "Nasarawa Egon",
            "Obi",
            "Toto",
            "Wamba"
        ],
        "Niger": [
            "Agaie",
            "Agwara",
            "Bida",
            "Borgu",
            "Bosso",
            "Chanchaga",
            "Edati",
            "Gbako",
            "Gurara",
            "Katcha",
            "Kontagora",
            "Lapai",
            "Lavun",
            "Magama",
            "Mariga",
            "Mashegu",
            "Mokwa",
            "Munya",
            "Paikoro",
            "Raffi",
            "Rafi",
            "Rijau",
            "Shiroro",
            "Suleja",
            "Wushishi"
        ],
        "Ogun": [
            "Abeokuta North",
            "Abeokuta South",
            "Ado Odo/Otta",
            "Egbado North",
            "Egbado South",
            "Ewekoro",
            "Ifo",
            "Ijebu East",
            "Ijebu North",
            "Ijebu North/East",
            "Ijebu Ode",
            "Ikenne",
            "Imeko Afon",
            "Ipokia",
            "Obafemi Owode",
            "Odeda",
            "Odogbolu",
            "Ogun Waterside",
            "Remo North",
            "Sagamu"
        ],
        "Ondo": [
            "Akoko North East",
            "Akoko North West",
            "Akoko South East",
            "Akoko South West",
            "Akure North",
            "Akure South",
            "Ese Odo",
            "Idanre",
            "Ifedore",
            "Ilaje",
            "Ile Oluji",
            "Irele",
            "Odigbo",
            "Okitipupa",
            "Ondo East",
            "Ondo West",
            "Ose",
            "Owo"
        ],
        "Osun": [
            "Aiyedaade",
            "Aiyedire",
            "Atakunmosa East",
            "Atakunmosa West",
            "Boluwaduro",
            "Boripe",
            "Ede North",
            "Ede South",
            "Egbedore",
            "Ejigbo",
            "Ife Central",
            "Ife East",
            "Ife North",
            "Ife South",
            "Ifedayo",
            "Ifelodun",
            "Ila",
            "Ilesa East",
            "Ilesa West",
            "Irepodun",
            "Irewole",
            "Isokan",
            "Iwo",
            "Obokun",
            "Odo Otin",
            "Ola Oluwa",
            "Olorunda",
            "Oriade",
            "Orolu",
            "Osogbo"
        ],
        "Oyo": [
            "Afijio",
            "Akinyele",
            "Atiba",
            "Atisbo",
            "Egbeda",
            "Ibadan",
            "Ibarapa Central",
            "Ibarapa East",
            "Ibarapa North",
            "Ido",
            "Irepo",
            "Iseyin",
            "Itesiwaju",
            "Iwajowa",
            "Kajola",
            "Lagelu",
            "Ogbomosho",
            "Ogo Oluwa",
            "Olorunsogo",
            "Oluyole",
            "Ona-Ara",
            "Orelope",
            "Ori Ire",
            "Oyo East",
            "Oyo West",
            "Saki East",
            "Saki West",
            "South East",
            "South West",
            "Surulere"
        ],
        "Plateau": [
            "Barkin Ladi",
            "Bassa",
            "Bokkos",
            "Jos East",
            "Jos North",
            "Jos South",
            "Kanam",
            "Kanke",
            "Langtang North",
            "Langtang South",
            "Mangu",
            "Mikang",
            "Pankshin",
            "Qua'an Pan",
            "Riyom",
            "Shendam",
            "Wase"
        ],
        "Rivers": [
            "Abua/Odual",
            "Ahoada East",
            "Ahoada West",
            "Akuku Toru",
            "Andoni",
            "Asari Toru",
            "Bonny",
            "Degema",
            "Eleme",
            "Emohua",
            "Etche",
            "Gokana",
            "Ikwerre",
            "Khana",
            "Obio/Akpor",
            "Ogba",
            "Ogubolo",
            "Okrika",
            "Omuma",
            "Opobo Nkoro",
            "Oyigbo",
            "Port Harcourt",
            "Tai"
        ],
        "Sokoto": [
            "Binji",
            "Bodinga",
            "Dange-Shuni",
            "Gada",
            "Gonroyo",
            "Gudu",
            "Gwadabawa",
            "Illela",
            "Isa",
            "Kebbe",
            "Kware",
            "Sabon Birni",
            "Shagari",
            "Silame",
            "Sokoto North",
            "Sokoto South",
            "Tambuwal",
            "Tangaza",
            "Tureta",
            "Wamako",
            "Wurno",
            "Yabo"
        ],
        "Taraba": [
            "Ardo Kola",
            "Bali",
            "Donga",
            "Gashaka",
            "Gassol",
            "Ibi",
            "Jalingo",
            "Karim Lamido",
            "Kurmi",
            "Lau",
            "Sardauna",
            "Takum",
            "Ussa",
            "Wukari",
            "Yorro",
            "Zing"
        ],
        "Yobe": [
            "Bade",
            "Bursari",
            "Damaturu",
            "Fika",
            "Fune",
            "Geidam",
            "Gujba",
            "Gulani",
            "Jakusko",
            "Karasuwa",
            "Machina",
            "Nangere",
            "Nguru",
            "Potiskum",
            "Tarmuwa",
            "Yunusari",
            "Yusufari"
        ],
        "Zamfara": [
            "Anka",
            "Bakura",
            "Birni Magaji/Kiyaw",
            "Bukkuyum",
            "Bungudu",
            "Chafe",
            "Gummi",
            "Gusau",
            "Kaura Namoda",
            "Maradun",
            "Maru",
            "Shinkafi",
            "Talata Mafara",
            "Zurmi"
        ]
    };
}

exports.get_ups_lgas = () => {
    const lgas = this.get_ng_lgas();
    const non = this.non_ups_locations();
    _.forEach(lgas, (state_vals, state) => {
        _.forEach(state_vals, (lga, key_1) => {
            if (_.has(non, state) && _.includes(lga, non[state])) {
                _.unset(lgas[state], key_1);
            }
        })
        lgas[state] = Object.values(lgas[state]);
    })
    return lgas;
}

exports.get_countries = () => {
    const us_states = {
        '': "Select Countries",
        '_fetch_from_display_countries_': ''
    };
    return us_states;
}

exports.get_credit_card_types = () => {
    const credit_card_types = ["Visa", "MasterCard", "American Express", "Discover"];
    return credit_card_types;
}

exports.get_genders = () => {
    const genders = {
        '': "Sex",
        'Female': "Female",
        'Male': "Male"
    };
    return genders;
}

exports.display_validation_errors = (error, show_script_tags = false) => {
    const error_string = _.trim(_.join(error, "\n"));
    let return_string = "";
    const searches = []; //['/\s+/','/\\n/'];
    const replaces = [' ', ' '];
    if (error_string.length > 0) {
        return_string += `window.alert(\'There were errors in your submission:\\n---\\n${_.replace(error_string, searches, replaces)}\');`;
    }
    return return_string;
}

exports.csv_escape = (str) => {
    if (!this.isString(str)) return str;

    const _bad = ['"'];
    const _good = ['\''];
    return `"${_.replace(_.trim(str), _bad, _good)}"`;
}

exports.get_tiers = () => {
    const tiers = {
        "": ""
        ,
        "Tier 1": { "name": "Tier 1" },
        "Tier 2": { "name": "Tier 2" }
    };
    return tiers;
}

exports.get_attendee_statuses = () => {
    const statuses = {
        "UNCONFIRMED": { "name": "UNCONFIRMED" },
        "LATE REGISTRATION": { "name": "LATE REGISTRATION" },
        "REGISTERED": { "name": "REGISTERED" },
        "RSVP-NO": { "name": "RSVP-NO" },
        "CHECKED-IN": { "name": "CHECKED-IN" }

    };
    return statuses;
}


exports.get_attendee_swag_statuses = () => {
    const statuses = {
        "": "N/A (Pre-Event Setting)",
        "CHECKED-IN": "CHECKED-IN (Eligible & Checked In at Event)",
        "UNABLE-TO-ACCEPT": "UNABLE-TO-ACCEPT (Unable to Accept Incentive)",
        "REGISTERED": "REGISTERED (Registered for Incentive)"

    };
    return statuses;
}

exports.get_wireless_carriers = () => {
    const carriers = {
        "": { "name": "Select Carrier" },
        "Verizon": { "name": "Verizon" },
        "AT&T": { "name": "AT&T" },
        "Sprint": { "name": "Sprint" },
        "T-Mobile": { "name": "T-Mobile" }

    };
    return carriers;
}

exports.get_flight_times = () => {
    const flight_times = {
        '': "__________",
        '12AM': '12AM',
        ' 1AM': ' 1AM',
        ' 2AM': ' 2AM',
        ' 3AM': ' 3AM',
        ' 4AM': ' 4AM',
        ' 5AM': ' 5AM',
        ' 6AM': ' 6AM',
        ' 7AM': ' 7AM',
        ' 8AM': ' 8AM',
        ' 9AM': ' 9AM',
        '10AM': '10AM',
        '11AM': '11AM',
        '12PM': '12PM',
        ' 1PM': ' 1PM',
        ' 2PM': ' 2PM',
        ' 3PM': ' 3PM',
        ' 4PM': ' 4PM',
        ' 5PM': ' 5PM',
        ' 6PM': ' 6PM',
        ' 7PM': ' 7PM',
        ' 8PM': ' 8PM',
        ' 9PM': ' 9PM',
        '10PM': '10PM',
        '11PM': '11PM'
    };
    return flight_times;
}

exports.get_airports = () => {
    const airports = {
        "MIA": "MIA - Miami Int'l Airport",
        "FLL": "FLL - Fort Lauderdale Airport"

    };
    return airports;
}

/*
* Escape string for display in JS
* http://stackoverflow.com/questions/6054033/pretty-printing-json-with-php
* re:prettyPrint by @Kendall Hopkins
*/
exports.prettify = (json) => {
    let result = '',
        level = 0,
        prev_char = '',
        in_quotes = false,
        ends_line_level = null;
    const json_length = this.isString(json) ? json.length : 0;

    for (i = 0; i < json_length; i++) {
        let char = json[i], new_line_level = null, post = "";

        if (ends_line_level !== null) {
            new_line_level = ends_line_level;
            ends_line_level = null;
        }
        if (char === '"' && prev_char !== '\\') {
            in_quotes = !in_quotes;
        } else if (!in_quotes) {
            switch (char) {
                case '}':
                case ']':
                    level--;
                    ends_line_level = null;
                    new_line_level = level;
                    break;

                case '{':
                case '[':
                    level++;
                case ',':
                    ends_line_level = level;
                    break;

                case ':':
                    post = " ";
                    break;

                case " ":
                case "\t":
                case "\n":
                case "\r":
                    char = "";
                    ends_line_level = new_line_level;
                    new_line_level = null;
                    break;
            }
        }
        if (new_line_level !== null) {
            result += "\n" + _.repeat("\t", new_line_level);
        }
        result += char + post;
        prev_char = char;
    }

    return result;
}

exports.fromCamelCase = (input) => {
  return null;
    let matches = [];
    preg_match_all('!([A-Z][A-Z0-9]*(?=$|[A-Z][a-z0-9])|[A-Za-z][a-z0-9]+)!', input, matches);
    const ret = matches[0];
    _.forEach(ret, match => {
        match = match === _.toUpper(match) ? _.toLower(match) : _.lowerFirst(match);
    })
    return _.join(ret, '_');
}

exports.camelCase = (str, lcfirst = false, noStrip = [], remove_space = true) => {
    // non-alpha and non-numeric characters become spaces
    str = _.replace(str, '/[^a-z0-9' + _.join(noStrip, "") + ']+/i', ' ');
    str = _.trim(str);
    // uppercase the first character of each word
    str = this.ucwords(str);
    if (remove_space = true) {
        str = _.replace(str, " ", "");
    } else {
        str = _.trim(str);
    }
    if (lcfirst = true) {
        str = _.lowerFirst(str);
    }
    return str;
}

exports.getallheaders = (req) => {
    const headers = {};

    _.forEach(req.headers, (value, name) => {
        if (this.substr(name, 0, 5) === 'HTTP_') {
            headers[_.replace(this.ucwords(_.toLower(_.replace(this.substr(name, 5), '_', ' '))), ' ', '-')] = value;
        }
    })
    return headers;
}

exports.array_to_csv_string = (array, delim = ",", newline = "\n", enclosure = '"') => {
    let out = '';
    // Next blast through the result array and build out the rows
    if (this.isArray(array)) _.forEach(array, row => {
        if (this.isArray(row)) _.forEach(row, item => {
            out += `${enclosure}${_.replace(item, enclosure, enclosure + enclosure)}${enclosure}${delim}`;
        })
        out = _.trimEnd(out);
        out += newline;
    })

    return out;
}

/**
 * Underscore
 *
 * Takes multiple words separated by spaces and underscores them
 *
 * @access	public
 * @param	{string} str
 * @return	{string}
 */
exports.underscore = (str) => {
    return this.preg_replace( '/[\s]+/', '_',_.toLower(_.trim(str)));
}

exports.cmp_time = (a, b) => {
    if (this.strtotime('1970/01/01 ' + a) == this.strtotime('1970/01/01 ' + b)) {
        return 0;
    }
    return (this.strtotime('1970/01/01 ' + a) < this.strtotime('1970/01/01 ' + b)) ? -1 : 1;
}

exports.escape_regex = (word) => {
    const replaces = ['\\', '*', '+', '?', '|', '{', '[', '(', ')', '^', '$', '.', '#'];
    _.forEach(replaces, replace => {
        word = _.replace(word, replace, "\\" + replace);
    })
    return word;
}

/**
 * get a date string based on the format supplied, time zone and/or tz offset
 * @param string $date_time		string, if empty now will be used
 * @param string $format		format default F j, Y g:iA T
 * @param string $tz_name		e.g. America/New_York
 * @param int $tz_offset
 * @return bool|string			returns formatted date string. e.g. Dec, 20 2014 if m, d Y
 */
exports.build_date_string_for_timezone = (date_time = null, format = 'F j, Y g:iA T', tz_name = '', tz_offset = 0) => {
    const dt = this.build_date_object_for_timezone(!this.empty(date_time) ? date_time : "now", tz_name, tz_offset);
    return (!this.empty(dt)) ? dt.format(format) : false;
}

/**
 *
 * @todo fix DateTimeZone and DateTime functions, date_default_timezone_get function
 * @param {*} remote_tz
 * @param {*} origin_tz
 * @returns
 */
exports.build_timezone_offset = (remote_tz, origin_tz = null) => {
    if (origin_tz === null) {
        if (!this.isString(origin_tz = date_default_timezone_get())) {
            return false; // A UTC timestamp was returned -- bail out!
        }
    }
    const origin_dtz = new DateTimeZone(origin_tz);
    const remote_dtz = new DateTimeZone(remote_tz);
    const origin_dt = new DateTime("now", origin_dtz);
    const remote_dt = new DateTime("now", remote_dtz);
    const offset = origin_dtz.getOffset(origin_dt) - remote_dtz.getOffset(remote_dt);
    return offset / 3600;
}

/**
 * get a DateTime object based on the time zone and/or tz offset
 * @todo fix timezone_name_from_abbr function
 * @param string $date_time		string, if empty now will be used
 * @param string $tz_name
 * @param int $tz_offset
 * @return DateTime
 */
exports.build_date_object_for_timezone = (date_time = null, tz_name = '', tz_offset = 0) => {
    let user_dt = "";
    try {
        user_dt = new DateTime(!this.empty(date_time) ? date_time : "now");
        if (this.empty(tz_name))
            tz_name = timezone_name_from_abbr("", (tz_offset * 3600), 1);
        if (this.empty(tz_name)) {
            user_dt.setTimezone(new DateTimeZone('UTC'));
            user_dt.modify(tz_offset + ' hours');
        } else
            user_dt.setTimezone(new DateTimeZone(tz_name));
    } catch (e) {
        user_dt = "";
    }
    return user_dt;
}

/**
 *
 * @todo resolve http_build_query function
 * @param {*} attendee_fields
 * @param {*} get_input
 * @returns
 */
exports.build_params_from_attendee_fields = (attendee_fields, get_input) => {
    const get_params = {};
    if (!this.empty(get_input)) {
        _.forEach(get_input, (value, key) => {
            if ((!_.includes("attendee_event_survey_", key) || !_.includes("attendee_event_email_", key) || !_.includes("agenda_items_", key) || _.includes(attendee_fields, key)) && key !== 'search_constraints') {
                    get_params[key] = value;
                }
        })
    }
    return http_build_query(get_params);
}

/**
 *
 * @todo resolve http_build_query and parse_str functions
 * @param {*} list_constraints
 * @param {*} search_constraints
 * @returns
 */
exports.convert_list_and_search_to_params = (list_constraints = "", search_constraints = "") => {
    const constraints_output = {};
    if (!this.empty(list_constraints)) {
        parse_str(list_constraints, constraints_output);
    }
    const post_params = !this.empty(constraints_output) ? constraints_output : {};
    post_params['search_constraints'] = !this.empty(search_constraints) ? search_constraints : "";
    return http_build_query(post_params);
}

/**
 * Helper function that converts underscore string|variable to camelCased string|variable
 * @returns {string} - Returns new camelCased variable.
 */
exports.underscoreToCamelcase = (string="") => {
  return string.replace(/(\_\w)/g, function (m) {
    return m[1].toUpperCase();
  });
}

/**
 * Helper function that converts camelCased string|variable to underscore string|variable
 * @returns {string} - Returns new underscore variable.
 */
exports.camelToUnderscore = (string = "") => {
  return string.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**

 * Helper function to get the sha1 hash of a string.  equivalent of PHP sha1
 * @param {string} str
 * @returns
 *
 * Usage example: sha1('Kevin van Zonneveld');
 * returns: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'
 */
exports.sha1 = (str="") =>{
  let hash
  try {
    const crypto = require('crypto')
    const sha1sum = crypto.createHash('sha1')
    sha1sum.update(str)
    hash = sha1sum.digest('hex')
  } catch (e) {
    hash = undefined
  }
  if (hash !== undefined) {
    return hash
  }
  const _rotLeft = function (n, s) {
    const t4 = (n << s) | (n >>> (32 - s))
    return t4
  }
  const _cvtHex = function (val) {
    let str = ''
    let i
    let v
    for (i = 7; i >= 0; i--) {
      v = (val >>> (i * 4)) & 0x0f
      str += v.toString(16)
    }
    return str
  }
  let blockstart
  let i, j
  const W = new Array(80)
  let H0 = 0x67452301
  let H1 = 0xEFCDAB89
  let H2 = 0x98BADCFE
  let H3 = 0x10325476
  let H4 = 0xC3D2E1F0
  let A, B, C, D, E
  let temp
  // utf8_encode
  str = unescape(encodeURIComponent(str))
  const strLen = str.length
  const wordArray = []
  for (i = 0; i < strLen - 3; i += 4) {
    j = str.charCodeAt(i) << 24 |
      str.charCodeAt(i + 1) << 16 |
      str.charCodeAt(i + 2) << 8 |
      str.charCodeAt(i + 3)
    wordArray.push(j)
  }
  switch (strLen % 4) {
    case 0:
      i = 0x080000000
      break
    case 1:
      i = str.charCodeAt(strLen - 1) << 24 | 0x0800000
      break
    case 2:
      i = str.charCodeAt(strLen - 2) << 24 | str.charCodeAt(strLen - 1) << 16 | 0x08000
      break
    case 3:
      i = str.charCodeAt(strLen - 3) << 24 |
        str.charCodeAt(strLen - 2) << 16 |
        str.charCodeAt(strLen - 1) <<
        8 | 0x80
      break
  }
  wordArray.push(i)
  while ((wordArray.length % 16) !== 14) {
    wordArray.push(0)
  }
  wordArray.push(strLen >>> 29)
  wordArray.push((strLen << 3) & 0x0ffffffff)
  for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
    for (i = 0; i < 16; i++) {
      W[i] = wordArray[blockstart + i]
    }
    for (i = 16; i <= 79; i++) {
      W[i] = _rotLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1)
    }
    A = H0
    B = H1
    C = H2
    D = H3
    E = H4
    for (i = 0; i <= 19; i++) {
      temp = (_rotLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff
      E = D
      D = C
      C = _rotLeft(B, 30)
      B = A
      A = temp
    }
    for (i = 20; i <= 39; i++) {
      temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff
      E = D
      D = C
      C = _rotLeft(B, 30)
      B = A
      A = temp
    }
    for (i = 40; i <= 59; i++) {
      temp = (_rotLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff
      E = D
      D = C
      C = _rotLeft(B, 30)
      B = A
      A = temp
    }
    for (i = 60; i <= 79; i++) {
      temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff
      E = D
      D = C
      C = _rotLeft(B, 30)
      B = A
      A = temp
    }
    H0 = (H0 + A) & 0x0ffffffff
    H1 = (H1 + B) & 0x0ffffffff
    H2 = (H2 + C) & 0x0ffffffff
    H3 = (H3 + D) & 0x0ffffffff
    H4 = (H4 + E) & 0x0ffffffff
  }
  temp = _cvtHex(H0) + _cvtHex(H1) + _cvtHex(H2) + _cvtHex(H3) + _cvtHex(H4)
  return temp.toLowerCase()
}

/**
 * Helper function to replace a string or array of strings with another string or array os strings in a given string.  equivalent of PHP str_replace
 * @param {string} search
 * @param {string} replace
 * @param {string} subject
 * @param {string} countObj
 * @returns
 *
 * note 1: The countObj parameter (optional) if used must be passed in as an object. The count will then be written by reference into it's `value` property
 *  example 1: str_replace(' ', '.', 'Kevin van Zonneveld')
 *  returns 1: 'Kevin.van.Zonneveld'
 *  example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars')
 *  returns 2: 'hemmo, mars'
 *  example 3: str_replace(Array('S','F'),'x','ASDFASDF')
 *  returns 3: 'AxDxAxDx'
 *  example 4: var countObj = {}
 *  example 4: str_replace(['A','D'], ['x','y'] , 'ASDFASDF' , countObj)
 *  example 4: var $result = countObj.value
 *  returns 4: 4
 *  example 5: str_replace('', '.', 'aaa')
 *  returns 5: 'aaa'
 */
exports.str_replace = (search, replace, subject, countObj={})=> {
  search=this.isString(search)?search:'';
  replace=this.isString(replace)?replace:'';
  subject=this.isString(subject)?subject:'';
  countObj=this.isObject(countObj)?countObj:{};
  let i = 0
  let j = 0
  let temp = ''
  let repl = ''
  let sl = 0
  let fl = 0
  const f = [].concat(search)
  let r = [].concat(replace)
  let s = subject
  let ra = Object.prototype.toString.call(r) === '[object Array]'
  const sa = Object.prototype.toString.call(s) === '[object Array]'
  s = [].concat(s)
  if (typeof (search) === 'object' && typeof (replace) === 'string') {
    temp = replace
    replace = []
    for (i = 0; i < search.length; i += 1) {
      replace[i] = temp
    }
    temp = ''
    r = [].concat(replace)
    ra = Object.prototype.toString.call(r) === '[object Array]'
  }
  if (typeof countObj !== 'undefined') {
    countObj.value = 0
  }
  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === '') {
      continue
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      if (f[j] === '') {
        continue
      }
      temp = s[i] + ''
      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0]
      s[i] = (temp).split(f[j]).join(repl)
      if (typeof countObj !== 'undefined') {
        countObj.value += ((temp.split(f[j])).length - 1)
      }
    }
  }
  return sa ? s : s[0]
}

 /* Search an object for a value and return the key
 * JS Equvalent of PHP array_search
 * @param {*} needle
 * @param {*} haystack
 * @returns string | boolean
 */
exports.object_search = (needle, haystack) => {
    if(_this.isObject(haystack)) {
        for(let i in haystack) {
            if (haystack.hasOwnProperty(i)) {
                if((haystack[i] + '') === (needle + '')) return i;
            }
        }
    }
    return false;
}

exports.array_search = (needle, haystack) => {
    return _this.object_search(needle, haystack);
}

/**
 * Returns object with unique values (JS equivalent of PHP array_unique)
 * @param {*} inputArr
 * @param {*} returnObjec
 * Sample input and output
 * example 1: array_unique(['Kevin','Kevin','van','Zonneveld','Kevin'])
 *      returns 1: {0: 'Kevin', 2: 'van', 3: 'Zonneveld'}
 * example 2: array_unique({'a': 'green', 0: 'red', 'b': 'green', 1: 'blue', 2: 'red'})
 *      returns 2: {a: 'green', 0: 'red', 1: 'blue'}
 * @returns
 */
exports.array_unique = (inputArr, returnObjec = true) => {
    let key = ''
    const tmpArr2 = {}
    let val = '';
    for (key in inputArr) {
      if (inputArr.hasOwnProperty(key)) {
        val = inputArr[key]
        if (_this.array_search(val, tmpArr2) === false) {
          tmpArr2[key] = val
        }
      }
    }
    return tmpArr2
}

exports.randomNumberWithInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

exports.generateRandomCodes = (amount, min_length = 10, max_length = 16, characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789") => {
    const string = [];
    for (let j = 0; j < amount; j++) {
        let first_string = '';
        const random_string_length = this.randomNumberWithInterval(min_length, max_length);
        for (let i = 0; i < random_string_length; i++) {
            first_string += characters[this.randomNumberWithInterval(0, characters.length - 1)];
        }
        string.push(first_string);
    }
    return string;
}

/**
 * Helper function to check if a needle/string/value is an element of an array/
 * equivalent to php in_array
 * Usage examples:
 *   example 1: in_array('van', ['Kevin', 'van', 'Zonneveld'])
 *   returns 1: true
 *   example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'})
 *   returns 2: false
 *   example 3: in_array(1, ['1', '2', '3'])
 *   example 3: in_array(1, ['1', '2', '3'], false)
 *   returns 3: true
 *   returns 3: true
 *   example 4: in_array(1, ['1', '2', '3'], true)
 *   returns 4: false
 * @param needle
 * @param haystack
 * @param argStrict
 * @returns {boolean}
 */
exports.in_array = (needle, haystack, argStrict) =>{
  let key = ''
  const strict = !!argStrict
  if (strict) {
    for (key in haystack) {
      if (haystack[key] === needle) {
        return true
      }
    }
  } else {
    for (key in haystack) {
      if (haystack[key] == needle) {
        return true
      }
    }
  }
  return false
}

exports.base64_encode = (stringToEncode) => {
  return _base64_encode(stringToEncode);
}

exports.base64_decode = (encodedData) => {
  return _base64_decode(encodedData);
}

//equivalent of php file_get_contents
// reimplemented by: Kevin van Zonneveld (https://kvz.io)
//           note 1: This used to work in the browser via blocking ajax
//           note 1: requests in 1.3.2 and earlier
//           note 1: but then people started using that for real app,
//           note 1: so we deprecated this behavior,
//           note 1: so this function is now Node-only
//        example 1: var $buf = file_get_contents('test/never-change.txt')
//        example 1: var $result = $buf.indexOf('hash') !== -1
//        returns 1: true
exports.file_get_contents = (url, flags, context, offset, maxLen) => {
  const fs = require('fs')
  return fs.readFileSync(url, 'utf-8');
}


//   example 1: basename('/www/site/home.htm', '.htm')
//   returns 1: 'home'
//   example 2: basename('ecra.php?p=1')
//   returns 2: 'ecra.php?p=1'
//   example 3: basename('/some/path/')
//   returns 3: 'path'
//   example 4: basename('/some/path_ext.ext/','.ext')
//   returns 4: 'path_ext'

exports.basename = (path, suffix) => {

  let b = path
  const lastChar = b.charAt(b.length - 1)

  if (lastChar === '/' || lastChar === '\\') {
    b = b.slice(0, -1)
  }

  b = b.replace(/^.*[/\\]/g, '')

  if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
    b = b.substr(0, b.length - suffix.length)
  }

  return b
}

//Equivalent of php pathinfo
//      note 1: Inspired by actual PHP source: php5-5.2.6/ext/standard/string.c line #1559
//      note 1: The way the bitwise arguments are handled allows for greater flexibility
//      note 1: & compatability. We might even standardize this
//      note 1: code and use a similar approach for
//      note 1: other bitwise PHP functions
//      note 1: Locutus tries very hard to stay away from a core.js
//      note 1: file with global dependencies, because we like
//      note 1: that you can just take a couple of functions and be on your way.
//      note 1: But by way we implemented this function,
//      note 1: if you want you can still declare the PATHINFO_*
//      note 1: yourself, and then you can use:
//      note 1: pathinfo('/www/index.html', PATHINFO_BASENAME | PATHINFO_EXTENSION);
//      note 1: which makes it fully compliant with PHP syntax.
//   example 1: pathinfo('/www/htdocs/index.html', 1)
//   returns 1: '/www/htdocs'
//   example 2: pathinfo('/www/htdocs/index.html', 'PATHINFO_BASENAME')
//   returns 2: 'index.html'
//   example 3: pathinfo('/www/htdocs/index.html', 'PATHINFO_EXTENSION')
//   returns 3: 'html'
//   example 4: pathinfo('/www/htdocs/index.html', 'PATHINFO_FILENAME')
//   returns 4: 'index'
//   example 5: pathinfo('/www/htdocs/index.html', 2 | 4)
//   returns 5: {basename: 'index.html', extension: 'html'}
//   example 6: pathinfo('/www/htdocs/index.html', 'PATHINFO_ALL')
//   returns 6: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}
//   example 7: pathinfo('/www/htdocs/index.html')
//   returns 7: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}
exports.pathinfo = (path, options) => {

  let opt = ''
  let realOpt = ''
  let optName = ''
  let optTemp = 0
  const tmpArr = {}
  let cnt = 0
  let i = 0
  let haveBasename = false
  let haveExtension = false
  let haveFilename = false
  // Input defaulting & sanitation
  if (!path) {
    return false
  }
  if (!options) {
    options = 'PATHINFO_ALL'
  }
  // Initialize binary arguments. Both the string & integer (constant) input is
  // allowed
  const OPTS = {
    PATHINFO_DIRNAME: 1,
    PATHINFO_BASENAME: 2,
    PATHINFO_EXTENSION: 4,
    PATHINFO_FILENAME: 8,
    PATHINFO_ALL: 0
  }
  // PATHINFO_ALL sums up all previously defined PATHINFOs (could just pre-calculate)
  for (optName in OPTS) {
    if (OPTS.hasOwnProperty(optName)) {
      OPTS.PATHINFO_ALL = OPTS.PATHINFO_ALL | OPTS[optName]
    }
  }
  if (typeof options !== 'number') {
    // Allow for a single string or an array of string flags
    options = [].concat(options)
    for (i = 0; i < options.length; i++) {
      // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
      if (OPTS[options[i]]) {
        optTemp = optTemp | OPTS[options[i]]
      }
    }
    options = optTemp
  }
  // Internal Functions
  const _getExt = function (path) {
    const str = path + ''
    const dotP = str.lastIndexOf('.') + 1
    return !dotP ? false : dotP !== str.length ? str.substr(dotP) : ''
  }
  // Gather path infos
  if (options & OPTS.PATHINFO_DIRNAME) {
    const dirName = path
      .replace(/\\/g, '/')
      .replace(/\/[^/]*\/?$/, '') // dirname
    tmpArr.dirname = dirName === path ? '.' : dirName
  }
  if (options & OPTS.PATHINFO_BASENAME) {
    if (haveBasename === false) {
      haveBasename = this.basename(path)
    }
    tmpArr.basename = haveBasename
  }
  if (options & OPTS.PATHINFO_EXTENSION) {
    if (haveBasename === false) {
      haveBasename = this.basename(path)
    }
    if (haveExtension === false) {
      haveExtension = _getExt(haveBasename)
    }
    if (haveExtension !== false) {
      tmpArr.extension = haveExtension
    }
  }
  if (options & OPTS.PATHINFO_FILENAME) {
    if (haveBasename === false) {
      haveBasename = this.basename(path)
    }
    if (haveExtension === false) {
      haveExtension = _getExt(haveBasename)
    }
    if (haveFilename === false) {
      haveFilename = haveBasename.slice(0, haveBasename.length - (haveExtension
          ? haveExtension.length + 1
          : haveExtension === false
            ? 0
            : 1
      )
      )
    }
    tmpArr.filename = haveFilename
  }
  // If array contains only 1 element: return string
  cnt = 0
  for (opt in tmpArr) {
    if (tmpArr.hasOwnProperty(opt)) {
      cnt++
      realOpt = opt
    }
  }
  if (cnt === 1) {
    return tmpArr[realOpt]
  }
  // Return full-blown array
  return tmpArr
}

/**
 * Cloned Helper function to trim str
 * @param {string} str - Represents the data to run check on.
 * @returns {string} - Returns the trimmed str.
 */
exports.trim = (str = "") => {
  return this.isString(str) ? str.trim() : str;
}

/**
 * Cloned Helper function to trim str
 * @param {string} str - Represents the data to run check on.
 * @returns {string} - Returns the trimmed str.
 */
exports.strtolower = (str = "") => {
  return this.isString(str) ? str.toLowerCase() : str;
}

/**
 * Cloned Helper function to trim str
 * @param {string} str - Represents the data to run check on.
 * @returns {string} - Returns the trimmed str.
 */
exports.strtoupper = (str = "") => {
  return this.isString(str) ? str.toUpperCase() : str;
}

/**
 js version of php preg_replace
  original by: rony2k6 (https://github.com/rony2k6)
  example 1: preg_replace('/xmas/i', 'Christmas', 'It was the night before Xmas.')
  returns 1: "It was the night before Christmas."
  example 2: preg_replace('/xmas/ig', 'Christmas', 'xMas: It was the night before Xmas.')
  returns 2: "Christmas: It was the night before Christmas."
  example 3: preg_replace('\/(\\w+) (\\d+), (\\d+)\/i', '$11,$3', 'April 15, 2003')
  returns 3: "April1,2003"
  example 4: preg_replace('/[^a-zA-Z0-9]+/', '', 'The Development of code . http://www.')
  returns 4: "TheDevelopmentofcodehttpwww"
  example 5: preg_replace('/[^A-Za-z0-9_\\s]/', '', 'D"usseldorfer H"auptstrasse')
  returns 5: "Dusseldorfer Hauptstrasse"
 **/
exports.preg_replace = (pattern, replacement, string)=> {
  let _flag = pattern.substr(pattern.lastIndexOf(pattern[0]) + 1)
  _flag = (_flag !== '') ? _flag : 'g'
  const _pattern = pattern.substr(1, pattern.lastIndexOf(pattern[0]) - 1)
  const regex = new RegExp(_pattern, _flag)
  const result = string.replace(regex, replacement)
  return result
}

//  js version of php strpos - case sensitive match. See stripos for case-insensitive match
// original by: Kevin van Zonneveld (https://kvz.io)
// improved by: Onno Marsman (https://twitter.com/onnomarsman)
// improved by: Brett Zamir (https://brett-zamir.me)
// bugfixed by: Daniel Esteban
//   example 1: strpos('Kevin van Zonneveld', 'e', 5)
//   returns 1: 14
exports.strpos = (haystack, needle, offset) => {

  const i = (haystack + '')
    .indexOf(needle, (offset || 0))
  return i === -1 ? false : i
}

//  js version of php stripos
// original by: Martijn Wieringa
//  revised by: Onno Marsman (https://twitter.com/onnomarsman)
//   example 1: stripos('ABC', 'a')
//   returns 1: 0
exports.stripos = (fHaystack, fNeedle, fOffset) => {

  const haystack = (fHaystack + '').toLowerCase()
  const needle = (fNeedle + '').toLowerCase()
  let index = 0
  if ((index = haystack.indexOf(needle, fOffset)) !== -1) {
    return index
  }
  return false
}

//  function to count number of string characters
//   example 1: strlen('Kevin van Zonneveld')
//   returns 1: 19
exports.strlen = (string) => {
  const str = string + ''
  return str.length

}

//  js version of php implode
// original by: Kevin van Zonneveld (https://kvz.io)
// improved by: Waldo Malqui Silva (https://waldo.malqui.info)
// improved by: Itsacon (https://www.itsacon.net/)
// bugfixed by: Brett Zamir (https://brett-zamir.me)
//   example 1: implode(' ', ['Kevin', 'van', 'Zonneveld'])
//   returns 1: 'Kevin van Zonneveld'
//   example 2: implode(' ', {first:'Kevin', last: 'van Zonneveld'})
//   returns 2: 'Kevin van Zonneveld'
exports.implode = (glue, pieces) => {

  let i = ''
  let retVal = ''
  let tGlue = ''
  if (arguments.length === 1) {
    pieces = glue
    glue = ''
  }
  if (typeof pieces === 'object') {
    if (Object.prototype.toString.call(pieces) === '[object Array]') {
      return pieces.join(glue)
    }
    for (i in pieces) {
      retVal += tGlue + pieces[i]
      tGlue = glue
    }
    return retVal
  }
  return pieces
}

// js version of php str_split
//  discuss at: https://locutus.io/php/str_split/
// original by: Martijn Wieringa
// improved by: Brett Zamir (https://brett-zamir.me)
// bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
//  revised by: Theriault (https://github.com/Theriault)
//  revised by: Rafał Kukawski (https://blog.kukawski.pl)
//    input by: Bjorn Roesbeke (https://www.bjornroesbeke.be/)
//   example 1: str_split('Hello Friend', 3)
//   returns 1: ['Hel', 'lo ', 'Fri', 'end']
exports.str_split = (string, splitLength) => {
  if (splitLength === null) {
    splitLength = 1
  }
  if (string === null || splitLength < 1) {
    return false
  }
  string += ''
  const chunks = []
  let pos = 0
  const len = string.length
  while (pos < len) {
    chunks.push(string.slice(pos, pos += splitLength))
  }
  return chunks
}

//  js version of php substr
// original by: Martijn Wieringa
// bugfixed by: T.Wild
// improved by: Onno Marsman (https://twitter.com/onnomarsman)
// improved by: Brett Zamir (https://brett-zamir.me)
//  revised by: Theriault (https://github.com/Theriault)
//  revised by: Rafał Kukawski
//      note 1: Handles rare Unicode characters if 'unicode.semantics' ini (PHP6) is set to 'on'
//   example 1: substr('abcdef', 0, -1)
//   returns 1: 'abcde'
//   example 2: substr(2, 0, -6)
//   returns 2: false
//   example 3: ini_set('unicode.semantics', 'on')
//   example 3: substr('a\uD801\uDC00', 0, -1)
//   returns 3: 'a'
//   example 4: ini_set('unicode.semantics', 'on')
//   example 4: substr('a\uD801\uDC00', 0, 2)
//   returns 4: 'a\uD801\uDC00'
//   example 5: ini_set('unicode.semantics', 'on')
//   example 5: substr('a\uD801\uDC00', -1, 1)
//   returns 5: '\uD801\uDC00'
//   example 6: ini_set('unicode.semantics', 'on')
//   example 6: substr('a\uD801\uDC00z\uD801\uDC00', -3, 2)
//   returns 6: '\uD801\uDC00z'
//   example 7: ini_set('unicode.semantics', 'on')
//   example 7: substr('a\uD801\uDC00z\uD801\uDC00', -3, -1)
//   returns 7: '\uD801\uDC00z'
//        test: skip-3 skip-4 skip-5 skip-6 skip-7
exports.substr = (input, start, len) => {

  const _php_cast_string = require('../lib/php_js/_phpCastString') // eslint-disable-line camelcase
  input = _php_cast_string(input)
  const multibyte = false;
  if (multibyte) {
    input = input.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/gu) || []
  }
  const inputLength = input.length
  let end = inputLength
  if (start < 0) {
    start += end
  }
  if (typeof len !== 'undefined') {
    if (len < 0) {
      end = len + end
    } else {
      end = len + start
    }
  }
  if (start > inputLength || start < 0 || start > end) {
    return false
  }
  if (multibyte) {
    return input.slice(start, end).join('')
  }
  return input.slice(start, end)
}

//js version of php explode
// original by: Kevin van Zonneveld (https://kvz.io)
//   example 1: explode(' ', 'Kevin van Zonneveld')
//   returns 1: [ 'Kevin', 'van', 'Zonneveld' ]
exports.explode = (delimiter, string, limit) => {
  const _explode = require('../lib/php_js/explode');
  return _explode(delimiter, string, limit);
}

// js version of php str_pad
//  discuss at: https://locutus.io/php/str_pad/
// original by: Kevin van Zonneveld (https://kvz.io)
// improved by: Michael White (https://getsprink.com)
//    input by: Marco van Oort
// bugfixed by: Brett Zamir (https://brett-zamir.me)
//   example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT')
//   returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
//   example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH')
//   returns 2: '------Kevin van Zonneveld-----'
exports.str_pad = (input, padLength, padString, padType) => {
  const _str_pad = require('../lib/php_js/str_pad');
  return _str_pad(input, padLength, padString, padType);
}

// js version of php array_values
//  discuss at: https://locutus.io/php/array_values/
// original by: Kevin van Zonneveld (https://kvz.io)
// improved by: Brett Zamir (https://brett-zamir.me)
//   example 1: array_values( {firstname: 'Kevin', surname: 'van Zonneveld'} )
//   returns 1: [ 'Kevin', 'van Zonneveld' ]
exports.array_values = (input) => {
  const tmpArr = []
  let key = ''
  if(this.isArray(input)) {
    for (key in input) {
      tmpArr[tmpArr.length] = input[key]
    }
  }
  return tmpArr
}

//  js version of php gmdate
// original by: Brett Zamir (https://brett-zamir.me)
//    input by: Alex
// bugfixed by: Brett Zamir (https://brett-zamir.me)
//   example 1: gmdate('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400); // Return will depend on your timezone
//   returns 1: '07:09:40 m is month'
exports.gmdate = (format, timestamp) => {

  const date = require('./date')
  const dt = typeof timestamp === 'undefined'
    ? new Date() // Not provided
    : timestamp instanceof Date
      ? new Date(timestamp) // Javascript Date()
      : new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
  timestamp = Date.parse(dt.toUTCString().slice(0, -4)) / 1000
  return date(format, timestamp)
}

exports.getBase64Image = async (image_url) => {
    return new Promise(function (resolve, reject) {
        if (_.isString(image_url) && image_url.trim() !== "") {
            var request_http = null;
            if (image_url.indexOf('https') === 0) {
                request_http = require('https');
            } else {
                request_http = require('http');
            }
            request_http.get(image_url, function (resp) {
                resp.setEncoding('base64');
                let body = "data:" + resp.headers["content-type"] + ";base64,";
                resp.on('data', function (data) {
                    body += data;
                });
                resp.on('end', function () {
                    resolve(body);
                });
            }).on('error', function (e) {
                reject({err: e.message});
            });
        } else {
          reject({err: "No image provided"});
        }
    });
}

/**
 * checks database response data validity
 * checks if data is not empty or undefined
 * checks if data has _id or id field
 * checks if data is an object
 */
exports.isDbObjectValid = (data) => {
    if (!_.isEmpty(data) && !_.isUndefined(data) && _.isObject(data) && (_.has(data, "_id") || _.has(data, "id"))) {
        return true;
    }
    return false;
}



