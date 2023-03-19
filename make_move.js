function make_move(src_x, src_y, dst_x, dst_y, promotion) {
    //console.log(`Make move params: src_x=${src_x}; src_y=${src_y}; dst_x=${dst_x}; dst_y=${dst_y}; prom=${promotion}`);

    if (src_x === undefined || src_y === undefined || dst_x === undefined || dst_y === undefined) {
        console.error("make_move called with less than 4 parameters");
    }
    if (typeof(src_x) != "number" || typeof(src_y) != "number" || typeof(dst_x) != "number" || typeof(dst_y) != "number") {
        console.error("Non-number parameter in make_move. Parameters: "+src_x+", "+src_y+", "+dst_x+", "+dst_y);
    }
    if(!validate_move(src_x, src_y, dst_x, dst_y, promotion)) {
        console.error("make_move called with invalid move data");
    }

    board = cloneBoard(board_history[view_move]);

    let src_sq = src_y * game_data.width + src_x;
    let dst_sq = dst_y * game_data.width + dst_x;
    let this_id = identify_piece(src_sq);
    let this_piece = game_data.all_pieces[this_id];
    let is_white = board.white_ss.get(src_sq);
    let is_black = board.black_ss.get(src_sq);
    let my_space = src_sq;
    let other_space = dst_sq;

    //First figure out the notation
    //let notation = this_piece.notation ?? this_piece.symbol; //My IDE thinks this is an error
    let notation = this_piece.symbol;
    if (this_piece.notation != undefined) {
        notation = this_piece.notation;
    }
    //Find how many pieces can go to the same spot
    let in_same_row = false, in_same_column = false, needs_specification = false;;
    let other_pieces = ss_and(board.turn ? board.black_ss : board.white_ss, board.piece_ss[this_id]);
    for (; !other_pieces.is_zero(); other_pieces.pop()) {
        let pos = other_pieces.get_ls1b();
        if (pos === src_sq) { continue; }
        if (!board.can_move_ss[pos].get(dst_sq)) { continue; }
        needs_specification = true;
        if (Math.floor(pos / game_data.width) === Math.floor(src_sq / game_data.width)) {
            in_same_row = true;
        }
        if ((pos % game_data.width) === (src_sq % game_data.width)) {
            in_same_column = true;
        }
    }
    let file = (num) => { return String.fromCharCode(97 + num); };
    let rank = (num) => { return game_data.height - num; }
    if (!needs_specification) {
        //Do nothing
    }
    else if (!in_same_column) {
        notation += file(src_sq%game_data.width);
    }
    else if (!in_same_row) {
        notation += rank(Math.floor(src_sq/game_data.width));
    }
    else {
        notation += file(src_sq % game_data.width) + rank(Math.floor(src_sq / game_data.width));
    }
    //Captures
    if ((board.turn && board.white_ss.get(dst_sq)) || (!board.turn && board.black_ss.get(dst_sq))) {
        notation += "x";
    }
    //To space
    notation += file(dst_sq % game_data.width) + rank(Math.floor(dst_sq / game_data.width));
    //Need to add + and #

    if (src_sq === dst_sq) {
        //Lands on self
        if (this_piece.attributes.includes(attrib.retreat)) {
            death(src_sq);
        }
    }
    else if ((board.turn && board.black_ss.get(dst_sq)) || (!board.turn && board.white_ss.get(dst_sq))) {
        //Lands on ally
        let other_piece = game_data.all_pieces[identify_piece(dst_sq)];
        if (this_piece.attributes.includes(attrib.castle_from) && other_piece.attributes.includes(attrib.castle_to)) {
            //Castle
            let delta_x = dst_x - src_x, delta_y = dst_y - src_y;
            let delta_gcd = Math.abs(gcd(delta_x, delta_y));
            delta_x /= delta_gcd; delta_y /= delta_gcd;
            let king_dest_x = src_x + delta_x * game_data.castle_length;
            let king_dest_y = src_y + delta_y * game_data.castle_length;
            let rook_dest_x = king_dest_x - delta_x;
            let rook_dest_y = king_dest_y - delta_y;
            let king_sq = king_dest_y * game_data.width + king_dest_x;
            let rook_sq = rook_dest_y * game_data.width + rook_dest_x;

            if (king_sq === rook_sq) {
                console.log("Trying to castle on self");
            }
            else if (!on_board(king_sq) || !on_board(rook_sq)) {
                console.log("Trying to castle to non-existent space");
            }
            else if (dst_sq != king_sq && (board.black_ss.get(king_sq) || board.white_ss.get(king_sq))) {
                console.log("Trying to castle king to occupied space");
            }
            else if (src_sq != rook_sq && (board.black_ss.get(rook_sq) || board.white_ss.get(rook_sq))) {
                console.log("Trying to castle rook to occupied space");
            }
            else {
                //Castle successful
                let rook_current = dst_sq;
                if (src_sq != king_sq) {
                    swap_spaces(src_sq, king_sq);
                    if (king_sq === dst_sq) {
                        rook_current = src_sq;
                    }
                }
                if (dst_sq != rook_sq && (src_sq != rook_sq || dst_sq != king_sq)) {
                    swap_spaces(rook_current, rook_sq);
                }
                my_space = king_sq;
                other_space = rook_sq;
            }
        }
        else if (!this_piece.attributes.includes(attrib.ally_static)) {
            swap_spaces(src_sq, dst_sq);
            other_space = src_sq;
            my_space = dst_sq;
        }
        if (this_piece.attributes.includes(attrib.kill_ally)) {
            death(other_space);
        }
    }
    else if ((board.turn && board.white_ss.get(dst_sq)) || (!board.turn && board.black_ss.get(dst_sq))) {
        //Lands on enemy
        let other_piece = game_data.all_pieces[identify_piece(dst_sq)];
        if (!this_piece.attributes.includes(attrib.enemy_static)) {
            swap_spaces(src_sq, dst_sq);
            other_space = src_sq;
            my_space = dst_sq;
        }
        if (this_piece.attributes.includes(attrib.flip_this_on_attack)) {
            if (board.black_ss.get(my_space) != board.white_ss.get(my_space)) {
                board.black_ss.flip(my_space);
                board.white_ss.flip(my_space);
            }
        }
        if (this_piece.attributes.includes(attrib.promote_on_attack) && this_piece.held_piece >= 0
            && this_piece.held_piece < game_data.all_pieces.length) {
            let spawn_col = (is_white && is_black) ? 2 : is_black;
            clear_space(my_space);
            spawn_piece(my_space, this_piece.held_piece, spawn_col);
            board.has_moved_ss.set_on(my_space);
            //Old values of this_piece and piece_id should be used, so don't update them
        }
        if (!this_piece.attributes.includes(attrib.save_enemy)) {
            death(other_space, !this_piece.attributes.includes(attrib.dont_flip_enemy));
        }
        else if (!this_piece.attributes.includes(attrib.dont_flip_enemy)) {
            board.black_ss.flip(other_space);
            board.white_ss.flip(other_space);
        }
        if (this_piece.attributes.includes(attrib.fireball) || other_piece.attributes.includes(attrib.bomb)) {
            death(my_space);
        }
        if (this_piece.attributes.includes(attrib.burn_attack)) {
            evaluate_burns(this_id, my_space, board.turn);
        }
    }
    else if (!board.white_ss.get(dst_sq) && !board.black_ss.get(dst_sq)) {
        //Lands on blank
        swap_spaces(src_sq, dst_sq);
        other_space = src_sq;
        my_space = dst_sq;
        if (this_piece.attributes.includes(attrib.burn_peaceful)) {
            evaluate_burns(this_id, dst_sq, board.turn);
        }
        if (this_piece.attributes.includes(attrib.flip_on_passive)) {
            //Only flip if there's a piece there
            if (board.black_ss.get(dst_sq) || board.white_ss.get(dst_sq)) {
                board.black_ss.flip(dst_sq);
                board.white_ss.flip(dst_sq);
            }
        }
    }

    //En passant
    if (this_piece.attributes.includes(attrib.ep_capturer) && board.ep_mask.get(my_space)) {
        let other_white = board.white_ss.get(board.last_moved_dest), other_black = board.black_ss.get(board.last_moved_dest);
        if ((!this_piece.attributes.includes(attrib.save_enemy) && ((board.turn && other_white) || (!board.turn && other_black)))
            || ((this_piece.attributes.includes(attrib.kill_ally) && ((board.turn && other_white) || (!board.turn && other_black))))) {
            //If it's an enemy and I can kill enemies, or it's an ally and I can kill allies
            death(board.last_moved_dest);
        }
    }

    //Kill between
    let kill = new squareset(game_data.width * game_data.height);
    if (this_piece.attributes.includes(attrib.kill_between)) {
        kill.ore(game_data.ep_ss[src_sq][dst_sq]);
        if (save_enemy) {
            kill.ande(turn ? board.white_ss.inverse() : board.black_ss.inverse());
        }
        if (!kill_ally) {
            kill.ande(turn ? board.black_ss.inverse() : board.white_ss.inverse());
        }
    }
    for (; !kill.is_zero(); kill.pop()) {
        death(kill.get_ls1b());
    }

    //Spawn_trail, then spawn_constant
    if (this_piece.attributes.includes(attrib.spawn_trail)) {
        if (!board.black_ss.get(other_space) && !board.white_ss.get(other_space)) {
            let spawn_col = (is_white && is_black) ? 2 : is_black;
            spawn_piece(other_space, this_piece.held_piece, spawn_col)
        }
    }
    for (let a = new squareset(board.constant_spawn_ss); !a.is_zero(); a.pop()) {
        //Treat as col determines the orientation of the spawning squareset
        //Spawn col determines color of the pieces it spawns
        let sq = a.get_ls1b();
        let piece = game_data.all_pieces[identify_piece(sq)];
        let treat_as_col = board.black_ss.get(sq) && (!board.white_ss.get(sq) || board.turn);
        let spawn_col = (board.white_ss.get(sq) && board.black_ss.get(sq)) ? 2 : board.black_ss.get(sq);
        let spawn_ss = new squareset(game_data.move_ss[piece.held_move][sq][treat_as_col ? 4 : 0]);
        spawn_ss.ande(ss_or(board.black_ss, board.white_ss).inverse());
        for (; !spawn_ss.is_zero(); spawn_ss.pop()) {
            spawn_piece(spawn_ss.get_ls1b(), piece.held_piece, spawn_col);
        }
    }

    //Passive burn
    let burn_white = new squareset(game_data.width * game_data.height);
    let burn_black = new squareset(game_data.width * game_data.height);
    for (let a = new squareset(board.passive_burn_ss); !a.is_zero(); a.pop()) {
        //Neutral piece's burn direction is based on whose turn it is
        //But neutral pieces burn both sides
        let sq = a.get_ls1b();
        let piece = game_data.all_pieces[identify_piece(sq)];
        let treat_as_col = board.black_ss.get(sq) && (!board.white_ss.get(sq) || board.turn);
        if (board.black_ss.get(sq) || piece.attributes.includes(attrib.burn_allies)) {
            burn_white.ore(game_data.move_ss[piece.held_move][sq][treat_as_col ? 4 : 0]);
        }
        if (board.white_ss.get(sq) || piece.attributes.includes(attrib.burn_allies)) {
            burn_black.ore(game_data.move_ss[piece.held_move][sq][treat_as_col ? 4 : 0]);
        }
    }
    let burn = ss_or(ss_and(burn_white, board.white_ss), ss_and(burn_black, board.black_ss));
    burn.ande(board.burn_immune_ss.inverse());
    for (; !burn.is_zero(); burn.pop()) {
        death(burn.get_ls1b());
    }

    //Promotions
    let my_promotion = -1;
    if (board.piece_ss[this_id].get(my_space)) {
        let promote_to = find_promotions(this_id, src_sq, my_space, board.white_ss.get(my_space), board.black_ss.get(my_space));
        //Promote_to is all pieces this piece can currently promote to
        if (promote_to.length === 1) {
            my_promotion = promote_to[0];
        }
        else if (promotion != undefined && promote_to.includes(promotion)) {
            //If the passed-in promotion value is in the promote_to array, promote to that
            my_promotion = promotion;
        }
        else if (promote_to.length > 1) {
            //Something went wrong, promote to the first possible piece and throw an error
            console.error("Piece promotion not found, promoting to first possible promotion");
            my_promotion = promote_to[0];
        }
        if (my_promotion >= 0) {
            let spawn_col = (board.white_ss.get(my_space) && board.black_ss.get(my_space)) ? 2 : board.black_ss.get(my_space);
            clear_space(my_space);
            spawn_piece(my_space, my_promotion, spawn_col);
            board.has_moved_ss.set_on(my_space);
            notation += "=" + game_data.all_pieces[my_promotion].symbol;
        }
    }

    //Leave EP mask
    if (this_piece.attributes.includes(attrib.ep_captured)) {
        board.ep_mask = JSON.parse(JSON.stringify(game_data.ep_ss[src_sq][my_space]));
        Object.setPrototypeOf(board.ep_mask, squareset.prototype);
        //I need to copy the ep_ss so that when I zero it out it doesn't zero out the ep_ss
    }
    else {
        board.ep_mask.zero();
    }

    let history_record = { x1: src_x, y1: src_y, x2: dst_x, y2: dst_y, turn: board.turn_count, notation: notation };
    if (my_promotion >= 0) { history_record.promotion = my_promotion; }
    post_move(src_sq, dst_sq, history_record);
}

