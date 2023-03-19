function start_game(json_data) {
    game_data = JSON.parse(JSON.stringify(json_data));
    if (game_data.name === undefined) { console.error("Variant must have a name"); return; }
    if (game_data.description === undefined) { game_data.description = ""; }
	if (game_data.width === undefined) { game_data.width = 8; }
    if (game_data.height === undefined) { game_data.height = 8; }
    let size = game_data.width * game_data.height;
	if (game_data.has_hand === undefined) { game_data.has_hand = false; }
	if (game_data.turn_list === undefined) { game_data.turn_list = [false, true]; }
	if (game_data.flip_colors === undefined) { game_data.flip_colors = false; }
	if (game_data.can_pass === undefined) { game_data.can_pass = false; }
	if (game_data.wins === undefined) { game_data.wins = [ends.royal_capture]; }
	if (game_data.draws === undefined) { game_data.draws = [ends.stalemate]; }
	if (game_data.next_turn_win === undefined) { game_data.next_turn_win = false; }
	if (game_data.all_pieces === undefined) { console.error("Piece data must be defined"); return; }
    if (game_data.setup === undefined) { console.error("Piece setup must be defined"); return; } //This remails a string
    if (game_data.starting_hands === undefined) { game_data.starting_hands = { white: [], black: [] }; }
    if (game_data.castle_length === undefined) { game_data.castle_length = 2; }
    //Name-based hand filling
    else if (isNaN(game_data.starting_hands.white[0]) || isNaN(game_data.starting_hands.black[0])) {
        let new_white = [], new_black = [];
        for (let a = 0; a < game_data.all_pieces.length; a++) {
            new_white.push(0);
            new_black.push(0);
        }
        for (let a = 0; a < game_data.starting_hands.white.length; a++) {
            let id = name_to_piece_id(game_data.starting_hands.white[a]);
            if (id >= 0) {
                new_white[id]++;
            }
        }
        for (let a = 0; a < game_data.starting_hands.black.length; a++) {
            let id = name_to_piece_id(game_data.starting_hands.black[a]);
            if (id >= 0) {
                new_black[id]++;
            }
        }
        game_data.starting_hands = { white: new_white, black: new_black };
    }
    //Make sure all pieces have a hand index
    for (let a = game_data.starting_hands.white.length; a < game_data.all_pieces.length; a++) {
        game_data.starting_hands.white.push(0);
    }
    for (let a = game_data.starting_hands.black.length; a < game_data.all_pieces.length; a++) {
        game_data.starting_hands.black.push(0);
    }
    if (game_data.copy === undefined) { game_data.flip = ""; }

    for (let a = 0; a < game_data.all_pieces.length; a++) {
        let piece = game_data.all_pieces[a];
        if (piece.name === undefined) { console.error("All pieces must be named"); return; }
        if (piece.symbol === undefined) { console.error("All pieces must have symbols"); return; }
        if (piece.move === undefined) { console.error("All pieces must have moves"); return; }
        if (piece.description === undefined) { piece.description = ""; }
        if (piece.sprite === undefined) {
            piece.sprite = "";
            piece.use_symbol = true;
        } else {
            piece.use_symbol = false;
        }
        if (piece.promotions === undefined) { piece.promotions = []; }
        if (piece.attributes === undefined) { piece.attributes = []; }
        if (piece.held_piece === undefined) { piece.held_piece = -1; }
        if (piece.held_move) { piece.held_move = string_to_mol_num(piece.held_move, mols); }
        else { piece.held_move = 0; }
    }
    //Held pieces - string to id
    for (let a = 0; a < game_data.all_pieces.length; a++) {
        game_data.all_pieces[a].held_piece = name_to_piece_id(game_data.all_pieces[a].held_piece);
    }
    //Piece upgrades - string to id
    for (let p = 0; p < game_data.all_pieces.length; p++) {
        let piece = game_data.all_pieces[p];
        for (let a = 0; a < piece.promotions.length; a++) {
            let new_to = [];
            for (let b = 0; b < piece.promotions[a].to.length; b++) {
                let tob = piece.promotions[a].to[b];
                if (tob === "NSNR") { //Non-self non-royal
                    for (let c = 0; c < game_data.all_pieces.length; c++) {
                        if (c != p && !game_data.all_pieces[c].attributes.includes(attrib.royal)) {
                            new_to.push(c);
                        }
                    }
                    continue;
                }
                else {
                    let id = name_to_piece_id(tob);
                    if (id >= 0) {
                        new_to.push(id);
                    }
                }
            }
            piece.promotions[a].to = new_to;
        }
    }

    if (game_data.active_squares === undefined) { game_data.active_squares = new squareset(size, 1); }
    else { game_data.active_squares = squareset_from_string(size, game_data.active_squares); } //Convert string to SS
    if (game_data.zones === undefined) { game_data.zones = []; }
    else {
        for (let a = 0; a < game_data.zones.length; a++) {
            game_data.zones[a] = squareset_from_string(size, game_data.zones[a]);
        }
    }

    if (game_data.mud === undefined) { game_data.mud = new squareset(size, 0); }
    else { game_data.mud = squareset_from_string(size, game_data.mud); } //Convert string to SS
    if (game_data.sanctuary === undefined) { game_data.sanctuary = new squareset(size); }
    else { game_data.sanctuary = squareset_from_string(size, game_data.sanctuary); } //Convert string to SS
    if (game_data.etherial === undefined) { game_data.etherial = new squareset(size); }
    else { game_data.etherial = squareset_from_string(size, game_data.etherial); } //Convert string to SS
    if (game_data.pacifist === undefined) { game_data.pacifist = new squareset(size); }
    else { game_data.pacifist = squareset_from_string(size, game_data.pacifist); } //Convert string to SS
    if (game_data.fischer_zones === undefined) { game_data.fischer_zones = []; }
	
    let bnb_ep = bnb_ep_squaresets(game_data.width, game_data.height, game_data.active_squares);
    game_data.bnb_ss = bnb_ep.bnb_ss;//JSON.parse(JSON.stringify(bnb_ep.bnb_ss));
    game_data.ep_ss = bnb_ep.ep_ss;//JSON.parse(JSON.stringify(bnb_ep.ep_ss));
    /*for (let a = 0; a < game_data.width * game_data.height; a++) {
        for (let b = 0; b < game_data.width * game_data.height; b++) {
        }
    }*/
    game_data.uses_burns = false;

    board = {
        turn_pos: 0,
        turn: game_data.turn_list[0],
        turn_count: 1,
        last_moved_src: -1,
        last_moved_dest: -1,

        is_piece_locked: false,
        promotion_locked: false,
        piece_locked_pos: -1,

        piece_ss: [],
        white_ss: new squareset(size),
        black_ss: new squareset(size),
        solid_ss: new squareset(size),
        iron_ss: new squareset(size),
        tall_ss: new squareset(size),
        passive_burn_ss: new squareset(size),
        burn_immune_ss: new squareset(size),
        constant_spawn_ss: new squareset(size),

        can_move_ss: [],
        has_moved_ss: new squareset(size),
        ep_mask: new squareset(size),

        copycat_memory: -1, //piece id
        hands: JSON.parse(JSON.stringify(game_data.starting_hands)),

        royals_killed: { white: 0, black: 0 },
        victory: -1 //0 - White, 0.5 - Draw, 1 - Black, -1 - Undefined
    };
    temp_data = {
        selected: false,
        selected_position: -1,
        mouse_pressed: false, //Not needed?
        waiting_for_promotion: false,
        promotions: [],
        move_to: -1,
        hand_selected: false,
        selected_side: false
    }

    for (let a = 0; a < game_data.all_pieces.length; a++) {
        board.piece_ss.push(new squareset(size));
    }
    for (let a = 0; a < size; a++) {
        board.can_move_ss.push(new squareset(size));
    }
    //Read piece string and place pieces
    for (let a = 0, pos = 0; a < game_data.setup.length; a++) {
        let char = game_data.setup[a];
        if (["b", "w", "n"].includes(char.toLowerCase())) {
            let col = char.toLowerCase();
            a++;
            let piece = game_data.all_pieces.indexOf(game_data.all_pieces.find(piece => piece.symbol === game_data.setup[a]));
            if (piece === -1) {
                continue;
            }
            set_piece_space(piece, col, pos, true);
            pos++;
        }
        else if (char === ".") {
            pos++;
        }
        else if (char<="9" && char>="0") {
            //Find the whole number
            let num = parseInt(char);
            a++;
            while (game_data.setup[a]<="9" && game_data.setup[a]>="0") {
                num *= 10;
                num += parseInt(game_data.setup[a]);
                a++;
            }
            //Find the next char - should be b, w, n, or .
            if (game_data.setup[a] === ".") {
                pos += num;
            } else if (["b", "w", "n"].includes(game_data.setup[a].toLowerCase())) {
                let col = game_data.setup[a].toLowerCase();
                a++;
                let piece = game_data.all_pieces.indexOf(game_data.all_pieces.find(piece => piece.symbol === game_data.setup[a]));
                if (piece === -1) {
                    continue;
                }
                for (let b = 0; b < num; b++) {
                    set_piece_space(piece, col, pos, true);
                    pos++;
                }
            }
        }
    }
    //Flip or rotate the board
    if (game_data.copy === "flip" || game_data.copy === "rotate") {
        let placed_pieces = ss_or(board.white_ss, board.black_ss);
        for (; !placed_pieces.is_zero(); placed_pieces.pop()) {
            let sq_orig = placed_pieces.get_ls1b();
            let sq = game_data.width * game_data.height - sq_orig - 1;
            if (game_data.copy === "flip") {
                sq = (game_data.height - Math.floor(sq_orig / game_data.width) - 1) * game_data.width + (sq_orig % game_data.width);
            }
            if (!board.black_ss.get(sq) && !board.white_ss.get(sq)) {
                let col = (board.black_ss.get(sq_orig) && board.white_ss.get(sq_orig)) ? "n" :
                    board.black_ss.get(sq_orig) ? "w" : "b";
                set_piece_space(identify_piece(sq_orig), col, sq);
            }
        }
    }

    let all_molecules = [];
    //Set all piece's moves, and update all_molecules
    for (let a = 0; a < game_data.all_pieces.length; a++) {
        game_data.all_pieces[a].move = string_to_move(game_data.all_pieces[a].move, all_molecules);
    }
    //Set move ss
    game_data.move_ss = [];
    for (let a = 0; a < all_molecules.length; a++) {
        game_data.move_ss.push(generate_move_ss(all_molecules[a]));
    }
    //Load all piece sprites
    for (let a = 0; a < game_data.all_pieces.length; a++) {
        add_image("pieces", game_data.all_pieces[a].sprite);
    }
    //Style data
    if (game_data.flip_colors) { style_data.flip_colors = true; }

    fix_canvas_height();
    refresh_moves();
    move_history = [];
    board_history = [cloneBoard()];
    view_move = 0;
    render_board();
    render_extras();
    //The sprites might not be loaded yet, reload every 50ms for the next half second
    for (let a = 1; a < 11; a++) {
        setTimeout(() => { render_board(); }, 50*a);
    }
}

