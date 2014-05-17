$(window).load(function(){
    game.init();
});

var game = {
    /*
    * Initializing the game
    */
    init: function(){
     game.canvas = document.getElementById('main');
     // get width and height from css and set it to the canvas element
     game.canWidth = $('#main').css("width");
     game.canHeight = $('#main').css("height");
     game.canvas.width = parseInt(game.canWidth);
     game.canvas.height = parseInt(game.canHeight);
     game.ctx = game.canvas.getContext('2d');
     game.counter = 0;
     game.totalCols = 10;
     game.totalRows = 10;
     game.offset = Math.floor(game.canvas.width/game.totalCols);
     game.font = Math.floor(game.offset/2);
     game.timeout  = setInterval(function(){
      if(game.over){
          notifications.gameOver();
          clearInterval(game.timeout);
        }
      }, 500);
     /*
     *  put this variable true if you want red rectangles on available cells
     */
     game.debug = false;
     game.over = false;
     allowedPositions.init();
     positions.init();
     game.drawgrid();
     debugging.init();
     notifications.init();
     $("#main").mousemove(function(e) {
       var pos = positions.findPos(this);
       posX = e.pageX - pos.x;
       posY = e.pageY - pos.y;
       positions.current = [posX,posY];
     });
     $("#main").on("click",function(){
       positions.checkOnClick();
     });
     $('#score').html(game.counter);
    },

    drawgrid: function(){

      for(var i=0;i<=game.canvas.width;i+=game.offset){
         game.ctx.lineWidth = 0.3;
         game.ctx.strokeStyle = 'blue';
         game.ctx.beginPath();
         game.ctx.moveTo(i,0);
         game.ctx.lineTo(i,game.canvas.width);
         game.ctx.stroke();
         game.ctx.closePath();
         game.ctx.beginPath();
         game.ctx.moveTo(0,i);
         game.ctx.lineTo(game.canvas.width,i);
         game.ctx.stroke();
         game.ctx.closePath();
     }
    },
    writeInGridCell: function(xCol,yCol){
         xMiddleCell = ((xCol+1)*game.offset)-game.offset/2;
         yMiddleCell = ((yCol+1)*game.offset)-game.offset/2;
         positions.current = [xMiddleCell,yMiddleCell];
    },
    
    getGridCoordinates: function(xPos,yPos){
        var xCol = Math.floor(xPos/game.offset);
        var xRow = Math.floor(yPos/game.offset);
        return [xCol,xRow];
    }
    
}

var allowedPositions = {
   // Init the positions object
   init: function(){
     // set all the positions
     allowedPositions.used = []
     allowedPositions.top = [-1,-1];
     allowedPositions.upRight = [-1,-1];
     allowedPositions.right = [-1,-1];
     allowedPositions.bottomRight = [-1,-1];
     allowedPositions.bottom = [-1,-1];
     allowedPositions.bottomLeft = [-1,-1];
     allowedPositions.left = [-1,-1];
     allowedPositions.upLeft = [-1,-1];
   }
}

