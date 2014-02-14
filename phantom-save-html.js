var page = require('webpage').create(),
    fs = require('fs'),
    system = require('system');

if (system.args.length < 2) {
  console.log("Usage: savePage.js URL [filename]");
  phantom.exit();
}
else {
  var address = system.args[1].replace(/^\/\/|^(?!https?:\/\/)/, 'http:\/\/'),
      output = system.args[2] || '',
      outputStream;
      
  page.onResourceReceived = function(response) {
    if (response.url === page.url) {
      if (response.status === 200) {
        for (var i = 0; i < response.headers.length; i++) {
          if (response.headers[i].name === 'Content-Disposition'
           && response.headers[i].value.indexOf('filename') >= 0) {
            output = decodeURI(response.headers[i].value.match(/filename="?([^;"]+)"?/)[1]);
          }
        }
      }
    }
  };
  
  page.onUrlChanged = function (newUrl) {
    console.log('Connecting to ' + newUrl);
  }
    
  page.open(address, function (status) {
    if (status !== 'success') {
      console.log('Unable to load ' + address + '!');
      phantom.exit();
    }
    else {
      window.setTimeout(function () {
        var pageName, i = 0;
          if (!output) {
            pageName = page.url.match(/\/([^\/]+)$/);
            if (pageName && pageName[1]) {
              output = decodeURI(pageName[1]);
            }
            else output = 'saved_page';
          }
          while (output && fs.exists(output) && ++i) {
              output = output.replace(/(?: \(\d+\))?(\.[^.]*)?$/, ' (' + i + ')$1');
              console.log('file exists. trying "' + output + '"...');
          }
          try {
            outputStream = fs.open(output, 'w');
          }
          catch (e) {
            console.log(e);
            console.log('trying filename "saved_page"...');
            output = 'saved_page';
            i = 0;
            while (fs.exists(output) && ++i) {
              output = output.replace(/(?: \(\d+\))?$/, ' (' + i + ')');
              console.log('filename exists. trying "' + output + '"...');
            }
            try {
              outputStream = fs.open(output, 'w');
            }
            catch (e) {
              console.log(e);
              console.log('Cannot open file. Exit program.');
              phantom.exit();
            }
          }
          outputStream.write(page.content);
          console.log('Done!');
          phantom.exit();
      }, 200);
    }
  });
}