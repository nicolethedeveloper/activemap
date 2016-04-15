/**
 * Created by alire_000 on 4/2/2016.
 */

var colors = [
    "rgb(255,0,0)",
    "rgb(255,255,0)",
    "rgb(0,255,0)",
    "rgb(0,255,255)",
    "rgb(0,0,255)",
    "rgb(255,0,255)"
];

var squares = document.querySelectorAll(".square");
var pickedColor = colors[3];
for (i in squares){
    squares[i].style.background = colors[i];

    squares[i].addEventListener("click", function(){
        var clickedObject = this;
        var clickedColor = clickedObject.style.background;
        console.log(clickedColor);
        if(clickedColor == "rgb(35,35,35)"){
            setTimeout(function(){
                console.log("ooo");
                clickedObject.style.background = clickedColor;
            },1500)
        } else {
            clickedObject.style.background = "#232323";
        }

    })
}





