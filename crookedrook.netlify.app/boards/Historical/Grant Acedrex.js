preset_variants[folders.historical].push({
    name: "Grant Acedrex",
    description: "Grant Acedrex",
	width: 12,
	height: 12,
    wins: [ends.royal_capture, ends.bare_royal, ends.stalemate],
    snap_mode: "diagonal",

	all_pieces: [
		{
            name: "Pawn",
			description: "Moves passively forward one step, captures one step forward-diagonally, and promotes when reaching the back rank",
            sprite: "peasant",
            symbol: "p",
            notation: "",
			move: "[0 1 1 1]ae+([1 1 1 1],[-1 1 1 1])ba",
            promotions: [
                { white: 1, black: 0, to: ["R"], on: [events.enter] },
                { white: 3, black: 2, to: ["L"], on: [events.enter] },
                { white: 5, black: 4, to: ["U"], on: [events.enter] },
                { white: 7, black: 6, to: ["Z"], on: [events.enter] },
                { white: 9, black: 8, to: ["B"], on: [events.enter] },
                { white:11, black:10, to: ["G"], on: [events.enter] },
            ]
		},
		{
            name: "Rook",
            description: "Moves sideways and vertically as many spaces as it wants",
            sprite: "rook",
			symbol: "R",
			move: "[R]Ba",
        },
        {
            name: "Griffin",
            description: "Moves to the first diagonal, then optionally outwards like a rook.",
            sprite: "griffin",
            symbol: "G",
            move: "[F]ase([1 1 1 -1],[-1 1 1 -1])Ba",
        },
        {
            name: "Unicorn",
            description: "Moves like a knight, then optionally outwards like a bishop.",
            sprite: "unicorn",
            symbol: "U",
            move: "[N]ase[0 1 1 -1]Ba",
        },
        {
            name: "Lion",
            description: "Makes (3, 0) or (3, 1) jumps",
            sprite: "lion",
            symbol: "L",
            move: "([C],[H])a",
        },
        {
            name: "Giraffe",
            description: "Makes (3, 2) jumps",
            sprite: "giraffe",
            symbol: "Z",
            move: "[Z]a",
        },
		{
            name: "Bishop",
            description: "Jumps to the second diagonal",
            sprite: "elephant",
			symbol: "B",
			move: "[A]a",
		},
		{
            name: "King",
            description: "Moves one step in any direction. Can be checked and checkmated. On its first move, it can jump to the second orthogonal or diagonal.",
            sprite: "king",
			symbol: "K",
			move: "[K]a+i([A],[F])a",
			attributes: [attrib.royal],
		},
    ],
    setup: "bR bL bU bZ bB bG bK bB bZ bU bL bR 24. 12bp",
    copy: "flip",
    zones: [
        "000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 100000000001",
        "100000000001 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000",
        "000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 010000000010",
        "010000000010 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000",
        "000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 001000000100",
        "001000000100 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000",
        "000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000100001000",
        "000100001000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000",
        "000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000010010000",
        "000010010000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000",
        "000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000001100000",
        "000001100000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000 000000000000",
	],
});