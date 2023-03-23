var canvas;

function on_board(x, y) {
    if (y === undefined) {
        //Only square id given
        y = Math.floor(x / game_data.width);
        x %= game_data.width;
    }
    return x >= 0 && y >= 0 && x < game_data.width && y < game_data.height && game_data.active_squares.get(y * game_data.width + x);
}

function fix_canvas_height() {
    let ratio = (game_data.height + (game_data.has_hand ? 2 : 0)) / game_data.width;
    canvas.height = canvas.width * ratio;
}

function change_zoom(amount) {
    canvas.width = canvas.width + 50 * amount;
    fix_canvas_height();
}

function add_image(dname, fname) {
    if (!document.getElementById("img_" + fname)) {
        let img1 = new Image();
        img1.src = "images/" + dname + "/" + fname + ".png";
        img1.id = "img_" + fname;
        document.getElementById("imageDiv").appendChild(img1);
    }
}

//Doesn't work, it's too long!
function print_all_boards() {
    let str = "{";
    for(let a = 0; a < preset_variants.length; a++) {
        for(let b = 0; b < preset_variants[a].length; b++) {
            str += "\""+preset_variants[a][b].name+"\": "+JSON.stringify(preset_variants[a][b]);
            if(a < preset_variants.length-1 || b < preset_variants[a].length-1) {
                str += ",";
            }
        }
    }
    str += "}";
    return str;
}
//Will only work if you have access to the database
function update_all_boards() {
    for(let a = 0; a < preset_variants.length; a++) {
        for(let b = 0; b < preset_variants[a].length; b++) {
            firebase.database().ref("boards").child(preset_variants[a][b].name).update(preset_variants[a][b]);
        }
    }
}
function add_files_to_dropdown() {
    let variant_dropdown = document.getElementById("variantField");
    let variant_file = document.getElementById("variant_file");
    let category = document.getElementById("categoryField");
    let cat_num = Number(category.value);
    if(cat_num < 0) {
        variant_file.style.display="inline";
        variant_dropdown.style.display="none";
    }
    else {
        variant_file.style.display="none";
        variant_dropdown.style.display="inline";
        variant_dropdown.innerHTML = "";
        for (let a = 0; a < preset_variants[cat_num].length; a++) {
            var temp = new Option();
            temp.value = a;
            temp.innerHTML = preset_variants[cat_num][a].name;
            variant_dropdown.appendChild(temp);
        }
    }
}
function load_variant() {
    let category = Number(document.getElementById("categoryField").value);
    if(category < 0) {
        var file = document.getElementById("variant_file").files[0];
        if (file) {
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                start_game(JSON.parse(evt.target.result));
            }
            reader.onerror = function (evt) {
                console.error("Couldn't read the file");
            }
        }
    }
    else {
        start_game(preset_variants[category][document.getElementById('variantField').value]);
    }
}

function load_board_textures() {
    add_image("board", "sq_dark");
    add_image("board", "sq_light");
    add_image("board", "sq_canmove");
    add_image("board", "sq_canmove_potential");
    add_image("board", "sq_canmove_sel");
    add_image("board", "sq_canmove_turn");
    add_image("board", "hand_bg");
    add_image("board", "glow");
    add_image("board", "full_space");
}

function handle_make_move(src_x, src_y, dst_x, dst_y, prom) {
    if(in_multiplayer_game) {
        multiplayer_make_move(src_x, src_y, dst_x, dst_y, prom);
    }
    else {
        make_move(src_x, src_y, dst_x, dst_y, prom);
    }
}
function handle_make_drop(piece, color, dest) {
    if(in_multiplayer_game) {
        multiplayer_make_drop(piece, color, dest);
    }
    else {
        make_drop_move(piece, color, dest);
    }
}

