function HalfSigmoid(x, k) {
	return (k * x - x) / (2.0 * k * x - k - 1.0);
}