//Converts id, name, or symbol to id
function name_to_piece_id(name) {
    if (typeof (name) === "number") {
        return name;
    }
    else if (typeof (name) === "string") {
        let num = game_data.all_pieces.findIndex(e => e.name === name);
        if (num >= 0) {
            return num;
        }
        //Look for any pieces with symbol tob
        num = game_data.all_pieces.findIndex(e => e.symbol === name);
        if (num >= 0) {
            return num;
        }
    }
    return -1;
}

function cloneBoard(brd) {
    if (brd === undefined) {
        brd = board;
    }
    let ret = JSON.parse(JSON.stringify(brd));
    Object.setPrototypeOf(ret.black_ss, squareset.prototype);
    Object.setPrototypeOf(ret.white_ss, squareset.prototype);
    Object.setPrototypeOf(ret.solid_ss, squareset.prototype);
    Object.setPrototypeOf(ret.ep_mask, squareset.prototype);
    Object.setPrototypeOf(ret.has_moved_ss, squareset.prototype);
    Object.setPrototypeOf(ret.iron_ss, squareset.prototype);
    Object.setPrototypeOf(ret.tall_ss, squareset.prototype);
    Object.setPrototypeOf(ret.passive_burn_ss, squareset.prototype);
    Object.setPrototypeOf(ret.burn_immune_ss, squareset.prototype);
    for (let a = 0; a < ret.can_move_ss.length; a++) {
        Object.setPrototypeOf(ret.can_move_ss[a], squareset.prototype);
    }
    for (let a = 0; a < ret.piece_ss.length; a++) {
        Object.setPrototypeOf(ret.piece_ss[a], squareset.prototype);
    }
    return ret;
}

