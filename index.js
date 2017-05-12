'use strict';

class Dot{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.angle=Angle(x-width/2,y-width/2);
    }
    areEqual(dot){
        return Math.abs(dot.x-this.x)<0.001 && Math.abs(dot.y-this.y)<0.001;
    }
    distanceToPoint(dot){
        let x=Math.abs(dot.x-this.x);
        let y=Math.abs(dot.y-this.y);
        return Math.sqrt(x*x+y*y);
    }
    placeDot(){
        context.fillRect(this.x-2,this.y-2,4,4);
    }
}

class Segment{
    constructor(x1,y1,x2,y2){
        this.x1=x1;
        this.y1=y1;
        this.x2=x2;
        this.y2=y2;
        this.startPoint=new Dot(x1,y1);
        this.endPoint=new Dot(x2,y2);
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
    constructor(dots){
         this.dots=dots;
         this.segments=[];
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
    constructor(){
        this.figures=[];
        this.figuresSegments=[];
        this.dotsOfFigures=[];
    }
    addFigure(figure){
        this.figures.push(figure);
        this.addToEnvironment(figure);
        this.figuresSegments=this.figuresSegments.concat(figure.segments);
        this.dotsOfFigures=this.dotsOfFigures.concat(figure.dots);
    }
    addToEnvironment(figure){
        environmentContext.moveTo(figure.dots[0].x,figure.dots[0].y);
        environmentContext.beginPath();
        figure.dots.forEach(function(item){
            environmentContext.lineTo(item.x,item.y);
        });
        environmentContext.closePath();
        environmentContext.fill();
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
}

const width=900;
const delta=0.3;
const centerPoint=new Dot(width/2,width/2);

const environmentContext=document.getElementById("environment").getContext("2d");
const context=document.getElementById("canvas").getContext("2d");

const figure1=new Figure([new Dot(120,150),new Dot(150,350),new Dot(250,350),new Dot(160,330),new Dot(170,170)]);
const figure2=new Figure([new Dot(620,650),new Dot(650,750),new Dot(650,550),new Dot(560,630),new Dot(470,870)]);
const figure3=new Figure([new Dot(222,314),new Dot(230,330),new Dot(247,327)]);
const figure4=new Figure([new Dot(220,550),new Dot(320,550),new Dot(400,650),new Dot(160,730)]);

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
    env.clear();

    let dots=[];
    //находим все точки в секторе зрения и выбираем те, которые видимы
    env.dotsOfFigures.forEach((item)=>{
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
                dots.push(item);
            }
        }
    });

    let additionalDots=[];
    //для каждой видимой точки, проводим еще 2 отрезка с малым отклонением в обе стороны 
    dots.forEach((item)=>{
        let segmentPlusDelta=new Segment(width/2,width/2,width/2+(width/2)*Math.cos(item.angle+0.001),width/2+(width/2)*Math.sin(item.angle+0.001));
        let segmentMinusDelta=new Segment(width/2,width/2,width/2+(width/2)*Math.cos(item.angle-0.001),width/2+(width/2)*Math.sin(item.angle-0.001));

        let pointPlus=new Dot((width/2)*Math.cos(item.angle+0.001)+width/2,(width/2)*Math.sin(item.angle+0.001)+width/2);
        let pointMinus=new Dot((width/2)*Math.cos(item.angle-0.001)+width/2,(width/2)*Math.sin(item.angle-0.001)+width/2);

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
                    pointPlus=res.point;
                }
            }
        });
        
        additionalDots.push(pointPlus);
        additionalDots.push(pointMinus);
    });

    dots=dots.concat(additionalDots);

    let point1=new Dot(width/2+(width/2)*Math.cos(currentDirectionRad-delta),width/2+(width/2)*Math.sin(currentDirectionRad-delta));  
    let point2=new Dot(width/2+(width/2)*Math.cos(currentDirectionRad+delta),width/2+(width/2)*Math.sin(currentDirectionRad+delta));
    let segm1=new Segment(width/2,width/2,point1.x,point1.y);
    let segm2=new Segment(width/2,width/2,point2.x,point2.y);

    env.figuresSegments.forEach(function(segm){
        var res=segm1.haveAnIntersectionPoint(segm);
        if(res.result){
            if(res.point.distanceToPoint(centerPoint)<=point1.distanceToPoint(centerPoint)){
                point1=res.point;
            }
        }
    });

    env.figuresSegments.forEach(function(segm){
        var res=segm2.haveAnIntersectionPoint(segm);
        if(res.result){
            if(res.point.distanceToPoint(centerPoint)<=point2.distanceToPoint(centerPoint)){
                point2=res.point;
            }
        }
    });

    dots.push(point1);
    dots.push(point2);
    
    let resultFigure=[centerPoint];
    dots.forEach((item)=>{
        resultFigure.push(new Dot(item.x,item.y));
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
    return new Dot(x,y);  
}

function checkIfNotParallel(_segment1,_segment2){
    var k1=(_segment1.x2-_segment1.x1)/(_segment1.y2-_segment1.y1);
    var k2=(_segment2.x2-_segment2.x1)/(_segment2.y2-_segment2.y1);
    return Math.abs(k1-k2)>0.001;
}

function haveAnIntersectionPoint(_segment1,_segment2){
    let result={result:false,point:new Dot(0,0)};
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

