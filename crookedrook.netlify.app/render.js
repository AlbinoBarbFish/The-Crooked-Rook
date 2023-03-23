function render_board(){
    let c = document.getElementById("board_canvas");
    let ctx = c.getContext("2d");

    //Set up some variables
    let width_px = c.width / game_data.width; //Width and height should be the same
    let height_px = c.height / (game_data.height + (game_data.has_hand ? 2 : 0)); //(they should be squares)
    //let square_x = Math.floor(mouse_pos.x / width_px);
    //let square_y = Math.floor(mouse_pos.y / height_px);
    let square_x = mouse_sq_pos.x;
    let square_y = mouse_sq_pos.y;

    let brd = board_history[view_move];

    //Clear with background color
    ctx.fillStyle = style_data.bg_col;
    ctx.fillRect(0, 0, c.width, c.height);

    //Draw the squares
    let file = (num) => { return String.fromCharCode(97 + num); };
    let rank = (num) => { return game_data.height - num; }
    for (let a = 0; a < game_data.width; a++) {
        for (let b = 0; b < game_data.height; b++) {
            if (!on_board(a, b)) { continue; }
            let is_dark = (a + b + style_data.flip_colors) % 2;
            let sq = b * game_data.width + a;
            if (game_data.mud.get(sq)) { ctx.fillStyle = is_dark ? style_data.dark_mud_col : style_data.light_mud_col; }
            else if (game_data.etherial.get(sq)) { ctx.fillStyle = is_dark ? style_data.dark_etherial_col : style_data.light_etherial_col; }
            else if (game_data.pacifist.get(sq)) { ctx.fillStyle = is_dark ? style_data.dark_pacifist_col : style_data.light_pacifist_col; }
            else if (game_data.sanctuary.get(sq)) { ctx.fillStyle = is_dark ? style_data.dark_sanctuary_col : style_data.light_sanctuary_col; }
            else { ctx.fillStyle = is_dark ? style_data.dark_square_col : style_data.light_square_col; }
            let x = width_px * a, y = height_px * (b + game_data.has_hand)
            if (style_data.flip_board) {
                x = width_px * (game_data.width - a - 1);
                y = height_px * (game_data.height - b - 1 + game_data.has_hand);
            }
            ctx.fillRect(x, y, width_px, height_px);
            //Square names
            if (style_data.name_squares) {
                ctx.font = "12px serif";
                ctx.fillStyle = 'rgb(0,0,0)';
                ctx.fillText(file(a) + rank(b), x + 4, y + 12);
            }
        }
    }
    //Hands
    if (game_data.has_hand) {
        ctx.fillStyle = style_data.hand_col;
        ctx.fillRect(0, 0, c.width, height_px);
        ctx.fillRect(0, c.height-height_px, c.width, height_px);
    }

    //Draw glow on last moved piece
    if (brd.last_moved_src >= 0 && brd.last_moved_dest >= 0) {
        let img = document.getElementById("img_glow");
        draw_on_square(img, brd.last_moved_src);
        draw_on_square(img, brd.last_moved_dest);
    }

    //Draw the pieces
    for (let a = 0; a < game_data.all_pieces.length; a++) {
        let img = document.getElementById("img_" + game_data.all_pieces[a].sprite);
        let neutral_pieces = ss_and(brd.white_ss, brd.black_ss, brd.piece_ss[a]);
        let white_pieces = ss_and(brd.white_ss, brd.black_ss.inverse(), brd.piece_ss[a]);
        let black_pieces = ss_and(brd.white_ss.inverse(), brd.black_ss, brd.piece_ss[a]);
        draw_ss(white_pieces, img, style_data.white_col);
        draw_ss(black_pieces, img, style_data.black_col);
        draw_ss(neutral_pieces, img, style_data.neutral_col);
    }
    //Pieces in hand
    if (game_data.has_hand) {
        let col = 0;
        for (let a = 0; a < brd.hands.white.length; a++) {
            if (brd.hands.white[a] > 0) {
                let img = document.getElementById("img_" + game_data.all_pieces[a].sprite)
                draw_on_hand(img, col, false);
                if (brd.hands.white[a] > 1) {
                    draw_text_on_hand(brd.hands.white[a], col, false);
                }
                col++;
            }
        }
        col = 0;
        for (let a = 0; a < brd.hands.black.length; a++) {
            if (brd.hands.black[a] > 0) {
                let img = document.getElementById("img_" + game_data.all_pieces[a].sprite)
                draw_on_hand(img, col, true);
                if (brd.hands.black[a] > 1) {
                    draw_text_on_hand(brd.hands.black[a], col, true);
                }
                col++;
            }
        }
    }

    //Draw squares indicating possible moves
    if (brd.victory === -1) {
        if (temp_data.hand_selected) {
            draw_ss(ss_and(game_data.active_squares, ss_or(brd.white_ss, brd.black_ss).inverse()), document.getElementById('img_sq_canmove_sel'));
        }
        else if (temp_data.selected) {
            draw_ss(brd.can_move_ss[temp_data.selected_position], document.getElementById('img_sq_canmove_sel'));
        }
        else if ((mouse_sq_pos.y === -1 || mouse_sq_pos.y === game_data.height)) {
            let hover = highlighted_hand_piece(brd);
            if (hover.piece != -1) {
                let type = (hover.color === brd.turn) ? 'img_sq_canmove' : 'img_sq_canmove_turn';
                if(in_multiplayer_game &&  brd.turn != my_col) { type = 'img_sq_canmove_turn'; }
                let ss = ss_and(game_data.active_squares, ss_or(brd.white_ss, brd.black_ss).inverse());
                draw_ss(ss, document.getElementById(type));
            }
        }
        else {
            let highlight = square_x + square_y * game_data.width;
            if (highlight >= 0 && highlight < game_data.width * game_data.height && on_board(square_x, square_y)) {
                let type = 'img_sq_canmove_turn';
                if ((!brd.turn && brd.white_ss.get(highlight)) || (brd.turn && brd.black_ss.get(highlight))) {
                    type = 'img_sq_canmove';
                }
                if(in_multiplayer_game &&  brd.turn != my_col) { type = 'img_sq_canmove_turn'; }
                draw_ss(brd.can_move_ss[highlight], document.getElementById(type));
            }
        }
    }

    //Promotions menu
    if (temp_data.waiting_for_promotion) {
        //Background
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.globalAlpha = 1.0;
        //Border around selectable pieces
        let start_height = c.height / 2 - height_px / 2;
        let start_width = c.width / 2 - height_px * temp_data.promotions.length / 2;
        ctx.fillStyle = 'rgb(0,0,0)';
        let border_width = width_px / 8;
        ctx.fillRect(start_width - border_width, start_height - border_width,
            temp_data.promotions.length * width_px + border_width * 2, height_px + border_width * 2);

        //Selectable pieces
        for (let a = 0; a < temp_data.promotions.length; a++) {
            ctx.fillStyle = (a % 2) ? style_data.dark_square_col : style_data.light_square_col;
            ctx.fillRect(start_width + width_px * a, start_height, width_px, height_px);
            let img = document.getElementById("img_" + game_data.all_pieces[temp_data.promotions[a]].sprite);
            //To do: Set draw color based on piece's color
            draw_sprite(img, start_width + width_px * a, start_height, width_px, height_px);
        }
    }
}