var positions = {
   // init last and current position
   init: function(){
      // canvas last position
      positions.last = [0,0];
      // canvas current position
      positions.current = [0,0];
      // grid current position
      positions.currentCoords = [0,0];
      // grid last position
      positions.lastCoords = [0,0];
      positions.isValid = false;
   },
   
   findPos: function(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj == obj.offsetParent);
        return { x: curleft, y: curtop };
    }
      return undefined;
    },
    
    checkIfValid: function(coords){
      /*grid = game.getGridCoordinates(coords[0],coords[1]);
      x = grid[0];
      y = grid[1];*/
      x = coords[0];
      y = coords[1];
      if((x>=0 && x<game.totalCols) && (y>=0 && y<game.totalRows)){
        return true;
      }else{
        return false;
      }
    },
    
    isValidPosition: function(){
      /* TODO
      *  use last position and current position to verify
      *  if click is in a valid place
      *  if not notify the user
      *  check if there are any other valid positions
      *  if not notify the user and stop the game
      *  also check if the position has already been written or not
      *  and notify the user
      */
      positions.checkPossibleCells();
      positions.isValid = false;
      if(game.debug){
         console.log('currentCoords: ' +positions.currentCoords);
         console.log(allowedPositions.top);
         console.log(allowedPositions.upRight);
         console.log(allowedPositions.right);
         console.log(allowedPositions.bottomRight);
         console.log(allowedPositions.bottom);
         console.log(allowedPositions.bottomLeft);
         console.log(allowedPositions.left);
         console.log(allowedPositions.upLeft);
      } 
      if(positions.currentCoords[0] == allowedPositions.top[0] && positions.currentCoords[1] == allowedPositions.top[1]){
        positions.isValid = positions.isValid || true;
      }
      if(positions.currentCoords[0] == allowedPositions.upRight[0] && positions.currentCoords[1] == allowedPositions.upRight[1]){
        positions.isValid = positions.isValid || true;
      }
      if(positions.currentCoords[0] == allowedPositions.right[0] && positions.currentCoords[1] == allowedPositions.right[1]){
        positions.isValid = positions.isValid || true;
      }
      if(positions.currentCoords[0] == allowedPositions.bottomRight[0] && positions.currentCoords[1] == allowedPositions.bottomRight[1]){
        positions.isValid = positions.isValid || true;
      }
      if(positions.currentCoords[0] == allowedPositions.bottom[0] && positions.currentCoords[1] == allowedPositions.bottom[1]){
        positions.isValid = positions.isValid || true;
      }
      if(positions.currentCoords[0] == allowedPositions.bottomLeft[0] && positions.currentCoords[1] == allowedPositions.bottomLeft[1]){
        positions.isValid = positions.isValid || true;
      }
      if(positions.currentCoords[0] == allowedPositions.left[0] && positions.currentCoords[1] == allowedPositions.left[1] ){
        positions.isValid = positions.isValid || true;
      }
      if(positions.currentCoords[0] == allowedPositions.upLeft[0] && positions.currentCoords[1] == allowedPositions.upLeft[1]){
        positions.isValid = positions.isValid || true;
      }
      if(game.debug){
        console.log(positions.isValid);
      }
    },
    
    checkUsedPositions: function(position){
       var valid = true;
       for(var i = 0; i<allowedPositions.used.length; i++){
           if(position[0] ==allowedPositions.used[i][0] && position[1] ==allowedPositions.used[i][1] ){
               valid = false;
               break;
           }
       }
       return valid;
    },

    checkGameOver: function(position){
       for(var i = 0; i<allowedPositions.used.length; i++){
           if(position[0] ==allowedPositions.used[i][0] && position[1] ==allowedPositions.used[i][1] ){
               return true;
           }
       } 
       return false;
    },
    
    checkAvailablePositions: function(){
         // TODO game over function not working in the correct way
         positions.checkPossibleCells();
         //game.over = false;
         if(allowedPositions.top[0] !=-1 && allowedPositions.top[1] !=-1){
             game.over = game.over || positions.checkGameOver(allowedPositions.top); 
         }
         if(allowedPositions.upRight[0] !=-1 && allowedPositions.upRight[1] !=-1){
             game.over = game.over || positions.checkGameOver(allowedPositions.upRight);
         }
         if(allowedPositions.right[0] !=-1 && allowedPositions.right[1] !=-1){
             game.over = game.over || positions.checkGameOver(allowedPositions.right);
         }
         if(allowedPositions.bottomRight[0] !=-1 && allowedPositions.bottomRight[1] !=-1){
             game.over = game.over || positions.checkGameOver(allowedPositions.top);
         }
         if(allowedPositions.bottom[0] !=-1 && allowedPositions.bottom[1] !=-1){
             game.over = game.over || positions.checkGameOver(allowedPositions.bottom);
         }
        if(allowedPositions.bottomLeft[0] !=-1 && allowedPositions.bottomLeft[1] !=-1){
             game.over = game.over || positions.checkGameOver(allowedPositions.bottomLeft);
         }
        if(allowedPositions.left[0] !=-1 && allowedPositions.left[1] !=-1){
             game.over = game.over || positions.checkGameOver(allowedPositions.left);
         }
        if(allowedPositions.upLeft[0] !=-1 && allowedPositions.upLeft[1] !=-1){
             game.over = game.over || positions.checkGameOver(allowedPositions.upLeft);
         }
     },

     checkAllowedPositions: function(){
         game.over = true;
         if(allowedPositions.top[0] !=-1 && allowedPositions.top[1] !=-1){
             game.over = false;
         }
         if(allowedPositions.upRight[0] !=-1 && allowedPositions.upRight[1] !=-1){
             game.over = false;
         }
         if(allowedPositions.right[0] !=-1 && allowedPositions.right[1] !=-1){
             game.over = false;
         }
         if(allowedPositions.bottomRight[0] !=-1 && allowedPositions.bottomRight[1] !=-1){
             game.over = false;
         }
         if(allowedPositions.bottom[0] !=-1 && allowedPositions.bottom[1] !=-1){
             game.over = false;
         }
        if(allowedPositions.bottomLeft[0] !=-1 && allowedPositions.bottomLeft[1] !=-1){
             game.over = false;
         }
        if(allowedPositions.left[0] !=-1 && allowedPositions.left[1] !=-1){
             game.over = false;
         }
        if(allowedPositions.upLeft[0] !=-1 && allowedPositions.upLeft[1] !=-1){
             game.over = false;
         }
     },
    
    checkPossibleCells: function(){
        var currentCoords = positions.lastCoords;
        allowedPositions.right = [currentCoords[0]+3,currentCoords[1]];
        if(positions.checkIfValid(allowedPositions.right) && positions.checkUsedPositions(allowedPositions.right)){
           if(game.debug){
                debugging.createRect('red',allowedPositions.right,30,30);
           }
        }else{
           allowedPositions.right = [-1,-1];
        }

        allowedPositions.bottom  = [currentCoords[0],currentCoords[1]+3];
        if(positions.checkIfValid(allowedPositions.bottom) && positions.checkUsedPositions(allowedPositions.bottom)){
           if(game.debug){
                debugging.createRect('red',allowedPositions.bottom,30,30);
           }
        }else{
           allowedPositions.bottom = [-1,-1];
        }

        allowedPositions.bottomRight = [currentCoords[0]+2,currentCoords[1]+2];
        if(positions.checkIfValid(allowedPositions.bottomRight) && positions.checkUsedPositions(allowedPositions.bottomRight)){
           if(game.debug){
                debugging.createRect('red',allowedPositions.bottomRight,30,30);
           }
        }else{
           allowedPositions.bottomRight = [-1,-1];
        }

        allowedPositions.bottomLeft = [currentCoords[0]-2,currentCoords[1]+2];
        if(positions.checkIfValid(allowedPositions.bottomLeft) && positions.checkUsedPositions(allowedPositions.bottomLeft)){
           if(game.debug){
              debugging.createRect('red',allowedPositions.bottomLeft,30,30);
           }
        }else{
           allowedPositions.bottomLeft = [-1,-1];
        }

        allowedPositions.upRight = [currentCoords[0]+2,currentCoords[1]-2];
        if(positions.checkIfValid(allowedPositions.upRight) && positions.checkUsedPositions(allowedPositions.upRight)){
           if(game.debug){
              debugging.createRect('red',allowedPositions.upRight,30,30);
           }
        }else{
           allowedPositions.upRight  = [-1,-1];
        }

        allowedPositions.top = [currentCoords[0],currentCoords[1]-3];
        if(positions.checkIfValid( allowedPositions.top) && positions.checkUsedPositions(allowedPositions.top)){
           if(game.debug){
              debugging.createRect('red', allowedPositions.top,30,30);
           }
        }else{
           allowedPositions.top = [-1,-1];
        }

        allowedPositions.upLeft = [currentCoords[0]-2,currentCoords[1]-2];
        if(positions.checkIfValid(allowedPositions.upLeft) && positions.checkUsedPositions(allowedPositions.upLeft)){
           if(game.debug){
              debugging.createRect('red',allowedPositions.upLeft,30,30);
           }
        }else{
           allowedPositions.upLeft = [-1,-1];
        }

        allowedPositions.left = [currentCoords[0]-3,currentCoords[1]];
        if(positions.checkIfValid(allowedPositions.left) && positions.checkUsedPositions(allowedPositions.left)){
           if(game.debug){           
              debugging.createRect('red',allowedPositions.left,30,30);
           }
        }else{
           allowedPositions.left= [-1,-1];
        }
    },
    
    checkOnClick: function(){
      posX = positions.current[0];
      posY = positions.current[1];
      var coords = game.getGridCoordinates(posX,posY);
      positions.currentCoords = coords; //game.getGridCoordinates(positions.current[0],positions.current[1]);
      positions.isValidPosition();
      positions.checkAvailablePositions();
      if(game.counter == 100){
        notifications.winnerIs();
      }else if((positions.isValid || game.counter == 0) && !game.over ){
         game.writeInGridCell(coords[0],coords[1]);
         game.counter +=1;
         game.ctx.font = "bold "+game.font+"px Arial";
         game.ctx.fillStyle = "#172DBA";
         $('#score').html(game.counter);
         if(game.counter>=10){
            game.ctx.fillText(game.counter,positions.current[0]-game.font/2,positions.current[1]+game.font/3); 
         }else{
          game.ctx.fillText(game.counter,positions.current[0]-game.font/3,positions.current[1]+game.font/3);
         }
         if((positions.lastCoords[0] != positions.currentCoords[0]) || (positions.lastCoords[1] != positions.currentCoords[1]) ){
            positions.last = positions.current;
            positions.lastCoords = positions.currentCoords;
            positions.checkAvailablePositions();
            if(game.counter > 0){
              positions.checkAllowedPositions();
            }
         }
         allowedPositions.used.push(positions.currentCoords);

      }else if(game.over){
         notifications.gameOver();
      }else{
        notifications.alerting("This move is not allowed", "Not valid");
         //alert('not valid');
      }
   }
}

