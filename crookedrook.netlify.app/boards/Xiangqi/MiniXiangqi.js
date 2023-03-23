preset_variants[folders.xiangqi].push({
    name: "MiniXiangqi",
    author: "S. Kusumoto (1973)",
    description: "7x7 version of Chinese Chess",
	width: 7,
	height: 7,
    wins: [ends.royal_capture, ends.stalemate],
    draws: [],

	all_pieces: [
		{
			name: "Peasant",
			description: "Moves one step forwards or sideways.",
            sprite: "peasant",
            symbol: "p",
            notation: "",
			move: "([0 -1 1 1],[1 0 2 1])a",
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
            name: "Cannon",
            description: "Xiangqi Cannon",
            sprite: "cannon",
            symbol: "C",
            move: "[R]Bb[0 -1 1 -1]Bab+[R]Bae",
        },
		{
            name: "Mao",
            description: "Blockable Knight",
            sprite: "knight",
			symbol: "N",
			move: "[W]ae([1 -1 1 1],[-1 -1 1 1])a",
		},
		{
            name: "King",
            description: "Moves one step cardinally. Must stay in the palace. Can fly to kill opposing king.",
            sprite: "king",
			symbol: "K",
			move: "[W]aZ{1 0}+[R]BP{King}",
            attributes: [attrib.royal]
		},
	],
    setup: "bR bC bN bK bN bC bR bp . 3bp . bp",
    copy: "flip",
    zones: [
        "0011100 0011100 0011100 0000000 0000000 0000000 0000000",
        "0000000 0000000 0000000 0000000 0011100 0011100 0011100",
	],
});