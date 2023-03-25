preset_variants[folders.shogi].push({
    name: "Shogi",
    description: "Japanese Chess. You can drop pieces after you capture them. Drop restrictions and some endgame rules are not implemented.",
	width: 9,
	height: 9,
	has_hand: true,
	wins: [ends.royal_capture, ends.stalemate],

	all_pieces: [
		{
			name: "Pawn",
			description: "Moves and captures forward one step. Promotes to Gold.",
            sprite: "peasant",
            symbol: "p",
            notation: "",
			move: "[0 1 1 1]a",
            promotions: [{ white: 0, black: 1, to: ["Pawn", "+Pawn"], on: [events.enter, events.exit, events.between] }],
		},
		{
            name: "Rook",
            description: "Moves sideways and vertically as many spaces as it wants",
            sprite: "rook",
			symbol: "r",
            move: "[R]Ba",
            promotions: [{ white: 0, black: 1, to: ["Rook", "+Rook"], on: [events.enter, events.exit, events.between] }],
        },
        {
            name: "Bishop",
            description: "Moves diagonally as many spaces as it wants",
            sprite: "bishop",
            symbol: "b",
            move: "[B]Ba",
            promotions: [{ white: 0, black: 1, to: ["Bishop", "+Bishop"], on: [events.enter, events.exit, events.between] }]
        },
        {
            name: "Lance",
            description: "Moves up as many spaces as it wants",
            sprite: "spear",
            symbol: "l",
            move: "[0 1 1 -1]Ba",
            promotions: [{ white: 0, black: 1, to: ["Lance", "+Lance"], on: [events.enter, events.exit, events.between] }]
        },
		{
            name: "Knight",
            description: "Japanese Knight. Jumps forward two spaces and sideways one. Promotes to Gold.",
            sprite: "knight",
			symbol: "n",
            move: "([1 2 1 1],[-1 2 1 1])a",
            promotions: [{ white: 0, black: 1, to: ["Knight", "+Knight"], on: [events.enter, events.exit, events.between] }]
        },
        {
            name: "Silver",
            description: "Moves one step diagonally or forward. Promotes to Gold.",
            sprite: "star5",
            symbol: "s",
            move: "([F],[0 1 1 1])a",
            promotions: [{ white: 0, black: 1, to: ["Silver", "+Silver"], on: [events.enter, events.exit, events.between] }]
        },
        {
            name: "Gold",
            description: "Moves one step cardinally or forward-diagonal.",
            sprite: "shield",
            symbol: "G",
            move: "([W],[-1 1 1 1],[1 1 1 1])a"
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
            name: "+Pawn",
            description: "Promoted pawn. Moves as a Gold.",
            sprite: "shield",
            symbol: "P",
            move: "([W],[-1 1 1 1],[1 1 1 1])a",
            attributes: [attrib.transform_on_death],
            held_piece: 0
        },
        {
            name: "+Rook",
            description: "Dragon King. Moves as Rook or King.",
            sprite: "dragon",
            symbol: "R",
            move: "([R],[K])Ba",
            attributes: [attrib.transform_on_death],
            held_piece: 1
        },
        {
            name: "+Bishop",
            description: "Dragon Horse. Moves as a Bishop or King.",
            sprite: "kelpie",
            symbol: "B",
            move: "([B],[K])Ba",
            attributes: [attrib.transform_on_death],
            held_piece: 2
        },
        {
            name: "+Lance",
            description: "Promoted lance. Moves as a Gold.",
            sprite: "shield",
            symbol: "L",
            move: "([W],[-1 1 1 1],[1 1 1 1])a",
            attributes: [attrib.transform_on_death],
            held_piece: 3
        },
        {
            name: "+Knight",
            description: "Promoted knight. Moves as a Gold.",
            sprite: "shield",
            symbol: "N",
            move: "([W],[-1 1 1 1],[1 1 1 1])a",
            attributes: [attrib.transform_on_death],
            held_piece: 4
        },
        {
            name: "+Silver",
            description: "Promoted silver. Moves as a Gold.",
            sprite: "shield",
            symbol: "S",
            move: "([W],[-1 1 1 1],[1 1 1 1])a",
            attributes: [attrib.transform_on_death],
            held_piece: 5
        }
	],
    setup: "bl bn bs bG bK bG bs bn bl . br 5. bb . 9bp",
    copy: "rotate",
    zones: [
        "111111111 111111111 111111111 000000000 000000000 000000000 000000000 000000000 000000000",
        "000000000 000000000 000000000 000000000 000000000 000000000 111111111 111111111 111111111"
    ],
    starting_hands: {white: [], black: []}
});