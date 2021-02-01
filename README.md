# Fun with Tangrams

Simple, interactive and responsive web app for those who love (or are yet to love) playing with tangrams.  

<p align="center">
  <img src="/doc/app.gif" alt="tangram game app"/>
</p>

## Introduction

The Tangram is one of China's most famous games. 

### Classic Seven-Piece tangram

In the ninteenth century the tangram found its way to Europe where it gained popularity in the coffee houses of the time.

The classic tangram has seven pieces (called Tans) arranged to form a square. The objective of the game is to rearrange the pieces to make diagrams of different objects (people, animals etc...), using all seven pieces and without any pieces overlapping each other. 

### History of the Tangram

While the classic seven-piece tangram dates back to the early ninteenth century, it may trace its origns back to 900 year-old books featuring diagrams of various arrangements of banqueting tables based around a set of seven tables of three different sizes.   

![Tangram history](/doc/history1.png) | ![Tangram history](/doc/history2.png)

You can read more about the history of the tangram [here](https://chinesepuzzles.org/tangram-puzzle/).

### Fun with Tangrams

During the initial COVID-19 lockdown period in 2020, my son and I discovered tangrams as one of many things to keep ourselves entertained. When the lockdown ended, one of the first things I did was to buy a real tangram puzzle for us! I made this simple web app so, in the future, we can play tangrams together anywhere.     

![Lockdown Tangrams](/doc/lockdown1.png) | ![Lockdown Tangrams](/doc/lockdown2.png)
![Lockdown Tangrams](/doc/lockdown3.png) | ![Lockdown Tangrams](/doc/baba-do-playing-no-working.png)

## The App

The user can choose between the classic tangram and the more complex fifteen-piece version. All tans are dynamically rendered as ```polygon``` or ```path``` elements on an SVG canvas. The app utilises a basic Bootstrap-based UI. 

The fantastic ```Subjx.js``` library is used to do the heavy-lifting when it comes to dragging, dropping and rotating the tans.   

Enjoy! Please feel free to adapt and improve this little app if, for any reason, it's something that has caught your eye.  

## To Do

In the classic tangram, only one tan (the parallelogram) also requires an additional transformation, beyond rotation and translation; this tan can also be flipped. ```Subjx.js``` doesn't offer this functionality. Implement this functionality seperately using SVG transforms (e.g. ```scale(1,-1)```), triggered by long-press or long-touch on an already selected tan.  

## Built with

* HTML, CSS and Bootstrap
* JavaScript
* SVG and [Subjx.js](https://github.com/nichollascarter/subjx) library for SVG transformations
* The oddly alluring [Geometrica](https://www.dafont.com/geometrica.font) font

## Key References 

* [Chinese Puzzles - History of the Tangram](https://chinesepuzzles.org/tangram-puzzle/)
* [Tangram Channel: All things Tangram, plus kids activities and printables](https://www.tangram-channel.com/)

## Authors

Initial work contributed by Andrew Houlbrook - [andrewhoulbrook](https://github.com/andrewhoulbrook)