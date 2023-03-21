preset_variants[folders.ccit].push({
    name: "No Step On Snek",
    author: "Eumorpha",
    description: "Popo Chess Snake Contest board. Snakes promote to Hydras on the last rank. Basilisks act as Short Rooks (R5) and cannot castle. Frogs act as Ferz + Threeleaper (yes, it can leap across the board holes on the edges). The Centaur acts as Mann + Knight.",
	width: 10,
	height: 10,

	all_pieces: [
		{
			name: "Snake",
            description: "Can move passively to four squares: forward one or two, then sideways one. Captures like a pawn.",
            sprite: "snake",
			symbol: "S",
            move: "([1 -1 1 1],[-1 -1 1 1])a+([1 -2 1 1],[-1 -2 1 1])ea",
			promotions: [{white: 0, black: 1, to: ["H"], on: [events.enter]}]
		},
		{
            name: "Basilisk",
            description: "Acts cardinally up to 5 spaces away",
            sprite: "trocular",
			symbol: "B",
			move: "[0 1 4 5]Ba"
		},
		{
            name: "Frog",
            description: "Acts one square diagonally or three squares orthogonally, jumping over intervening pieces.",
            sprite: "beholder",
			symbol: "F",
			move: "([F],[H])a"
		},
		{
            name: "Centaur",
            description: "King + Knight",
            sprite: "mare",
			symbol: "C",
			move: "([K],[N])a"
        },
        {
            name: "Hydra",
            description: "Acts like a Knight. Also, acts orthogonally in any direction for one or three spaces.",
            sprite: "hydra",
            symbol: "H",
            move: "([N],[H],[W])a"
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
    setup: "2. bB bF bC bK bF bB 3. 8bS 62. 8wS 3. wB wF wC wK wF wB 2.",
    active_squares: "0011111100 0111111110 1111111111 1111111111 0111111110 0111111110 1111111111 1111111111 0111111110 0011111100",
    zones: [
        "0011111100 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000",
        "0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0000000000 0011111100",
    ]
});