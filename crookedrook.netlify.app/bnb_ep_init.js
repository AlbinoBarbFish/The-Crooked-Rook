

function get_rot(rx, ry, loops) {
    //I messed up and put it in the wrong direction
    loops = (8 - loops) % 8; //Band-aid solution
    while (loops < 0) {
        loops += 8;
    }
    if (rx === 0 && ry === 0) {
        return { x: 0, y: 0 };
    }
    for (var a = 0; a < loops; a++) {
        if (rx === 0) { tx = -ry; ty = ry; }
        else if (ry === 0) { tx = rx; ty = rx; }
        else if (rx === ry) { tx = 0; ty = ry; }
        else if (rx === -ry) { tx = rx; ty = 0; }
        else if (rx > 0 && ry > 0) {
            if (rx > ry) {
                tx = ry;
                ty = rx;
            }
            else {
                tx = -rx;
                ty = ry;
            }
        }
        else if (rx > 0 && ry < 0) {
            if (rx > -ry) {
                tx = rx;
                ty = -ry;
            }
            else {
                tx = -ry;
                ty = -rx;
            }
        }
        else if (rx < 0 && ry > 0) {
            if (rx < -ry) {
                tx = rx;
                ty = -ry;
            }
            else {
                tx = -ry;
                ty = -rx;
            }
        }
        else {
            if (rx < ry) {
                tx = ry;
                ty = rx;
            }
            else {
                tx = -rx;
                ty = ry;
            }
        }
        rx = tx;
        ry = ty;
    }
    return { x: rx, y: ry };
}

function gcd(a, b){
	if(b){
		return gcd(b, a%b);
	}
	else{
		return Math.abs(a);
	}
	//return b?gcd(b,a%b):Math.abs(a);
}

function get_slide_ss(start_x, start_y, delta_x, delta_y, angle, sym, len_max){
	let ret = new squareset(game_data.width*game_data.height);
	if(len_max <= 0 || len_max > 256){
		len_max = 256;
	}
	for(var a = 0; a < 8; a += 8/sym){
		var d = get_rot(delta_x, -delta_y, a+angle);
		//d=delta; the vector that we're sliding each step
		for(let cx = start_x+d.x, cy = start_y+d.y, i=0; i < len_max; cx += d.x, cy += d.y, i ++){
			if(!on_board(cx, cy)){ break; }
			ret.set_on(cy*game_data.width+cx);
		}
	}
	return ret;
}

//for b&b and ep bitboards
//this.onBoard isn't defined since I'm decoupling this from the object
function bnb_ep_squaresets(width, height, active_ss){
	let bnb = [];
	let ep  = [];
	for(var a = 0; a < width*height; a ++){
		bnb.push([]);
		ep.push([]);
		for(var b = 0; b < width*height; b ++){
			bnb[a].push(new squareset(width*height)); //Are these default to 0?
			 ep[a].push(new squareset(width*height)); //I think so. If not, we should do that
			var a_x = a%width, a_y = Math.floor(a/width);
			var b_x = b%width, b_y = Math.floor(b/width);
			var d_x = b_x-a_x, d_y=b_y-a_y;
			if(d_x === d_y && d_y === 0){ continue; }
			var d_gcd = Math.abs(gcd(d_x, d_y));
			d_x /= d_gcd;
			d_y /= d_gcd;
            for (var cx = b_x + d_x, cy = b_y + d_y;
                cx >= 0 && cx < width && cy >= 0 && cy < height && active_ss.get(cy * width + cx);
                cx += d_x, cy += d_y){
				bnb[a][b].set_on(cy*width+cx);
			}
            for (var cx = a_x + d_x, cy = a_y + d_y;
                (cx != b_x || cy != b_y) && cx >= 0 && cx < width && cy >= 0 && cy < height && active_ss.get(cy * width + cx);
                cx+= d_x, cy += d_y){
				ep[a][b].set_on(cy*width+cx);
			}
		}
	}
	return {bnb_ss: bnb, ep_ss: ep};
}