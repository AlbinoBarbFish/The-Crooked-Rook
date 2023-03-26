preset_variants[folders.other].push({
//const style_board = {
    name: "Style",
	description: "From top to bottom, the rows are highlighted, mud, etherial, pacifist, and sanctuary. <br />This is also the style priority; if a square has mud and sanctuary, it will render as mud.",
	width: 7,
	height: 7,
	has_hand: true,

	all_pieces: [
		{
			name: "Pawn",
			description: "Moves passively forward one step (or 2 on its first move), captures one step forward-diagonally, and promotes when reaching the back rank",
            sprite: "pawn",
            symbol: "p",
            notation: "",
			move: "i[0 1 1 2]Bae+[0 1 1 1]ae+([1 1 1 1],[-1 1 1 1])ca",
		},
		{
            name: "Rook",
            description: "Moves sideways and vertically as many spaces as it wants",
            sprite: "rook",
			symbol: "R",
			move: "[R]Ba",
		},
		{
            name: "Knight",
            description: "Jumps in a (2, 1) L-shaped pattern",
            sprite: "knight",
			symbol: "N",
			move: "[N]a",
		},
		{
            name: "Bishop",
            description: "Moves diagonally as many spaces as it wants",
            sprite: "bishop",
			symbol: "B",
			move: "[B]Ba",
		},
		{
            name: "Queen",
            description: "Moves like a Rook or Bishop",
            sprite: "queen",
			symbol: "Q",
			move: "[Q]Ba",
		},
		{
            name: "King",
            description: "Moves one step in any direction. Can be checked and checkmated.",
            sprite: "king",
			symbol: "K",
            move: "[K]a",
			attributes: [attrib.royal],
		},
	],
    setup: ". bR bN bB bQ bK 18. nR",
	starting_hands: {white: ["p"], black: ["p"]},
    copy: "rotate",
	active_squares: "0111110 1111111 1111111 1111111 1111111 1111111 0111110",
	highlight: "0000000 1111111 0000000 0000000 0000000 0000000 0000000",
	mud: "0000000 0000000 1111111 0000000 0000000 0000000 0000000",
    ethereal: "0000000 0000000 0000000 1111111 0000000 0000000 0000000",
    pacifist: "0000000 0000000 0000000 0000000 1111111 0000000 0000000",
	sanctuary: "0000000 0000000 0000000 0000000 0000000 1111111 0000000",
});