function make_drop_move(piece, color, dest) {
    if(!validate_drop(piece, color, dest)) {
        console.error("make_drop_move called with invalid data");
    }
    let my_hand = color ? board.hands.black : board.hands.white;

    spawn_piece(dest, piece, color);
    my_hand[piece]--;

    let file = (num) => { return String.fromCharCode(97 + num); };
    let rank = (num) => { return game_data.height - num; }
    //let piece_symbol = game_data.all_pieces[piece].notation ?? game_data.all_pieces[piece].symbol; //My IDE thinks this is an error
    let piece_symbol = game_data.all_pieces[piece].symbol;
    if (game_data.all_pieces[piece].notation != undefined) {
        piece_symbol = game_data.all_pieces[piece].notation;
    }
    let notation = piece_symbol + "'" + file(dest % game_data.width) + rank(Math.floor(dest / game_data.width));

    post_move(-1, dest, { piece: piece, color: color, dest: dest, turn: board.turn_count, drop: true, notation: notation });
}

function validate_move(src_x, src_y, dst_x, dst_y, promotion) {
    let brd = board_history[view_move];
    let src_sq = src_y * game_data.width + src_x;
    let dst_sq = dst_y * game_data.width + dst_x;

    //If a piece of turn's color isn't on src
    if(brd.turn && !brd.black_ss.get(src_sq) || !brd.turn && !brd.white_ss.get(src_sq)) {
        return false;
    }
    //If the piece can't move there
    if(!brd.can_move_ss[src_sq].get(dst_sq)) {
        return false;
    }
    return true;
}

