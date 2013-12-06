//main is the object that contains the data, map is the ref to map, config is global in config.js
// and layers is the array that holds the color schemes for the layers
function doMap(main, map, config, layers) {
  var x = {};
  x.data = [];
  x.shape = {};
  x.layer = {};
  x.legend = {};

  var obj, block, geo, i, j, key, len = main.features.length;
  key = config.key;
  var alen, k, arr;

  for (i = 0; i < len; i++) {
    //extract the data
    block = main.features[i].properties;
    obj = {};
    for (j in block) {
      obj[j] = block[j];
    }
    x.data.push(obj);
    // now create the block on the map and record ref in x.shape
    geo = main.features[i].geometry.coordinates[0];
    //TAKE THIS OUT LATER--LATITUDE AND LONGITUDE ARE REVERSED IN THE DATA
    alen = geo.length;
    for (k = 0; k < alen; k++) {
      geo[k] = geo[k].reverse();
    }
    //END OF ADJUSTMENT
    x.shape[obj[key]] = L.polygon(geo).addTo(map);
    x.shape[obj[key]].setStyle({
      color: '#000',
      fillColor: '#CCC',
      fillOpacity: 0.5
    });
  }

  //now build the colors for the layers based upon values
  var current, off, glob, cut, total, name, colors, val, id, op, clr, dataLen = x.data.length;
  //build function creates object to store info about a block's color for a specific layer
  var build = function(id, clr, op) {
      var obj = {};
      obj.color = clr;
      obj.id = id;
      obj.opacity = op;
      return obj;
    }


  len = layers.length;

  for (i = 0; i < len; i++) {
    name = layers[i].name;
    if (name == 'BASE') { //special case here for BASE
      x.layer['BASE'] = [];
      for (j = 0; j < dataLen; j++) {
        glob = build(x.data[j][key], layers[i].colors[0], layers[i].opacity[0]);
        x.layer['BASE'].push(glob);
      }
      continue;
    }
    colors = layers[i].colors;
    x.layer[name] = [];
    total = colors.length;
    cut = 100 / total;
    for (j = 0; j < dataLen; j++) {
      off = 0;
      val = cut;
      while (x.data[j][name] > val) {
        off++;
        val += cut;
      }
      if (off == total) {
        off--;
      }
      op = layers[i].opacity[off];
      clr = layers[i].colors[off];
      id = x.data[j][key];
      glob = build(id, clr, op);
      x.layer[name].push(glob);
    }
  }

  //colors schemes are built for the layers

  //now create the popups
  len = x.data.length;
  var str, j;

  for (i = 0; i < len; i++) {
    str = '<b>' + x.data[i][key] + '</b><hr>';
    for (j in x.data[i]) {
      if (j == key) {
        continue;
      }
      str += j + ': ' + x.data[i][j] + '<br>';
    }
    x.shape[x.data[i][key]].bindPopup(str);
  }

  //now create the legends for the various layers

  //==========TRANSIENT FUNCTIONS NEEDED TO BUILD THE LEGENDS
  //--------convert rgb/opacity to rgba---leflet.js takes opacity as a separate value
  var toRGBA = function(hex, opacity) {
      hex = hex.replace('#', '');
      hex = hex.toUpperCase();
      var ret, r, g, b, ret = "rgba( *r, *g, *b," + opacity + ')';
      r = hexToDec(hex.substring(0, 2));
      g = hexToDec(hex.substring(2, 4));
      b = hexToDec(hex.substring(4, 6));
      ret = ret.replace('*r', r);
      ret = ret.replace('*g', g);
      ret = ret.replace('*b', b);
      return ret;
    }

  var hexToDec = function(inp) {
      var first, second, conv = '0123456789ABCDEF';
      first = inp.substring(0, 1);
      first = conv.indexOf(first) * 16;
      second = inp.substring(1, 2);
      second = conv.indexOf(second);
      return (first + second);
    }
    //retrieve alias from attribute name
  var getAlias = function(name) {
      var off = config.sought.indexOf(name);
      return config.alias[off];
    }
    //=====================
  var div, curr, clen, clr, alias, start = 0;
  len = layers.length - 1; //do not include BASE in this loop
  for (i = 0; i < len; i++) {
    alias = getAlias(layers[i].name);
    str = '<h3>' + alias + '</h3>';
    clen = layers[i].colors.length;
    div = 100 / clen;
    curr = div;
    start = 0;
    for (j = 0; j < clen; j++) {
      str += '<span class="cBlock"';
      str += 'style="background-color:';
      clr = toRGBA(layers[i].colors[j], layers[i].opacity[j]);
      str += clr + '">&nbsp;&nbsp;</span>' + start + '-' + curr + '<br>';
      start = curr + 1;
      curr += div;
    }
    x.legend[layers[i].name] = str;
  }
  //build one for the BASE--its different
  str = '<h3>BASE</h3>';
  str += "Relevance in Descending Order<br>";
  len = config.color.length;
  var tag = len;
  for (i = 0; i < len; i++) {
    str += '<span class="cBlock"';
    str += 'style="background-color:';
    clr = toRGBA(config.color[i], config.opacity);
    str += clr + '">&nbsp;&nbsp;</span>' + tag + '<br>';
    tag--;
  }
  x.legend['BASE'] = str;

  //============================= legacy function from esri map--interface to showLayer()
  x.setVisible = function(arg) {
    if (slate.graphics_exist == 'yes' && arg == 'BASE') {
      x.setGradient();
      var doc = document.getElementById('Legend');
      doc.style.display = "block";
      doc.innerHTML = x.legend[arg];
    } else {
      x.showLayer(arg);
    }
  }

  //=========================colors grids to show "layers"
  x.showLayer = function(inp) {
    var i, len, off, fc, op, doc, focus = x.layer[inp];
    len = x.data.length;
    for (i = 0; i < len; i++) {
      op = focus[i].opacity;
      fc = focus[i].color;
      off = focus[i].id;
      x.shape[off].setStyle({
        fillColor: fc,
        opacity: op
      });
    }
    doc = document.getElementById('Legend');
    doc.style.display = "block";
    doc.innerHTML = x.legend[inp];
  }

  //================================create radio buttons to toggle layers upon request
  x.makeButtons = function(contId) {
    var target = document.getElementById(contId);
    config.sought.push('BASE');
    config.alias.push('BASE');
    var i, bt, len = config.sought.length;
    for (i = 0; i < len; i++) {
      bt = document.createElement('input');
      bt.type = "radio";
      bt.name = "layerToggle";
      bt.className = "layerToggle";
      bt.onclick = function(arg, but) {
        return function() {
          but.checked = false;
          x.setVisible(arg);
          document.getElementById('legendWrapper').style.display = "block";
        }
      }(config.sought[i], bt);
      target.appendChild(bt);
      sp = document.createElement('span');
      sp.className = 'layerSpan';
      target.appendChild(sp);
      sp.innerHTML = config.alias[i];
      br = document.createElement('br');
      target.appendChild(br);
    }
    config.sought.pop();
    config.alias.pop();
  }

  //=========================sets colors of blocks in BASE in accordance with search criteria
  x.setGradient = function() {
    var counter, i, off, feature, color, clrOff, interval;
    var len = x.data.length,
      clen = config.color.length;

    counter = 0;
    clrOff = 0;
    interval = len / clen;
    interval = Math.round(interval);

    //color them according to rank in array--x.data has been sorted already
    for (i = 0; i < len; i++) {
      color = config.color[clrOff];
      off = x.data[i][key];
      x.shape[off].setStyle({
        fillColor: color,
        opacity: config.opacity
      });
      counter++;
      if (counter == interval) {
        if (clrOff < (clen - 1)) {
          clrOff++;
        }
        counter = 0;
      }
    }
  }


  //end
  x.showLayer('BASE');
  adjustZ('dashB');
  return x;
}
