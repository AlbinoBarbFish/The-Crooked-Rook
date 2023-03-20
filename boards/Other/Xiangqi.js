preset_variants[5].push({
    name: "Xiangqi",
    description: "Chinese Chess",
	width: 9,
	height: 10,

	all_pieces: [
	{
	    name: "Peasant",
	    description: "Moves one step forwards. If it crosses the river, it can move sideways.",
            sprite: "peasant",
            symbol: "p",
            notation: "",
			move: "[0 -1 1 1]a+z{0 1}[1 0 2 1]a",
			attributes: [attrib.ep_captured, attrib.ep_capturer],
        },
        {
            name: "Rook",
            description: "Moves sideways and vertically as many spaces as it wants",
            sprite: "rook",
            symbol: "r",
            move: "[R]Ba",
            attributes: [attrib.castle_to],
        },
        {
            name: "Cannon",
            description: "Xiangqi Cannon",
            sprite: "cannon",
            symbol: "c",
            move: "[R]Bb[0 -1 1 -1]Bab+[R]Bae",
        },
		{
            name: "Mao",
            description: "Blockable Knight",
            sprite: "knight",
			symbol: "n",
			move: "[W]ae([1 -1 1 1],[-1 -1 1 1])a",
		},
		{
            name: "Elephant",
            description: "Moves exactly 2 spaces diagonally. Can be blocked. Cannot cross the river.",
            sprite: "elephant",
			symbol: "e",
			move: "[1 1 4 2]BaZ{1 0}+-[1 1 4 1]",
		},
		{
            name: "Advisor",
            description: "Moves 1 space diagonally. Must stay in the palace.",
            sprite: "prince",
			symbol: "a",
			move: "[F]aZ{3 2}",
		},
		{
            name: "King",
            description: "Moves one step cardinally. Must stay in the palace. Can fly to kill opposing king.",
            sprite: "king",
	    symbol: "k",
	    move: "[W]aZ{3 2}+[R]BP{King}",
            attributes: [attrib.royal]
		},
	],
    setup: "br bn be ba bk ba be bn br 10. bc 5. bc . bp . bp . bp . bp . bp 18. wp . wp . wp . wp . wp . wc 5. wc 10. wr wn we wa wk wa we wn wr",
    zones: [
        "111111111 111111111 111111111 111111111 111111111 000000000 000000000 000000000 000000000 000000000",
        "000000000 000000000 000000000 000000000 000000000 111111111 111111111 111111111 111111111 111111111",
        "000111000 000111000 000111000 000000000 000000000 000000000 000000000 000000000 000000000 000000000",
        "000000000 000000000 000000000 000000000 000000000 000000000 000000000 000111000 000111000 000111000",
	],
});