function highlighted_hand_piece(brd) {
    if(brd === undefined) {
        brd = board;
    }
    let hover_side = (mouse_sq_pos.y === -1);
    let real_mouse_x = style_data.flip_board ? (game_data.width - mouse_sq_pos.x - 1) : mouse_sq_pos.x;
    let this_hand = hover_side ? brd.hands.black : brd.hands.white;
    let col = 0;
    let hover_piece = -1;
    for (let a = 0; a < this_hand.length; a++) {
        if (this_hand[a] > 0) {
            if (col === real_mouse_x) {
                hover_piece = a;
            }
            col++;
        }
    }
    return {piece: hover_piece, color: hover_side};
}

function draw_sprite(sprite, x, y, width, height, color) {
    //console.log(sprite);
    let c = document.getElementById("board_canvas");
    let ctx = c.getContext("2d");
    if (!color || color === 'rgb(255,255,255)') {
        ctx.drawImage(sprite, x, y, width, height);
    }
    else {
        let c2 = document.getElementById("blend_canvas");
        let ctx2 = c2.getContext("2d");
        ctx2.clearRect(0, 0, c2.width, c2.height);
        ctx2.drawImage(sprite, 0, 0, width, height);
        ctx2.globalCompositeOperation = "multiply";
        ctx2.fillStyle = color;
        ctx2.fillRect(0, 0, width, height);
        ctx2.globalCompositeOperation = "destination-in";
        ctx2.drawImage(sprite, 0, 0, width, height);
        ctx2.globalCompositeOperation = "source-over";
        ctx.drawImage(c2, 0, 0, width, height, x, y, width, height);
    }
}

