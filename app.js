'use strict';

const width=900;

//точки фигуры предмета
var figure1=[{x:120,y:150},{x:150,y:350},{x:250,y:350},{x:160,y:330},{x:170,y:170}];
var figure2=[{x:620,y:650},{x:650,y:750},{x:650,y:550},{x:560,y:630},{x:470,y:870}];
var figure3=[{x:222,y:314},{x:230,y:330},{x:247,y:327}];
var figure4=[{x:220,y:550},{x:320,y:550},{x:400,y:650},{x:160,y:730}];
var figuresSegments=[];
var dotsOfFigures=[];

var environmentContext=document.getElementById("environment").getContext("2d");
var context=document.getElementById("canvas").getContext("2d");

window.onload=()=>{
    addEnvironment(figure1);
    addEnvironment(figure2);
    addEnvironment(figure3);
    addEnvironment(figure4);

    //метод рисования линий
    Draw();
}

function addEnvironment(figure){
    createEnvironment(figure);
    segmentsByFigure(figure).forEach((item)=>figuresSegments.push(item));
    figure.forEach((item)=>dotsOfFigures.push({x:item.x,y:item.y,angle:Angle(item.x-width/2,item.y-width/2)}));
}

window.onmousemove=(e)=>{
    currentDirectionRad=Angle(e.pageX-width/2,e.pageY-width/2);
    window.requestAnimationFrame(Draw);
}

var delta=0.3;
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

//рисование фигуры по точкам
function createEnvironment(fig){
    environmentContext.moveTo(fig[0].x,fig[0].y);
    environmentContext.beginPath();
    fig.forEach(function(item){
        environmentContext.lineTo(item.x,item.y);
    });
    environmentContext.closePath();
    environmentContext.fill();
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

        var bool1=(min(_segment1.x1,_segment1.x2)<=x) && (max(_segment1.x1,_segment1.x2)>=x) && (min(_segment2.x1,_segment2.x2)<=x) && (max(_segment2.x1,_segment2.x2)>=x);
        var bool2=(min(_segment1.y1,_segment1.y2)<=y) && (max(_segment1.y1,_segment1.y2)>=y) && (min(_segment2.y1,_segment2.y2)<=y) && (max(_segment2.y1,_segment2.y2)>=y);
        result=bool1 && bool2;
    }
    return result;
}

function max(x1,x2){
    return x1>x2?x1:x2;
}

function min(x1,x2){
    return x1<x2?x1:x2;
}

//расстояние между точками  - для определения ближайшей к центру точки
function distanceBetweenPoints(p1,p2){
    var x=Math.abs(p1.x-p2.x);
    var y=Math.abs(p1.y-p2.y);
    return Math.sqrt(x*x+y*y);
}

//сегменты по точкам фигуры
function segmentsByFigure(fig){
    var result=[];
    for(var i=0;i<fig.length-1;i++){
        result.push({x1:fig[i].x,y1:fig[i].y,x2:fig[i+1].x,y2:fig[i+1].y});
    }
    result.push({x1:fig[fig.length-1].x,y1:fig[fig.length-1].y,x2:fig[0].x,y2:fig[0].y});
    return result;
}

function placeDot(x,y){
    context.fillRect(x-2,y-2,4,4);
}