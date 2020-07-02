
function Mine(tr,td,mineNum){
    this.tr = tr;  //行数
    this.td =td;   //列数
    this.mineNum = mineNum; //雷数

    this.squares = []; //存储所有方块的信息，是一个二维数组，按行和列的顺序排放，存取都使用行列的形式
    this.tds = [];     // 存放所有单元格的dom（二维数组）
    this.surplusMine = mineNum;  //剩余雷的数量
    this.allRight = false;     //右击标的小红旗是否全是雷，用来判断游戏是否成功

    this.parent = document.querySelector('.gameBox');
}

//生成n个不重复的数字,随机数字的位置相当于雷的随机位置
Mine.prototype.randomNum = function(){
    var square = new Array(this.tr*this.td);  //生成一个空数组，但有长度，长度为行数乘列数等于格子的总数
    for(var i = 0;i<square.length;i++){
        square[i] = i;
    }
    square.sort(function(){return 0.5-Math.random()});
    //截取0~雷的数量
    return square.slice(0,this.mineNum);
}

//初始化
Mine.prototype.init = function(){
    // console.log(this.randomNum());
    var rn = this.randomNum();   //雷在格子里的位置
    var n = 0;   //用来找格子对应的索引

    for(var i = 0;i<this.tr;i++){
        this.squares[i] = [];
        for(var j = 0;j<this.td;j++){
            // this.squares[i][j] = ;
            //由于是嵌套循环，所以没办法每个格子从0一直循环到总数，所以弄个n,每循环一次+1，最后肯定是格子的总数
            n++;
            //取一个方块在数组里的数据要使用行和列的形式去取。找方块周围的数据时要用坐标的形式去找。行和列的形式和坐标x,y的形式刚好是相反的
            if(rn.indexOf(n) !== -1){
                //如果条件成立，说明现在循环到的这个索引在雷的数组中找到了，那就表示这个索引对应的就是个雷
                this.squares[i][j] = {type:'mine',x:j,y:i}
            }else{
                this.squares[i][j] = {type:'number',x:j,y:i,value:0};
            }
        }
    }
    this.updateNum();
    this.createDom(); 

    //阻止鼠标右键默认事件
    this.parent.oncontextmenu = function(){
        return false;
    }

    //剩余雷数
    this.oMineNum = document.querySelector('.mineNum');
    this.oMineNum.innerHTML = this.surplusMine;
}