var notifications = {
  init: function(){
    $('#notify').dialog({
      resizable: false,
      height:"auto",
      modal: true,
      autoOpen:false
    });
  },
  
  alerting: function(message,title){
    $('#notify').attr("title",title);
    $('#notify').html(message);
    $('#notify').dialog("open");
    $('#notify').dialog("option","buttons",{
        Ok: function(){
          $(this).dialog("close");
        }
    });
    
  },

  gameOver: function(){
    $('#notify').html('The game is over. Do you want to play again?');
    $('#notify').dialog('open');
    $('#notify').dialog("option","buttons",{
      'Yes':function(){
          $(this).dialog("close");
          location.reload();
      },
      'No':function(){
         $(this).dialog("close");
      }

    });
  },

  winnerIs: function(){
    $('#notify').html('Congratulations, you won the game. Do you want to play again?');
    $('#notify').dialog('open');
    $('#notify').dialog("option","buttons",{
      'Yes':function(){
          $(this).dialog("close");
          location.reload();
      },
      'No':function(){
         $(this).dialog("close");
      }

    });
  }
}

var debugging = {
  init: function(){
    
  },
  
  createRect: function(color,coords,w,h){
    game.writeInGridCell(coords[0],coords[1]);
    x = positions.current[0]-15;
    y = positions.current[1]-15;
    game.ctx.fillStyle = color;
    game.ctx.fillRect(x, y, w, h);
  }
}


