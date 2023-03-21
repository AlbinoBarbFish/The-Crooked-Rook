class squareset {
    constructor(length, seed) {
        if (length === undefined) {
            length = 256;
            console.error("Squareset created without length or copy");
        }
        if (isNaN(length)) {
            //Copy constructor
            let copy = length;
            this.length = copy.length;
            this.backingArray = Array.from(copy.backingArray);
        } else {
            if (seed === 1) {
                seed = 4294967295; //2^32-1 - 32 1's
            } else {
                seed = 0;
            }
            this.length = length;
            this.backingArray = Array.from({ length: Math.ceil(this.length / 32) }, () => seed);
        }
    }
}
function squareset_from_string(size, string) {
    let ret = new squareset(size);
    for (let a = 0, pos = 0; a < string.length; a++) {
        if (string[a] === "1") {
            ret.set_on(pos);
            pos++;
        } else if (string[a] === "0") {
            pos++;
        }
    }
    return ret;
}
squareset.prototype.get = function (n) {
    return (this.backingArray[n / 32 | 0] & 1 << n % 32) != 0;
}
squareset.prototype.set_on = function (n) {
    this.backingArray[n / 32 | 0] |= 1 << n % 32;
}
squareset.prototype.set_off = function (n) {
    this.backingArray[n / 32 | 0] &= ~(1 << n % 32);
}
squareset.prototype.set = function (n, bit) {
    if (bit) { this.backingArray[n / 32 | 0] |= 1 << n % 32; }
    else { this.backingArray[n / 32 | 0] &= ~(1 << n % 32); }
}
squareset.prototype.flip = function(n){
	this.backingArray[n/32|0] ^= 1 << n % 32;
}
squareset.prototype.count_bits = function(){
	var count = 0;
    for (let a = 0; a < this.backingArray.length; a ++){
		let temp = this.backingArray[a];
		while(temp != 0){
			count ++;
			temp &= temp-1;
		}
	}
	return count;
}
squareset.prototype.count_bits_num = function(n){
	let count = 0;
	let temp = n;
	while(temp != 0){
		count ++;
		temp &= temp-1;
    }
	return count;
}
squareset.prototype.get_ls1b = function(){
	for(let a = 0; a < this.length; a ++){
		if(this.get(a)){
			return a;
		}
	}

	//for(var a = 0; a < 8; a ++){
	//	if(this.backingArray[a] != 0){
	//		return this.count_bits_num(this.backingArray[a]^(this.backingArray[a]-1))-1;
	//	}
	//}
	//return 0; 
}
squareset.prototype.is_zero = function() {
    for (let a = 0; a < this.backingArray.length; a++){
	if(this.backingArray[a] != 0){
		return false;
		}
	}
	return true;
}
squareset.prototype.invert = function(){ //Not sure if this is correct???
    for (let a = 0; a < this.backingArray.length; a ++){
		this.backingArray[a] = ~this.backingArray[a];
	}
}
squareset.prototype.inverse = function(){
	var ret = new squareset(this.length);
    for (let a = 0; a < this.backingArray.length; a ++){
		ret.backingArray[a] = ~this.backingArray[a];
	}
	return ret;
}
squareset.prototype.zero = function(){
    for (let a = 0; a < this.backingArray.length; a ++){
		this.backingArray[a] = 0;
	}
}
squareset.prototype.ore = function(other){
    for (let a = 0; a < this.backingArray.length; a ++){
		this.backingArray[a] |= other.backingArray[a];
	}
}
squareset.prototype.ande = function(other){
    for (let a = 0; a < this.backingArray.length; a ++){
		this.backingArray[a] &= other.backingArray[a];
	}
}
squareset.prototype.pop = function(){ //Sets ls1b to 0
	this.set_off(this.get_ls1b());
}
/*function ss_and(ss1, ss2) {
    if (ss1 === undefined || ss2 === undefined) {
        console.log("ss and is broken");
        return new squareset();
    }
    let ret = new squareset(ss1.length);
    for (let a = 0; a < ss1.backingArray.length; a++){
		ret.backingArray[a] = ss1.backingArray[a] & ss2.backingArray[a];
	}
	return ret;
}*/
function ss_and(...args) {
    let ret = new squareset(args[0]);
    for (let a = 1; a < args.length; a++) {
        ret.ande(args[a]);
    }
    return ret;
}
/*function ss_or(ss1, ss2) {
    if (ss1 === undefined || ss2 === undefined) {
        console.log("ss or is broken");
        return new squareset();
    }
    let ret = new squareset(ss1.length);
    for (let a = 0; a < ss1.backingArray.length; a++) {
        ret.backingArray[a] = ss1.backingArray[a] | ss2.backingArray[a];
	}
	return ret;
}*/
function ss_or(...args) {
    let ret = new squareset(args[0]);
    for (let a = 1; a < args.length; a++) {
        ret.ore(args[a]);
    }
    return ret;
}