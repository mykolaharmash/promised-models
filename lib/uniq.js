/**
 * generate uniq strings
 */
var lastUniq = 0;

/**
 * @return {string}
 */
module.exports =  function () {
    return 'uniq' + lastUniq++;
};
