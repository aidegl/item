;(function (window) {
  var TempLink = {
    generateFromFile: async function (file) {
      var url = URL.createObjectURL(file)
      return url
    },
    revoke: function (url) {
      try {
        URL.revokeObjectURL(url)
      } catch (e) {}
    }
  }
  window.TempLink = TempLink
})(window)
