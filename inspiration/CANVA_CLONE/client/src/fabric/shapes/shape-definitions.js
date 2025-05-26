export const shapeDefinitions = {
  rectangle: {
    type: "rect",
    label: "Rectangle",
    defaultProps: {
      width: 100,
      height: 60,
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Rect } = fabric;
      const rect = new Rect({
        left: 15,
        top: 35,
        width: 70,
        height: 35,
        fill: "#000000",
      });
      canvas.add(rect);
    },
  },
  square: {
    type: "rect",
    label: "Square",
    defaultProps: {
      width: 80,
      height: 80,
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Rect } = fabric;
      const square = new Rect({
        left: 20,
        top: 20,
        width: 60,
        height: 60,
        fill: "#000000",
      });
      canvas.add(square);
    },
  },
  circle: {
    type: "circle",
    label: "Circle",
    defaultProps: {
      radius: 50,
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Circle } = fabric;
      const circle = new Circle({
        left: 20,
        top: 20,
        radius: 30,
        fill: "#000000",
      });
      canvas.add(circle);
    },
  },
  triangle: {
    type: "triangle",
    label: "Triangle",
    defaultProps: {
      width: 80,
      height: 80,
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Triangle } = fabric;
      const triangle = new Triangle({
        left: 20,
        top: 20,
        width: 60,
        height: 60,
        fill: "#000000",
      });
      canvas.add(triangle);
    },
  },
  ellipse: {
    type: "ellipse",
    label: "Ellipse",
    defaultProps: {
      rx: 60,
      ry: 30,
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Ellipse } = fabric;
      const ellipse = new Ellipse({
        left: 15,
        top: 35,
        rx: 35,
        ry: 18,
        fill: "#000000",
      });
      canvas.add(ellipse);
    },
  },
  line: {
    type: "line",
    label: "Line",
    defaultProps: {
      x1: 50,
      y1: 50,
      x2: 200,
      y2: 50,
      stroke: "#000000",
      strokeWidth: 5,
    },
    thumbnail: (fabric, canvas) => {
      const { Line } = fabric;
      const line = new Line([15, 50, 85, 50], {
        stroke: "#000000",
        strokeWidth: 5,
      });
      canvas.add(line);
    },
  },
  star: {
    type: "polygon",
    label: "Star",
    defaultProps: {
      fill: "#000000",
      points: [],
    },
    thumbnail: (fabric, canvas) => {
      const { Polygon } = fabric;
      const starPoints = [];
      const outerRadius = 30;
      const innerRadius = 15;
      const center = { x: 50, y: 50 };
      const points = 5;

      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points;
        starPoints.push({
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        });
      }

      const star = new Polygon(starPoints, {
        fill: "#000000",
      });

      canvas.add(star);
    },
  },
  arrow: {
    type: "path",
    label: "Arrow",
    defaultProps: {
      path: "M 20,40 L 150,40 L 150,20 L 200,50 L 150,80 L 150,60 L 20,60 z",
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Path } = fabric;
      const arrowPath =
        "M 10,45 L 65,45 L 65,30 L 90,50 L 65,70 L 65,55 L 10,55 z";

      const arrow = new Path(arrowPath, {
        fill: "#000000",
      });

      canvas.add(arrow);
    },
  },
  pentagon: {
    type: "polygon",
    label: "Pentagon",
    defaultProps: {
      fill: "#000000",
      points: [],
    },
    thumbnail: (fabric, canvas) => {
      const { Polygon } = fabric;
      const pentagonPoints = [];
      const radius = 30;
      const center = { x: 50, y: 50 };
      const sides = 5;

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        pentagonPoints.push({
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        });
      }

      const pentagon = new Polygon(pentagonPoints, {
        fill: "#000000",
      });

      canvas.add(pentagon);
    },
  },
  hexagon: {
    type: "polygon",
    label: "Hexagon",
    defaultProps: {
      fill: "#000000",
      points: [],
    },
    thumbnail: (fabric, canvas) => {
      const { Polygon } = fabric;
      const hexagonPoints = [];
      const radius = 30;
      const center = { x: 50, y: 50 };
      const sides = 6;

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        hexagonPoints.push({
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        });
      }

      const hexagon = new Polygon(hexagonPoints, {
        fill: "#000000",
      });

      canvas.add(hexagon);
    },
  },
  octagon: {
    type: "polygon",
    label: "Octagon",
    defaultProps: {
      fill: "#000000",
      points: [],
    },
    thumbnail: (fabric, canvas) => {
      const { Polygon } = fabric;
      const octagonPoints = [];
      const radius = 30;
      const center = { x: 50, y: 50 };
      const sides = 8;

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        octagonPoints.push({
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        });
      }

      const octagon = new Polygon(octagonPoints, {
        fill: "#000000",
      });

      canvas.add(octagon);
    },
  },
  doubleArrow: {
    type: "path",
    label: "Double Arrow",
    defaultProps: {
      path: "M 20,40 L 180,40 L 180,20 L 220,50 L 180,80 L 180,60 L 20,60 L 20,80 L 0,50 L 20,20 z",
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Path } = fabric;
      const doubleArrowPath =
        "M 15,50 L 50,50 L 50,35 L 85,50 L 50,65 L 50,50 L 15,50 M 85,50 L 50,50 L 50,35 L 15,50 L 50,65 L 50,50 L 85,50";

      const doubleArrow = new Path(doubleArrowPath, {
        fill: "#000000",
      });

      canvas.add(doubleArrow);
    },
  },
  elbowConnector: {
    type: "path",
    label: "Elbow Connector",
    defaultProps: {
      path: "M 20,20 L 20,80 L 80,80",
      stroke: "#000000",
      strokeWidth: 5,
      fill: "",
    },
    thumbnail: (fabric, canvas) => {
      const { Path } = fabric;
      const elbowPath = "M 20,20 L 20,80 L 80,80";

      const elbow = new Path(elbowPath, {
        stroke: "#000000",
        strokeWidth: 5,
        fill: "",
      });

      canvas.add(elbow);
    },
  },
  heart: {
    type: "path",
    label: "Heart",
    defaultProps: {
      path: "M 50,90 C 35,80 10,60 10,40 C 10,20 25,10 40,10 C 45,10 50,15 50,20 C 50,15 55,10 60,10 C 75,10 90,20 90,40 C 90,60 65,80 50,90 Z",
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Path } = fabric;
      const heartPath =
        "M 50,80 C 40,70 20,55 20,40 C 20,25 30,20 40,20 C 45,20 50,25 50,30 C 50,25 55,20 60,20 C 70,20 80,25 80,40 C 80,55 60,70 50,80 Z";

      const heart = new Path(heartPath, {
        fill: "#000000",
      });

      canvas.add(heart);
    },
  },
  cross: {
    type: "path",
    label: "Cross",
    defaultProps: {
      path: "M 40,20 L 60,20 L 60,40 L 80,40 L 80,60 L 60,60 L 60,80 L 40,80 L 40,60 L 20,60 L 20,40 L 40,40 Z",
      fill: "#000000",
    },
    thumbnail: (fabric, canvas) => {
      const { Path } = fabric;
      const crossPath =
        "M 40,20 L 60,20 L 60,40 L 80,40 L 80,60 L 60,60 L 60,80 L 40,80 L 40,60 L 20,60 L 20,40 L 40,40 Z";

      const cross = new Path(crossPath, {
        fill: "#000000",
      });

      canvas.add(cross);
    },
  },
};

export const shapeTypes = [
  "rectangle",
  "square",
  "circle",
  "triangle",
  "ellipse",
  "line",
  "star",
  "arrow",
  "pentagon",
  "hexagon",
  "octagon",
  "doubleArrow",
  "elbowConnector",
  "heart",
  "cross",
];
