preset_variants[2].push({
    name: "Chaturanga",
    description: "Ancient ancestor of Chess-like games. Queen is replaced with Ferz, Bishop with Alfil, Pawns lose their double-step and promote to Ferz only, and King can't castle. Win by capturing, stalemating, or baring the opponent's King.",
	width: 8,
	height: 8,
    wins: [ends.royal_capture, ends.bare_royal, ends.stalemate],

	all_pieces: [
		{
            name: "Pedati",
			description: "Moves passively forward one step, captures one step forward-diagonally, and promotes when reaching the back rank",
            sprite: "peasant",
            symbol: "p",
            notation: "",
			move: "[0 -1 1 1]ae+([1 -1 1 1],[-1 -1 1 1])ba",
            promotions: [{ white: 1, black: 0, to: ["M"], on: [events.enter] }],
		},
		{
            name: "Ratha",
            description: "Moves sideways and vertically as many spaces as it wants",
            sprite: "rook",
			symbol: "R",
			move: "[R]Ba",
			promotions: [],
			attributes: [attrib.castle_to],
			held_piece: -1,
			held_move: ""
		},
		{
            name: "Ashva",
            description: "Jumps in a (2, 1) L-shaped pattern",
            sprite: "knight",
			symbol: "A",
			move: "[N]a",
		},
		{
            name: "Gaja",
            description: "Jumps to the second diagonal",
            sprite: "elephant",
			symbol: "G",
			move: "[A]a",
			promotions: [],
			attributes: [],
			held_piece: -1,
			held_move: ""
		},
		{
            name: "Mantri",
            description: "Moves one step diagonally",
            sprite: "prince",
			symbol: "M",
			move: "[F]a"
		},
		{
            name: "Raja",
            description: "Moves one step in any direction. Can be checked and checkmated.",
            sprite: "king",
			symbol: "K",
			move: "[K]a",
			attributes: [attrib.royal],
		},
	],
    setup: "bR bA bG bM bK bG bA bR 8bp",
    copy: "flip",
	zones: [
		"00000000 00000000 00000000 00000000 00000000 00000000 00000000 11111111",
		"11111111 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
	],
});