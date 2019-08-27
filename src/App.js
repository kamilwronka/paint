import React, { useState, useEffect, useRef } from "react";
import logo, { ReactComponent } from "./logo.svg";
import socket from "socket.io-client";
import "./App.css";

const canvasWidth = 800;
const canvasHeight = 600;

const colors = [
  "#FF6633",
  "#FFB399",
  "#FF33FF",
  "#FFFF99",
  "#00B3E6",
  "#E6B333",
  "#3366E6",
  "#999966",
  "#99FF99",
  "#B34D4D",
  "#80B300",
  "#809900",
  "#E6B3B3",
  "#6680B3",
  "#66991A",
  "#FF99E6",
  "#CCFF1A",
  "#FF1A66",
  "#E6331A",
  "#33FFCC",
  "#66994D",
  "#B366CC",
  "#4D8000",
  "#B33300",
  "#CC80CC"
];

class App extends React.Component {
  drawing = false;
  currentPosition = { x: 0, y: 0 };

  state = {
    options: {
      strokeWidth: 1,
      strokeColor: "#000",
      secondaryColor: "#fff"
    },
    mode: "pencil",
    fill: false
  };

  componentDidMount() {
    const canvas = this.refs.canvas;
    this.ctx = canvas.getContext("2d");
    this.rect = canvas.getBoundingClientRect();
    console.log(canvas);

    const tempCanvas = this.refs.previewCanvas;
    this.ctxTemp = tempCanvas.getContext("2d");

    this.socket = socket("http://192.168.72.143:4000");
    // console.log(this.context);

    this.socket.on("draw", data => {
      console.log(data);
      const { x, y, clientX, clientY, color, width } = data;
      // this.drawLine(x, y, clientX, clientY, color, width);
    });
  }

  handleDrawing = e => {
    // console.log(this.context);
    if (this.drawing) {
      switch (this.state.mode) {
        case "pencil":
          this.drawLine(
            this.currentPosition.x,
            this.currentPosition.y,
            e.clientX - this.rect.left,
            e.clientY - this.rect.top,
            this.state.options.strokeColor,
            this.state.options.strokeWidth
          );

          this.currentPosition.x = e.clientX - this.rect.left;
          this.currentPosition.y = e.clientY - this.rect.top;
          break;
        case "ellipse":
          this.drawEllipse(
            this.currentPosition.x,
            this.currentPosition.y,
            e.clientX - this.rect.left,
            e.clientY - this.rect.top,
            true
          );
          break;
        case "square":
          this.drawSquare(
            this.currentPosition.x,
            this.currentPosition.y,
            e.clientX - this.rect.left,
            e.clientY - this.rect.top,
            true
          );
          break;
        default:
          return null;
      }

      // this.drawLine(
      //   this.currentPosition.x,
      //   this.currentPosition.y,
      //   e.clientX,
      //   e.clientY,
      //   this.state.options.strokeColor,
      //   this.state.options.strokeWidth
      // );

      // this.socket.emit("draw", {
      //   x: this.currentPosition.x,
      //   y: this.currentPosition.y,
      //   clientX: e.clientX,
      //   clientY: e.clientY,

      // });

      // console.log(this.rect.left);
    }
  };

  setDrawing = e => {
    // console.log(this.context);
    console.log(e.clientX, e.clientY);
    this.drawing = true;
    this.currentPosition = {
      x: e.clientX - this.rect.left,
      y: e.clientY - this.rect.top
    };
  };

  stopDrawing = e => {
    switch (this.state.mode) {
      case "ellipse":
        this.drawEllipse(
          this.currentPosition.x,
          this.currentPosition.y,
          e.clientX - this.rect.left,
          e.clientY - this.rect.top,
          false
        );
        break;
      case "square":
        this.drawSquare(
          this.currentPosition.x,
          this.currentPosition.y,
          e.clientX - this.rect.left,
          e.clientY - this.rect.top,
          false
        );
        break;
      default:
        break;
    }

    this.drawing = false;
    this.currentPosition = { x: 0, y: 0 };
  };

  drawLine = (x1, y1, x2, y2, color, width) => {
    this.ctx.beginPath();
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.closePath();
  };

