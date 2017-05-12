'use strict';

const width=900;
const delta=0.3;

const environmentContext=document.getElementById("environment").getContext("2d");
const context=document.getElementById("canvas").getContext("2d");

const figure1=new Figure([{x:120,y:150},{x:150,y:350},{x:250,y:350},{x:160,y:330},{x:170,y:170}]);
const figure2=new Figure([{x:620,y:650},{x:650,y:750},{x:650,y:550},{x:560,y:630},{x:470,y:870}]);
const figure3=new Figure([{x:222,y:314},{x:230,y:330},{x:247,y:327}]);
const figure4=new Figure([{x:220,y:550},{x:320,y:550},{x:400,y:650},{x:160,y:730}]);

let env=new Environment();

window.onload=()=>{
    env.addFigure(figure1);
    env.addFigure(figure2);
    env.addFigure(figure3);
    env.addFigure(figure4);

    Draw();
}


window.onmousemove=(e)=>{
    currentDirectionRad=Angle(e.pageX-width/2,e.pageY-width/2);
    window.requestAnimationFrame(Draw);
}

var currentDirectionRad=0;

function Draw(){
    Clear();

    var allDots=[];
    dotsOfFigures.forEach((item)=>{
        if(item.angle>=currentDirectionRad-delta && item.angle<=currentDirectionRad+delta){
            allDots.push(item);
        }
    });

    var dots=[];
    allDots.forEach((item)=>{
        var segm={x1:width/2,y1:width/2,x2:item.x,y2:item.y};
        var mark=true;
        figuresSegments.forEach((figsegm)=>{
            if(haveAnIntersectionPoint(segm,figsegm)){
                var point= intersectionPoint(segm,figsegm);
                if(!Equal(point,{x:segm.x1,y:segm.y1}) &&
                   !Equal(point,{x:segm.x2,y:segm.y2}) &&
                   !Equal(point,{x:figsegm.x1,y:figsegm.y1}) &&
                   !Equal(point,{x:figsegm.x2,y:figsegm.y2})){
                    mark=false;
                }
            }
        }); 
        if(mark){
            dots.push(item);
        }
    });

    dots.forEach((item)=>{
        var segmentPlusDelta={x1:width/2,y1:width/2,x2:width/2+(width/2)*Math.cos(item.angle+0.001),y2:width/2+(width/2)*Math.sin(item.angle+0.001)};
        var segmentMinusDelta={x1:width/2,y1:width/2,x2:width/2+(width/2)*Math.cos(item.angle-0.001),y2:width/2+(width/2)*Math.sin(item.angle-0.001)};

        var markPlus=true;
        figuresSegments.forEach((segm)=>{if (haveAnIntersectionPoint(segmentPlusDelta,segm)) markPlus=false;});

        if(markPlus){
            dots.push({x:(width/2)*Math.cos(item.angle+0.001)+width/2,
                       y:(width/2)*Math.sin(item.angle+0.001)+width/2,
                       angle:Angle((width/2)*Math.cos(item.angle+0.001)+width/2,(width/2)*Math.sin(item.angle+0.001)+width/2)});
        }
        else{
            var point={x:0,y:0}
            figuresSegments.forEach(function(segm){
                if(haveAnIntersectionPoint(segmentPlusDelta,segm)){ 
                    var p = intersectionPoint(segmentPlusDelta,segm);
                    if(distanceBetweenPoints({x:width/2,y:width/2},p)<=distanceBetweenPoints({x:width/2,y:width/2},point)){
                        point=p;
                    }
                }
            });

            dots.push({x:point.x, y:point.y,angle:Angle(point.x,point.y)});
        }

        var markMinus=true;
        figuresSegments.forEach((segm)=>{if (haveAnIntersectionPoint(segmentMinusDelta,segm)) markMinus=false;});
        if(markMinus){
            dots.push({x:(width/2)*Math.cos(item.angle-0.001)+width/2,
                       y:(width/2)*Math.sin(item.angle-0.001)+width/2,
                       angle:Angle((width/2)*Math.cos(item.angle-0.001)+width/2,(width/2)*Math.sin(item.angle-0.001)+width/2)});
        }
        else{
            var point={x:0,y:0}
            figuresSegments.forEach(function(segm){
                if(haveAnIntersectionPoint(segmentMinusDelta,segm)){ 
                    var p = intersectionPoint(segmentMinusDelta,segm);
                    if(distanceBetweenPoints({x:width/2,y:width/2},p)<=distanceBetweenPoints({x:width/2,y:width/2},point)){
                        point=p;
                    }
                }
            });

            dots.push({x:point.x, y:point.y,angle:Angle(point.x,point.y)});
        }
        
    });
    var point1={x:width/2+(width/2)*Math.cos(currentDirectionRad-delta),y:width/2+(width/2)*Math.sin(currentDirectionRad-delta)}    
    var point2={x:width/2+(width/2)*Math.cos(currentDirectionRad+delta),y:width/2+(width/2)*Math.sin(currentDirectionRad+delta)}    
    var segm1={x1:width/2,y1:width/2,x2:point1.x,y2:point1.y}
    var segm2={x1:width/2,y1:width/2,x2:point2.x,y2:point2.y}

    figuresSegments.forEach(function(segm){
        if(haveAnIntersectionPoint(segm1,segm)){ 
            var p = intersectionPoint(segm1,segm);
            if(distanceBetweenPoints({x:width/2,y:width/2},p)<=distanceBetweenPoints({x:width/2,y:width/2},point1)){
                point1=p;
            }
        }
    });

    figuresSegments.forEach(function(segm){
        if(haveAnIntersectionPoint(segm2,segm)){ 
            var p = intersectionPoint(segm2,segm);
            if(distanceBetweenPoints({x:width/2,y:width/2},p)<=distanceBetweenPoints({x:width/2,y:width/2},point2)){
                point2=p;
            }
        }
    });

    point1.angle=Angle(point1.x-width/2,point1.y-width/2);
    point2.angle=Angle(point2.x-width/2,point2.y-width/2);

    dots.push(point1);
    dots.push(point2);
    
    var resultFigure=[{x:width/2,y:width/2}];
    dots.forEach((item)=>{
        resultFigure.push({x:item.x,y:item.y});
    });  
    resultFigure=resultFigure.sort((a,b)=>{return Math.cos(Angle(a.x-width/2,a.y-width/2))-Math.cos(Angle(b.x-width/2,b.y-width/2))});
    createCone(resultFigure);
}

