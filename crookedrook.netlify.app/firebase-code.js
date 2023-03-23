let verbose_db_set = false; 
let verbose_db_get = false;
//This is just an estimate and doesn't include overhead
let total_bytes_fetched = 0;

let stored_boards = localStorage.getItem("boards") ?? [];
if(typeof(stored_boards) === "string") {
    stored_boards = JSON.parse(stored_boards);
}
let stored_name = localStorage.getItem("name") ?? "Guest";

function show_db_set(message) {
    if (verbose_db_set) {
        console.log("db_set: "+message);
    }
}
function show_db_get(message, data) {
    let len = JSON.stringify(data).length;
    total_bytes_fetched += len;
    if(verbose_db_get) {
        console.log(`db_get: ${message} (size: ${len}, total: ${total_bytes_fetched})`);
    }
}
//Todo: Make these show up on the website
function show_error(message) {
    console.error(message);
}
function show_message (message) {
    console.log(message);
}

let all_boards_ref = firebase.database().ref(`boards`);
function set_board(board_name, seed) {
    if(seed === undefined) {
        seed = cyrb128(time_as_string())[0];
    }
    let my_board = stored_boards.find(e => e.name === board_name);
    if (my_board) {
        start_game(my_board.board, seed);
        return;
    }
    all_boards_ref.child(board_name).once("value", (snapshot) => {
        let this_board = snapshot.val();
        stored_boards.push({name: board_name, board: JSON.parse(JSON.stringify(this_board))});
        localStorage.setItem("boards", JSON.stringify(stored_boards));
        show_db_get(`Getting boards/${board_name}`, this_board);
        if (!this_board) {
            show_error("Trying to start a non-existent board");
        }
        start_game(this_board, seed);
    });
}

let all_matches;
let all_matches_ref;

let user_id;
let user_ref;
let this_user;

let in_multiplayer_game = false;
let my_lobby_ref;
let my_match_ref;
let my_match;
let my_col;
let my_name, opp_name;
let my_match_data, other_match_data;
let my_ver_ref, other_ver_ref;
let my_prop_ref, other_prop_ref;
let my_res_ref, other_res_ref;
let my_prop;

function import_history_firebase(history) {
    let name_and_seed = history.substring(0, history.indexOf("[")).split(",");
    all_boards_ref.child(name_and_seed[0]).once("value", (snapshot) => {
        start_game(snapshot.val(), Number(name_and_seed[1]));
        import_history(history.substring(history.indexOf("[")));
    });
}

function multiplayer_make_move(src_x, src_y, dst_x, dst_y, prom) {
    if(!in_multiplayer_game) {
        show_error("Trying to make multiplayer move when not in a room");
    }
    let data = {src_x, src_y, dst_x, dst_y};
    if(prom != undefined) {
        data.prom = prom;
    }
    show_db_set("Setting my_prop (move)");
    my_prop_ref.set(data);
    my_prop = data;
}

function multiplayer_make_drop(piece, color, dest) {
    if(!in_multiplayer_game) {
        show_error("Trying to make multiplayer drop when not in a room");
    }
    let data = {piece, color, dest};
    show_db_set("Setting my_prop (drop)");
    my_prop_ref.set(data);
    my_prop = data;
}

function resign() {
    if(in_multiplayer_game && my_res_ref) {
        show_db_set("Setting my resign");
        my_res_ref.set(true);
        board_history[board_history.length-1].victory = !my_col;
        switch_to_single_player();
    }
}

//Pulls name automatically from name_input field
function set_name() {
    let new_name = document.getElementById("name_input").value;
    if(typeof(new_name) != "string" || new_name.length < 1) {
        show_error("Name must be a non-empty string");
        return;
    }
    show_db_set("Updating my name");
    user_ref.update({name: new_name});
    localStorage.setItem("name", new_name);
}

function close_match() {
    //Todo: Archive the match
    show_db_set("Setting my_match to close the match")
    //Todo: Don't have permission to set this
    my_match_ref.remove();
    switch_to_single_player();
}