//Process the entire move string
function string_to_move(string, mols) {
    let steps = string.split(">");
    let move = [];
    for (let a = 0; a < steps.length; a++) {
        move.push([]);
        let terms = steps[a].split("+");
        for (let b = 0; b < terms.length; b++) {
            let this_term = string_to_term(terms[b], mols);
            move[a].push(this_term);
        }
    }
    return move;
}

function string_to_mol_num(string, mols) {
    if (!mols.includes(string)) {
        mols.push(string);
        return mols.length - 1;
    }
    return mols.findIndex(e => e === string);
}

//Process a single component of the move string
function string_to_term(string, mols) {
    //Updates mols and returns term array
    let term = [];
    let repeat = -1; //Position in the term array where it loops to; -1 for no loop
    for (let a = 0; a < string.length; a++) {
        //Find molecules
        if (string[a] === "(" || string[a] === "[") {
            let end_char = (string[a] === "(") ? ")" : "]";
            let t_mol = "";
            while (a < string.length && string[a] != end_char) {
                t_mol += string[a];
                a++;
            }
            t_mol += end_char;
            if (!mols.includes(t_mol)) {
                mols.push(t_mol);
                term.push({ type: "mol", data: mols.length - 1 });
            } else {
                term.push({ type: "mol", data: mols.findIndex(e => e === t_mol) });
            }
        }
        else if (string[a] === "U") {
            if (!mols.includes("U")) {
                mols.push("U");
                term.push({ type: "mol", data: mols.length - 1 });
            } else {
                term.push({ type: "mol", data: mols.findIndex(e => e === "U") });
            }
        }
        //Pre-conditions
        //Data is break condition
        else if (string[a] === "T") {
            let num = get_1_num(string, a + 1);
            term.push({ type: "pre", data: () => { return (board.turn_count <= num.num); } });
            a = num.pos;
        }
        else if (string[a] === "t") {
            let num = get_1_num(string, a + 1);
            term.push({ type: "pre", data: () => { return (board.turn_count >= num.num); } });
            a = num.pos;
        }
        else if (string[a] === "i") { term.push({ type: "pre",
            data: (col, pos) => { return board.has_moved_ss.get(pos); } }); }
        else if (string[a] === "z") {
            let nums = get_2_nums(string, a + 1);
            term.push({type: "pre", data: (col, pos) => { return !game_data.zones[col ? nums.num2 : nums.num1].get(pos); } });
            a = nums.pos;
        }
        //Post-conditions
        //Data is a lambda that returns all squares it can't land on
        else if (string[a] === "a") { term.push({ type: "post", 
            data: (col) => { return col ? board.black_ss : board.white_ss } }); }
        else if (string[a] === "e") { term.push({ type: "post", 
            data: (col) => { return col ? board.white_ss : board.black_ss } }); }
        else if (string[a] === "b") { term.push({ type: "post", 
            data: () => { return ss_or(board.white_ss, board.black_ss).inverse() } }); }
        else if (string[a] === "c") { term.push({ type: "post", 
            data: () => {return ss_and(ss_or(board.white_ss, board.black_ss).inverse(), board.ep_mask.inverse());} }); }
        else if (string[a] === "P") {
            let piece_data = pieces_in_bracket(string, a + 1);
            let data = lambda_on_pieces(piece_data.pieces, true);
            term.push({ type: "post", data: data });
            a = piece_data.pos;
        }
        else if (string[a] === "p") {
            let piece_data = pieces_in_bracket(string, a + 1);
            let data = lambda_on_pieces(piece_data.pieces, false);
            term.push({ type: "post", data: data });
            a = piece_data.pos;
        }
        else if (string[a] === "m") { term.push({ type: "post", 
            data: () =>  {return ss_and(ss_or(board.white_ss, board.black_ss), board.has_moved_ss)}}); }
        else if (string[a] === "B") {
            term.push({
                type: "post", data: (col, pos, current_moves) => {
                    let ret = new squareset(game_data.width * game_data.height);
                    let stoppers = new squareset(ss_and(ss_or(ss_and(board.solid_ss, game_data.etherial.inverse()), game_data.mud), current_moves));
                    for (; !stoppers.is_zero(); stoppers.pop()) {
                        ret.ore(game_data.bnb_ss[pos][stoppers.get_ls1b()]);
                    }
                    return ret;
                }
            });
        }
        else if (string[a] === "Z") {
            let nums = get_2_nums(string, a + 1);
            term.push({
                type: "post", data: (col, pos) => {
                    let zone = col ? game_data.zones[nums.num2] : game_data.zones[nums.num1];
                    return zone.get(pos) ? zone.inverse() : new squareset(game_data.width * game_data.height);
                }
            });
            a = nums.pos;
        }
        else if (string[a] === "O") {
            let nums = get_2_nums(string, a + 1);
            term.push({ type: "post", data: (col) => { return col? game_data.zones[nums.num2] : game_data.zones[nums.num1] } });
            a = data.pos;
        }
        //Misc
        else if (string[a] === "s") { term.push({ type: "stop"}); }
        else if (string[a] === "-") { term.push({ type: "sub"}); }
        else if (string[a] === "^") { repeat = term.length; }
    }
    //If the term had a ^, add repeat to the term
    if (repeat > -1) {
        term.push({ type: "rep", data: repeat });
    }
    return term;
}

