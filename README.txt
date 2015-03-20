COMP6214 COURSEWORK1 
====================
Author: Aniebiet Willie (afw1g14)

How to host
===========
To host this visualisation, unzip the source files to a folder on any desired web server. A live version can be found on my space on the [ECS server](http://users.ecs.soton.ac.uk/afw1g14)


Cleaning
=========
The dataset provided details project data available from the US Governments agenices. It covered the projected and actual costs and timings of a number of government funded projects in the US. Open Refine 2.6 was used to rid the dataset of errors and manipulate the dataset to make it suitable for visualization. The following cleaning exercises were carried out on the dataset.

Cell transformation
-------------------
Applying a text facet on the Unique Investment Identifier column provided an overview of the dataset. Some of the data were found to be offset. To move the erroneously placed cell values to their bona fide columns, a custom text transform was applied to the columns for some flagged rows. Hence moving values from the Project Id column to the Unique Investment Identifier column, the custom expression cells["Project ID"].value was used. Similar expressions were used on the other erroneous rows.


Summation Records
-----------------
Still using the text facet on the Unique Investment Identifier, 26 rows had the value "Total", summation records for all the departments. These rows where deleted. Some totally blank rows where also discovered and deleted.


Multiple Representations
------------------------
Agency Code had 26 choices while Agency Name had 106 choices when the Text Facet was applied to both columns. Applying the Common Transform, Trim leading and trailing whitespace, reduced the Agency name chcoices to 53. Using the cluster and Edit function, some alternative representations of departments on the Agency Name column were captured and merged.


Spelling Errors
---------------
Mis-spelled agency names were detected by applying the Text Facet to the Agency Code and Agency Name, then viewing corresponding Agency names with respect to the selected Agency code. The Agency names were then corrected and thus reduced to the expected 26.


Duplicate Records
-----------------
Applying the Cluster and Edit function on the Project ID column revealed duplicates. The duplicate records were flagged and removed accordingly.


Value Transformation
--------------------
Applying the common transform, To Number, to the Project ID and Lifecycle cost reveals certain values that are made erroneous by commas and units. The records were flagged and the Custom text transform expression, replace(value, ',', '') and replace(value , '($m)', ''), were applied on the Project ID and Lifecycle cost to remove the commas and units respectively


Derived Columns
---------------
A Duration column was derived using the Add column based on column function on the Completion Date column. The expression diff(value, cells["Start Date"].value, "hours" )/24





Visualisation1-Parallel Coordinates
===================================
This visualisation is based on Kai Chang's [d3.parcoords](http://syntagmatic.github.io/parallel-coordinates/)

Description
-----------
The parallel coordinates visualisation is a representation of all the cleaned data. It provides multiple dimensions for encoding the different attributes of the data using equal weights.
The dimensions represented on the visualisations are the agency name, start date, ccompletion date, duration, lifecycle cost, planned cost and cost variances. Another dimension of encoding is the representation of the projects in each departments in similar colors.

Interraction
------------
The visualisation can be interracted with by brushing multiple axes. Brushing provides a means of filtering to specific ranges and manipulating the presented data accordingly. The axes can also be moved around for direct comparison with other attributes of the data. A table provides a means to analyse the filtered data. Hovering over any of the rows in the table highlights the data in the chart.

Audience
--------
The audience for this visualisation is the general public. The visualisation provides an engaging way for visualising the data rather than looking it up in a table. 
The audience can filter the data on any desired axis and find patterns in the data. A user could be interested in seeing how the lifecycle cost of a project differs from the planned cost of the project. One could also relate the duration of each project to the cost variance of the project.



Visualisation2 - Bubble Chart Visualisation
===========================================
It is based on Mike Bostocks's version of Han's Roslings [Wealth & Health of Nations](http://bost.ocks.org/mike/nations/)

Description
-----------
The bubble chart visualisation compares the lifecycle cost and the planned cost of each Investment title in the dataset for each year (from 1992). 
The planned cost is represented on the x axis, the lifecycle cost is represented on the y axis, the number of projects in the investment title for each year is represented by the radius of each bubble, the color represents the department the investment title belongs to and the year is represented by the animation.

Interraction
------------
The visualisation can be interracted with by mousing over the bubbles to view the investment title and the department it belongs to. This provides a way of analysing the data on the graph. 
The data can be manipulated by mousing over the year to move forwards and backwards in time to view the investment titles in each year.


Audience
--------
The audience for this visualisation are members of all the agencies and the general public. It provides a means for viewing at a glance, how the investment titles that commenced in a given year performed taking into consideration the planned cost and the eventual lifecycle cost. 
The investment titles that fall below the line consist of projects that performed below budget and the ones that are above the line show the investment titles that were above budget.
