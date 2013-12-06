DATA

The actual data establishing the grid and their geometry and attributes is found in the
mastergrid.js file which creates a global data structure named mastergrid.  The data
structure was provided by the client.  So long as this format is preserved different data
sets pertaining to different regions can be used, and the attribute data can be changed,
both as to the attributes themselves(adding or deleting) as well as the values for each
and any feature in the set.  Currently it will only deal with "features" that are of type
"Polygon," but the code could be modified fairly easily to deal with other feature types
recognized by the leaflet.js API.


CONFIGURATION

Altering the settings is accomplished by editing the file config.js.  It creates a global 
variable named 'config' that contains the information needed to dynamically build the
components.  The actual data is contained in the file 'mastergrid.js.'  Use caution in 
editing it.  If syntax errors are made when editing the file the entire application may
abort itself upon load.

config.sought --This is an array containing the names of all attributes that are to be
	      used in any calculations.  The data in the JSON structure in mastergrid.js
	      may contain other attributes, but unless they are listed in this array they
	      will be ignored.

config.alias --This array contains "English translation" which directly correspond in place
	     with the entries in config.sought.  They can be anything, but the size of this
	     array must match that in config.sought in number.  The alias will be the name
	     that appears with the layer selection panel and the popups.

config.key --The name of the attribute that distinguishes a data entry's unique identity.
	     The primary key for the data set.

config.set1 --This is an array of the attributes that will appear in slider set one.
config.set1alias--This performs the same function as config.alias above.  Because the
             selectors may be styled to be small, this allows shorter aliases to be used.
config.set1dest--This is the id of the HTML element that the selectors in this set will
             be created in.
config.set1Weight -- The sum of all values in the set.  LEAVE IT AT 100.

config.set2* --the same as the set options above except it applies to set two.

config.exportUrl --this doesn't work, this file name is hard-coded into the export.js
		 module.  Maybe its merely a bug in the browser version, but it seemingly	
		 won't allow a variable for use as the url in creating an xmlHttpRequest object.
		 This should enable one to specify the application to which exported data goes.

config.sum --This specific the name of the field where a block's weight will be stored. This
	   field should NOT ALL READY EXIST in the data.  It will be created.  Here it is called
	   'Weight,' but it can be called "Score" or anything one desires.

config.color --This is an array of the color scheme used to visually display the results
	     of a calculation. If for example only three colors were used, the top 33%
	     would display as the first color in the array, the next highest as the second color,
	     and so forth.

config.opacity -- A single value between 0 and 1 that can be used to modify the opacity of
	       config.color.

config.makeDraggable --This is an array listing the ID's of the components that one wishes
	       to make draggable.  If you don't want this feature, comment this line out.

layerFill is a global array of objects that are used to set the color scheme for the individual
layers such as 'roads'.
       
       Each object in the array has three properties:
       name--This should be the name of the attribute.
       colors --This is an array of all the colors used to display the values for the layer.
       opacity--This is an array of opacity values for the corresponding colors.  Even if
       the values are identical DO NOT omit this array. 


OVERVIEW

Upon page load the setUp function in master.js is called.  This function builds the various
components and provides the event bindings that allow users to interact with the components.
Besides the global variables defined in mastergrid.js and config.js, there are:
 map, grabber, slider1, slider2, sorter, slate, recorder, and master.

     -- map is created by leaflet.js

     --slate is a generic object used for storing miscellaneous data

     -- grabber is an object that basically handles all data storage and visual
     manipulation of the actual map.  Upon creation it extracts, processes and stores 
     information from 'mastergrid' and 'layerFill.' It has four properties:
     (1) It stores the attribute data in an array named 'data'.
     (2) It adds the features to the leaflet map and stores a reference to them in 'shape'
     (3) It calculates the color schemes for individual layers and stores them in 'layers'
     (4) Creates content for the 'legend' component and stores them in 'legend'

     It also creates a set of radio buttons which allows the user to toggle "layers," 
     upon calling its makeButtons() function.  Toggling the layers also causes the object
     to change the innerHTML of the "legend" component to match the layer.

     It also has a method called setGradient, which is used to "paint" the blocks to their 
     appropriate color to indicate their relative weight after a selection/calculation
     has been made.

     --slider1 and slider2 are balancer objects.  Each controls a set of selectors that
     allows the user to set the relative importance of the factors.  It merely reacts to
     the user and stores data.  When a calculation is made, each slider's giveSet method is
     called, which returns an object with the structure where the name of each property
     is the name of an attribute and its value is that of the percentage as indicated
     by its selector.

     --master controls the widget that allows the user to set the relative weights of 
     the two sets vis a vis one another.  After the two objects have been received,
     each is run through this object.  It adjusts their values so that the sum of both
     sets' properties will be 100 so that they can then be combined into a single object,
     which is the formula for the calculation.
=====================
     Example:

     set1 produces this object: {roads: 50, terrain: 25, fault: 25}
     set2 produces this object: {trans: 20, use: 20, watertmp: 60}
     --Note that the sum of each object's properties is 100.

     set1 was given a weight of 70% leaving 30% for set2
     Everything in set 1 is multiplied by 0.7, and everything in set2 by 0.3.
     
     This yields:
     set1: {roads: 35, terrain: 17.5, fault: 17.5}
     set2: {trans: 6, use: 6, watertmp: 18}

     They can now be combined into a single object:
     result:{roads: 35, terrain: 17.5, fault: 17.5,trans: 6, use: 6, watertmp: 18}
     --The sum of all properties values is 100.
===========================
     ---sorter is the object that controls the actual calculations, sorts the results
     from greatest to least in terms of "Weight", and generates the html table.

     It makes its calculations by going through the data array and multiplying the corresponding
     attributes actual value by the factors in the object described in the example above.

     Given a data object k and a formula object f

     k.weight = (k.roads * f.roads) + (k.terrain * f.terrain) + ...


STARTING THE CALCULATION

What binds all this together is the global 'calculate' function.  It pulls the data from
the selectors and uses the resultant formula object as an argument along with a reference
to grabbers' data array.  The calculations are made, the html table is generated and put inside
the HTML 'chart' div, and grabber's setGradient method is called to color the blocks to
reflect their respective rankings.  A copy of the formula object is also stored with the 
recorder object, so that it can export that along with the other data if requested to do so.
 
EXPORTING DATA

The object (global var recorder) is very simple, but it relies upon server side applications
to make it run.  Assuming that a calculation has been made and the user has entered a 
description/filename, this creates a data structure having the following format:
{description: (user's input),
 date: (timestamp),
 formula: (see formula object above),
 chart: (the html from the table generated)
}

It sends this via POST through an xmlHttpRequest object as an url-encoded JSON string. 
It will report back on the status code, if any, of the request made to the server.

It should be directed at "exporter.php" on the server.  Currently this is hardwired into
export.js.

There are three files involved.  They should be placed on the server in the same directory
as index.html.  They are:
exporter.php
import.php
mapData.src

mapData.src is a data file.  Its empty.  Keep a copy of it so you can overwrite it when 
it gets too full.  At some point you may want to switch to a database rather than a flat
file.

As it is, exporter.php must be able to both read and write to that file on the server.  
Import.php must be able to read mapData.src on the server.

If you use the newest version of export.js I have sent, you will find that it dynamically adds
an 'import' button to the list.  This will allow you to look at the data you have exported
up to the server.

MISCELLANEOUS

You don't have to use all the attributes from a data file for the process.  If you don't want
a particular attribute weighed then simply don't include it in any of the slider sets.  This
is covered in the section dealing with config.  And if the attribute is not ready for prime
time don't include it in the 'config.sought' array.

	      




  
