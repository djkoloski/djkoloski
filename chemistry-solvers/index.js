var pte = null;

window.onload = function() {
	pte = new PeriodicTable();
	pte.init();
}

var gcd = function(a, b) {
	a = Math.abs(a);
	b = Math.abs(b);
	var t = 0;
	while (b != 0) {
		t = b;
		b = a % b;
		a = t;
	}
	return a;
}

var lcm = function(a, b) {
	return (a * b) / gcd(a, b);
}

var PeriodicElement = function(
	atomicNumber,
	atomicWeight,
	electronegativity,
	electronConfiguration,
	ionizationPotential,
	name,
	symbol
	)
{
	this.atomicNumber = atomicNumber;
	this.atomicWeight = atomicWeight;
	this.electronegativity = electronegativity;
	this.electronConfiguration = electronConfiguration;
	this.ionizationPotential = ionizationPotential;
	this.name = name;
	this.symbol = symbol;
}

var PeriodicTable = function() {
	this.byName = {};
	this.bySymbol = {};
	this.byAtomicNumber = {};
};
PeriodicTable.prototype.init = function(callback) {
	var pte = this;
	var xhr = new XMLHttpRequest();
	xhr.open('get', 'pte.json', true);
	xhr.onreadystatechange = function() {
		var status;
		var data;
		
		if (xhr.readyState == 4) {
			status = xhr.status;
			if (status == 200) {
				data = JSON.parse(xhr.responseText);
				pte.processJSON(data);
				if (callback != null)
					callback();
			} else {
				throw 'Failed to load pte.json';
			}
		}
	};
	xhr.send();
};
PeriodicTable.prototype.processJSON = function(data) {
	for (var i = 0; i < data.PERIODIC_TABLE.ATOM.length; ++i) {
		var entry = data.PERIODIC_TABLE.ATOM[i];
		var element = new PeriodicElement(
			parseInt(entry.ATOMIC_NUMBER),
			parseFloat(entry.ATOMIC_WEIGHT),
			parseFloat(entry.ELECTRONEGATIVITY),
			entry.ELECTRON_CONFIGURATION,
			parseFloat(entry.IONIZATION_POTENTIAL),
			entry.NAME,
			entry.SYMBOL
		);
		
		this.byName[element.name] = element;
		this.bySymbol[element.symbol] = element;
		this.byAtomicNumber[element.atomicNumber] = element;
	}
};

var frac = {
	create: function(n, d) {
		return frac.set(new Int32Array(2), n || 0, d || 1);
	},
	set: function(out, n, d) {
		out[0] = n;
		out[1] = d;
		return frac.reduce(out);
	},
	reduce: function(out) {
		if (out[1] < 0) {
			out[0] = -out[0];
			out[1] = -out[1];
		}
		var g = gcd(out[0], out[1]);
		out[0] /= g;
		out[1] /= g;
		return out;
	},
	add: function(out, a, b) {
		return frac.set(
			out,
			a[0] * b[1] + b[0] * a[1],
			a[1] * b[1]
		);
	},
	sub: function(out, a, b) {
		return frac.set(
			out,
			a[0] * b[1] - b[0] * a[1],
			a[1] * b[1]
		);
	},
	mul: function(out, a, b) {
		return frac.set(
			out, 
			a[0] * b[0],
			a[1] * b[1]
		);
	},
	div: function(out, a, b) {
		return frac.set(
			out,
			out[0] * b[1],
			out[1] * b[0]
		);
	},
	inv: function(out, a) {
		return frac.set(
			out,
			a[1],
			a[0]
		);
	},
	neg: function(out, a) {
		return frac.set(
			out,
			-a[0],
			a[1]
		);
	},
	tof: function(a) {
		return a[0] / a[1];
	},
	str: function(a) {
		return a[0] + "/" + a[1];
	}
};

var Matrix = function(rows, cols) {
	this.rows = rows;
	this.cols = cols;
	this.entries = [];
	for (var c = 0; c < this.cols; ++c) {
		for (var r = 0; r < this.rows; ++r) {
			this.entries.push(frac.create(0));
		}
	}
};
Matrix.prototype.fromValues = function(array) {
	for (var c = 0; c < this.cols; ++c) {
		for (var r = 0; r < this.rows; ++r) {
			this.set(r, c, frac.create(array[c * this.rows + r]));
		}
	}
};
Matrix.prototype.get = function(row, col) {
	return this.entries[col * this.rows + row];
};
Matrix.prototype.set = function(row, col, value) {
	this.entries[col * this.rows + row] = value;
};
Matrix.prototype.toString = function() {
	var out = '';
	for (var r = 0; r < this.rows; ++r) {
		if (r == 0)
			out += '[';
		else
			out += ' ';
		out += '[';
		for (var c = 0; c < this.cols; ++c) {
			out += ' ' + frac.str(this.get(r, c));
		}
		out += ' ]';
		if (r == this.rows - 1)
			out += ']';
		out += '\n';
	}
	return out;
};
Matrix.prototype.print = function() {
	console.log(this.toString());
};
Matrix.prototype.rowScale = function(row, scale) {
	for (var c = 0; c < this.cols; ++c) {
		frac.mul(this.get(row, c), scale, this.get(row, c));
	}
	return this;
};
Matrix.prototype.rowScaleAndAdd = function(to, from, scale) {
	for (var c = 0; c < this.cols; ++c) {
		var f = frac.create();
		frac.mul(f, scale, this.get(from, c));
		frac.add(this.get(to, c), f, this.get(to, c));
	}
	return this;
};
Matrix.prototype.rowSwap = function(a, b) {
	if (a == b)
		return this;
	
	for (var c = 0; c < this.cols; ++c) {
		var tmp = this.get(b, c);
		this.set(b, c, this.get(a, c));
		this.set(a, c, tmp);
	}
	
	return this;
};
Matrix.prototype.reduce = function() {
	var r = 0;
	var k = 0;
	var tmp = frac.create();
	while (r < this.rows) {
		if (k >= this.cols) {
			break;
		}
		
		var iMax = r;
		var vMax = 0;
		for (var i = r; i < this.rows; ++i) {
			var v = Math.abs(frac.tof(this.get(i, k)));
			if (v > vMax) {
				iMax = i;
				vMax = v;
			}
		}
		if (vMax == 0) {
			++k;
			continue;
		}
		this.rowSwap(r, iMax);
		frac.inv(tmp, this.get(r, k));
		this.rowScale(r, tmp);
		
		for (var i = r + 1; i < this.rows; ++i) {
			frac.neg(tmp, this.get(i, k));
			this.rowScaleAndAdd(i, r, tmp);
		}
		++r;
		++k;
	}
	
	r = this.rows - 1;
	while (r > 0) {
		k = 0;
		while (k < this.cols && frac.tof(this.get(r, k)) == 0) {
			++k;
		}
		if (k < this.cols) {
			for (var i = 0; i < r; ++i) {
				frac.neg(tmp, this.get(i, k));
				this.rowScaleAndAdd(i, r, tmp);
			}
		}
		--r;
	}
	
	return this;
};