function handle_mouse_click() {
    let brd = board_history[view_move];

    if (game_data.width === undefined) {
        return;
    }
    if (brd.victory != -1) {
        return;
    }
    if (temp_data.waiting_for_promotion) {
        let width_px = canvas.width / game_data.width; //Width and height should be the same
        let height_px = canvas.height / (game_data.height + (game_data.has_hand ? 2 : 0));
        let start_height = canvas.height / 2 - height_px / 2;
        let start_width = canvas.width / 2 - height_px * temp_data.promotions.length / 2;
        let clicked_piece = Math.floor((mouse_pos.x - start_width) / width_px);
        if (mouse_pos.y >= start_height && mouse_pos.y <= start_height + height_px
            && clicked_piece >= 0 && clicked_piece < temp_data.promotions.length) {
            let prom = temp_data.promotions[clicked_piece];
            let src = temp_data.selected_position, dst = temp_data.move_to;
            let src_x = src % game_data.width, src_y = Math.floor(src / game_data.width);
            let dst_x = dst % game_data.width, dst_y = Math.floor(dst / game_data.width);
            if(validate_move(src_x, src_y, dst_x, dst_y, prom)) {
                handle_make_move(src_x, src_y, dst_x, dst_y, prom);
            }
            else {
                console.error("Invalid move attempted after promotion was selected");
            }
            temp_data.selected = false;
        }
        temp_data.waiting_for_promotion = false;
    }
    else if (temp_data.selected) {
        if (game_data.active_squares.get(mouse_sq)) {
            if (brd.can_move_ss[temp_data.selected_position].get(mouse_sq)) {
                //See how many promotions are possible
                let src = temp_data.selected_position, dst = mouse_sq;
                let promote_to = find_promotions(identify_piece(src, brd), src, dst, brd.white_ss.get(src), brd.black_ss.get(src));
                let src_x = src % game_data.width, src_y = Math.floor(src / game_data.width);
                let dst_x = mouse_sq_pos.x, dst_y = mouse_sq_pos.y;
                if (promote_to.length < 2) {
                    if(validate_move(src_x, src_y, dst_x, dst_y)) {
                        handle_make_move(src_x, src_y, dst_x, dst_y);
                    }
                    else {
                        console.error("Invalid move attempted");
                    }
                    temp_data.selected = false;
                }
                else if (game_data.all_pieces[identify_piece(src, brd)].attributes.includes(attrib.random_promotion)) {
                    let prom = promote_to[Math.floor(Math.random() * promote_to.length)];
                    if(validate_move(src_x, src_y, dst_x, dst_y, prom)) {
                        handle_make_move(src_x, src_y, dst_x, dst_y, prom);
                    }
                    else {
                        console.error("Invalid move attempted (random promotion)");
                    }
                    temp_data.selected = false;
                }
                else {
                    temp_data.waiting_for_promotion = true;
                    temp_data.promotions = promote_to;
                    temp_data.move_to = mouse_sq;
                }
            }
            else {
                temp_data.selected = false;
            }
        }
    }
    else if (temp_data.hand_selected) {
        if (mouse_sq >= 0 && mouse_sq < game_data.width * game_data.height) {
            if (!brd.white_ss.get(mouse_sq) && !brd.black_ss.get(mouse_sq)) {
                //Piece, color, dest
                if(validate_drop(temp_data.selected_position, temp_data.selected_side, mouse_sq)) {
                    handle_make_drop(temp_data.selected_position, temp_data.selected_side, mouse_sq);
                }
                else {
                    console.error("Invalid drop attempted");
                }
            }
        }
        temp_data.hand_selected = false;
    }
    else if (mouse_sq_pos.y === -1 || mouse_sq_pos.y === game_data.height) {
        //We clicked a hand
        let hover = highlighted_hand_piece(brd);
        if (hover.piece >= 0 && hover.color === brd.turn && (!in_multiplayer_game || brd.turn === my_col)) {
            temp_data.hand_selected = true;
            temp_data.selected_side = hover.color;
            temp_data.selected_position = hover.piece;
        }
    } 
    else {
        if ((!brd.turn && brd.white_ss.get(mouse_sq))
            || (brd.turn && brd.black_ss.get(mouse_sq))) {
            if (!brd.can_move_ss[mouse_sq].is_zero() && (!in_multiplayer_game || brd.turn === my_col)) {
                temp_data.selected = true;
                temp_data.selected_position = mouse_sq;
            }
        }
    }
    render_board();
}

function handle_mouse_leave() {
    if (game_data.width != undefined) {
        mouse_sq = -1;
        mouse_sq_pos = { x: -1, y: -1 };
        old_mouse_sq = -1;
        render_board();
    }
}

function board_page() {
    document.getElementById("board_section").style.display = "block";
    document.getElementById("lobby_section").style.display = "none";
}
function lobby_page() {
    document.getElementById("board_section").style.display = "none";
    document.getElementById("lobby_section").style.display = "block";
}

function handle_mouse_move(e) {
    let rect = e.currentTarget.getBoundingClientRect();
    mouse_pos.x = e.clientX - rect.left;
    mouse_pos.y = e.clientY - rect.top;
    if (game_data.width != undefined) {
        mouse_sq_pos.x = Math.floor(mouse_pos.x * game_data.width / canvas.width);
        mouse_sq_pos.y = Math.floor(mouse_pos.y * (game_data.height + game_data.has_hand * 2) / canvas.height) - game_data.has_hand;
        if (style_data.flip_board) {
            mouse_sq_pos.x = game_data.width - mouse_sq_pos.x - 1;
            mouse_sq_pos.y = game_data.height - mouse_sq_pos.y - 1;
        }
        mouse_sq = mouse_sq_pos.x + mouse_sq_pos.y * game_data.width;
        if (mouse_sq != old_mouse_sq) {
            //If mouse changes square, re-render the board
            render_board();
            old_mouse_sq = mouse_sq;
        }
    }
}
function left_arrow_click() {
    if (view_move > 0) {
        view_move--;
        render_board();
        render_extras();
    }
}
function right_arrow_click() {
    if (view_move < board_history.length - 1) {
        view_move ++;
        render_board();
        render_extras();
    }
}
function down_arrow_click() {
    view_move = board_history.length - 1;
    render_board();
    render_extras();
}
function up_arrow_click() {
    view_move = 0;
    render_board();
    render_extras();
}

let game_data = {};
let board = {};
let temp_data = {};
let board_history = [];
let move_history = [];
let view_move = 0;

let mouse_pos = { x: -1, y: -1 };
let mouse_sq_pos = { x: -1, y: -1 };
let mouse_sq = -1, old_mouse_sq = -1;


function page_init() {
    canvas = document.getElementById("board_canvas");
    add_files_to_dropdown();
    load_board_textures();

    canvas.addEventListener('mousemove', e => {
        handle_mouse_move(e);
    });
    canvas.addEventListener('mouseleave', e => {
        handle_mouse_leave();
    });
    canvas.addEventListener('mousedown', e => {
        handle_mouse_click();
    });
    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 37:
                left_arrow_click();
                break;
            case 39:
                right_arrow_click();
                break;
            //Up and down scroll - best to only have left and right
            /*case 38:
                up_arrow_click();
                break;
            case 40:
                down_arrow_click();
                break;*/
        }
    };
    board_page()
}