function render_extras() {
    //Turn indicator
    let ti = document.getElementById("turn_indicator");
    ti.innerHTML = board_history[view_move].turn ? "Turn: Black" : "Turn: White";
    //Win indicator
    if (board_history[view_move].victory != -1) {
        switch (board_history[view_move].victory) {
            case 0:
            case false:
                ti.innerHTML += "; Winner: White";
                break;
            case 0.5:
                ti.innerHTML += "; Winner: Draw";
                break;
            case 1:
            case true:
                ti.innerHTML += "; Winner: Black";
                break;
        }
    }

    //Name and Description
    document.getElementById("board_name_header").innerHTML = game_data.name;
    document.getElementById("board_description_header").innerHTML = game_data.description;

    //Move history
    let hist_div = document.getElementById("move_history");
    hist_div.innerHTML = "";
    /*let file = (num) => { return String.fromCharCode(97 + num); };
    let rank = (num) => { return game_data.height - num; }
    let move_to_string = (move) => {
        return "" + file(move.x1) + rank(move.y1) + "→" + file(move.x2) + rank(move.y2);
    };*/
    let num = 1, row = "";
    for (let a = 0; a < move_history.length; a++) {
        if (move_history[a].turn != num) {
            hist_div.innerHTML += "<p>" + num + " - " + row + "</p>";
            num++;
            row = "";
        }
        let inner_p = move_history[a].notation;//move_to_string(move_history[a]);
        if (a === view_move - 1) {
            inner_p = "<b>" + inner_p + "</b>";
        }
        row += inner_p + "&emsp;";
    }
    if (row != "") {
        hist_div.innerHTML += "<p>" + num + " - " + row + "</p>";
        num++;
        row = "";
    }

    //Multiplayer stuff
    if (in_multiplayer_game) {
        document.getElementById("multiplayer_label").innerHTML = "Mode: Multi-player";
        if(my_name != undefined && opp_name != undefined) {
            let white_name = "White: " + (my_col ? opp_name : my_name);
            let black_name = "Black: " + (my_col ? my_name : opp_name);
            document.getElementById("top_player_label").style.display = "block";
            document.getElementById("bottom_player_label").style.display = "block";
            document.getElementById("top_player_label").innerHTML = style_data.flip_board ? white_name : black_name;
            document.getElementById("bottom_player_label").innerHTML = style_data.flip_board ? black_name : white_name;
        }
        else {
            document.getElementById("top_player_label").style.display = "none";
            document.getElementById("bottom_player_label").style.display = "none";
        }
        document.getElementById("choose_section").style.display = "none";
        document.getElementById("resign_btn").style.display = "block";
    }
    else {
        document.getElementById("multiplayer_label").innerHTML = "Mode: Single-player";
        document.getElementById("top_player_label").style.display = "none";
        document.getElementById("bottom_player_label").style.display = "none";
        document.getElementById("choose_section").style.display = "block";
        document.getElementById("resign_btn").style.display = "none";
    }
}

