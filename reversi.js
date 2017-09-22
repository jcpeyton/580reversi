// reversi.js

/** The state of the game */
var state = {
	turn: 'b',
	board: [
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,'w','b',null,null,null],
		[null,null,null,'b','w',null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null]
	],
	border: [
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,'0','0','0','0',null,null],
		[null,null,'0',null,null,'0',null,null],
		[null,null,'0',null,null,'0',null,null],
		[null,null,'0','0','0','0',null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null]
	],
	spaces: [
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,'0',null,null,null,null],
		[null,null,'0',null,null,null,null,null],
		[null,null,null,null,null,'0',null,null],
		[null,null,null,null,'0',null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null]
	]
}

var ctx;

//Moves the game to the next turn
function nextTurn() {
	if(state.turn === 'b') state.turn = 'w';
	else state.turn = 'b';
}

//Checks if the x and y coordinates are inside the board
function isInBoard(x, y) {
	return (x >= 0 && x < 8 && y >= 0 && y < 8);
}

//Checks if a piece placed at x,y would flip any pieces in the dx,dy direction
function isValidLine(x, y, dx, dy) {
	if(dx === 0 && dy === 0) return false;
	var crossed = false;
	x += dx;
	y += dy;
	while(isInBoard(x, y)) {
		var piece = state.board[y][x];
		var turn = state.turn;
		if(piece) {
			if(turn === piece && crossed) {
				return true;
			}
			else if(turn === piece && !crossed) {
				return false
			}
			else if(turn !== piece) {
				crossed = true;
			}
		}
		else {
			return false;
		}
		x += dx;
		y += dy;
	}
	return false;
}

//Checks if a piece placed at x,y would flip any pieces in any of the cardinal directions
function isValidSpace(x, y) {
	if(state.board[y][x] || !state.border[y][x]) return false
	for(var dy = -1; dy <= 1; dy++) {
		for(var dx = -1; dx <= 1; dx++) {
			if(isValidLine(x, y, dx, dy)) {
				//console.log(x + ' ' + y + ' ' + dx + ' ' + dy)
				return true;
			}
		}
	}
	return false;
}

//Checks each border space to see if a piece could be placed there on this turn
function updateSpaces() {
	for(var y = 0; y < 8; y++) {
		for(var x = 0; x < 8; x++) {
			if(state.border[y][x]) {
				if(isValidSpace(x, y)) {
					state.spaces[y][x] = '0';
				}
				else {
					state.spaces[y][x] = null;
				}	
			}
			else {
				state.spaces[y][x] = null;
			}
		}
	}
}

//Renders an outline at x,y marking where a piece can be placed
function renderSpace(x, y) {
	ctx.beginPath();
    ctx.strokeWidth = 15;
	if(state.turn === 'b') {
		ctx.strokeStyle = "#000";
	}
	else {
		ctx.strokeStyle = "#fff";
	}
    ctx.arc(x*100+50, y*100+50, 45, 0, Math.PI * 2);
    ctx.stroke();
}

//Renders a game piece at x,y
function renderPiece(piece, x, y) {
	ctx.beginPath();
	if(piece.charAt(0) === 'w') {
		ctx.fillStyle = '#fff';
	}
	else {
		ctx.fillStyle = '#000';
	}
	ctx.arc(x*100+50, y*100+50, 40, 0, Math.PI * 2);
	ctx.fill();
}

//Renders the borders of the game board at x,y, as well as call the renderPiece and renderSpace functions if needed
function renderSquare(x,y) {
	ctx.beginPath();
	ctx.strokeStyle = '#000';
	ctx.rect(x*100, y*100, (x+1)*100, (y+1)*100);
	ctx.stroke();
	if(state.spaces[y][x]) {
		renderSpace(x, y);
	}
	else if(state.board[y][x]) {
		renderPiece(state.board[y][x], x, y);
	}
}

//Updates the possible spaces depending on the turn and the current pieces on the board, and renders each game space
function renderBoard() {
	if(!ctx) return;
	ctx.clearRect(0, 0, 800, 800);
	updateSpaces();
	for(var y = 0; y < 8; y++) {
		for(var x = 0; x < 8; x++) {
			renderSquare(x, y);
		}
	}
}

