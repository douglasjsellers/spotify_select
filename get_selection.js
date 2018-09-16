var selection = document.getSelection();
var editorExtensionId = "pmegncfkljalkbbncambjfbmdjifneba";
chrome.runtime.sendMessage(editorExtensionId, {selection: document.getSelection().toString().split( '\n' )},
                           function(response) {
                             console.log( response );
                           });
console.log( "plugin" );
console.log( selection );
