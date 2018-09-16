var selection = document.getSelection().toString().split( '\n' );
var filteredSelection = selection.filter( function( value ) { return value != null && value.length > 0 } )
var editorExtensionId = "pmegncfkljalkbbncambjfbmdjifneba";
chrome.runtime.sendMessage(editorExtensionId, {selection: filteredSelection},
                           function(response) {
                             console.log( response );
                           });
console.log( "plugin" );
console.log( selection );
