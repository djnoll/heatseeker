// This sets up the application
//global variables--'config' and 'style' were set in config.js 
var map, grabber, slider1, slider2, sorter, slate, recorder, master;

window.onload = function() {
  setUpMain();
}




//---------GENERAL UTILITY FUNCTIONS------------------------------
//sets z-index of main containers to bring the one whose id is the arg to the top
function adjustZ(id) {
  var set = ["chartCont", "export", "dashB", "legendWrapper"];
  var ref, i, start = 1000,
    len = set.length;
  for (i = 0; i < len; i++) {
    ref = document.getElementById(set[i]);
    if (set[i] == id) {
      ref.style.zIndex = 10000;
    } else {
      ref.style.zIndex = start;
      start = (start * 1) + 100;
    }
  }
}


function calculate() { //calculates from present settings--makes chart and sets colors by rank
  sorter.purify(grabber.data, config.sum);
  grabber.setVisible('BASE');
  slate.graphics_exist = 'yes';
  //put data in original order
  grabber.data = sorter.sortObj(grabber.data, config.key);
  grabber.data = grabber.data.reverse();
  var prime, minor, i, out;
  prime = slider1.giveSet();
  prime = master.adjustOne(prime);
  minor = slider2.giveSet();
  minor = master.adjustTwo(minor);
  //merge into prime
  for (i in minor) {
    prime[i] = minor[i];
  }

  grabber.data = sorter.calc(grabber.data, config.sum, prime);

  recorder.buffer = prime;
  out = sorter.makeTable(grabber.data);
  document.getElementById('chart').innerHTML = out;
  grabber.setGradient();
}

//instantiates the objects needed to run the program
function setUpMain() {
  //set up slate to provide status data and general info storage
  //this is actually a relic from the esri map--retained but of little use
  slate = {
    graphics_exist: "no",
    iframe: null,
    current: null,
    width: null,
    height: null
  };

  //========create the controller objects
  grabber = doMap(masterGrid, map, config, layerFill);
  grabber.makeButtons('radio'); //create layer toggle buttons

  //create MASTER selector for sliders
  master = makeMaster("masterSet");


  //create slider sets
  slider1 = balancer(config.set1dest, config.set1weight, config.set1, config.set1alias);
  slate.temp = document.getElementById(config.set1dest);
  //create hr between them
  slate.el = document.createElement('hr');
  slate.el.id = "divider1";
  slate.temp.appendChild(slate.el);
  //
  slider2 = balancer(config.set2dest, config.set2weight, config.set2, config.set2alias);

  //now the sorter
  sorter = chartMaker();
  sorter.init(config.key, config.sum, config.sought);

  //now export 
  recorder = exporter();


  //========set listeners for top bar
  //SHOW CONTROLS
  var ref = document.getElementById('s1');
  ref.onclick = function() {
    document.getElementById('dashB').style.display = 'block';
    adjustZ('dashB');
  }
  //make it hide upon request
  ref = document.getElementById('selectFade');
  ref.onclick = function() {
    document.getElementById('dashB').style.display = 'none';
  }


  //SET UP CHART DIV
  ref = document.getElementById('s2');
  ref.onclick = function() {
    document.getElementById('chartCont').style.display = 'block';
    adjustZ('chartCont');
  }
  ref = document.getElementById('chartFade');
  ref.onclick = function() {
    document.getElementById('chartCont').style.display = 'none';
  }


  // EXPORT ACTION
  ref = document.getElementById('s4');
  ref.onclick = function() {
    document.getElementById('export').style.display = 'block';
    adjustZ('export');
  }
  ref = document.getElementById('exportFade');
  ref.onclick = function() {
    document.getElementById('export').style.display = 'none';
  }



  //RESET
  ref = document.getElementById('s5');
  ref.onclick = function() {
    slate.graphics_exist = 'no';
    grabber.setVisible('BASE');
    recorder.buffer = '';
    var tar = document.getElementById('chart');
    tar.innerHTML = '<h3>No Chart Currently Exists</h3>';
  }

  //LEGEND
  ref = document.getElementById('legendFade');
  ref.onclick = function() {
    var k = document.getElementById('legendWrapper');
    k.style.display = "none";
  }

  //BIND BUTTON IN SLIDER BOX TO CALCULATE function
  ref = document.getElementById('doCalc');
  ref.onclick = function() {
    calculate();
  }
  //================================== if indicated in config.js, make divs draggable
  //create function to make divs draggable
  var makeDrag = function(el) {
      var x = {};
      x.motion = false;
      x.init = false;
      x.xoff = 0;
      x.yoff = 0;
      x.left = 0;
      x.top = 0;
      x.el = document.getElementById(el);

      x.pos = function(e) {
        var par, el;

        el = x.el;
        do {
          x.left += el.offsetLeft;
          x.top += el.offsetTop;
          el = el.offsetParent;
        } while (el != null);
        x.el.style.top = x.top + 'px';
        x.el.style.left = x.left + 'px';
        x.xoff = e.clientX - x.left;
        x.yoff = e.clientY - x.top;
        x.init = true;
      }

      x.el.onmousedown = function(e) {
        x.motion = true;
        adjustZ(x.el.id);
        if (!x.init) {
          x.pos(e);
          x.el.style.position = 'absolute';
        }
        x.xoff = e.clientX - x.left;
        x.yoff = e.clientY - x.top;
        return false;
      }

      x.el.onmousemove = function(e) {
        if (!x.motion) {
          return false;
        }
        x.left = e.clientX - x.xoff;
        x.top = e.clientY - x.yoff;
        x.el.style.top = x.top + 'px';
        x.el.style.left = x.left + 'px';
        return false;
      }

      x.el.onmouseout = function() {
        x.motion = false;
        return false;
      }

      x.el.onmouseup = function() {
        x.motion = false;
        return false;
      }

      return x;
    }

    //if indicated in config.js, make the controllers and stick them in an array in slate
    // so the divs in the array will be draggable
  if (config.makeDraggable && config.makeDraggable.length > 0) {
    slate.drag = [];
    var i, obj, len = config.makeDraggable.length;
    for (i = 0; i < len; i++) {
      obj = makeDrag(config.makeDraggable[i]);
      slate.drag.push(obj);
    }
  }

}