//创建表格
Mine.prototype.createDom = function(){
    var table = document.createElement('table');
    var that = this;
    for(var i = 0;i<this.tr;i++){//行
        var domTr = document.createElement('tr');
        this.tds[i] = [];

        for(var j = 0;j<this.td;j++){  //列
            var domTd = document.createElement('td');

            //为每个td注册鼠标点击事件
            domTd.pos = [i,j]; //把格子对应的行和列存在格子身上，为了下面通过这个值去数组里取到对应的数据
            domTd.onmousedown = function(){
                that.play(event,this);  //this指的是点击那个td
            };

            this.tds[i][j] = domTd;  //这里把所有创建的td添加到数组中
           

            // if(this.squares[i][j].type === 'mine'){
            //     domTd.className = 'mine';
            // }
            // if(this.squares[i][j].type === 'number'){
            //     domTd.innerHTML=this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';  //为后面避免点击后创建多个table
    this.parent.appendChild(table);
}

//找某个方格周围的8个方格
Mine.prototype.getAround = function(squares){
    var x = squares.x;
    var y = squares.y;
    var result = [];  //把找到的格子的坐标返回出去(二维数组)
    /**
     * 某格子周围8个格子的坐标
     * x-1,y-1  x,y-1  x+1,y-1      
     * x-1,y    x,y    x+1,y
     * x-1,y+1  x,y+1  x+1,y+1   
     */
    //通过坐标循环九宫格
    for(var i =x-1;i<=x+1;i++){
        for(var j = y-1;j <= y+1;j++){
            if(
                i < 0 ||   //格子超出了左边的范围
                j<0 ||    //格子超出了右边的范围
                i > this.td -1 ||    //格子超出了上边的范围
                j > this.tr - 1 ||   //格子超出了下边的范围
                (i === x && j === y) ||  //当前循环到的格子是自己
                this.squares[j][i].type === 'mine' //周围的格子是雷
            ){
                continue;
            }
            result.push([j,i]);  //要以行和列的形式返回回去。因为到时需要用行和列的形式取数组里的数据
        }
    }

    return result;
}

//更新数字
Mine.prototype.updateNum = function(){
    for(var i = 0;i<this.tr;i++){
        for(var j = 0;j < this.td;j++){
            //只更新雷周围的数字
            if(this.squares[i][j].type === 'number'){
                continue;
            }
            var num = this.getAround(this.squares[i][j]); //获取每一个雷周围的数字

            for(var k = 0;k<num.length;k++){
                /**
                 * num[k] === [0,1]
                 * num[k][0] === 0
                 * num[k][1] === 1
                 */
                this.squares[num[k][0]][num[k][1]].value+=1;
            }
        }
    }
}

Mine.prototype.play = function(e,obj){
    if(e.which === 1 && obj.className != 'flag'){  //后面的条件是为了限制用户在标完小红旗后就不能左键点击
        //点击的是左键
        //squares[]存的是所有小方块信息，pos属性存的是当前点击小方块的行和列信息
        var that = this;
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cla = ['zero','one','two','three','four','five','six','seven','eight'];

        if(curSquare.type === 'number'){
            //用户点击的是数字
            obj.innerHTML = curSquare.value;
            //为数字添加颜色样式
            obj.className = cla[curSquare.value];

            if(curSquare.value === 0){
                /*
                如果点击是数字0
                    1.显示自己
                    2.找四周
                        1.显示四周(如果四周的值不为0，那就显示到这里，不需要找了)
                        2.如果值为0
                            1.显示自己
                            2.找四周(如果四周的值不为0，那就显示到这里，不需要找了)
                            3.如果值为0
                                1.显示自己
                                2.找四周(如果四周的值不为0，那就显示到这里，不需要找了)
                */
                obj.innerHTML =''; //如果是数字0的话，样式不显示

                function getAllZero(square){
                    var around = that.getAround(square);  //找到了周围的n个格子   
                    // 返回的around是一个二维数组
                    for(var i=0;i<around.length;i++){
                        // around[i] = [0,0]
                        var x = around[i][0];  //行
                        var y = around[i][1];  //列

                        //为数字添加颜色样式
                        that.tds[x][y].className = cla[that.squares[x][y].value];

                        if(that.squares[x][y].value === 0){
                            //如果以某个格子为中心找到的格子值为0，那就需要接着调用函数(递归)
                            if(!that.tds[x][y].check){
                                //给对应的td添加一个属性，这个属性决定这个格子有没有被找过。如果找过的话为true,下一次就不会在找了
                                that.tds[x][y].check = true;
                                getAllZero(that.squares[x][y]);
                            }
                        }else{
                            //如果以某个格子为中心找到四周的格子值不为0，那就把人家的数字显示出来
                            that.tds[x][y].innerHTML = that.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare)
            }
        }else{
            //用户点到雷
            this.gameOver(obj);
        }
    }
    //点击的是右键
    if(e.which === 3){
        //如果右击的是一个数字，那就不能点击
        if(obj.className && obj.className != 'flag'){
            return;
        }
        obj.className = obj.className === 'flag' ? "":'flag';  //切换class

        if(this.squares[obj.pos[0]][obj.pos[1]].type === 'mine'){
            this.allRight = true;  //用户标的小红旗后面是雷
        }else{
            this.allRight = false;
        }
        //添加一个小红旗，下面的剩余雷数要减少，撤销一个小红旗，下面的剩余雷数要增加
        if(obj.className === 'flag'){
            this.oMineNum.innerHTML = --this.surplusMine;
        }else{
            this.oMineNum.innerHTML = ++this.surplusMine;
        }

        if(this.surplusMine === 0){
            //剩余雷数为0，表示用户已经标完了小红旗，这时候要判读游戏是成功还是结束
            if(this.allRight){
                //条件成立，说明用户全部标对了
                alert('游戏通过');
            }else{
                alert('游戏失败');
                this.gameOver();
            }
        }

    }
};

//游戏失败
Mine.prototype.gameOver = function(clickTd){
    /**
     * 1.点中显示所有雷
     * 2.取消所有格子的点击事件
     * 3.给点击中的雷添加样式
     */
    for(var i = 0;i<this.tr;i++){
        for(var j =0;j<this.td;j++){
            if(this.squares[i][j].type === 'mine'){
                this.tds[i][j].className = 'mine';
            }

            this.tds[i][j].onmousedown = null;
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor = '#f40';
    }
}

//button的功能
var obtn = document.querySelectorAll('.level button');
var mine = null;  //用来存储生成的实例
var ln = 0;    //用来处理当前选中的状态
var arr = [[9,9,10],[16,16,40],[28,28,99]];

for(let i =0;i<obtn.length-1;i++){
    obtn[i].onclick = function(){
        obtn[ln].className = '';
        this.className = 'active';
        ln = i;

        mine = new Mine(...arr[i]);
        mine.init();
    }
}
obtn[0].onclick();

obtn[3].onclick = function(){
    mine.init();
}

// var mine = new Mine(28,28,99);
// mine.init();