var chemistry = {
	parseCompound: function(str) {
		var r = [];
		var symbol = '';
		var amount = 0;
		
		var add = function() {
			if (amount == 0)
				amount = 1;
			
			for (var i = 0; i < r.length; ++i) {
				if (r[i].symbol == symbol) {
					r[i].amount += amount;
					return;
				}
			}
			r.push({
				symbol: symbol,
				amount: amount
			});
		};
		
		for (var i = 0; i < str.length; ++i) {
			var c = str.charAt(i);
			if (!isNaN(c * 1)) {
				amount = amount * 10 + c.charCodeAt(0) - '0'.charCodeAt(0);
			} else if (c == c.toUpperCase()) {
				if (symbol != '')
					add();
				symbol = c;
				amount = 0;
			} else {
				symbol += c;
			}
		}
		add();
		
		return r;
	},
	stringifyCompound: function(compound) {
		var r = '';
		
		for (var i = 0; i < compound.length; ++i) {
			r += compound[i].symbol + (compound[i].amount != 1 ? compound[i].amount : '');
		}
		
		return r;
	},
	parseFormula: function(str) {
		var sides = str
			.replace(/\s/g, '')
			.replace('--->', '=')
			.replace('-->', '=')
			.replace('->', '=')
			.split('=');
		var components = [[], []];
		for (var i = 0; i < 2; ++i) {
			var pieces = sides[i].split('+');
			for (var j = 0; j < pieces.length; ++j) {
				var amount = 0;
				var k = 0;
				while (k < pieces[j].length) {
					var c = pieces[j].charAt(k);
					if (!isNaN(c * 1)) {
						amount = amount * 10 + c.charCodeAt(0) - '0'.charCodeAt(0);
					} else {
						break;
					}
					++k;
				}
				
				if (amount == 0)
					amount = 1;
				
				components[i].push({
					amount: amount,
					compound: chemistry.parseCompound(pieces[j].substr(k))
				});
			}
		}
		return components;
	},
	balance: function(str, pretty) {
		if (pretty == null)
			pretty = false;
		
		var components = chemistry.parseFormula(str);
		var elements = [];
		var coeffs = [];
		
		var cols = components[0].length + components[1].length;
		for (var i = 0; i < 2; ++i) {
			for (var j = 0; j < components[i].length; ++j) {
				for (var k = 0; k < components[i][j].compound.length; ++k) {
					var element = components[i][j].compound[k];
					if (elements.indexOf(element.symbol) == -1)
						elements.push(element.symbol);
				}
			}
		}
		var rows = elements.length;
		
		var m = new Matrix(rows, cols);
		
		var c = 0;
		for (var i = 0; i < 2; ++i) {
			for (var j = 0; j < components[i].length; ++j) {
				for (var k = 0; k < components[i][j].compound.length; ++k) {
					var element = components[i][j].compound[k];
					m.set(elements.indexOf(element.symbol), c, frac.create((i == 0 ? 1 : -1) * element.amount));
				}
				++c;
			}
		}
		
		m.reduce();
		
		var l = 1;
		for (var i = 0; i < m.rows; ++i) {
			if (frac.tof(m.get(i, m.cols - 1)) != 0) {
				l = lcm(l, m.get(i, m.cols - 1)[1]);
			}
		}
		for (var i = 0; i < m.rows; ++i) {
			if (frac.tof(m.get(i, m.cols - 1)) != 0) {
				coeffs.push(frac.tof(m.get(i, m.cols - 1)) * -l);
			}
		}
		coeffs.push(l);
		
		var r = '';
		c = 0;
		for (var i = 0; i < 2; ++i) {
			for (var j = 0; j < components[i].length; ++j) {
				r += (pretty ? '<strong>' : '') + (coeffs[c] == 1 ? '' : coeffs[c]) + (pretty ? '</strong>' : '') + chemistry.stringifyCompound(components[i][j].compound);
				if (j != components[i].length - 1)
					r += ' + ';
				++c;
			}
			if (i != 1)
				r += ' = ';
		}
		
		return r;
	}
};

var RunBalancer = function() {
	var input = document.getElementById('balancer_input').value;
	var output = chemistry.balance(input, true);
	document.getElementById('balancer_output').innerHTML = output;
};