function get_2_nums(string, start_at) {
    let data = words_in_bracket(string, start_at);
    let nums = [];
    for (let a = 0; a < data.words.length; a++) {
        if (!isNaN(data.words[a])) {
            nums.push(Number(data.words[a]));
        }
    }
    return { num1: nums[0], num2: nums[1], pos: data.pos };
}
function get_1_num(string, start_at) {
    let data = words_in_bracket(string, start_at);
    for (let a = 0; a < data.words.length; a++) {
        if (!isNaN(data.words[a])) {
            return { num: Number(data.words[a]), pos: data.pos };
        }
    }
    return { num: -1, pos: data.pos };
}

function lambda_on_pieces(pieces, inverse) {
    let data;
    if (pieces.length === 1) {
        data = () => {
            return inverse ? board.piece_ss[pieces[0]].inverse() : board.piece_ss[pieces[0]];
        };
    } else if (pieces.length > 1) {
        data = () => {
            let ret = new squareset(game_data.width * game_data.height);
            for (let a = 0; a < pieces.length; a++) {
                ret.ore(board.piece_ss[pieces[a]]);
            }
            return inverse ? ret.inverse() : ret;
        }
    } else {
        data = () => { return new squareset(game_data.width * game_data.height, inverse? 1 : 0) };
    }
    return data;
}

