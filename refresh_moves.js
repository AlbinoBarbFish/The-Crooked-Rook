function refresh_moves() {
	//Clear all bitboards
	for(let a = 0; a < game_data.width*game_data.height; a ++){
		board.can_move_ss[a].zero();
    }
    if (board.victory != -1) {
        return; //Nothing can move if you already won
    }
	//Find the move board for each piece
    for (let a = 0; a < game_data.all_pieces.length; a ++){
        for (let b = new squareset(board.piece_ss[a]); !b.is_zero(); b.pop()){
            let sq = b.get_ls1b();
            let step_num = 0;
            let step = game_data.all_pieces[a].move[step_num];
            let treat_as_col = board.black_ss.get(sq) && (board.turn || !board.white_ss.get(sq));
            for (let c = 0; c < step.length; c++) {
                let add = parse_term(step[c], 0, sq, a, treat_as_col);
                if (step[c][0].type === "sub") {
                    board.can_move_ss[sq].ande(add.inverse());
                }
                else {
                    board.can_move_ss[sq].ore(add);
                }
            }
            //Cannot land on occupied sanctuaries
            board.can_move_ss[sq].ande(ss_and(game_data.sanctuary, ss_or(board.white_ss, board.black_ss)).inverse());
            //Cannot land on enemy if on pacifst
            if (game_data.pacifist.get(sq)) {
                board.can_move_ss[sq].ande(treat_as_col ? board.white_ss.inverse() : board.black_ss.inverse());
            }
            //Cannot land on iron enemies
            board.can_move_ss[sq].ande(ss_and(board.iron_ss, treat_as_col ? board.white_ss : board.black_ss).inverse());
            //Berzerk
            if (game_data.all_pieces[a].attributes.includes(attrib.berzerk)) {
                let treat_as_col = board.black_ss.get(sq) && (!board.white_ss.get(sq) || board.turn);
                let enemies = treat_as_col ? board.white_ss : board.black_ss;
                if (!ss_and(board.can_move_ss[sq], enemies).is_zero()) {
                    board.can_move_ss[sq].ande(enemies);
                }
            }
            //Retreat
            if (game_data.all_pieces[a].attributes.includes(attrib.retreat)) {
                board.can_move_ss[sq].set_on(sq);
            }
		}
    }
    //Eliminate any moves that put you in check
    /*if (game_data.next_turn_win) {
        //Save the current state
        let saved_state = cloneBoard();
        //Make every possible move
        for (let a = 0; a < game_data.width * game_data.height; a++) {
            let myMoves = new squareset(board.can_move_ss[a]);
            for (; !myMoves.is_zero(); myMoves.pop()) {
                let dst = myMoves.get_ls1b();
                let promote_to = find_promotions(identify_piece(a), a, dst, board.white_ss.get(a), board.black_ss.get(a));
                //The more I think about this problem the more impossible it seems
            }
        }
        board = cloneBoard(saved_state);
    }*/
}
function parse_term(term, term_index, sq, piece, col, angle) {
    //Neutral pieces are whoever's turn it is; non-neutral pieces are their color
    if (angle === undefined) {
        angle = col ? 4 : 0;
    }
    let first = true
    let ret = new squareset(game_data.width * game_data.height);
    let saved_ss = new squareset(game_data.width * game_data.height);
    //Read the term token by token
    for (let a = term_index; a < term.length; a++) {
        if (term[a].type === "pre") {
            //Check condition, possibly return
            if (typeof (term[a].data) === "function" && term[a].data(col, sq)) {
                return ss_or(ret, saved_ss);
            }

        } else if (term[a].type === "post") {
            //Filter squares in ret
            if (typeof (term[a].data) === "function") {
                let req_ss = term[a].data(col, sq, ret);
                ret.ande(req_ss.inverse());
            }

        } else if (term[a].type === "mol") {
            //If it's the first molecule, add the ss
            if (first) {
                ret.ore(game_data.move_ss[term[a].data][sq][angle]);
                first = false;
            }
            //Otherwise, call the function recursively for each square
            else {
                let resulting_spaces = new squareset(game_data.width * game_data.height);
                for (let b = new squareset(ret); !b.is_zero(); b.pop()) {
                    let new_sq = b.get_ls1b();
                    let cx = sq % game_data.width, cy = Math.floor(sq / game_data.width); //current x and y
                    let nx = new_sq % game_data.width, ny = Math.floor(new_sq / game_data.width); //new x and y
                    let new_ss = parse_term(term, a, new_sq, piece, col, angle_to(nx - cx, ny - cy));
                    resulting_spaces.ore(new_ss);
                }
                //Since it's called recursively, the rest of the term has already been processed
                return ss_or(resulting_spaces, saved_ss);
            }
        } else if (term[a].type === "stop") {
            saved_ss.ore(ret);
        } else if (term[a].type === "rep") {
            a = term[a].data - 1; //Subtract 1 because it's about to be incremented
        }
    }
    return ss_or(ret, saved_ss);
}