//Flips a piece at x,y
function flipPiece(piece, x, y) {
	if(piece) {
		if(piece === 'w') {
			state.board[y][x] = 'b';
		}
		else if(piece === 'b') {
			state.board[y][x] = 'w';
		}
		return true;
	}
	else {
		return false;
	}
}

//Flips all appropriate pieces from x,y in the direction of dx,dy
function flipLine(x, y, dx, dy) {
	if(dx === 0 && dy === 0) return;
	var crossed = false;
	x += dx;
	y += dy;
	while(isInBoard(x, y)) {
		var piece = state.board[y][x];
		var turn = state.turn;
		if(piece) {
			if(turn === piece && crossed) {
				return;
			}
			else if(turn === piece && !crossed) {
				return false
			}
			else if(turn !== piece) {
				flipPiece(piece, x, y);
				crossed = true;
			}
		}
		else {
			return;
		}
		x += dx;
		y += dy;
	}
}

//Flips all appropriate pieces from x,y in all cardinal directions
function flipPieces(x, y) {
	for(var dy = -1; dy <= 1; dy++) {
		for(var dx = -1; dx <= 1; dx++) {
			if(isValidLine(x, y, dx, dy)) {
				flipLine(x, y, dx, dy);
			}
		}
	}
}

//Updates the game state to record the border of the pieces around x1,y1
function updateBorder(x1, y1) {
	for(var y = y1 - 1; y <= y1 + 1; y++) {
		for(var x = x1 - 1; x <= x1 + 1; x++) {
			if(isInBoard(x, y)) {
				if(state.board[y][x]) {
					state.border[y][x] = null;
				}
				else {
					state.border[y][x] = '0';
				}
			}
		}
	}
}

//Places as piece at x,y and updates the border around it
function addPiece(x, y) {
	if(!state.board[y][x]) {
		if(state.turn === 'b') {
			state.board[y][x] = 'b';
		}
		else {
			state.board[y][x] = 'w';
		}
		updateBorder(x, y);
		return true;
	}
	else {
		return false;
	}
}

//Checks to see if there are viable spaces to place pieces on this turn
function checkSpaces() {
	for(var y = 0; y < 8; y++){
		for(var x = 0; x < 8; x++) {
			if(state.spaces[y][x]) return true;
		}
	}
	return false;
}

//Determines if black or white wins, or if there is a tie. If black wins, the entire board gets covered in black pieces, and vice versa.
//In a tie, the board is cleared of all pieces
function displayWin() {
	var b_count = 0;
	var w_count = 0;
	for(var y = 0; y < 8; y++){
		for(var x = 0; x < 8; x++) {
			if(state.board[y][x]){
				if(state.board[y][x] === 'b') {
					b_count++;
				}
				else if(state.board[y][x] === 'w'){
					w_count++;
				}
			}
		}
	}
	
	var victor = null;
	if(b_count > w_count) {
		victor = 'b';
	}
	else if(w_count > b_count) {
		victor = 'w';
	}
	
	for(var y = 0; y < 8; y++){
		for(var x = 0; x < 8; x++) {
			state.board[y][x] = victor;
		}
	}
	
	renderBoard();
}

//Handles when a player clicks on the board
function handleClick(event) {
	if(!ctx) return;
	var x = Math.floor(event.clientX / 50);
	var y = Math.floor(event.clientY / 50);
	//console.log(event.clientX + " " + event.clientY);
	if(state.spaces[y][x]) {
		addPiece(x, y);
		flipPieces(x, y);
		nextTurn();
		renderBoard();
		if(!checkSpaces()) {
			nextTurn();
			renderBoard();
			if(!checkSpaces()){
				displayWin();
			}
		}
	}
}

//Initializes the board and click handler
function setup() {
	var canvas = document.createElement('canvas');
	canvas.width = 800;
	canvas.height = 800;
	canvas.onclick = handleClick;
	document.body.appendChild(canvas);
	ctx = canvas.getContext('2d');
	renderBoard();
}

setup();