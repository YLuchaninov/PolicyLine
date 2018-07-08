export default {
    $trim: function(str) {
        return str.trim();
    },

    $uppercase: function (str) {
        return str.toUpperCase();
    },

    $lowercase: function (str) {
        return str.toLowerCase();
    },

    $strToInt: function (str) {
        return parseInt(str, 10);
    }
}