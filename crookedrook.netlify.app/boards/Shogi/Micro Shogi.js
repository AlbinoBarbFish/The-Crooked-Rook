preset_variants[folders.shogi].push({
    name: "Micro Shogi",
    description: "Small version of Shogi. Pieces promote/demote when capturing: Pawn <=> Knight, Gold <=> Rook, Bishop <=> Tokin, and Silver <=> Lance.",
	width: 4,
	height: 5,
	has_hand: true,
	wins: [ends.royal_capture, ends.stalemate],

	all_pieces: [
		{
			name: "Pawn",
			description: "Moves and captures forward one step.",
            sprite: "peasant",
            mini_sprite: "knight",
            symbol: "p",
            notation: "",
			move: "[0 1 1 1]a",
            attributes: [attrib.promote_on_attack],
            held_piece: "N"
		},
		{
            name: "Rook",
            description: "Moves sideways and vertically as many spaces as it wants",
            sprite: "rook",
            mini_sprite: "shield",
			symbol: "R",
            move: "[R]Ba",
            attributes: [attrib.promote_on_attack],
            held_piece: "G"
        },
        {
            name: "Bishop",
            description: "Moves diagonally as many spaces as it wants",
            sprite: "bishop",
            mini_sprite: "shield",
            symbol: "B",
            move: "[B]Ba",
            attributes: [attrib.promote_on_attack],
            held_piece: "T"
        },
        {
            name: "Lance",
            description: "Moves up as many spaces as it wants",
            sprite: "spear",
            mini_sprite: "star5",
            symbol: "L",
            move: "[0 1 1 -1]Ba",
            attributes: [attrib.promote_on_attack],
            held_piece: "S"
        },
		{
            name: "Knight",
            description: "Japanese Knight. Jumps forward two spaces and sideways one. Promotes to Gold.",
            sprite: "knight",
            mini_sprite: "peasant",
			symbol: "N",
            move: "([1 2 1 1],[-1 2 1 1])a",
            attributes: [attrib.promote_on_attack],
            held_piece: "p"
        },
        {
            name: "Silver",
            description: "Moves one step diagonally or forward. Promotes to Gold.",
            sprite: "star5",
            mini_sprite: "spear",
            symbol: "S",
            move: "([F],[0 1 1 1])a",
            attributes: [attrib.promote_on_attack],
            held_piece: "L"
        },
        {
            name: "Gold",
            description: "Moves one step cardinally or forward-diagonal.",
            sprite: "shield",
            mini_sprite: "rook",
            symbol: "G",
            move: "([W],[-1 1 1 1],[1 1 1 1])a",
            attributes: [attrib.promote_on_attack],
            held_piece: "R"
        },
		{
            name: "King",
            description: "Moves one step in any direction. Can be checked and checkmated.",
            sprite: "king",
			symbol: "K",
			move: "[K]a",
            attributes: [attrib.royal]
        },
        {
            name: "Tokin",
            description: "Moves as a Gold.",
            sprite: "shield",
            mini_sprite: "bishop",
            symbol: "T",
            move: "([W],[-1 1 1 1],[1 1 1 1])a",
            attributes: [attrib.promote_on_attack],
            held_piece: "B"
        },
	],
    setup: "bK bB bG bS bp",
    copy: "rotate",
    starting_hands: {white: [], black: []}
});