function switch_to_single_player() {
    in_multiplayer_game = false;
    my_ver_ref = undefined;
    other_ver_ref = undefined;
    my_prop_ref = undefined;
    other_prop_ref = undefined;
    my_res_ref = undefined;
    other_res_ref = undefined;
    my_prop = undefined;
    my_match = undefined;
    my_match_ref = undefined;
    my_col = undefined;
    render_extras();
}

let on_opp_resign = (snapshot) => {
    show_db_get("Getting opp_resign", snapshot.val());
    if(snapshot.val() === true && in_multiplayer_game) {
        in_multiplayer_game = false;
        show_message("Opponent resigned");
        board_history[board_history.length-1].victory = my_col;
        close_match();
    }
}

let other_prop_change = (snapshot) => {
    let other_prop = snapshot.val();
    show_db_get(`Getting other_prop`, other_prop)
    if (!other_prop) {
        show_db_set("Setting my_ver to empty")
        my_ver_ref.set({});
        return;
    }
    if (other_prop.piece != undefined && other_prop.color != undefined && other_prop.dest != undefined) {
        //Drop move
        let valid = validate_drop(other_prop.piece, other_prop.color, other_prop.dest);
        if (board.turn === my_col || other_prop.color === my_col) {
            valid = false;
        }
        show_db_set("Setting my_ver to verify drop move")
        my_ver_ref.set({valid, piece: other_prop.piece, color: other_prop.color, dest: other_prop.dest});
        if (valid) {
            my_match_ref.child("moves").child(board.turn_count-1).child(board.turn_pos).set(other_prop);
            make_drop_move(other_prop.piece, other_prop.color, other_prop.dest);
            if(find_victory() >= 0) {
                switch_to_single_player();
            }
            render_board();
        }
        else {
            //Todo: Report invalid move
            show_message("Opponent attempted invalid drop move, but it was blocked");
        }
    }
    else if (other_prop.src_x != undefined && other_prop.src_y != undefined && other_prop.dst_x != undefined && other_prop.dst_y != undefined) {
        //Move move
        let valid = validate_move(other_prop.src_x, other_prop.src_y, other_prop.dst_x, other_prop.dst_y);
        let src_sq = other_prop.src_x+other_prop.src_y*game_data.width;
        if (board.turn === my_col ||
            (!my_col && !board.black_ss.get(src_sq)) ||
            ( my_col && !board.white_ss.get(src_sq))) {
            valid = false;
        }
        let data = {valid, src_x: other_prop.src_x, src_y: other_prop.src_y, dst_x: other_prop.dst_x, dst_y: other_prop.dst_y};
        if (other_prop.prom != undefined) {
            data.prom = other_prop.prom;
        }
        show_db_set("Setting my_ver to verify move")
        my_ver_ref.set(data);
        if (valid) {
            my_match_ref.child("moves").child(board.turn_count-1).child(board.turn_pos).set(other_prop);
            make_move(other_prop.src_x, other_prop.src_y, other_prop.dst_x, other_prop.dst_y, other_prop.prom);
            if(find_victory() >= 0) {
                switch_to_single_player();
            }
            render_board();
        }
        else {
            //Todo: Report invalid move
            show_message("Opponent attempted invalid move, but it was blocked");
        }
    }
}
let other_ver_change = (snapshot) => {
    let other_ver = snapshot.val();
    show_db_get("Getting other_ver", other_ver);
    if (!other_ver) {
        return;
    }
    if (other_ver.valid) {
        //First make sure prop and ver are the same move
        if (my_prop.piece != undefined && my_prop.color != undefined && my_prop.dest != undefined) {
            if (my_prop.piece === other_ver.piece && my_prop.color === other_ver.color && my_prop.dest === other_ver.dest) {
                make_drop_move(my_prop.piece, my_prop.color, my_prop.dest);
                if(find_victory() >= 0) {
                    close_match();
                }
                render_board();
            }
        }
        else if (my_prop.src_x != undefined && my_prop.src_y != undefined && my_prop.dst_x != undefined && my_prop.dst_y != undefined) {
            if (my_prop.src_x === other_ver.src_x && my_prop.src_y === other_ver.src_y && my_prop.dst_x === other_ver.dst_x && my_prop.dst_y === other_ver.dst_y) {
                make_move(my_prop.src_x, my_prop.src_y, my_prop.dst_x, my_prop.dst_y, my_prop.prom);
                if(find_victory() >= 0) {
                    close_match();
                }
                render_board();
            }
        }
    }
    else {
        show_message("Your last attempted move was automatically flagged as invalid by the opponent")
    }
    my_prop = {};
    if(my_prop_ref) {
        show_db_set("Setting my_prop to empty")
        my_prop_ref.set({});
    }
    else {
        console.warn("my_prop_ref is undefined. Not a problem, especially if the game just ended.")
    }
}

