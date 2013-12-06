/*The application that gets the information on the server side must be specified in
the 'config' structure as 'config.exportUrl'. It will be sent an url-encoded JSON structure
that consists of: 
description: [user input--a title, a comment, whatever]
date: number of milliseconds since 1970/01/01
formula: JSON structure used to make the calculation--{attribute: weight for att, attribute ...}
chart: html for the chart produced
*/

function exporter() {
  var x = {};
  x.messageBox = document.getElementById('ExMessage');
  x.textBox = document.getElementById('textBox');
  x.send = document.getElementById('exSend');
  x.clear = document.getElementById('exClear');
  x.buffer = ''; //the calculate function places the search set in here
  x.http = null;
  x.timer = null;
  x.kb = null;


  x.sendMessage = function(txt) {
    x.messageBox.innerHTML = txt;
  }

  //create the callback func for keyboard
  x.keyb_callback = function(ch) {
    var text = x.textBox,
      val = x.textBox.value;

    switch (ch) {
    case "BackSpace":
      var min = (val.charCodeAt(val.length - 1) == 10) ? 2 : 1;
      text.value = val.substr(0, val.length - min);
      break;

    case "Enter":
      text.value += "\n";
      break;

    default:
      text.value += ch;
    }
  }

  x.kb = new VKeyboard("keyboard", x.keyb_callback);


  //clear button
  x.doClear = function() {
    x.messageBox.innerHTML = '';
    x.textBox.value = '';
  }

  x.clear.onclick = x.doClear;

  //send button
  x.send.onclick = function() {
    var data, cont = x.textBox.value;
    data = {};
    if (cont == '') {
      x.sendMessage("YOU MUST ENTER SOME TEXT");
      return;
    }
    if (x.buffer == '') {
      x.sendMessage("NO RESULTS HAVE BEEN SAVED");
      return;
    }
    if (x.http !== null) {
      x.sendMessage("WAIT--PRIOR CALL STILL PENDING");
      return;
    }
    if (config.exportUrl == (null || undefined)) {
      x.sendMessage("THE DESTINATION HAS NOT BEEN CONFIGURED");
      return;
    }
    x.textBox.innerHTML = ''; //no double hits
    data.description = cont;
    data.date = new Date();
    data.date = data.date.getTime();
    data.formula = x.buffer;
    data.chart = document.getElementById('chart');
    data.chart = data.chart.innerHTML;


    data = JSON.stringify(data);
    data = escape(data);
    data = 'mapData=' + data;


    x.http = new XMLHttpRequest();
    var fix = '"' + config.exportUrl + '"';
    x.http.open("POST", "exporter.php", true);
    x.http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    x.http.setRequestHeader("Connection", "close");
    x.http.onreadystatechange = function() {
      if (x.http.readyState == 4 && x.http.status == 200) {
        x.incoming;
      }
    }
    x.timer = setTimeout(x.error, 10000);
    x.http.send(data);
  }

  x.incoming = function() {
    if (x.http.responseText == 'ACK') {
      x.sendMessage('EXPORT WAS SUCCESSFUL');
    } else {
      x.sendMessage("THERE WAS AN ERROR-ATTEMPT FAILED");
    }
    clearTimeout(x.timer);
    x.http = null;

  }

  x.error = function() {
    if (x.http.readyState != 4) {
      x.sendMessage("THERE HAS BEEN NO RESPONSE FROM THE SERVER");
    } else {
      x.sendMessage(x.http.statusText);
    }
    x.http = null;

  }
  //alterations to let user view exported data
  var newB = document.createElement('input');
  newB.type = "button";
  newB.value = "IMPORT";
  //stick it in the row
  x.clear.parentNode.appendChild(newB);
  newB.onclick = function() {
    x.makeFrame();
  }

  x.makeFrame = function() {
    var html = document.createElement('div');
    html.id = "impDiv";
    html.innerHTML = ' <input type="button" value="CLOSE" id="closeF"><br><iframe src="import.php?query=t" id ="impF"></iframe></div>';
    html.style.width = "100%";
    html.style.height = "100%";
    html.style.position = 'absolute';
    html.style.top = '0px';
    html.style.left = '0px';
    html.style.zIndex = '20000';

    document.body.appendChild(html);
    x.frame = document.getElementById('impDiv');
    document.getElementById('closeF').onclick = function() {
      x.frame.parentNode.removeChild(x.frame);
    }
  }

  return x;
}
