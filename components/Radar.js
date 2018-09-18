// @flow
import React, { PureComponent } from "react";
import Svg, { Circle, G, Line, Polygon } from "react-native-svg";
import chroma from "chroma-js";

type PropsType = {
  size: number,
  colors: string[],
  axisColor?: string,
  values: number[],
  max?: number,
  webOpacity?: number
};

type Point = {
  x: number,
  y: number
};

const computeCoordinates = (
  radius: number,
  angle: number,
  offset?: Point
): Point => ({
  x: radius * Math.cos(angle) + (offset ? offset.x : 0),
  y: radius * Math.sin(angle) + (offset ? offset.y : 0)
});

export default class Radar extends PureComponent<PropsType> {
  static defaultProps = {
    axisColor: "black"
  };

  _computeAxisVertices = (): Point[] => {
    const { size, values } = this.props;
    const center = this._center();
    const nbVertices = values.length;
    const vertices = values.map(
      (value, index): Point => {
        const radius = Math.max(size / 2 - 1.5 * this._dotSize(), 0);
        const angle = (2 * Math.PI * index) / nbVertices - Math.PI / 2;
        return computeCoordinates(radius, angle, center);
      }
    );
    return vertices;
  };

  _computePolygonVertices = () => {
    const { values, size } = this.props;
    const max = this.props.max ? this.props.max : Math.max(...values);
    const center = this._center();
    const nbVertices = values.length;
    const vertices = values.map(
      (value, index): Point => {
        const radius = Math.max(
          (size * value) / (2 * max) - 1.5 * this._dotSize(),
          0
        );
        const angle = (2 * Math.PI * index) / nbVertices - Math.PI / 2;
        return computeCoordinates(radius, angle, center);
      }
    );
    return vertices;
  };

  _dotSize = () => this.props.size / 40;

  _center = () => ({ x: this.props.size / 2, y: this.props.size / 2 });

  _renderAxis = (): Point[] => {
    const { size } = this.props;
    const center = this._center();
    return this._computeAxisVertices().map((vertex, index) => (
      <G key={index}>
        <Line
          x1={center.x}
          y1={center.y}
          x2={vertex.x}
          y2={vertex.y}
          stroke={this.props.axisColor}
        />
        <Circle
          cx={vertex.x}
          cy={vertex.y}
          r={this._dotSize()}
          fill="#FFFFFF"
          stroke={this.props.axisColor}
        />
      </G>
    ));
  };

  _renderWeb = () => (
    <Polygon
      points={this._computePolygonVertices().reduce(
        (points, vertex) => `${points} ${vertex.x},${vertex.y}`,
        ""
      )}
      fill={this.props.axisColor}
      fillOpacity={this.props.webOpacity ? this.props.webOpacity : 0.5}
    />
  );

  _renderChart = () =>
    this._computePolygonVertices().map((vertex, index) => (
      <Circle
        key={index}
        cx={vertex.x}
        cy={vertex.y}
        r={this._dotSize()}
        fill={this.props.colors[index % this.props.colors.length]}
      />
    ));

  render() {
    if (!this.props.values || !this.props.values.length) return null;
    return (
      <Svg height={this.props.size} width={this.props.size}>
        {this._renderAxis()}
        {this._renderWeb()}
        {this._renderChart()}
      </Svg>
    );
  }
}
