'use strict';

class Point{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.angle=Angle(x-width/2,y-width/2);
    }
    areEqual(point){
        return Math.abs(point.x-this.x)<0.001 && Math.abs(point.y-this.y)<0.001;
    }
    distanceToPoint(point){
        let x=Math.abs(point.x-this.x);
        let y=Math.abs(point.y-this.y);
        return Math.sqrt(x*x+y*y);
    }
    placePoint(){
        context.fillRect(this.x-2,this.y-2,4,4);
    }
}

class Segment{
    constructor(x1,y1,x2,y2){
        this.x1=x1;
        this.y1=y1;
        this.x2=x2;
        this.y2=y2;
        this.startPoint=new Point(x1,y1);
        this.endPoint=new Point(x2,y2);
    }
    getLength(){
        let x = Math.abs(this.x1-this.x2);
        let y = Math.abs(this.y1-this.y2);
        return Math.sqrt(x*x+y*y);
    }
    draw(){
        context.beginPath();
        context.moveTo(this.x1,this.y1);
        context.lineTo(this.x2,this.y2);
        context.closePath();
        context.stroke();
    }
    haveAnIntersectionPoint(segment){
        return haveAnIntersectionPoint(this,segment);
    }
}

class Figure{
    constructor(points){
         this.points=points;
         this.segments=[];
         for(var i=0;i<points.length-1;i++){
             this.segments.push(new Segment(points[i].x,points[i].y,points[i+1].x,points[i+1].y));
         }
         this.segments.push(new Segment(points[points.length-1].x,points[points.length-1].y,points[0].x,points[0].y));
    }
    getSegments(){
        return this.segments;
    }
}

class Environment{
    constructor(){
        this.figures=[];
        this.figuresSegments=[];
        this.pointsOfFigures=[];
    }
    addFigure(figure){
        this.figures.push(figure);
        this.addToEnvironment(figure);
        this.figuresSegments=this.figuresSegments.concat(figure.segments);
        this.pointsOfFigures=this.pointsOfFigures.concat(figure.points);
    }
    addToEnvironment(figure){
        environmentContext.moveTo(figure.points[0].x,figure.points[0].y);
        environmentContext.beginPath();
        figure.points.forEach(function(item){
            environmentContext.lineTo(item.x,item.y);
        });
        environmentContext.closePath();
        environmentContext.fill();
    }
    redrawAll(){
        this.figures.forEach((figure)=>{
            environmentContext.moveTo(figure.points[0].x,figure.points[0].y);
            environmentContext.beginPath();
            figure.points.forEach(function(item){
                environmentContext.lineTo(item.x,item.y);
            });
            environmentContext.closePath();
            environmentContext.fill();
        })
    }
    drawVisibleZone(figure){
        context.moveTo(figure[0].x,figure[0].y);
        context.beginPath();
        figure.forEach(function(item){
            context.lineTo(item.x,item.y);
        });
        context.closePath();
        context.fillStyle="lightgray";
        context.fill();
    }
    clear(){
        context.clearRect(0,0,width,width);
    }
    clearEnvironment(){
        environmentContext.clearRect(0,0,width,width);
    }
    rotateFigure(alpha){
        var newFigures=[];
        this.figures.forEach((item,num)=>{
            if(num!=3){
                newFigures.push(item);
            }
            else{
                newFigures.push(Rotate(item,new Point(220,650),alpha));    
            }
        })
        this.figures=newFigures;
        this.figuresSegments=[];
        this.pointsOfFigures=[];
        this.figures.forEach((figure)=>{
            this.figuresSegments=this.figuresSegments.concat(figure.segments);
        })
        this.figures.forEach((figure)=>{
            this.pointsOfFigures=this.pointsOfFigures.concat(figure.points);
        })
    }
}

const width=900;
const delta=0.3;
const centerPoint=new Point(width/2,width/2);

const environmentContext=document.getElementById("environment").getContext("2d");
const context=document.getElementById("canvas").getContext("2d");

