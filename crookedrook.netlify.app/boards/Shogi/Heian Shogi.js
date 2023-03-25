preset_variants[folders.shogi].push({
    name: "Heian Shogi",
    description: "Precursor to the modern Shogi games. Reconstructed rules are speculative. No drops. Everything except King and Gold can promote to Gold in the last 3 ranks.",
	width: 8,
	height: 8,
	wins: [ends.royal_capture, ends.stalemate],

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
            name: "Lance",
            description: "Moves up as many spaces as it wants",
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
	],
    setup: "bL bN bS bG bK bS bN bL 8. 8bp",
    copy: "rotate",
    zones: [
        "11111111 11111111 11111111 00000000 00000000 00000000 00000000 00000000",
        "00000000 00000000 00000000 00000000 00000000 11111111 11111111 11111111"
    ],
    starting_hands: {white: [], black: []}
});