function pieces_in_bracket(string, start_at) {
    let all_words = words_in_bracket(string, start_at);
    let pieces = [];
    for (let b = 0; b < all_words.words.length; b++) {
        let piece_id = game_data.all_pieces.findIndex(p => p.name === all_words.words[b]);
        if (piece_id < 0) {
            piece_id = game_data.all_pieces.findIndex(p => p.symbol === all_words.words[b])
        }
        if (piece_id >= 0) {
            pieces.push(piece_id);
        }
    }
    return { pieces: pieces, pos: all_words.pos };
}

function words_in_bracket(string, start_at) {
    //Find start and end
    let open = -1, close = -1;
    for (let a = start_at; a < string.length; a++) {
        if (string[a] === "{" && open < 0) {
            open = a;
        }
        if (string[a] === "}" && open >= 0) {
            close = a;
            break;
        }
    }
    let in_brackets = string.substr(open + 1, close - open - 1);
    console
    let words = in_brackets.split(" ");
    return { words: words, pos: close };
}

function read_number(string, pos) {
    //Get to the first digit (or -)
    while (pos < string.length && (string[pos] < "0" || string[pos] > "9")
        && !(string[pos] === "-" && pos < string.length - 1 && string[pos + 1] >= 0 && string[pos + 1] <= "9")) {
        pos++;
    }
    let isNegative = false;
    if (string[pos] === "-") {
        pos++;
        isNegative = true;
    }
    let num = string[pos] - "0";
    pos++;
    //Read all subsequent digits
    while (pos < string.length && string[pos] >= "0" && string[pos] <= "9") {
        num *= 10;
        num += string[pos] - "0";
        pos++;
    }
    //Return the number you read, and the position of the first non-digit
    return { num: isNegative ? -num : num, pos: pos };
}

