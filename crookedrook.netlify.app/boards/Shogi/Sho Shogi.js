preset_variants[folders.shogi].push({
    name: "Sho Shogi",
    description: "Precursor to the modern Shogi game. No drops. Adds the Drunk Elephant, which promotes to a second King.",
	width: 9,
	height: 9,
	wins: [ends.royal_extinction, ends.stalemate],

	all_pieces: [
		{
			name: "Pawn",
			description: "Moves and captures forward one step. Promotes to Gold.",
            sprite: "peasant",
            symbol: "p",
            notation: "",
			move: "[0 1 1 1]a",
            promotions: [{ white: 0, black: 1, to: ["Pawn", "Gold"], on: [events.enter, events.exit, events.between] }],
		},
		{
            name: "Rook",
            description: "Moves sideways and vertically as many spaces as it wants. Promotes to Dragon King.",
            sprite: "rook",
			symbol: "R",
            move: "[R]Ba",
            promotions: [{ white: 0, black: 1, to: ["Rook", "D"], on: [events.enter, events.exit, events.between] }],
        },
        {
            name: "Bishop",
            description: "Moves diagonally as many spaces as it wants. Promotes to Dragon Horse.",
            sprite: "bishop",
            symbol: "B",
            move: "[B]Ba",
            promotions: [{ white: 0, black: 1, to: ["Bishop", "H"], on: [events.enter, events.exit, events.between] }]
        },
        {
            name: "Lance",
            description: "Moves up as many spaces as it wants. Promotes to Gold.",
            sprite: "spear",
            symbol: "L",
            move: "[0 1 1 -1]Ba",
            promotions: [{ white: 0, black: 1, to: ["Lance", "Gold"], on: [events.enter, events.exit, events.between] }]
        },
		{
            name: "Knight",
            description: "Japanese Knight. Jumps forward two spaces and sideways one. Promotes to Gold.",
            sprite: "knight",
			symbol: "N",
            move: "([1 2 1 1],[-1 2 1 1])a",
            promotions: [{ white: 0, black: 1, to: ["Knight", "Gold"], on: [events.enter, events.exit, events.between] }]
        },
        {
            name: "Silver",
            description: "Moves one step diagonally or forward. Promotes to Gold.",
            sprite: "star5",
            symbol: "S",
            move: "([F],[0 1 1 1])a",
            promotions: [{ white: 0, black: 1, to: ["Silver", "Gold"], on: [events.enter, events.exit, events.between] }]
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
            name: "Dragon King",
            description: "Moves as Rook or King.",
            sprite: "dragon",
            symbol: "D",
            move: "([R],[K])Ba",
        },
        {
            name: "Dragon Horse",
            description: "Moves as a Bishop or King.",
            sprite: "kelpie",
            symbol: "H",
            move: "([B],[K])Ba",
        },
        {
            name: "Drunk Elephant",
            description: "Moves like a King, except not directly backwards. Non-royal, but promotes to King.",
            sprite: "elephant",
            symbol: "E",
            move: "([F],[1 0 2 1],[0 1 1 1])a",
            promotions: [{ white: 0, black: 1, to: ["King"], on: [events.enter, events.exit, events.between] }]
        },
	],
    setup: "bL bN bS bG bK bG bS bN bL . bR 2. bE 2. bB . 9bp",
    copy: "rotate",
    zones: [
        "111111111 111111111 111111111 000000000 000000000 000000000 000000000 000000000 000000000",
        "000000000 000000000 000000000 000000000 000000000 000000000 111111111 111111111 111111111"
    ],
});