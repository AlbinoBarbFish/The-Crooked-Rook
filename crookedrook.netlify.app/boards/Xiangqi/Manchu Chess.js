preset_variants[folders.xiangqi].push({
    name: "Manchu Chess",
    description: "Xiangqi, but one side has a super-chariot, which moves like a rook, knight, or cannon",
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
        },
        {
            name: "Rook",
            description: "Moves sideways and vertically as many spaces as it wants",
            sprite: "rook",
            symbol: "R",
            move: "[R]Ba",
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
            name: "Elephant",
            description: "Moves exactly 2 spaces diagonally. Can be blocked. Cannot cross the river.",
            sprite: "elephant",
			symbol: "E",
			move: "[1 1 4 2]BaZ{1 0}+-[1 1 4 1]",
		},
		{
            name: "Advisor",
            description: "Moves 1 space diagonally. Must stay in the palace.",
            sprite: "prince",
			symbol: "A",
			move: "[F]aZ{3 2}",
		},
		{
            name: "King",
            description: "Moves one step cardinally. Must stay in the palace. Can fly to kill opposing king.",
            sprite: "king",
			symbol: "K",
			move: "[W]aZ{3 2}+[R]BP{King}",
            attributes: [attrib.royal]
		},
		{
            name: "Super Chariot",
            description: "Moves like a Rook, Knight, or Cannon",
            sprite: "lion",
			symbol: "S",
			move: "[R]Ba+[W]ae([1 -1 1 1],[-1 -1 1 1])a+[R]Bb[0 -1 1 -1]Bab",
		},
	],
    setup: "bR bN bE bA bK bA bE bN bR 10. bC 5. bC . bp . bp . bp . bp . bp 18. wp . wp . wp . wp . wp 18. wS . wE wA wK wA wE",
    zones: [
        "111111111 111111111 111111111 111111111 111111111 000000000 000000000 000000000 000000000 000000000",
        "000000000 000000000 000000000 000000000 000000000 111111111 111111111 111111111 111111111 111111111",
        "000111000 000111000 000111000 000000000 000000000 000000000 000000000 000000000 000000000 000000000",
        "000000000 000000000 000000000 000000000 000000000 000000000 000000000 000111000 000111000 000111000",
	],
});