function generate_move_ss(string_orig) {
    let string = string_orig;
    //Replace all letters with the correct numbers
    string = string.replaceAll("[0]", "[0 0 1 1]");
    string = string.replaceAll("[W]", "[1 0 4 1]");
    string = string.replaceAll("[F]", "[1 1 4 1]");
    string = string.replaceAll("[D]", "[2 0 4 1]");
    string = string.replaceAll("[N]", "[2 1 8 1]");
    string = string.replaceAll("[A]", "[2 2 4 1]");
    string = string.replaceAll("[H]", "[3 0 4 1]");
    string = string.replaceAll("[C]", "[3 1 8 1]");
    string = string.replaceAll("[Z]", "[3 2 8 1]");
    string = string.replaceAll("[G]", "[3 3 4 1]");
    string = string.replaceAll("[K]", "[1 1 8 1]");
    string = string.replaceAll("[B]", "[1 1 4 -1]");
    string = string.replaceAll("[R]", "[1 0 4 -1]");
    string = string.replaceAll("[Q]", "[1 1 8 -1]");

    let ret = [];
    if (string === "U") {
        //Every element is a shallow copy of all active squares on the board
        //return JSON.parse(JSON.stringify(game_data.active_squares));
        for (let a = 0; a < game_data.width * game_data.height; a++) {
            ret.push([]);
            for (let b = 0; b < 8; b++) {
                ret[a].push(game_data.active_squares);
            }
        }
    } else if (string.includes("(")) {
        //Add up several get_slide_ss calls
        let move_list = string.substr(1, string.length - 2).split(",");
        for (let pos = 0; pos < game_data.width * game_data.height; pos++) {
            let pos_x = pos % game_data.width;
            let pos_y = Math.floor(pos / game_data.width);
            ret.push([]);
            for (let angle = 0; angle < 8; angle++) {
                ret[pos].push(new squareset(game_data.width*game_data.height));
                for (let a = 0; a < move_list.length; a++) {
                    let nums = move_list[a].substr(1, move_list[a].length - 2).split(" ");
                    ret[pos][angle].ore(get_slide_ss(pos_x, pos_y, nums[0]-"0", nums[1]-"0", angle, nums[2]-"0", nums[3]-"0"));
                }
            }
        }
    } else {
        //Add one get_slide_ss to the array
        let nums = string.substr(1, string.length - 2).split(" ");
        for (let pos = 0; pos < game_data.width * game_data.height; pos++) {
            let pos_x = pos % game_data.width;
            let pos_y = Math.floor(pos / game_data.width);
            ret.push([]);
            for (let angle = 0; angle < 8; angle++) {
                ret[pos].push(get_slide_ss(pos_x, pos_y, nums[0]-"0", nums[1]-"0", angle, nums[2]-"0", nums[3]-"0"));
            }
        }
    }
    return ret;
}

function set_piece_space(piece, col, pos, apply_fischer = false) {
    //If this is a fischer random space, set its position randomly
    if (apply_fischer) {
        let my_fischer_zone = new squareset(game_data.width * game_data.height);
        for (let a = 0; a < game_data.fischer_zones.length; a++) {
            if (game_data.zones[game_data.fischer_zones[a]].get(pos)) {
                my_fischer_zone.ore(game_data.zones[game_data.fischer_zones[a]]);
            }
        }
        my_fischer_zone.ande(ss_or(board.white_ss, board.black_ss).inverse());
        if (!my_fischer_zone.is_zero()) {
            //Find a random bit in my_fischer_zone and set pos to it
            let possible_squares = [];
            for (let a = 0; a < game_data.width * game_data.height; a++) {
                if (my_fischer_zone.get(a)) {
                    possible_squares.push(a);
                }
            }
            pos = possible_squares[Math.floor(Math.random() * possible_squares.length)];
        }
    }

    board.piece_ss[piece].set_on(pos);
    if (col === "w" || col === "n") {
        board.white_ss.set_on(pos);
    }
    if (col === "b" || col === "n") {
        board.black_ss.set_on(pos);
    }
    let attributes = game_data.all_pieces[piece].attributes;
    if (!attributes.includes(attrib.ghost)) {
        board.solid_ss.set_on(pos);
    }
    if (attributes.includes(attrib.iron)) {
        board.iron_ss.set_on(pos);
    }
    if (attributes.includes(attrib.tall)) {
        board.tall_ss.set_on(pos);
    }
    if (attributes.includes(attrib.burn_passive)) {
        board.passive_burn_ss.set_on(pos);
    }
    if (attributes.includes(attrib.burn_immune)) {
        board.burn_immune_ss.set_on(pos);
    }
}

function load_variant_dropdown() {
    start_game(preset_variants
        [document.getElementById("categoryField").value]
        [document.getElementById('variantField').value]);
}
