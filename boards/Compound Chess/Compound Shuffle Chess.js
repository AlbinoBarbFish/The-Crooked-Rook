preset_variants[folders.compound].push({
    name: "Compound Shuffle Chess",
    author: "Fylo",
    description: "First rank of both players is randomized. Adds 2 pieces, which combine the moves of knight and bishop, and knight and rook. Castle length is 2.",
	width: 10,
	height: 8,
	wins: [ends.royal_capture],
	draws: [ends.stalemate],
    castle_length: 2,

	all_pieces: [
		{
			name: "Pawn",
			description: "Moves passively forward one step (or 2 on its first move), captures one step forward-diagonally, and promotes when reaching the back rank",
            sprite: "pawn",
            symbol: "p",
            notation: "",
			move: "i[0 -1 1 2]Bae+[0 -1 1 1]ae+([1 -1 1 1],[-1 -1 1 1])ca",
            promotions: [{ white: 1, black: 0, to: ["NSNR"], on: [events.enter] }],
            attributes: [attrib.ep_captured, attrib.ep_capturer],
		},
		{
            name: "Rook",
            description: "Moves sideways and vertically as many spaces as it wants",
            sprite: "rook",
			symbol: "R",
			move: "[R]Ba",
			attributes: [attrib.castle_to],
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
            move: "[K]a+i[1 0 2 -1]BemP{Rook}",
			attributes: [attrib.royal, attrib.castle_from],
		},
		{
            name: "Archbishop",
            description: "Moves like a Knight or Bishop",
            sprite: "archbishop",
			symbol: "A",
			move: "[B]Ba+[N]a",
		},
		{
            name: "Chancellor",
            description: "Moves like a Knight or Rook",
            sprite: "chancellor",
			symbol: "C",
			move: "[R]Ba+[N]a",
		},
	],
    setup: "bR bN bB bC bK bQ bA bB bN bR 10bp",
    copy: "flip",
	zones: [
		"0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 1111111111",
		"1111111111 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000",
	],
	fischer_zones: [1]
});