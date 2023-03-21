const ends = {
	royal_capture: 0,
	royal_extinction: 1,
	bare_royal: 2,
	stalemate: 3
}
const events = {
	enter: 0,
	exit: 1,
	between: 2,
	drop: 3
}
const attrib = {
	ally_static: 0,
	enemy_static: 1,
	kill_ally: 2,
	save_enemy: 3,
	flip_this_on_attack: 4,
	dont_flip_enemy: 5,
	fireball: 6,
	bomb: 7,
	save_self: 8,
	transform_on_death: 9,
	ep_capturer: 10,
	ep_captured: 11,
	castle_from: 12,
	castle_to: 13,
	pusher: 14,
	burn_passive: 15,
	burn_peaceful: 16,
	burn_attack: 17,
	burn_death: 18,
	burn_allies: 19,
	burn_immune: 20,
	coward: 21,
	child: 22,
	berzerk: 23,
	spawn_trail: 24,
	spawn_constant: 25,
	spawn_on_death: 26,
	copycat: 27,
	attacker_moves: 28,
	defender_moves: 29,
	tall: 30,
	iron: 31,
	silver: 32,
	bronze: 33,
	royal: 34,
	ghost: 35,
	flip_on_passive: 36,
	forced_step: 37,
	retreat: 38,
	bloodlust: 39,
	promote_on_attack: 40,
	kill_between: 41,
	muddy: 42,
	ghost_caster: 43,
	defender: 44,
	pacifier: 45,
	anchor: 46,
    empower: 47,
    random_promotion: 48
}
const folders = {
	chess: 0,
	shogi: 1,
	historical: 2,
	regional: 3,
	ccit: 4,
	compound: 5,
	other: 6
}

let preset_variants = [[],[],[],[],[],[], []];