  drawSquare = (x, y, width, height, preview) => {
    if (preview) {
      this.ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);
      this.ctxTemp.beginPath();
      this.ctxTemp.lineWidth = this.state.options.strokeWidth;
      this.ctxTemp.strokeStyle = this.state.options.strokeColor;
      this.ctxTemp.rect(x, y, width - x, height - y);
      this.ctxTemp.fillStyle = this.state.options.secondaryColor;
      this.ctxTemp.fillRect(x, y, width - x, height - y);
      this.ctxTemp.stroke();
      this.ctxTemp.closePath();
    } else {
      this.ctx.beginPath();
      this.ctx.lineWidth = this.state.options.strokeWidth;
      this.ctx.strokeStyle = this.state.options.strokeColor;
      this.ctx.rect(x, y, width - x, height - y);
      this.ctx.fillStyle = this.state.options.secondaryColor;
      this.ctx.fillRect(x, y, width - x, height - y);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  drawEllipse = (x1, y1, x2, y2, temp) => {
    temp && this.ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);

    var radiusX = (x2 - x1) * 0.5, /// radius for x based on input
      radiusY = (y2 - y1) * 0.5, /// radius for y based on input
      centerX = x1 + radiusX, /// calc center
      centerY = y1 + radiusY,
      step = 0.01, /// resolution of ellipse
      a = step, /// counter
      pi2 = Math.PI * 2 - step; /// end angle

    if (temp) {
      /// start a new path
      this.ctxTemp.beginPath();

      /// set start point at angle 0
      this.ctxTemp.moveTo(
        centerX + radiusX * Math.cos(0),
        centerY + radiusY * Math.sin(0)
      );

      /// create the ellipse
      for (; a < pi2; a += step) {
        this.ctxTemp.lineTo(
          centerX + radiusX * Math.cos(a),
          centerY + radiusY * Math.sin(a)
        );
      }

      /// close it and stroke it for demo
      this.ctxTemp.strokeStyle = this.state.options.strokeColor;
      this.ctxTemp.lineWidth = this.state.options.strokeWidth;
      this.ctxTemp.closePath();
      this.ctxTemp.stroke();
    } else {
      /// start a new path
      this.ctx.beginPath();

      /// set start point at angle 0
      this.ctx.moveTo(
        centerX + radiusX * Math.cos(0),
        centerY + radiusY * Math.sin(0)
      );

      /// create the ellipse
      for (; a < pi2; a += step) {
        this.ctx.lineTo(
          centerX + radiusX * Math.cos(a),
          centerY + radiusY * Math.sin(a)
        );
      }

      /// close it and stroke it for demo
      this.ctx.closePath();
      this.ctx.lineWidth = this.state.options.strokeWidth;
      this.ctx.strokeStyle = this.state.options.strokeColor;
      this.ctx.stroke();
      this.ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);
    }
  };

  handleColorChange = color => {
    this.setState({
      options: { ...this.state.options, strokeColor: color }
    });
  };

  handleSecondaryColorChange = color => {
    this.setState({
      options: { ...this.state.options, secondaryColor: color }
    });
  };

  handleWidthChange = e => {
    this.setState({
      options: { ...this.state.options, strokeWidth: e.target.value }
    });
  };

  render() {
    return (
      <div className="main">
        <div className="options">
          <input
            value={this.state.options.strokeWidth}
            onChange={this.handleWidthChange}
          />
          <input
            value={this.state.options.strokeColor}
            onChange={this.handleColorChange}
          />
          <input
            type="color"
            onChange={e => this.handleColorChange(e.target.value)}
            value={this.state.options.strokeColor}
          />
          <input
            type="color"
            onChange={e => this.handleSecondaryColorChange(e.target.value)}
            value={this.state.options.secondaryColor}
          />
          <div className="option">
            <button
              className="option-icon"
              onClick={() => this.setState({ mode: "square" })}
              onContextMenu={e => {
                e.preventDefault();
                this.setState({
                  openedContextMenu:
                    this.state.openedContextMenu === "square" ? null : "square"
                });
                return false;
              }}
            >
              <i className="far fa-square"></i>
            </button>
            {this.state.openedContextMenu === "square" && (
              <div className="contextMenu">
                <div onClick={() => this.setState({ fill: true })}>
                  Z wypełnieniem
                </div>
                <div onClick={() => this.setState({ fill: false })}>
                  Bez wypełnienia
                </div>
              </div>
            )}
          </div>
          <button onClick={() => this.setState({ mode: "ellipse" })}>
            <i className="far fa-circle"></i>
          </button>
          <button onClick={() => this.setState({ mode: "pencil" })}>
            <i className="fas fa-pencil-alt"></i>
          </button>
        </div>
        <div className="paint">
          <canvas
            ref="canvas"
            onMouseDown={this.setDrawing}
            onMouseMove={this.handleDrawing}
            onMouseUp={this.stopDrawing}
            className="App"
            width={canvasWidth}
            height={canvasHeight}
          >
            {/* {mousePosition} */}
          </canvas>
          <canvas
            ref="previewCanvas"
            onMouseDown={this.setDrawing}
            onMouseMove={this.handleDrawing}
            onMouseUp={this.stopDrawing}
            className="App"
            style={{ position: "absolute", left: 0 }}
            width={canvasWidth}
            height={canvasHeight}
          />
        </div>
      </div>
    );
  }
}

export default App;