function connect_to_match(match_ref_str, col, new_my_name, new_opp_name, owner, board_name, seed) {
    if(match_ref_str != undefined) {
        my_match_ref = firebase.database().ref(`match/${match_ref_str}`);
    }
    in_multiplayer_game = true;
    my_col = col;
    is_owner = owner;
    style_data.flip_board = my_col;
    my_name = new_my_name;
    opp_name = new_opp_name;
    my_prop_ref = my_match_ref.child(is_owner?'o':'j').child('prop');
    my_ver_ref  = my_match_ref.child(is_owner?'o':'j').child('ver');
    other_prop_ref = my_match_ref.child(is_owner?'j':'o').child('prop');
    other_ver_ref  = my_match_ref.child(is_owner?'j':'o').child('ver');
    my_res_ref = my_match_ref.child(is_owner?'o':'j').child('res');
    other_res_ref  = my_match_ref.child(is_owner?'j':'o').child('res');
    other_prop_ref.on("value", other_prop_change);
    other_ver_ref.on("value", other_ver_change);
    other_res_ref.on("value", on_opp_resign);
    if(my_lobby_ref) {
        my_lobby_ref.remove();
        my_lobby_ref = undefined;
    }
    set_board(board_name, seed);
    board_page();
}

function join_game(match_id) {
    if(in_multiplayer_game) {
        show_error("Trying to join game when you're already in a game");
        return;
    }
    let t_match_ref = firebase.database().ref(`lobby/${match_id}`);
    t_match_ref.once("value", (snapshot) => {
        let t_match = snapshot.val();
        show_db_get("Getting lobby info for join_game", t_match)
        if (!t_match) {
            show_error("Trying to join a non-existent match");
            return;
        }
        if (t_match.owner === user_id) {
            show_error("Attempting to join your own game");
            return;
        }
        let owner_col;
        switch(t_match.owner_col) {
            case 'w':
                owner_col = false;
                break;
            case 'b':
                owner_col = true;
                break;
            case 'r':
                owner_col = (Math.random() < 0.5);
                break;
        }
        //Create the match
        my_match_ref = firebase.database().ref(`match`).push();
        show_db_set("Setting my_match to join the game");
        let seed = cyrb128(time_as_string())[0];
        my_match_ref.update({
            board_name: t_match.board_name,
            seed,
            j: {
                name: this_user.name,
                uid: user_id,
                col: !owner_col
            },
            o: {
                col: owner_col,
                uid: t_match.owner,
                name: t_match.owner_name
            }
        });
        //Send match link to owner
        show_db_set("Updating lobby entry to start match")
        t_match_ref.update({goto: my_match_ref.key, joiner_name: this_user.name, owner_col, seed});
        t_match_ref = undefined;
        //Start match locally
        connect_to_match(undefined, !owner_col, this_user.name, t_match.owner_name, false, t_match.board_name, seed)
    });
}

