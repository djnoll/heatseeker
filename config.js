/*Configuration for all the custom javascript objects*/


var config = {};
config.sought = ['roads', 'terrain', 'fault', 'trans', 'use', 'watertemp', 'bsltthck'];
config.alias = ['Road Access', 'Terrain Slope', 'Faulting', 'Transmission', 'Land Use', '200F Isotherm Depth', 'Basalt Thickness'];
config.key = 'OBJECTID';
config.set1 = ['roads', 'trans', 'use', 'terrain'];
config.set1weight = 100;
config.set1dest = "slide1Div";
config.set1alias = ['roads', 'trans', 'use', 'terrain'];
config.set2weight = 100;
config.set2 = ['fault', 'watertemp', 'bsltthck'];
config.set2dest = "slide2Div";
config.set2alias = ['fault', 'watertemp', 'bsltthck'];
config.sum = 'Weight';
config.color = ['#EEF2FE', '#BFCFE0', '#B3D3EC', '#96C4E3', '#6FA5C7', '#60A4D0', '#488CBF', '#3479B4', '#215F99', '#0B4C8F'];
config.opacity = 1;
config.makeDraggable = ['dashB', 'legendWrapper', 'export', 'chartCont'];
config.exportUrl = ['http://dnoll.com/thesis/new/export/']

var layerFill = [{
  name: 'roads',
  colors: ['#EEF2FE', '#0B4C8F'],
  opacity: [1, 1]
},

{
  name: 'terrain',
  colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF'],
  opacity: [1, 1, 1, 1]
},

{
  name: 'fault',
  colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF'],
  opacity: [1, 1, 1, 1]
},

{
  name: 'trans',
  colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF'],
  opacity: [1, 1, 1, 1]
},

{
  name: 'use',
  colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF'],
  opacity: [1, 1, 1, 1]
},

{
  name: 'watertemp',
  colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF'],
  opacity: [1, 1, 1, 1]
},

{
  name: 'bsltthck',
  colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF'],
  opacity: [1, 1, 1, 1]
},

{
  name: 'BASE',
  colors: ['#CCCCCC'],
  opacity: [1]
}];
