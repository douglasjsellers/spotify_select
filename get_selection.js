var selection = document.getSelection().toString().split( '\n' );
var filteredSelection = selection.filter( function( value ) { return value != null && value.length > 0 } )
chrome.runtime.sendMessage("pmegncfkljalkbbncambjfbmdjifneba", {selection: filteredSelection},function(response) {});