function add_lobby() {
    if(my_lobby_ref) {
        show_error("Trying to add a lobby while you already have a lobby open");
        return;
    }
    if(in_multiplayer_game) {
        show_error("Trying to add a lobby while you are in a game");
        return;
    }
    let board_name = document.getElementById("board_name").value;
    let owner_col = document.getElementById("color_sel").value;
    //Check if this board exists
    all_boards_ref.child(`${board_name}/height`).once("value", (snapshot) => {
        show_db_get("Checking if board exists", snapshot.val());
        if(!snapshot.val()) {
            show_error("Trying to create lobby with non-existent board");
            return;
        }
        //Set up lobby
        my_lobby_ref = firebase.database().ref(`lobby`).push({
            board_name,
            owner_col,
            owner: user_id,
            owner_name: this_user.name
        });
        my_lobby_ref.onDisconnect().remove();
        //When someone connects, start the game
        my_lobby_ref.on("value", (snapshot) => {
            let val = snapshot.val();
            show_db_get("Getting lobby info for add_lobby", val)
            if(val && val.goto) {
                connect_to_match(val.goto, val.owner_col, val.owner_name, val.joiner_name, true, val.board_name, val.seed)
            }
        });
    });
}

let all_lobbies_ref = firebase.database().ref(`lobby`);
all_lobbies_ref.on("value", (snapshot) => {
    let lobby = snapshot.val();
    show_db_get("Updating lobby info for table", lobby)
    let table = document.getElementById("lobby_table");
    table.innerHTML = `
    <tr>
        <th>Board Name</th>
        <th>Creator</th>
        <th>Creator's Color</th>
        <th>Join</th>
    </tr>`;
    for(let row in lobby) {
        let row_v = lobby[row];
        let col =
            row_v.owner_col === 'r' ? "Random" :
            row_v.owner_col === 'w' ? "White" :
            row_v.owner_col === 'b' ? "Black" : "Error";
        table.innerHTML += `
        <tr>
            <td>${row_v.board_name}</td>
            <td>${row_v.owner_name}</td>
            <td>${col}</td>
            <td><button onclick="join_game('${row}')">Join</button></td>
        </tr>`;
    }
});


firebase.auth().onAuthStateChanged((user) => {
    if(user) {
        user_id = user.uid;
        user_ref = firebase.database().ref(`users/${user_id}`);

        user_ref.on("value", (snapshot) => {
            this_user = snapshot.val();
            if(!this_user) {
                console.warn("This user is undefined. This is normal.")
            }
            else {
                show_db_get("Getting my user info", this_user);
                let name_p = document.getElementById("name_p");
                name_p.innerHTML = "Name: "+this_user.name;
            }
        });
        
        show_db_set("Setting my user id and name");
        user_ref.set({
            id: user_id,
            name: stored_name
        });

        user_ref.onDisconnect().remove();

        //Look through all matches to see if you're in one
        if (!in_multiplayer_game) {
            firebase.database().ref("match").once("value", (snapshot) => {
                let all_matches = snapshot.val();
                for (let mid in all_matches) {
                    let match = all_matches[mid]
                    if ((match.o && match.o.uid === user_id) || (match.j && match.j.uid === user_id)) {
                        //Join this match
                        let owner = (match.o && match.o.uid === user_id);
                        let me = owner ? match.o : match.j, them = owner ? match.j : match.o;
                        connect_to_match(mid, me.col, me.name, them.name, owner, match.board_name, match.seed);
                        //Replay all moves
                        firebase.database().ref(`match/${mid}/moves`).once("value", (snapshot) => {
                            let all_moves = snapshot.val();
                            if(all_moves) {
                                for (let a = 0; a < all_moves.length; a ++) {
                                    for (let b = 0; b < all_moves[a].length; b ++) { 
                                        let m = all_moves[a][b]; //To keep the lines short
                                        if (m.color != undefined) {
                                            make_drop_move(m.piece, m.color, m.dest);
                                        }
                                        else {
                                            make_move(m.src_x, m.src_y, m.dst_x, m.dst_y, m.prom);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    }
    else {
        //Logged out
    }
});

firebase.auth().signInAnonymously().catch((error) => {
    show_error(error.code, error.message);
});