function angle_to_diagonal(dx, dy) {
    if (dx === dy && dy === 0) { return 0; }
    if (dx === 0) {
        return (dy < 0) ? 0 : 4;
    }
    if (dx > 0) {
        return (dy < 0) ? 7 : (dy === 0) ? 6 : 5;
    }
    if (dx < 0) {
        return (dy < 0) ? 1 : (dy === 0) ? 2 : 3;
    }
    return 0;
}
function angle_to_orthogonal(dx, dy) {
    if (dx === dy && dy === 0) { return 0; }
    if (dy < -Math.abs(dx)) { return 0; }
    if (dy > Math.abs(dx)) { return 4; }
    if (dx < -Math.abs(dy)) { return 2; }
    if (dx > Math.abs(dy)) { return 6; }
    if (dx === dy)  { return (dx < 0) ? 1 : 5; }
    if (dx === -dy) { return (dx < 0) ? 3 : 7; }
    return 0;
}
function angle_to_clockwise(dx, dy) {
    if (dx === dy && dy === 0) { return 0; }
    if (dx >= 0 && dy < 0) {
        if (Math.abs(dx) < Math.abs(dy)) { return 0; }
        else { return 7; }
    }
    if (dx > 0 && dy >= 0) {
        if (Math.abs(dx) > Math.abs(dy)) { return 6; }
        else { return 5; }
    }
    if (dx <= 0 && dy > 0) {
        if (Math.abs(dx) < Math.abs(dy)) { return 4; }
        else { return 3; }
    }
    if (dx < 0 && dy <= 0) {
        if (Math.abs(dx) > Math.abs(dy)) { return 2; }
        else { return 1; }
    }
    return 0;
}
function angle_to_counterclockwise(dx, dy) {
    if (dx === dy && dy === 0) { return 0; }
    if (dx <= 0 && dy < 0) {
        return (dx <= dy) ? 1 : 0;
    }
    if (dx < 0 && dy >= 0) {
        return (dx < -dy) ? 2 : 3;
    }
    if (dx >= 0 && dy > 0) {
        return (dx >= dy) ? 5 : 4;
    }
    if (dx > 0 && dy <= 0) {
        return (dx > -dy) ? 6 : 7;
    }
    return 0;
}
function angle_to(dx, dy) {
    switch (game_data.snap_mode) {
        case "diagonal":
            return angle_to_diagonal(dx, dy);
            break;
        case "orthogonal":
            return angle_to_orthogonal(dx, dy);
            break;
        case "counterclockwise":
            return angle_to_counterclockwise(dx, dy);
            break;
        default:
            return angle_to_clockwise(dx, dy);
            break;
    }
}
function print_angles(fn) {
    let ret = "";
    for (let y = -3; y < 4; y++) {
        for (let x = -3; x < 4; x++) {
            ret += fn(x, y) + " ";
        }
        ret += "\n";
    }
    console.log(ret);
} 