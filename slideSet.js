  /*builds an individual selector widget--the set is controlled by balancer (below)--
args are: id= HTML id of container in which they go, txt--text that will describe them
at the top of the widget, qual--actual name of attribute, value--original starting value,
master --the callback function to the balancer so it can report to it, and factor-
which represents the 'weight' the set is to have*/

  function buildWidget(id, txt, qual, value, master, factor) {
    var x = {};
    x.val = value;
    x.isLocked = false;
    x.qual = qual;
    x.off = 0;
    x.max = 100;
    x.trans = 0;
    x.width = 1;
    x.callBack = master;
    x.trigger = false;
    x.factor = factor;


    var target = document.getElementById(id);

    var inner = '';
    //build widget structure here here
    inner += '<div id="descriptq" class="descript">';
    inner += '<span id="descSpanq" class="descSpan">';
    inner += txt;
    inner += '</span>';
    inner += '</div>'; //end of description
    inner += '<div id="holderq" class="holder">';
    inner += '<div id="barq" class="bar">';
    inner += '</div>';

    inner += '</div>'; //end of holder
    inner += '<div id="controlq" class="control">';
    inner += '<span id="lockq" class="lock">LOCK';
    inner += '</span>';
    inner += '<input type ="checkbox" id="checkq" class="check" />';
    inner += '<button id="minusBq" class="minusB">-</button>';
    inner += '<button id="plusBq" class = "plusB">+</button>';
    inner += '</span>';
    inner += '<span id="counterq" class ="counter">0</span>';
    inner += '</div>'; //end of control area



    //append to parent
    x.out = document.createElement('div');
    x.out.className = "slider";
    target.appendChild(x.out);
    x.out.innerHTML = inner;

    //get the refs and store them in x.l object
    x.l = {};
    var div = x.out.getElementsByTagName('div');
    x.l.sign = div[0].firstChild;
    x.l.holder = div[1];
    x.l.bar = div[2];
    var ctr = div[3];
    var button = ctr.getElementsByTagName('button');
    x.l.minus = button[0];
    x.l.plus = button[1];
    var inp = ctr.getElementsByTagName('input');
    x.l.check = inp[0];
    var display = ctr.getElementsByTagName('span');
    x.l.display = display[1];
    //

    //get true cords
    x.trueCords = function() {
      x.off = 0;
      /*
  var node = x.l.holder;
  do{
      x.off += node.offsetLeft;
      node = node.parentNode;
  } while(node.nodeType == 3);
  
  x.off = x.l.holder.parentNode.offsetWidth;
  */
      //KLUDGE
      x.off = document.getElementById('dashB').offsetLeft;
      x.width = x.l.holder.offsetWidth;

      //get translation factor
      var divW = x.l.holder.offsetWidth;
      x.trans = divW / 100;
    }


    x.l.holder.onclick = function(e) {
      if (x.isLocked) {
        return false;
      }

      x.trueCords();
      var xx = e.clientX - x.off;
      xx = xx / x.trans;
      xx = Math.round(xx);
      if (xx == 99) {
        xx = 100;
      }
      if (xx == 1) {
        xx = 0;
      }
      x.sendData(xx);


      //x.l.display.innerHTML = val;
      //x.l.bar.style.width = val + '%';
    }

    x.setVal = function(val) { //how the balancer sets the value
      x.val = val;
      var alt = val * x.factor;
      alt = Math.round(alt);
      var r = Math.round(x.val);

      x.l.display.innerHTML = alt;
      x.l.bar.style.width = r + '%';

    }

    x.l.plus.onclick = function() { //when + button is clicked
      if (x.val == 100) {
        return;
      }
      var tmp = x.val + (1 / x.factor);
      x.sendData(tmp);
    }

    x.l.minus.onclick = function() { //when minus button is clicked
      if (x.val < 1) {
        return;
      }
      var tmp = x.val - (1 / x.factor);
      x.sendData(tmp);

    }


    //locking
    x.l.check.onclick = function() {
      if (x.l.check.checked) {
        x.isLocked = true;
      } else {
        x.isLocked = false;
      }


    }
    /*whenever user interacts with the slider (other than to lock/unlock, it sends data
      to the balancer through x.sendData*/

    x.sendData = function(request) {
      var m = {};

      m['name'] = x.qual;
      m['request'] = request;
      m['val'] = x.val;

      x.callBack(m);
    }

    x.message = function(txt) { //used to send error messages to replace description text
      var fnc, m = x.l.sign.innerHTML;
      x.l.sign.innerHTML = txt;
      fnc = function() {
        x.l.sign.innerHTML = m;
      }
      setTimeout(fnc, 3000); //replaces original text after 3 seconds
    }

    x.setText = function(txt) { //"manual" setting of description text for the widget
      x.l.sign.innerHTML = txt;
    }


    x.setVal(value);
    return x;
  }
  /*=================================================================*/
  //The brain for the selector widgets
  function balancer(a, b, c, d) {
    var x = {};
    x.data = {};
    x.numLocked = 0;
    x.quantity = 0;
    x.locked = 0;
    x.factor = 1;

    /*put in here to harmonize with amended geothermal app
      'set1dest, set1weight, set1, set1alias' is order of args */
    x.doTrans = function(destination, weight, attArr, alArr) {
      var out, value, tmp, i, len = attArr.length;
      value = len / 100;
      value = Math.round(value);
      out = {};
      out.id = destination;
      out.factor = weight;
      out.obj = [];

      for (i = 0; i < len; i++) {
        tmp = {};
        tmp.qual = attArr[i];
        tmp.txt = alArr[i];
        tmp.val = value;
        out.obj.push(tmp);
      }
      return out;
    }


    var input = x.doTrans(a, b, c, d);
    //end of insert
    var name, i, z, len = input.obj.length;
    var target = input.id;
    x.factor = input.factor / 100;

    //this function is invoked whenever someone clicks on a slider--unless its locked
    //in which case the slider ignores the user--the balancer decides how to adjust
    //the values of the sliders in the set
    x.info = function(m) {

      var request = m.request,
        name = m.name,
        value = m.val;
      var i, tmp, taken = 0,
        direction, empty = 0,
        active = 0,
        available = 0;

      if (request == value) { //no change from present setting--ignore
        return;
      }

      direction = "push"; //shrinking or expanding a current value?
      if (request > value) {
        direction = "pull";
      }

      for (i in x.data) { //determine number of points that are locked
        if (x.data[i].isLocked) {
          taken += x.data[i].val;
          continue;
        }
        if (x.data[i].val == 0) {
          empty++;
        }
        active++;

      }

      if (active < 2) { //nothing to push to  or pull from
        return;
      }

      if (direction == "push" && ((active - empty) < 2)) {
        x.data[name].message("NO ACTIVE BOXES TO PUSH TO");
        return;
      } //pushing to empties is not allowed
      available = 100 - taken;

      if (request > available) { //special case--sucks the others dry
        x.data[name].setVal(available);
        for (i in x.data) {
          if ((x.data[i].isLocked) || (i == name)) {
            continue;
          }
          x.data[i].setVal(0);
        }
        x.data[name].message("NOT ENOUGH UNLOCKED POINTS");
        return false;
      }

      available = 100 - (taken + request);;
      x.data[name].setVal(request);
      x.synchSet(name, available);
    }

    //
    x.synchSet = function(name, goal) {
      //identify non-zero non-locked properties
      var i, len, box = [],
        total = 0,
        ratio, tmp, off;
      for (i in x.data) {
        if (x.data[i].isLocked || x.data[i].val == 0 || (i == name)) {
          continue;
        }
        box.push(i);
        total += x.data[i].val;
      }

      ratio = goal / total;
      len = box.length;

      for (i = 0; i < len; i++) {
        off = box[i];
        tmp = x.data[off].val;
        tmp = tmp * ratio;

        if (tmp > 100) {
          tmp = 100;
        }
        x.data[off].setVal(tmp);
      }
    }


    //object generated when a calculation is made--returns object consisting
    // of keys as attribute names and value as currently set by slider
    x.giveSet = function() {
      var i, out = {};
      for (i in x.data) {
        out[i] = (x.data[i].val * x.factor);
      }
      return out;
    }


    //will change text in description box
    x.alterText = function(prop, txt) {
      if (x.data[prop]) {
        x.data[prop].setText(txt);
      }
    }


    // create the widgets from the info in var input		
    for (i = 0; i < len; i++) {
      z = input.obj[i];
      name = z.qual;
      x.data[name] = buildWidget(target, z.txt, name, z.val, x.info, x.factor);
      x.quantity++;
    }

    // set initial values of the slider set to the same value
    var www = 100 / len;
    www = Math.round(www);

    for (i in x.data) {
      x.data[i].setVal(www);
    }
    return x;
  }


  //=================================master slide
  makeMaster = function(id) {
    var x = {};

    var html = '<div class="masterHolder" style="width: 100%">';
    html += '<div class="masterSelect" id = "masterSelect" style="width: 100%">';
    html += '</div></div>';
    html += '<input type="button" value="@" id = "set1">';
    html += '<span id="leftSet">SET ONE: 50%</span>';
    html += '<span id="rightSet">SET TWO: 50%</span>';
    html += '<input type="button" value="@" id = "set2">';


    var target = document.getElementById(id);
    var cont = document.createElement('div');
    cont.id = "masterSlide";
    cont.className = "masterSlide";
    target.appendChild(cont);
    cont.innerHTML = html;
    var slide = document.getElementById('masterSelect');
    slide.style.height = '100%';
    slide.style.width = '50%';


    x.value = 50;
    x.left = false;
    x.right = false;
    x.displayL = document.getElementById("leftSet");
    x.displayR = document.getElementById("rightSet");


    //user presses button for first set preference
    document.getElementById('set1').onmousedown = function() {
      if (x.value == 0) {
        return;
      }
      x.left = true;
      x.shiftLeft();
    }

    document.getElementById('set1').onmouseup = function() {
      x.left = false;
    }
    document.getElementById('set1').onmouseout = function() {
      x.left = false;
    }

    x.shiftLeft = function() {
      if (x.value === 0 || x.left === false) {
        return;
      }
      x.value--;
      x.flash();
      document.getElementById('masterSelect').style.width = x.value + '%';
      setTimeout(x.shiftLeft, 100);
    }

    document.getElementById('set2').onmousedown = function() {
      if (x.value == 100) {
        return;
      }
      x.right = true;
      x.shiftRight();
    }
    document.getElementById('set2').onmouseup = function() {
      x.right = false;
    }
    document.getElementById('set2').onmouseout = function() {
      x.right = false;
    }

    x.shiftRight = function() {
      if (!x.right || x.value === 100) {
        return;
      }
      x.value++;
      x.flash();
      document.getElementById('masterSelect').style.width = x.value + '%';
      setTimeout(x.shiftRight, 100);
    }

    x.flash = function() {
      x.displayL.innerHTML = 'SET ONE: ' + x.value + '%';
      x.displayR.innerHTML = 'SET TWO: ' + (100 - x.value) + '%';
    }

    x.adjustOne = function(obj) {
      var i, val = x.value / 100;
      for (i in obj) {
        obj[i] = obj[i] * val;
      }
      return obj;
    }

    x.adjustTwo = function(obj) {
      var i, val = (100 - x.value) / 100;
      for (i in obj) {
        obj[i] = obj[i] * val;
      }
      return obj;
    }

    return x;
  }