const figure1=new Figure([new Point(120,150),new Point(150,350),new Point(250,350),new Point(160,330),new Point(170,170)]);
const figure2=new Figure([new Point(620,650),new Point(650,750),new Point(650,550),new Point(560,630),new Point(470,870)]);
const figure3=new Figure([new Point(222,314),new Point(230,330),new Point(247,327)]);
const figure4=new Figure([new Point(220,550),new Point(220,650),new Point(400,650),new Point(160,730)])
const figure5=new Figure([new Point(500,100),new Point(700,100),new Point(700,300),new Point(500,300),new Point(500,260),new Point(650,260),new Point(650,140),new Point(500,140)]);

let env=new Environment();

window.onload=()=>{
    env.addFigure(figure1);
    env.addFigure(figure2);
    env.addFigure(figure3);
    env.addFigure(figure4);
    env.addFigure(figure5);

    Draw();
}

window.onmousemove=(e)=>{
    currentDirectionRad=Angle(e.pageX-width/2,e.pageY-width/2);
    window.requestAnimationFrame(Draw);
}

let currentDirectionRad=0;
let rotationAngle=0.05;

function Draw(){
    env.clear();
    env.clearEnvironment();
    env.rotateFigure(rotationAngle);
    env.redrawAll();

    let points=[];
    //находим все точки в секторе зрения и выбираем те, которые видимы
    env.pointsOfFigures.forEach((item)=>{
        if(item.angle>=currentDirectionRad-delta && item.angle<=currentDirectionRad+delta){
           let segm=new Segment(width/2,width/2,item.x,item.y);
           let mark=true;
           env.figuresSegments.forEach((figsegm)=>{
               let res=segm.haveAnIntersectionPoint(figsegm);
                if(res.result){
                     if(!res.point.areEqual(segm.startPoint) &&
                        !res.point.areEqual(segm.endPoint) &&
                        !res.point.areEqual(figsegm.startPoint) &&
                        !res.point.areEqual(figsegm.endPoint)){
                            mark=false;
                     } 
                }
            }); 
            if(mark){
                points.push(item);
            }
        }
    });

    let additionalPoints=[];
    //для каждой видимой точки, проводим еще 2 отрезка с малым отклонением в обе стороны 
    points.forEach((item)=>{
        let segmentPlusDelta=new Segment(width/2,width/2,width/2+(width/2)*Math.cos(item.angle+0.001),width/2+(width/2)*Math.sin(item.angle+0.001));
        let segmentMinusDelta=new Segment(width/2,width/2,width/2+(width/2)*Math.cos(item.angle-0.001),width/2+(width/2)*Math.sin(item.angle-0.001));

        let pointPlus=new Point((width/2)*Math.cos(item.angle+0.001)+width/2,(width/2)*Math.sin(item.angle+0.001)+width/2);
        let pointMinus=new Point((width/2)*Math.cos(item.angle-0.001)+width/2,(width/2)*Math.sin(item.angle-0.001)+width/2);

        env.figuresSegments.forEach(function(segm){
            let res=segmentPlusDelta.haveAnIntersectionPoint(segm);
            if(res.result){
                if(res.point.distanceToPoint(centerPoint)<=pointPlus.distanceToPoint(centerPoint)){
                    pointPlus=res.point;
                }
            }
        });
        
        env.figuresSegments.forEach(function(segm){
            let res=segmentMinusDelta.haveAnIntersectionPoint(segm);
            if(res.result){
                if(res.point.distanceToPoint(centerPoint)<=pointMinus.distanceToPoint(centerPoint)){
                    pointMinus=res.point;
                }
            }
        });
        
        additionalPoints.push(pointPlus);
        additionalPoints.push(pointMinus);
    });

    points=points.concat(additionalPoints);

    let point1=new Point(width/2+(width/2)*Math.cos(currentDirectionRad-delta),width/2+(width/2)*Math.sin(currentDirectionRad-delta));  
    let point2=new Point(width/2+(width/2)*Math.cos(currentDirectionRad+delta),width/2+(width/2)*Math.sin(currentDirectionRad+delta));
    let segm1=new Segment(width/2,width/2,point1.x,point1.y);
    let segm2=new Segment(width/2,width/2,point2.x,point2.y);

    env.figuresSegments.forEach(function(segm){
        let res=segm1.haveAnIntersectionPoint(segm);
        if(res.result){
            if(res.point.distanceToPoint(centerPoint)<=point1.distanceToPoint(centerPoint)){
                point1=res.point;
            }
        }
    });

    env.figuresSegments.forEach(function(segm){
        let res=segm2.haveAnIntersectionPoint(segm);
        if(res.result){
            if(res.point.distanceToPoint(centerPoint)<=point2.distanceToPoint(centerPoint)){
                point2=res.point;
            }
        }
    });

    points.push(point1);
    points.push(point2);
    
    let resultFigure=[centerPoint];
    points.forEach((item)=>{
        resultFigure.push(new Point(item.x,item.y));
    });  
    resultFigure=resultFigure.sort((a,b)=>{return Math.cos(Angle(a.x-width/2,a.y-width/2))-Math.cos(Angle(b.x-width/2,b.y-width/2))});
    env.drawVisibleZone(resultFigure);
}