function draw_on_square(img, pos1, pos2) {
    let c = document.getElementById("board_canvas");
    let ctx = c.getContext("2d");
    //If only sq position is given, set square based on that
    let sq = pos1;
    //If x and y coords are given, set square based on that
    if (pos2 != undefined) {
        sq = pos2 * game_data.width * pos1;
    }
    //Set size data
    let width_px = canvas.width / game_data.width;
    let height_px = canvas.height / (game_data.height + (game_data.has_hand ? 2 : 0));
    //Find x and y coordinates, depending on if the board is flipped
    let pos_x = width_px * (sq % game_data.width);
    let pos_y = height_px * (Math.floor(sq / game_data.width) + game_data.has_hand);
    if (style_data.flip_board) {
        pos_x = width_px * (game_data.width - (sq % game_data.width) - 1);
        pos_y = height_px * (game_data.height - Math.floor(sq / game_data.width) - 1 + game_data.has_hand);
    }
    draw_sprite(img, pos_x, pos_y, width_px, height_px);
}

function draw_on_hand(img, x, is_black) {
    let side = style_data.flip_board ? !is_black : is_black;
    //Set size data
    let width_px = canvas.width / game_data.width;
    let height_px = canvas.height / (game_data.height + (game_data.has_hand ? 2 : 0));
    //Find x and y coordinates
    let pos_x = x * width_px;
    let pos_y = side ? 0 : canvas.height - height_px;
    draw_sprite(img, pos_x, pos_y, width_px, height_px, is_black ? style_data.black_col : style_data.white_col);
}

function draw_text_on_hand(txt, x, is_black) {
    let c = document.getElementById("board_canvas");
    let ctx = c.getContext("2d");
    if (style_data.flip_board) { is_black ^= 1; }
    //Set size data
    let width_px = canvas.width / game_data.width;
    let height_px = canvas.height / (game_data.height + (game_data.has_hand ? 2 : 0));
    //Find x and y coordinates
    let pos_x = x * width_px;
    let pos_y = is_black ? 0 : canvas.height - height_px;
    ctx.font = "12px serif";
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillText(txt, pos_x + 4, pos_y + 12);
}

function draw_ss(ss, img, col) {
    let width_px = canvas.width / game_data.width;
    let height_px = canvas.height / (game_data.height + (game_data.has_hand ? 2 : 0));
    for (let a = 0; a < Math.min(ss.length, game_data.width * game_data.height); a++) {
        if (ss.get(a)) {
            let pos_x = width_px * (a % game_data.width);
            let pos_y = height_px * (Math.floor(a / game_data.width) + game_data.has_hand);
            if (style_data.flip_board) {
                pos_x = width_px * (game_data.width - (a % game_data.width) - 1);
                pos_y = height_px * (game_data.height - Math.floor(a / game_data.width) - 1 + game_data.has_hand);
            }
            draw_sprite(img, pos_x, pos_y, width_px, height_px, col);
        }
    }
}

function print_ss(ss, width) {
    let ret = "";
    if (width === undefined) {
        width = game_data.width;
    }
    for (let a = 0; a < ss.length; a++) {
        ret += ss.get(a) ? "1" : "0";
        if ((a + 1) % width === 0) {
            ret += "\n";
        }
    }
    console.log(ret)
} 

function export_history() {
    let ret = game_data.name + "," + game_data.seed;
    for (let a = 0; a < move_history.length; a++) {
        if (move_history[a].drop) {
            ret += "[" + move_history[a].piece + "," + Number(move_history[a].color) + "," + move_history[a].dest + "]";
        }
        else {
            let prom = move_history[a].promotion === undefined ? "" : "," + move_history[a].promotion;
            ret += "[" + move_history[a].x1 + "," + move_history[a].y1 + "," + move_history[a].x2 + "," + move_history[a].y2 + prom + "]";
        }
    }
    return ret;
} 
function import_history(history) {
    for (let a = 0; a < history.length; a++) {
        if (history[a] === "[") {
            //Find the closing bracket
            let end = a;
            while (history[end] != "]") {
                end++;
            }
            //Read the four numbers
            let nums = history.substr(a + 1, end - a - 1).split(",");
            for (let a = 0; a < nums.length; a++) {
                nums[a] = Number(nums[a]);
            }
            if (nums.length === 3) {
                make_drop_move(nums[0], nums[1], nums[2]);
            }
            if (nums.length === 4) {
                make_move(nums[0], nums[1], nums[2], nums[3]);
            }
            else if (nums.length === 5) {
                make_move(nums[0], nums[1], nums[2], nums[3], nums[4]);
            }
        }
    }
}