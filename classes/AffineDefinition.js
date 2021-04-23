class AffineDeformation{
  constructor(fromPoints, toPoints, alpha) {
    this.w = null;
    this.pRelative = null;
    this.qRelative = null;
    this.A = null;
    if (fromPoints.length != toPoints.length) {
      console.error('Points are not of same length.');
      return;
    }
    this.n = fromPoints.length;
    this.fromPoints = fromPoints;
    this.toPoints = toPoints;
    this.alpha = alpha;
  }

  pointMover(point) {
    if (null == this.pRelative || this.pRelative.length < this.n) {
      this.pRelative = new Array(this.n);
    }
    if (null == this.qRelative || this.qRelative.length < this.n) {
      this.qRelative = new Array(this.n);
    }
    if (null == this.w || this.w.length < this.n) {
      this.w = new Array(this.n);
    }
    if (null == this.A || this.A.length < this.n) {
      this.A = new Array(this.n);
    }

    for (let i = 0; i < this.n; ++i) {
      const t = this.fromPoints[i].subtract(point);
      this.w[i] = Math.pow(t.x * t.x + t.y * t.y, -this.alpha);
    }

    const pAverage = Point.weightedAverage(this.fromPoints, this.w);
    const qAverage = Point.weightedAverage(this.toPoints, this.w);

    for (let i = 0; i < this.n; ++i) {
      this.pRelative[i] = this.fromPoints[i].subtract(pAverage);
      this.qRelative[i] = this.toPoints[i].subtract(qAverage);
    }

    let B = new Matrix22(0, 0, 0, 0);

    for (let i = 0; i < this.n; ++i) {
      B.addM(this.pRelative[i].wXtX(this.w[i]));
    }

    B = B.inverse();
    for (let j = 0; j < this.n; ++j) {
      this.A[j] =
      point
        .subtract(pAverage)
        .multiply(B)
        .dotP(this.pRelative[j]) * this.w[j];
    }

    let r = qAverage; //r is an point
    for (let j = 0; j < this.n; ++j) {
      r = r.add(this.qRelative[j].multiply_d(this.A[j]));
    }
    return r;
  }
}
