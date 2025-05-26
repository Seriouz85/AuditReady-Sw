export const createShape = (
  fabric,
  type,
  shapeDefinitions,
  customProps = {}
) => {
  const definition = shapeDefinitions[type];
  if (!definition) return null;

  const props = { ...definition.defaultProps, ...customProps };

  switch (definition.type) {
    case "rect":
      return new fabric.Rect(props);

    case "circle":
      return new fabric.Circle(props);

    case "triangle":
      return new fabric.Triangle(props);

    case "ellipse":
      return new fabric.Ellipse(props);

    case "line":
      return new fabric.Line([props.x1, props.y1, props.x2, props.y2], {
        stroke: props.stroke,
        strokeWidth: props.strokeWidth,
        ...customProps,
      });

    case "polygon":
      const left = props.left || 100;
      const top = props.top || 100;

      let points = [];

      if (type === "star") {
        const outerRadius = 50;
        const innerRadius = 25;
        const center = { x: left, y: top };
        const numPoints = 5;

        for (let i = 0; i < numPoints * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / numPoints;
          points.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
          });
        }
      } else if (
        type === "pentagon" ||
        type === "hexagon" ||
        type === "octagon"
      ) {
        const radius = 50;
        const center = { x: left, y: top };
        const sides = type === "pentagon" ? 5 : type === "hexagon" ? 6 : 8;
        const startAngle = type === "pentagon" ? -Math.PI / 2 : 0;

        for (let i = 0; i < sides; i++) {
          const angle = startAngle + (i * 2 * Math.PI) / sides;
          points.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
          });
        }
      } else if (props.points && props.points.length > 0) {
        points = props.points;
      }

      return new fabric.Polygon(points, {
        fill: props.fill,
        ...customProps,
      });

    case "path":
      return new fabric.Path(props.path, props);

    default:
      return null;
  }
};