function validate_drop(piece, color, dest) {
    let brd = board_history[view_move];
    let my_hand = color ? brd.hands.black : brd.hands.white;
    if (my_hand[piece] <= 0) {
        //console.error("Trying to drop a piece you don't have");
        return false;
    }
    if (color != brd.turn) {
        //console.error("Trying to drop a piece when it isn't your turn");
        return false;
    }
    if (brd.white_ss.get(dest) || brd.black_ss.get(dest)) {
        //console.error("Trying to drop a piece on another piece");
        return false;
    }
    return true;
}

function post_move(src, dest, history_record) {
    board.turn_pos++;
    if (board.turn_pos >= game_data.turn_list.length) {
        board.turn_pos = 0;
        board.turn_count++;
    }
    board.turn = game_data.turn_list[board.turn_pos];
    board.last_moved_src = src;
    board.last_moved_dest = dest;
    refresh_moves();
    board.victory = find_victory();
    board_history.length = view_move + 1;
    move_history.length = view_move;
    view_move++;
    board_history.push(cloneBoard());
    move_history.push(history_record);
    render_extras();
}
function find_victory() {
    //Royal Capture
    //If your royal gets captured, you lose
    if (game_data.wins.includes(ends.royal_capture)) {
        if (!board.royals_killed.white && board.royals_killed.black) {
            console.log("Black by royal capture")
            return 1; //Black wins
        }
        if (board.royals_killed.white && !board.royals_killed.black) {
            console.log("White by royal capture")
            return 0; //White wins
        }
        if (board.royals_killed.white && board.royals_killed.black) {
            console.log("Mutual win by royal capture")
            return 0.5; //Draw
        }
    }
    if (game_data.draws.includes(ends.royal_capture)) {
        if (board.royals_killed.white || board.royals_killed.black) {
            console.log("Draw by royal capture")
            return 0.5; //Not sure why this would ever be a thing
        }
    }
    //Royal Extinction
    //If you have no royal pieces, you lose
    let all_royals = new squareset(game_data.width * game_data.height);
    for (let a = 0; a < game_data.all_pieces.length; a++) {
        if (game_data.all_pieces[a].attributes.includes(attrib.royal)) {
            all_royals.ore(board.piece_ss[a]);
        }
    }
    if (game_data.wins.includes(ends.royal_extinction)) {
        if (ss_and(all_royals, board.white_ss).is_zero() && !ss_and(all_royals, board.black_ss).is_zero()) {
            console.log("Black by royal extinction")
            return 1; //Black wins
        }
        if (ss_and(!all_royals, board.white_ss).is_zero() && ss_and(all_royals, board.black_ss).is_zero()) {
            console.log("White by royal extinction")
            return 0; //White wins
        }
        if (ss_and(all_royals, board.white_ss).is_zero() && ss_and(all_royals, board.black_ss).is_zero()) {
            console.log("Mutual win by royal extinction")
            return 0.5; //Draw
        }
    }
    if (game_data.draws.includes(ends.royal_extinction)) {
        if (ss_and(all_royals, board.white_ss).is_zero() || ss_and(all_royals, board.black_ss).is_zero()) {
            console.log("Draw by royal extinction")
            return 0.5; //Not sure why this would ever be a thing
        }
    }
    //Bare Royals
    //If you have no non-royal pieces, you lose
    if (game_data.wins.includes(ends.bare_royal)) {
        if (ss_and(all_royals.inverse(), board.white_ss).is_zero() && !ss_and(all_royals.inverse(), board.black_ss).is_zero()) {
            console.log("Black by bare royal")
            return 1; //Black wins
        }
        if (ss_and(!all_royals.inverse(), board.white_ss).is_zero() && ss_and(all_royals.inverse(), board.black_ss).is_zero()) {
            console.log("White by bare royal")
            return 0; //White wins
        }
        if (ss_and(all_royals.inverse(), board.white_ss).is_zero() && ss_and(all_royals.inverse(), board.black_ss).is_zero()) {
            console.log("Mutual win by bare royal")
            return 0.5; //Draw
        }
    }
    if (game_data.draws.includes(ends.bare_royal)) {
        if (ss_and(all_royals.inverse(), board.white_ss).is_zero() || ss_and(all_royals.inverse(), board.black_ss).is_zero()) {
            console.log("Draw by bare royal")
            return 0.5;
        }
    }
    //Stalemate
    let has_possible_moves = { white: false, black: false };
    for (let a = 0; a < game_data.width * game_data.height; a++) {
        if (!board.can_move_ss[a].is_zero()) {
            if (board.black_ss.get(a)) {
                has_possible_moves.black = true;
            }
            if (board.white_ss.get(a)) {
                has_possible_moves.white = true;
            }
        }
        if (has_possible_moves.white && has_possible_moves.black) {
            break;
        }
    }
    if (game_data.wins.includes(ends.stalemate) || game_data.draws.includes(ends.stalemate)) {
        if (!board.turn && !has_possible_moves.white) {
            if (game_data.draws.includes(ends.stalemate)) {
                console.log("Draw by stalemate")
                return 0.5; //Black wins
            }
            console.log("Black by stalemate")
            return 1; //Black wins
        }
        if (board.turn && !has_possible_moves.black) {
            if (game_data.draws.includes(ends.stalemate)) {
                console.log("Draw by stalemate")
                return 0.5; //Black wins
            }
            console.log("White by stalemate")
            return 0; //White wins
        }
    }
    return -1;
}
function find_promotions(this_id, src_sq, end_sq, is_white, is_black) {
    let promote_to = [];
    for (let a = 0; a < game_data.all_pieces[this_id].promotions.length; a++) {
        let prom = game_data.all_pieces[this_id].promotions[a];
        let start_in_white = game_data.zones[prom.white].get(src_sq);
        let start_in_black = game_data.zones[prom.black].get(src_sq);
        let end_in_white = game_data.zones[prom.white].get(end_sq);
        let end_in_black = game_data.zones[prom.black].get(end_sq);
        if (prom.on.includes(events.enter) &&
            (is_white && !start_in_white && end_in_white) ||
            (is_black && !start_in_black && end_in_black)) {
            promote_to.push(...prom.to);
        }
        else if (prom.on.includes(events.exit) &&
            (is_white && start_in_white && !end_in_white) ||
            (is_black && start_in_black && !end_in_black)) {
            promote_to.push(...prom.to);
        }
        else if (prom.on.includes(events.between) &&
            (is_white && start_in_white && end_in_white) ||
            (is_black && start_in_black && end_in_black)) {
            promote_to.push(...prom.to);
        }
    }
    return promote_to;
}
function evaluate_burns(piece_id, sq, col) {
    let burn = new squareset(game_data.move_ss[game_data.all_pieces[piece_id].held_move][sq][col ? 4 : 0]);
    burn = ss_and(burn, ss_or(board.black_ss, board.white_ss), board.burn_immune.inverse());
    if (!game_data.all_pieces[piece_id].attributes.includes(attrib.burn_allies)) {
        let my_ss = col ? board.black_ss : board.white_ss;
        burn.ande(my_ss.inverse());
    }
    for (; !burn.is_zero(); burn.pop()) {
        death(burn.get_ls1b());
    }
}
function death(sq, flip = true) {
    let piece_id = identify_piece(sq);
    let piece = game_data.all_pieces[piece_id];
    let is_neutral = board.black_ss.get(sq) && board.white_ss.get(sq);
    let burn_col = is_neutral ? !board.turn : board.black_ss.get(sq);
    let spawn_col = is_neutral ? 2 : board.black_ss.get(sq);

    if (piece.attributes.includes(attrib.transform_on_death)) {
        clear_space(sq);
        spawn_piece(sq, piece.held_piece, spawn_col);
        board.has_moved_ss.set_on(sq);
    }
    if (flip && !is_neutral) {
        board.black_ss.flip(sq);
        board.white_ss.flip(sq);
    }
    if (!piece.attributes.includes(attrib.save_self)) {
        if (game_data.has_hand && !is_neutral) {
            if (board.black_ss.get(sq)) {
                board.hands.black[identify_piece(sq)]++;
            }
            else if (board.white_ss.get(sq)) {
                board.hands.white[identify_piece(sq)]++;
            }
        }
        clear_space(sq);
    }

    if (piece.attributes.includes(attrib.burn_death)) {
        evaluate_burns(piece_id, sq, burn_col);
    }
    if (piece.attributes.includes(attrib.spawn_on_death)) {
        let spawns = new squareset(game_data.move_ss[piece.held_move][sq][burn_col ? 4 : 0]);
        spawns.ande(ss_or(board.black_ss, board.white_ss).inverse());
        for (; !spawns.is_zero(); spawns.pop()) {
            spawn_piece(spawns.get_ls1b(), piece.held_piece, spawn_col);
        }
    }

    if (piece.attributes.includes(attrib.royal)) {
        //Whoever's turn it is gets a royals_killed point
        if (board.turn) {
            board.royals_killed.black++;
        }
        else {
            board.royals_killed.white++;
        }
    }
}
function spawn_piece(sq, piece_id, col) {
    if (board.white_ss.get(sq) || board.black_ss.get(sq)) {
        return;
    }
    board.piece_ss[piece_id].set_on(sq);
    if (col == 0 || col == 2) {
        board.white_ss.set_on(sq);
    }
    if (col == 1 || col == 2) {
        board.black_ss.set_on(sq);
    }
    let attributes = game_data.all_pieces[piece_id].attributes;
    if (!attributes.includes(attrib.ghost)) {
        board.solid_ss.set_on(sq);
    }
    if (attributes.includes(attrib.iron)) {
        board.iron_ss.set_on(sq);
    }
    if (attributes.includes(attrib.tall)) {
        board.tall_ss.set_on(sq);
    }
    if (attributes.includes(attrib.burn_passive)) {
        board.passive_burn_ss.set_on(sq);
    }
    if (attributes.includes(attrib.burn_immune)) {
        board.burn_immune_ss.set_on(sq);
    }
    board.has_moved_ss.set_off(sq);
}
function swap_spaces(src, dest) {
    swap_ss_space(src, dest, board.black_ss);
    swap_ss_space(src, dest, board.white_ss);
    swap_ss_space(src, dest, board.solid_ss);
    swap_ss_space(src, dest, board.iron_ss);
    swap_ss_space(src, dest, board.tall_ss);
    swap_ss_space(src, dest, board.passive_burn_ss);
    swap_ss_space(src, dest, board.burn_immune_ss);
    for (let a = 0; a < game_data.all_pieces.length; a++) {
        swap_ss_space(src, dest, board.piece_ss[a]);
    }
    board.has_moved_ss.set_on(src);
    board.has_moved_ss.set_on(dest);
}
function clear_space(sq) {
    board.black_ss.set_off(sq);
    board.white_ss.set_off(sq);
    board.solid_ss.set_off(sq);
    board.iron_ss.set_off(sq);
    board.tall_ss.set_off(sq);
    board.passive_burn_ss.set_off(sq);
    board.burn_immune_ss.set_off(sq);
    for (let a = 0; a < game_data.all_pieces.length; a++) {
        board.piece_ss[a].set_off(sq);
    }
}
function swap_ss_space(src, dest, ss) {
    let temp = ss.get(src);
    ss.set(src, ss.get(dest));
    ss.set(dest, temp);
}
//Returns ID of piece at given square
function identify_piece(sq, brd) {
    if (brd === undefined) {
        brd = board;
    }
    for (let a = 0; a < game_data.all_pieces.length; a++) {
        if (brd.piece_ss[a].get(sq)) {
            return a;
        }
    }
    return -1;
}
