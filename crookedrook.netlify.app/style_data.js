/*let style_data = {
    //Pieces
    white_col: 'rgb(255, 255, 255)',
    black_col: 'rgb(255, 0, 0)',
    neutral_col: 'rgb(0, 200, 100)',
    //Squares
    light_highlight_col: 'rgb(112, 255, 105)',
    dark_highlight_col: 'rgb(76, 173, 71)',
    light_mud_col: 'rgb(125, 85, 45)',
    dark_mud_col: 'rgb(82, 56, 30)',
    light_ethereal_col: 'rgb(150, 51, 196)',
    dark_ethereal_col: 'rgb(96, 23, 130)',
    light_pacifist_col: 'rgb(201, 198, 52)',
    dark_pacifist_col: 'rgb(138, 136, 47)',
    light_sanctuary_col: 'rgb(45, 99, 186)',
    dark_sanctuary_col: 'rgb(26, 69, 138)',
    light_square_col: 'rgb(255, 196, 136)',
    dark_square_col: 'rgb(230, 115, 0)',
    //bg_col: 'rgb( 32,  96,  32)',
    //Other
    bg_col: 'rgb(255, 255, 255)',
    hand_col: 'rgb(85, 230, 119)',
    flip_colors: false,
    flip_board: false,
    name_squares: false,
    border: 0.05
}*/
let style_data = JSON.parse(`{
    "white_col": "rgb(240, 240, 240)",
    "black_col": "rgb(60, 60, 60)",
    "neutral_col": "rgb(0, 200, 100)",
    "light_highlight_col": "rgb(214, 111, 105)",
    "dark_highlight_col": "rgb(113, 50, 47)",
    "light_mud_col": "rgb(205, 148, 114)",
    "dark_mud_col": "rgb(117, 70, 43)",
    "light_ethereal_col": "rgb(98, 193, 221)",
    "dark_ethereal_col": "rgb(50, 101, 109)",
    "light_pacifist_col": "rgb(236, 202, 79)",
    "dark_pacifist_col": "rgb(116, 100, 44)",
    "light_sanctuary_col": "rgb(135, 198, 121)",
    "dark_sanctuary_col": "rgb(60, 112, 48)",
    "light_square_col": "rgb(255, 196, 136)",
    "dark_square_col": "rgb(230, 115, 0)",
    "bg_col": "rgb(255, 255, 255)",
    "hand_col": "rgb(205, 137, 24)",
    "flip_colors": false,
    "flip_board": false,
    "name_squares": false,
    "border": 0.05
  }`)

function show_style_data() {
    document.getElementById("style_div").style.display = "block";
    //preset_variants[folders.other].push(style_board);
    //add_files_to_dropdown();
}
function hide_style_data() {
    document.getElementById("style_div").style.display = "none";
}

function reload_style_inputs() {
    document.getElementById("style_piece_w").value = style_data.white_col;
    document.getElementById("style_piece_b").value = style_data.black_col;
    document.getElementById("style_piece_n").value = style_data.neutral_col;

    document.getElementById("style_sq_light").value = style_data.light_square_col;
    document.getElementById("style_sq_dark").value = style_data.dark_square_col;
    document.getElementById("style_hi_light").value = style_data.light_highlight_col;
    document.getElementById("style_hi_dark").value = style_data.dark_highlight_col;
    document.getElementById("style_md_light").value = style_data.light_mud_col;
    document.getElementById("style_md_dark").value = style_data.dark_mud_col;
    document.getElementById("style_et_light").value = style_data.light_ethereal_col;
    document.getElementById("style_et_dark").value = style_data.dark_ethereal_col;
    document.getElementById("style_pa_light").value = style_data.light_pacifist_col;
    document.getElementById("style_pa_dark").value = style_data.dark_pacifist_col;
    document.getElementById("style_sa_light").value = style_data.light_sanctuary_col;
    document.getElementById("style_sa_dark").value = style_data.dark_sanctuary_col;
    
    document.getElementById("style_bg").value = style_data.bg_col;
    document.getElementById("style_hand").value = style_data.hand_col;
}

function set_style() {
    style_data.white_col = document.getElementById("style_piece_w").value;
    style_data.black_col = document.getElementById("style_piece_b").value;
    style_data.neutral_col = document.getElementById("style_piece_n").value;
    
    style_data.light_square_col = document.getElementById("style_sq_light").value;
    style_data.dark_square_col = document.getElementById("style_sq_dark").value;
    style_data.light_highlight_col = document.getElementById("style_hi_light").value;
    style_data.dark_highlight_col = document.getElementById("style_hi_dark").value;
    style_data.light_mud_col = document.getElementById("style_md_light").value;
    style_data.dark_mud_col = document.getElementById("style_md_dark").value;
    style_data.light_ethereal_col = document.getElementById("style_et_light").value;
    style_data.dark_ethereal_col = document.getElementById("style_et_dark").value;
    style_data.light_pacifist_col = document.getElementById("style_pa_light").value;
    style_data.dark_pacifist_col = document.getElementById("style_pa_dark").value;
    style_data.light_sanctuary_col = document.getElementById("style_sa_light").value;
    style_data.dark_sanctuary_col = document.getElementById("style_sa_dark").value;
    
    style_data.bg_col = document.getElementById("style_bg").value;
    style_data.hand_col = document.getElementById("style_hand").value;

    if (board.turn != undefined) {
        render_board();
    }
}

function export_style() {
    let str = JSON.stringify(style_data, null, 2);
    let file = new File([str], "style");
    let url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "style.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}