function Equal(dot1,dot2){
    return Math.abs(dot1.x-dot2.x)<0.001 && Math.abs(dot1.y-dot2.y)<0.001;
}

//получаем угол через арктангенс 
function Angle(x,y){
    return Math.atan2(y,x);
}

function Clear(){
    context.clearRect(0,0,width,width);
}

function createCone(fig){
    context.moveTo(fig[0].x,fig[0].y);
    context.beginPath();
    fig.forEach(function(item){
        context.lineTo(item.x,item.y);
    });
    context.closePath();
    context.fillStyle="lightgray";
    context.fill();
}

function intersectionPoint(_segment1,_segment2){     
    var x = -((_segment1.x1*_segment1.y2 - _segment1.x2*_segment1.y1)*(_segment2.x2 - _segment2.x1) -
            (_segment2.x1*_segment2.y2 - _segment2.x2*_segment2.y1)*(_segment1.x2 - _segment1.x1))/
            ((_segment1.y1 - _segment1.y2)*(_segment2.x2 - _segment2.x1) -(_segment2.y1 - _segment2.y2)*(_segment1.x2 - _segment1.x1));   
    var y = ((_segment2.y1 - _segment2.y2) * -x - (_segment2.x1 * _segment2.y2 - _segment2.x2 * _segment2.y1)) / (_segment2.x2 - _segment2.x1);  
    return {x:x,y:y}   
}

function checkIfNotParallel(_segment1,_segment2){
    var k1=(_segment1.x2-_segment1.x1)/(_segment1.y2-_segment1.y1);
    var k2=(_segment2.x2-_segment2.x1)/(_segment2.y2-_segment2.y1);
    return Math.abs(k1-k2)>0.000001;
}

function haveAnIntersectionPoint(_segment1,_segment2){
    var result=false;
    if(checkIfNotParallel(_segment1,_segment2)){
        var point=intersectionPoint(_segment1,_segment2);
        var x=point.x;
        var y=point.y;

        var bool1=(Math.min(_segment1.x1,_segment1.x2)<=x) && (Math.max(_segment1.x1,_segment1.x2)>=x) && (Math.min(_segment2.x1,_segment2.x2)<=x) && (Math.max(_segment2.x1,_segment2.x2)>=x);
        var bool2=(Math.min(_segment1.y1,_segment1.y2)<=y) && (Math.max(_segment1.y1,_segment1.y2)>=y) && (Math.min(_segment2.y1,_segment2.y2)<=y) && (Math.max(_segment2.y1,_segment2.y2)>=y);
        result=bool1 && bool2;
    }
    return result;
}

//расстояние между точками  - для определения ближайшей к центру точки
function distanceBetweenPoints(p1,p2){
    var x=Math.abs(p1.x-p2.x);
    var y=Math.abs(p1.y-p2.y);
    return Math.sqrt(x*x+y*y);
}


function placeDot(x,y){
    context.fillRect(x-2,y-2,4,4);
}

class Dot{
    x=0;
    y=0;
    angle=0;
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.angle=Angle(x-width/2,y-width/2);
    }
}

class Segment{
    x1=0;
    y1=0;
    x2=0;
    y2=0;
    constructor(x1,y1,x2,y2){
        this.x1=x1;
        this.y1=y1;
        this.x2=x2;
        this.y2=y2;
    }
    getLength(){
        let x = Math.abs(this.x1-this.x2);
        let y = Math.abs(this.y1-this.y2);
        return Math.sqrt(x*x+y*y);
    }
    draw(drawContext){
        drawContext.beginPath();
        drawContext.moveTo(this.x1,this.y1);
        drawContext.lineTo(this.x2,this.y2);
        drawContext.closePath();
        drawContext.stroke();
    }
}

class Figure{
    dots=[];
    segments=[];
    constructor(dots){
        this.dots=dots;
         for(var i=0;i<dots.length-1;i++){
             this.segments.push(new Segment(dots[i].x,dots[i].y,dots[i+1].x,dots[i+1].y));
         }
         this.segments.push(new Segment(dots[dots.length-1].x,dots[dots.length-1].y,dots[0].x,dots[0].y));
    }
    getSegments(){
        return this.segments;
    }
}

class Environment{
    figures=[];
    figuresSegments=[];
    dotsOfFigures=[];
    addFigure(figure){
        this.figures.push(figure);
        this.addToEnvironment(figure);
        this.figuresSegments.concat(figure.segments);
        this.dotsOfFigures.concat(figure.dots);
    }
    addToEnvironment(figure){
        environmentContext.moveTo(figure[0].x,figure[0].y);
        environmentContext.beginPath();
        figure.forEach(function(item){
            environmentContext.lineTo(item.x,item.y);
        });
        environmentContext.closePath();
        environmentContext.fill();
    }
}