function Angle(x,y){
    return Math.atan2(y,x);
}

function intersectionPoint(_segment1,_segment2){     
    var x = -((_segment1.x1*_segment1.y2 - _segment1.x2*_segment1.y1)*(_segment2.x2 - _segment2.x1) -
            (_segment2.x1*_segment2.y2 - _segment2.x2*_segment2.y1)*(_segment1.x2 - _segment1.x1))/
            ((_segment1.y1 - _segment1.y2)*(_segment2.x2 - _segment2.x1) -(_segment2.y1 - _segment2.y2)*(_segment1.x2 - _segment1.x1));   
    var y = ((_segment2.y1 - _segment2.y2) * -x - (_segment2.x1 * _segment2.y2 - _segment2.x2 * _segment2.y1)) / (_segment2.x2 - _segment2.x1);  
    return new Point(x,y);  
}

function checkIfNotParallel(_segment1,_segment2){
    var k1=(_segment1.x2-_segment1.x1)/(_segment1.y2-_segment1.y1);
    var k2=(_segment2.x2-_segment2.x1)/(_segment2.y2-_segment2.y1);
    return Math.abs(k1-k2)>0.001;
}

function haveAnIntersectionPoint(_segment1,_segment2){
    let result={result:false,point:new Point(0,0)};
    if(checkIfNotParallel(_segment1,_segment2)){
        result.point=intersectionPoint(_segment1,_segment2);

        let bool1=(Math.min(_segment1.x1,_segment1.x2)<=result.point.x) && 
                    (Math.max(_segment1.x1,_segment1.x2)>=result.point.x) && 
                    (Math.min(_segment2.x1,_segment2.x2)<=result.point.x) && 
                    (Math.max(_segment2.x1,_segment2.x2)>=result.point.x);
        let bool2=(Math.min(_segment1.y1,_segment1.y2)<=result.point.y) && 
                    (Math.max(_segment1.y1,_segment1.y2)>=result.point.y) && 
                    (Math.min(_segment2.y1,_segment2.y2)<=result.point.y) && 
                    (Math.max(_segment2.y1,_segment2.y2)>=result.point.y);
        result.result=bool1 && bool2;
    }
    return result;
}

//const figure4=new Figure([new Point(220,550),new Point(220,650),new Point(400,650),new Point(160,730)]);
function Rotate(figure,point,alpha){
    var fig=[];
    figure.points.forEach((dot)=>{
        let distance=dot.distanceToPoint(point);
        let angle=Angle(dot.x-point.x,dot.y-point.y)+alpha;
        fig.push(new Point(point.x+distance*Math.cos(angle),point.y+distance*Math.sin(angle)))
    });
    return new Figure(fig);
}